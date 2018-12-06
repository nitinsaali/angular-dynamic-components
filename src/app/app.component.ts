import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { HttpService } from './services/http.service';
import { StoreContainer } from './services/store.container.service';
import { UserService } from './services/user.service';
import { ConfigService } from './services/config.service';
import { MessageService } from './services/message.service';
import { AuthService } from './services/auth.service';

import { MainUi } from './interface/main-ui';
import { User } from './interface/user';

import { Store } from './classes/store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  menuList = [];
  message: string;
  messageType: string;
  
  constructor(private httpService: HttpService,
              private http: HttpClient,
              private storeContainer: StoreContainer,
              private activeRoute: ActivatedRoute,
              private userService: UserService,
              private configService: ConfigService,
              private messageService: MessageService,
              private authService: AuthService) {}

  ngOnInit() {
    console.log("component init");
    console.log(this.configService.getConfig('mainview'));
    this.renderMenu(this.configService.getConfig('mainview').solution);
    console.log("component init");
    this.messageService.message.subscribe((message: {message: string, type: string}) => {
      this.message = message.message;
      this.messageType = message.type;
    });
  }

  

  renderMenu(solution) {
    this.menuList = solution;
  }

  clearErrorMessage() {
    this.message = undefined;
    this.messageType = null;
  }

  logout() {
    this.authService.logout();
  }
  
}
