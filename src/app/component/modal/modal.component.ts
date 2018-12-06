import { Component, OnInit, ChangeDetectorRef, Inject, ViewContainerRef, Directive, ViewChild, forwardRef } from '@angular/core';
import {SuiModal, ComponentModalConfig, ModalSize, SuiActiveModal} from "ng2-semantic-ui";
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ComponentLoaderService } from '../../services/component-loader.service';
import { ConfigService } from '../../services/config.service';
import { HttpService } from '../../services/http.service';

import { ViewportComponent } from "../../viewport/viewport.component";

import { TableComponent } from '../table/table.component';
import { FormComponent } from '../form/form.component';

interface IModalContext {
  title: string;
  subview: any;
  options: object;
}

@Directive({
  selector: '[modal-content]',
})
export class ModalContent {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

/**
 * this modal implementation assumes that data has been fetched and theres no need to rerequest the 
 */
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  viewContainerRef: any;
  title: string;
  @ViewChild(ModalContent) modalContentHost: ModalContent;

  constructor(public modal: SuiModal<IModalContext, void, void>, private det: ChangeDetectorRef,
    private http: HttpService, private service: ComponentLoaderService, @Inject(ViewContainerRef) viewContainerRef,
    private configService: ConfigService) {
      this.title = modal.context.subview.title || '-';
  }

  renderComponent(view: any, options?: any) {
    this.service.setRootViewContainerRef(this.viewContainerRef);
    view.component.forEach(component => {
      let componentRef = this.getComponentRefs(component.componentType);
      if (options) {
        options['isModal'] = true;
      }
      this.service.addDynamicComponent(componentRef, component, view.viewName, options, ()=> this.closeModal());//always pass modal flag
    });
  }

  closeModal() {
    this.modal.approve(undefined);
  }

  getComponentRefs(componentType: string) {
    componentType = componentType.toUpperCase();
    let componentRef = null;
    if (componentType === 'TABLECOMPONENT') {
      componentRef = TableComponent;
    } else if (componentType === 'FORMCOMPONENT') {
      componentRef = FormComponent;
    }

    return componentRef;
  }

  ngOnInit() {
    this.viewContainerRef = this.modalContentHost.viewContainerRef;
    this.renderComponent(this.modal.context.subview, this.modal.context.options);
  };

}

export class ConfirmModal extends ComponentModalConfig<IModalContext, void, void> {
  constructor(subview: any = {}, options, size = ModalSize.Large) {
    super(ModalComponent, { title: subview.title, subview, options });
    // console.log(subview);
    // this.renderComponent(viewConfig.name);
    this.isClosable = true;
    this.transitionDuration = 200;
    this.isBasic = true;
    this.size = size;
    // this.mustScroll = true;
  }
}