import { Injectable, Inject, ComponentFactoryResolver, ReflectiveInjector, Injector } from '@angular/core';

import { ViewConfig } from '../interface/viewConfig';

@Injectable()
export class ComponentLoaderService {
  private rootViewContainer: any;

  constructor(private factoryResolver: ComponentFactoryResolver) {
    // this.factoryResolver = factoryResolver
  }

  setRootViewContainerRef(viewContainerRef) {
    this.rootViewContainer = viewContainerRef;
  }

  addDynamicComponent(componentName: any, componentConfig: any, viewName: string, options?: object, close?: any) {
    // resolve the component passed
    const factory = this.factoryResolver.resolveComponentFactory(componentName);

    // create inputs injector
    const testInjector : Injector = ReflectiveInjector.resolveAndCreate([{provide: 'componentConfig', useValue: componentConfig}]);

    //Create the component passed
    const component = factory.create(testInjector);
    this.rootViewContainer.insert(component.hostView);
    (<any>component.instance).componentConfig = componentConfig; // surely there is a more graceful way of doing this, like injecting Inputs on compile time of factories instead of after its inserted
    (<any>component.instance).viewName = viewName;
    if((<any>component.instance).event) {
      (<any>component.instance).event.subscribe((val) => {
        if (val === 'modalClose') {
          close();
        }
      });
    }

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        (<any>component.instance)[`${key}`] = value;
      });
    }
  }
}
