//Goal should be a uni directional architecture for data flow
//store
import * as Immutable from "immutable";
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../services/http.service';
import { User } from "../interface/user";
import { BaseQueryPayload, BaseCommandPayload } from "../interface/base-payload";
import * as _ from 'lodash';

// enum Action {
//   add = 'ADD',
//   edit = 'EDIT',
//   delete = 'DELETE',
//   update = 'UPDATE'
// }

// TODO: big issue with stores, need to update so it treats stores as tables, 
//       then support multiple definition of commands (for flexibility) query stays singular per store

interface StoreConfig {
  "name": string,
  "endpoint": string,
  "basePayload": object,
  "queryName": string,
  "commandNames": string[],
  "solution": string,
}

export class Store {
  public observable: BehaviorSubject<any>;
  public name: string;
  private _storeConf: StoreConfig;
  private _dataCache: any;
  private _http: HttpClient;
  private _queryUrl: string;
  private _commandUrl: string
  private _user: User;
  public _queryPayload: BaseQueryPayload;
  public _commandPayload: BaseCommandPayload;

  constructor (storeConf: StoreConfig, http: HttpClient, user: User) {
    this._storeConf = storeConf;
    this.name = storeConf.name;
    this.observable = new BehaviorSubject(null);
    this._http = http;
    this._user = user;
    this._queryPayload = <BaseQueryPayload>{
      queryName: this._storeConf.queryName,
      query: {
        parameters: [],
        pageNo: "1",
        pageSize: "50",
        sort: ""
      }
    };

//     {
//       "queryName":"category_search",
//       "query": {
//         "parameters":[
//           {
//             "name":"status",
//             "value":"Active"
//           }, {
//             "name": "category_name",
//             "value": "Canned%"
//           }],
//      "pageNo" : "1",
//      "pageSize" : "50",
//      "sort" : ""
//  }}

    this._commandPayload = <BaseCommandPayload> {
      commandName: '',
      payload: {}
    }

    this._resolveURL();
  }

  private _resolveURL() {
    // temp: use of _org instead of org for org name reference
    this._queryUrl = `${this._storeConf.endpoint}/api/query/v1/${this._user.org}/${this._storeConf.solution}/queries`;
    this._commandUrl = `${this._storeConf.endpoint}/api/command/v1/${this._user.org}/${this._storeConf.solution}/commands`;
  }

  private isValidCommand(commandName: string) {
    return this._storeConf.commandNames.find(element => {
      return element === commandName;
    });
  }

  public getData(payload?: any) {
    console.log('getting data...');
    return this.query(payload);
  }

  /**
   * execute queries in a store
   * @param payload 
   */
  public query(payload?: object ) {
    if (payload) {
      this._queryPayload.query.parameters = Object.assign(this._queryPayload.query.parameters, this.payloadFormatter(payload));
    }

    return this._http.post(this._queryUrl, this._queryPayload)
    .subscribe(data => {
      this.observable.next(data);
    });
  }

  /**
   * 
   * @param commandName 
   * @param payload 
   * 
   * 
   {
      "commandName": "create_herd",
      "org": "boxchain",
      "payload":{
        "cattle_count": 20,
        "county": "Ocala",
        "herd_name": "D",
        "owner": "John",
        "state": "FL"
    }
   */
  public command(commandName: string, payload?: object) {
    if (payload) {
      this._commandPayload.payload = Object.assign(this._commandPayload.payload, payload);
    }

    if (this.isValidCommand(commandName)) {
      this._commandPayload.commandName = commandName;
      return this._http.post(this._commandUrl, this._commandPayload).subscribe(); //fire and forget right now
    }
  }

  private payloadFormatter(payload) {

    let parameters: Array<{"name": string, "value": string}> = [];
    for (let property in payload) {
      parameters.push({"name": property, "value": payload[property]});
    }
    return parameters;
  }
}
