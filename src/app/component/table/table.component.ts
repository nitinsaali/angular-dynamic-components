import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SuiModalService } from 'ng2-semantic-ui';
import { isArray } from 'lodash';

import { ConfigService } from '../../services/config.service';
import { HttpService } from '../../services/http.service';
import { MessageService } from '../../services/message.service';

import { ViewConfig } from '../../interface/viewConfig';
import { ApiResult } from '../../interface/api-result';
import { TableComponentInterface } from '../../interface/table-component';

import { ConfirmModal } from '../modal/modal.component';
import { Store } from '../../classes/store';
import { StoreContainer } from '../../services/store.container.service';
import { UserService } from '../../services/user.service';

import { Dispatcher } from '../../classes/dispatcher';

import { pipe } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnDestroy {

  @Input() componentConfig : TableComponentInterface;
  public tableData = [];
  public entryClickFlag: boolean = false;
  public isModal: boolean = false;
  public options: any; // needs to be any
  public subviewname: string;
  public source: string;
  public viewName: string;
  public settings: any;
  private alive: boolean = true;
  private _store: Store;
  private _dispatcher: Dispatcher;
  constructor(private configService: ConfigService,
              private http: HttpService,
              private modalService: SuiModalService,
              private changeDetector: ChangeDetectorRef,
              private storeContainer: StoreContainer,
              private userService: UserService,
              private messageService: MessageService) {
                this._dispatcher = new Dispatcher();
                this.settings = this.userService.getSettings();
              }

  /** TODO:
   * - figure out the store current component is supposed to subscribe to
   * - subscribe to events from store and change data as you go.
   * - figure out how to trigger fetch when the store is empty
   */
  ngAfterViewInit() {
    console.log("Table component rendered with: ", this.componentConfig);
    if (this.isModal) {
      this.tableData = isArray(this.options.data) ? this.options.data.map((val) => { return {source: val}}) : [{source: this.options.data}];
      this.changeDetector.detectChanges();
      return;
    }
    this.attachEvents(this.componentConfig.events);

    let payload : Object = {}; // formed based on the columnFields columnName in the config file. It should match the fields that will be exposed the in endpoint as payload, Initially passed as null value
    payload = {}; // just for the sake of having data initially
    this._store = this.storeContainer.getStore(this.componentConfig.store);
    console.log(this._store);
    this._dispatcher.dispatch(this._store, 'fetch');
    this._store.observable.pipe(
        takeWhile(() => this.alive)
    ).subscribe((result: ApiResult) => {
      if (result) {
        this.tableData = result.results;
        console.log(this.tableData);
        this.changeDetector.detectChanges();
        if(result.results.length < 1) this.messageService.setMessage("No results found.", "warning");
      }
    });
  }

  /**
   * Attaches events to component
   * @param eventsObject : events object from config
   */
  attachEvents (eventsObject: any) {
    eventsObject.forEach(element => {
      if (element.hasOwnProperty('click')) {
        this.entryClickFlag = true;
        this.subviewname = element.click.viewName;
        this.source = element.click.source;
      }
    });
  }

  /**
   * only attach entry click on existing click events in the config
   */
  entryClick (record) {
    if (this.entryClickFlag) {
      let subview = this.findSubView(this.subviewname);
      this.modalService
      .open(new ConfirmModal(subview, {data: record, source: this.source}))
      .onApprove(() => this._dispatcher.dispatch(this._store, 'fetch'));
    }
  }
  findSubView(name) {
    return this.configService.getConfig(this.viewName).subViews.find(el => {
      return el.viewName === name;
    });
  }

  tableBtnClick(buttonObject) {
    if (buttonObject.actionType === "command") {
      this._store.command(buttonObject.resource.commandName, {});
    } else if (buttonObject.actionType === 'showModal') {
      console.log('calling subview');
      let subview = this.findSubView(buttonObject.resource.viewName);
      this.modalService
      .open(new ConfirmModal(subview, {data: null, source: this.source}))
      .onApprove(() => this._dispatcher.dispatch(this._store, 'fetch'));
    } else {
      console.log('Unrecognized button actionType');
    }
  }

  ngOnDestroy () {
    this.alive = false;
  }

}
