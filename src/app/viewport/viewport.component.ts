import { Component, OnInit, ChangeDetectorRef, Inject, ViewContainerRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpService } from '../services/http.service';

import { TableComponent } from '../component/table/table.component';
import { FormComponent } from '../component/form/form.component';

import { ComponentLoaderService } from '../services/component-loader.service';
import { ConfigService } from '../services/config.service';

import { ViewConfig } from '../interface/viewConfig'

@Component({
  selector: 'app-main-renderer',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss']
})
export class ViewportComponent implements OnInit {
  parameters: any = [];
  viewContainerRef: any;
  title: string;
  @ViewChild('viewportContainer') viewportContainer;
  
  constructor(private activatedRoute: ActivatedRoute,
              private det: ChangeDetectorRef,
              private http: HttpService,
              private service: ComponentLoaderService,
              @Inject(ViewContainerRef) viewContainerRef,
              private configService: ConfigService) {
    this.viewContainerRef = viewContainerRef;
    // this.service = service;
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramsObj: Params) => {
      //bind nth param to html
      let viewName: string = paramsObj.params.param2;
      let solution: string = paramsObj.params.param1;

      this.det.detectChanges();
      this.clearViewPort();

      //get config for view
      this.http.getViewConfig(solution, viewName)
        .subscribe((viewConfig: ViewConfig) => {
          this.configService.addConfig(viewConfig);
          this.title = viewConfig.definition.title || '-';
          this.renderComponent(viewConfig.name);
        });
    });
  }

  renderComponent(viewName: string) {
    this.service.setRootViewContainerRef(this.viewContainerRef);
    const view = this.configService.getConfig(viewName);
    view.component.forEach(component => {
      let componentRef = this.getComponentRef(component.componentType);
      this.service.addDynamicComponent(componentRef, component, viewName);
    });
  }

  getComponentRef(componentType: string) {
    componentType = componentType.toUpperCase();
    let componentRef = null;
    if (componentType === 'TABLECOMPONENT') {
      componentRef = TableComponent;
    } else if (componentType === 'FORMCOMPONENT') {
      componentRef = FormComponent;
    }

    return componentRef;
  }

  clearViewPort() {
    this.viewContainerRef.clear()
  }

}
