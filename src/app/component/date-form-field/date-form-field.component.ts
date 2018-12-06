import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgForm, FormBuilder } from '@angular/forms';

// import * as Moment from 'moment';
import * as Moment from 'moment-timezone';


interface IDateObject {
  value: string,
  tz?: string,
  utc_timestamp?: number
};

type IDateTypes = 'datetime' | 'date' | 'time' | 'timestamp';

@Component({
  selector: 'app-date-form-field',
  template: `
    <div class="ui left icon input" [ngClass]="{'disabled': readOnly}">
      <i class="calendar icon"></i>
      <input suiDatepicker
        [pickerMode]="type"
        pickerFirstDayOfWeek="1"
        [(ngModel)]="dateObject"
        [pickerUseNativeOnMobile]="false"
        [pickerLocaleOverrides]="localeOverrides"
        (ngModelChange)="onChange($event)">
    </div>
  `,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DateFormFieldComponent),
    multi: true
  }]
})
export class DateFormFieldComponent implements ControlValueAccessor {

  @Input() fieldObject: any;
  @Input() displayFormat: string;
  @Input() readOnly: boolean;
  @Input()
  set type(type: IDateTypes) {
    this._type = type;
    if (this.displayFormat) {
      this.localeOverrides.formats[type] = this.displayFormat.toUpperCase();
    }
  }
  get type(): IDateTypes {
    return this._type;
  }
  
  private _type: IDateTypes;
  public dateObject: any;
  public localeOverrides: any = {};

  private propagateChange: (dateObject: IDateObject | null) => void;
  constructor() {
    this.localeOverrides['formats'] = {}
  }

  writeValue(data: any) {
    if (data) {
      if (this.type !== 'timestamp') {
        this.dateObject = new Date(data.value);
      } else {
        this.dateObject = Moment.unix(data.utc_timestamp).toDate();
      }
    } else {
      this.dateObject = undefined;
    }
    // this.onChange(data);
    console.log("date obj check", this.dateObject);
  }

  registerOnChange(onChange: (data: IDateObject) => void) {
    this.propagateChange = onChange;
  }

  onChange(event: IDateObject) {
    let momentDate: Moment = Moment(event);
    let _dateObject: IDateObject | null = null; // set default value override for all
    if (typeof event === 'undefined') {
      _dateObject = null;
    } else if (momentDate.isValid()) {
      _dateObject = {
        value: momentDate.format('Y-MM-DDTHH:mm:ss.SSS')
      }

      if (this.type === 'timestamp') {
        _dateObject.utc_timestamp = momentDate.unix();
      }

      if (this.type === 'datetime') {
        _dateObject.utc_timestamp = momentDate.unix();
        _dateObject.tz = momentDate.format('Z');
      }
    }

    this.propagateChange(_dateObject);
  }

  registerOnTouched() {}

  convertDateObject(dateObject: any) {
    // let date: IdateObject;
    return dateObject;
  }
}
