import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import * as auth0 from 'auth0-js';
import * as q from 'query-string';
import { environment } from '../../environments/environment';

import { User } from '../interface/user';
import { Store } from '../classes/store';
import { UserService } from '../services/user.service';
import { HttpService } from '../services/http.service';
import { StoreContainer } from '../services/store.container.service';
import { ConfigService } from '../services/config.service';

@Injectable()
export class AuthService {

  constructor(
    private httpService: HttpService,
    private userService: UserService,
    private storeContainer: StoreContainer,
    private http: HttpClient,
    private configService: ConfigService
  ) {
  }

  private authBaseUrl: string = `${environment.authUrl}oauth/authorize`; //eviqa
  private tokenBaseUrl: string = `${environment.authUrl}oauth/token`; //eviqa

  private authParams = {
    client_id: 'webbox-client',
    response_type: 'code',
    redirect_uri: `${location.origin}/callback`,
    scope: 'boxchain/solution boxchain/org boxchain/ide boxchain/iam'
  };

  private buildAuthUrl () {
    return `${this.authBaseUrl}?${this.jsonToUrl(this.authParams)}`;
  }

  private jsonToUrl(params) {
    return Object.keys(params).map(function(k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
    }).join('&');
  }

  private urlParamsToJSON() {
    console.log("asd");
  }

  login() {
    window.location.href = this.buildAuthUrl();
  }

  getToken(urlFragment, cb) {
    // const code = urlFragment.
    let code = q.parse(urlFragment);
    let params = new HttpParams()
      .set("grant_type", "authorization_code")
      .set("code", code.code)
      .set("client_id", 'webbox-client')
      .set("redirect_uri", this.authParams.redirect_uri);
    
    this.http.post(this.tokenBaseUrl, params.toString(), {
      headers: new HttpHeaders({
        'authorization': `Basic ${window.btoa(`${this.authParams.client_id}:`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    })
      .subscribe((data: any) => {
        localStorage.setItem('token', data.access_token);
        cb();
      });
  }

  getMainView(): Promise<any> {
    let _userData: User = {
      org: 'boxchain',
      username: 'boxchain',
      hostname: environment.serverUrl
    };
    this.userService.setUser(_userData);
    this.httpService.setUser();
    // wrap this in queryParams for now to allow url defined user values
    return new Promise((resolve: any) => {
      this.httpService.getMainConfig().subscribe((data: any) => {
        console.log("Main Config: ", data);
        _userData.org = data.org;
        _userData.settings = data.settings;
        this.configService.addConfig(data, 'mainview');
        this.userService.updateUserData(_userData);
        if ( data.store ) {
          const stores: Store[] = data.store.map(store => {
            return new Store(store, this.http, _userData);
          });
          this.storeContainer.saveStore(stores);
        }
        resolve(true);
      });
    });
  }

  authBootstrap(): Promise<boolean> {
    let promise: Promise<boolean>;
    if (window.location.pathname === '/callback') {
      promise = new Promise((resolve: any) => {
        this.getToken(window.location.search, () => {
          // location.pathname = '/';
          this.getMainView().then(() => {
            resolve(true);
            window.location.href = window.location.origin;
          });
        });
      });
    } else if(localStorage.getItem('token')) {
      promise = new Promise((resolve: any) => {
        this.getMainView().then(() => {
          resolve(true);
        });
      });
    } else {
      localStorage.removeItem('token');
      this.login();
    }
    return promise;
  }

  logout() {
    //send a delete 
    this.http.delete(this.tokenBaseUrl, {withCredentials: true})
    .subscribe(() => {
      localStorage.clear();
      this.login();
    });
  }

}
