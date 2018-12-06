import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { map, share } from 'rxjs/operators'
import { Observable } from 'rxjs';
import { Subject, BehaviorSubject} from 'rxjs';
import isEmpty from 'lodash/isEmpty';

import { User } from '../interface/user';
import { ViewConfig } from '../interface/viewConfig';
import { ApiResult } from '../interface/api-result';

import { UserService } from '../services/user.service';

interface ObservablesStore {
  storeName: string,
  url: string,
  payload: object,
  queryName: string,
  obvReturn?: BehaviorSubject<any>
}

@Injectable()
export class HttpService {
  // public HOST_NAME_API : string = "http://localhost:8082/api";
  public CONFIG_VERSION : string = "v1";
  public user : User;
  public SOLUTION_NAME : string = "";
  // sample main view link : http://eviqa.mwemea.com:9033/api/view/v1/boxchain/mainview?user=boxchain
  // sample view link : http://eviqa.mwemea.com:9033/api/view/v1/boxchain/demo_a/views/despatchEnquiry?user=boxchain
  public obvStoreCollection: Array<ObservablesStore> = [];

  constructor(private http: HttpClient, private userService: UserService) {
    console.log('httpService init');
    this.setUser();
  }

  setUser() {
    this.user = this.userService.getUser();
  }

  /**
   * fetches views from the server
   * @param solutionName 
   * @param viewName 
   */
  getViewConfig(solutionName, viewName) {
    this.SOLUTION_NAME = solutionName; // get solution in each view change, TODO: change call level if this function is used for purposes other than changing view
    // http request to config api
    // http://localhost:8082/api/boxchain/demo_a/ui-config/view-config
    // return this.http.get(`http://78.129.190.89:9033/api/view/v1/loaves_and_fishes/loaves_and_fishes/views/${viewName}`);
    return this.http.get(`${this.user.hostname}view/${this.CONFIG_VERSION}/${this.user.org}/${solutionName}/views/${viewName}`);
  }

  /**
   * gets main view config based on the org and active user(eventually will be based on tokens)
   */
  getMainConfig() {
    // return this.http.get<ViewConfig>(`${this.HOST_NAME_API}/${this.ORG}/main`)
    // return this.http.get<ViewConfig>(`http://78.129.190.89:9033/api/view/v1/boxchain/mainview`)
    return this.http.get<ViewConfig>(`${this.user.hostname}view/${this.CONFIG_VERSION}/mainview`)
    .pipe(map(value => {
        return value.definition;
      }))
  }


  /**
   * goal is to:
   *  store queries
   *  return the same observable to the same query requests
   *  implement a hot observable so data flow within the app can be manageble
   *  initial dirty setup for flux architecture that we will eventually implement
   *  cause i find implementing the manual approach to be really dirty and bad
   * @param store reference name for the store
   * @param url endpoint where to throw the request
   * @param payload object to send to the server
   */
  requestEndpoint (storeName: string, url: string, queryName: string, payload: any): ObservablesStore {
    let store = this.requestSubject(storeName,  url, queryName, payload);
    this.getData(storeName, url, queryName, store.payload, store.obvReturn);
    return store;
  }

  
  requestSubject(storeName: string,  url?: string, queryName?: string, payload?: any) {
    let store: ObservablesStore = this.searchStore(storeName);
    if (!store) { //create the subject
      let newSubj: BehaviorSubject<any> = new BehaviorSubject<ApiResult>(null);
      store = {
        storeName,
        url,
        payload,
        queryName,
        obvReturn: newSubj
      };
      this.obvStoreCollection.push(store);
    } else {
      // check whether to replace the payload or not
      if ( this.verifyPayload(payload, store.payload) ) {
        store.payload = payload;
      }
    }

    return store;
  }

  verifyPayload(newPayload: object, oldPayload: object): boolean {
    return Object.entries(newPayload).filter(([key, val]) => {
      return !oldPayload.hasOwnProperty(key);
    }).length === 0 || isEmpty(oldPayload);
  }

  searchStore<ObservablesStore>(storeName: string) {
    return this.obvStoreCollection.find((val) => {
      return val.storeName === storeName;
    });
  }

  /**
   * fetches data from the server
   * @param storeName ignore for now
   * @param url where to get the data from
   * @param innerPayload the inner payload to send to the server, wrapped by the required credentials and identifiers
   * @param queryName 
   */
  getData <Observable>(storeName: string, url: string, queryName: string, innerPayload: any, subj?: BehaviorSubject<any>) {
    console.log('fetching data....');
    let payload = {
      "org": this.user.org,
      "queryName": queryName,
      "solutionName": this.SOLUTION_NAME,
      "payload": innerPayload
    };
    this.http.post(`${url}`, payload, {})
      .subscribe((val) => {
        subj.next(val);
      });
  }

  directQuery(url, payload) {
    return this.http.post(url, payload);
  }

  /**
   * Responsible for making calls to Jaspersoft api
   * @param payload 
   */
  getJaspersoftReport(payload: JSON): Observable<any>{
    //${this.user.hostname}
    return this.http.post(
      `http://78.129.190.89/api/jaspersoft/${this.CONFIG_VERSION}/${this.user.org}/${this.SOLUTION_NAME}/reports`, 
      payload, 
      { 
        headers: new HttpHeaders({ 
        'Content-Type': 'application/json'}),
        responseType: 'blob'
      }
    ).pipe(map(
      (res: any) => { 
        console.log("Got", res);
        return new Blob([res], {type: 'application/pdf'}); 
      }
    ));
  }

}
