import { Component, OnInit, Input, Output, Inject, ViewChild, Directive, EventEmitter } from '@angular/core';
import { NgForm, NgModel, NG_VALUE_ACCESSOR, FormGroup, Form, FormBuilder} from '@angular/forms';
import * as _ from 'lodash';
import { SuiSelectModule } from 'ng2-semantic-ui';
import { map } from 'rxjs/operators';

import { HttpService } from '../../services/http.service';
import { StoreContainer } from '../../services/store.container.service';
import { UserService } from '../../services/user.service';

import { ApiResult } from '../../interface/api-result';
import { Store } from '../../classes/store';
// import { Output } from '@angular/core/src/metadata/directives';

interface IOption {
  value: any,
  displayName: any
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  @Input() componentConfig;
  @Input() data: any = null;

  @Output() event: EventEmitter<string> = new EventEmitter();

  public remoteShit: IOption[];
  public dynamicOptions: IOption[];
  public formObject: FormGroup;
  public form: NgForm;
  public fields: any;
  public _store: Store;
  public tryFlag = false;
  public settings: any;

  constructor(private http: HttpService, private storeContainer: StoreContainer, private formBuilder: FormBuilder, private userService: UserService) {
    this.settings = this.userService.getSettings();
  }

  ngOnInit() {
    console.log('Form Component rendered with: ',this.componentConfig);
    this._store = this.storeContainer.getStore(this.componentConfig.store);
    // build form group
    if (this.componentConfig.formFields) {
      let _formTemplate = {};
      this.componentConfig.formFields.forEach(field => {
        if(field.type === 'group') {
          field.formFields.forEach(_field => {
            _formTemplate[_field.fieldName] = '';
          });
        } else if (field.type === 'multiItem') {
          let itemFields = {};
          field.itemFields.forEach(item => {
            itemFields[item.fieldName] = '';
          });
          _formTemplate[field.fieldName] = this.formBuilder.control([]);
        } else {
          _formTemplate[field.fieldName] = '';
        }
      });
      this.formObject = this.formBuilder.group(_formTemplate);
      
      if (this.data) {
        if(this.data.uuid) {
          delete this.data.uuid;
        }
        this.formObject.setValue(this.data);
      }
    }
  }

  /**
   * checks the type of source we are dealing with
   * @param source _source field from component field
   * @return {number} 2 = static object, 1 = dynamic endpoint
   */
  checkSourceType (source) : number {
    return _.isArray(source) ? 1 : 2;
  }

  onSubmit(form: NgForm, btnObj: any) {
    if (btnObj.actionType === 'query' || btnObj.actionType === 'search') {
      this._store.getData(form.value);
    } else if (btnObj.actionType === 'command') {
      this._store.command(btnObj.resource.commandName, form.value);
    } else if (btnObj.actionType === 'reset' || btnObj.actionType === 'clear') {
      this.reset();
      //refetch full dataset
      this._store.getData(form.value);
    } else if (btnObj.actionType === 'jaspersoftExport') {
      this.getJaspersoftReport(form.value, btnObj.resource.reportName);
    }

    if(btnObj.resource.events && btnObj.resource.events.length) {
      btnObj.resource.events.forEach((val) => {
        this.event.emit(val);
      });
    }
  }

  reset() {
    this.formObject.reset();
  }

  /**
   * Prepare, send and [download/open TBD] a Jaspersoft report 
   * @param form the value of the form whose fields will be used as parameters for the Jaspersoft report
   * @param reportName the name of the Jaspersoft report to be created
   */
  getJaspersoftReport(form: any, reportName: string) {
    //begin overly convoluted report construction
    let params: Object[] = [];
    for(let prop in form) {
      if(prop.includes("date")) {
        if(form[prop] == null || form[prop] == "") {
          params.push({
            name: prop,
            value: ""
          });
        } else {
          params.push({
            name: prop,
            value: {value: form[prop]}
          });
        }
      } else {
        params.push({
          name: prop,
          value: form[prop]
        });
      }
    }
    let payload: any = {
      reportName: reportName,
      parameters: params
    };
    //end overly convoluted report construction
    payload = JSON.stringify(payload);
    this.http.getJaspersoftReport(payload)
      .subscribe((res: any) => {
        //open PDF in new tab
        let fileURL = URL.createObjectURL(res);
        window.open(fileURL);
      }
    );
  }

  propDropdownValue(ev: IOption[]) {
    this.dynamicOptions = ev;
  }
}
