import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {

  public configStore: Object = {};

  constructor() {
    console.log("Initializing config store.");
  }

  addConfig (config, name?: string) {
    this.configStore[config.name || name] = config.definition || config;
  }

  getConfig (configName) {
    console.log(`Getting config ${configName}.`);

    if ( this.configStore.hasOwnProperty(configName) ) {
      console.log(`Config found.`);
      return this.configStore[configName];
    }
    console.log(`Config ${configName} not found!`);
    throw(`Config ${configName} not found!`);
  }

}
