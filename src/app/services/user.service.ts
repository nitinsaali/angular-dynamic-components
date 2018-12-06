import { Injectable } from '@angular/core';
import { User } from '../interface/user';


@Injectable()
export class UserService {

  public user: User;

  constructor() { }

  setUser(user) {
    this.user = user;
  }

  getSettings() {
    return this.user.settings;
  }


  /**
   * Updates user data from authentication
   * Call on app init for now.
   */
  updateUserData (user : User) {
    this.setUser(user);
  }

  getUser () {
    return this.user;
  }
}
