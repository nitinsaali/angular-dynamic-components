import { 
  Component,
  OnInit, 
  Input, 
  Output,
  EventEmitter,
  forwardRef,
  ElementRef,
  ViewChild,
  Directive,
  Renderer
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgForm, FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import { UserService } from '../../services/user.service';

interface IOption {
  value: any,
  displayName: any
}

@Directive({
  selector: '[editField]'
})
export class EditField implements OnInit {
  @Input('editField') isFocused: boolean;
  
  constructor(private hostElement: ElementRef, private renderer: Renderer) {}

  ngOnInit() {
    if (this.isFocused) {
      this.renderer.invokeElementMethod(this.hostElement.nativeElement, 'focus');
    }
  }
}

/**
 * clean way of implementing the multi item.
 * this should: implement custom control structures so its usable in angular forms
 *              value accessors proper array output
 *              value structure input based on configuration
 */

@Component({
  selector: 'multi-item',
  templateUrl: './multi-item.component.html',
  styleUrls: ['./multi-item.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MultiItemComponent),
    multi: true
  }]
})
export class MultiItemComponent implements ControlValueAccessor {
  @Input() fieldObject: any;
  tableData: any[];

  private propagateChange: (data: any[]) => void;
  private current_editable_field: any;
  private current_editable_field_index: number;
  private editableFieldVal: any;

  public dynamicOptions: IOption[];
  public settings: any;

  constructor(private formBuilder: FormBuilder, private userService: UserService) {
    this.settings = this.userService.getSettings();
  }

  writeValue(data: any[]) {
    // this.tableData = [
    //   {"sub_category": "asd", "minimum_inventory_level": "1", "status": "active"}
    // ];
    if (data) {
      this.tableData = typeof data === 'string' ? [] : data;
    } else {
      this.tableData = [];
    }
  }

  registerOnChange(onChange: (data: any[]) => void) {
    this.propagateChange = onChange;
  }

  registerOnTouched() {}

  onChange(event) {
    // update the form
    this.propagateChange(this.tableData);
    console.log("columns", this.fieldObject.itemFields);
  }

  onSubmit(form: NgForm) {
    if (typeof this.current_editable_field_index !== 'undefined' &&  this.current_editable_field) {
      return;
    }

    this.tableData.push(Object.assign({}, form.value));
    form.form.reset();
  }

  remove(index: number) {
    this.tableData.splice(index, 1);
  }

  edit(index: number, config: any) {
    console.log(index, config.fieldName, this.tableData[index][config.fieldName]);
    if(config.readOnly) {
      return;
    }
    if (this.current_editable_field_index !== index ||  this.current_editable_field !== config.fieldName) {
      this.saveCurrentEditVal(this.current_editable_field_index, this.current_editable_field);
      this.disableEditMode();
      this.editableFieldVal = this.tableData[index][config.fieldName];
      this.current_editable_field = config.fieldName;
      this.current_editable_field_index = index;
    } else if (typeof this.current_editable_field_index !== 'undefined' &&  this.current_editable_field) {
      this.tableData[index][config.fieldName] = this.editableFieldVal;
    }
  }

  onEnter(index: number, fieldName: any, event: any) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.saveCurrentEditVal(index, fieldName);
    this.disableEditMode();
  }

  isEdittable(index: number, fieldName: any): Boolean {
    // this.editableFieldVal = this.tableData[index][fieldName];
    return this.current_editable_field_index === index &&  this.current_editable_field === fieldName;
  }

  saveCurrentEditVal(index: number, fieldName: any) {
    if (typeof this.current_editable_field_index !== 'undefined' &&  this.current_editable_field) {
      this.tableData[index][fieldName] = this.editableFieldVal;
    }
  }

  disableEditMode() {
    this.current_editable_field = null;
    this.current_editable_field_index = null;
  }

  propDropdownValue(ev: IOption[]) {
    this.dynamicOptions = ev;
  }

  checkSourceType (source) : number {
    return _.isArray(source) ? 1 : 2;
  }
}
