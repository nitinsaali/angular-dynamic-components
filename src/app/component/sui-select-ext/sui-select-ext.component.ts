import { Component, OnInit, Input,Output, EventEmitter } from '@angular/core';

import { map } from 'rxjs/operators'
import { HttpService } from '../../services/http.service';

import { ApiResult } from '../../interface/api-result';
import { Store } from '../../classes/store';
interface IOption {
  value: any,
  displayName: any
}

/**
 * Dynamic extension for sui dropdowns. abstracts the way we fetch the data to allow our approach to remote data fetching.
 */
@Component({
  selector: 'sui-select-ext',
  template: `<ng-content></ng-content>`,
})
export class SuiSelectExtComponent {
  public dropDownOptions: IOption[];

  @Input() selectOptionsUrl: string;
  @Input() selectOptionsPayload: object;

  @Output() dropDownValueChange = new EventEmitter();


  constructor(private http: HttpService) {
    this.dropDownValueChange = new EventEmitter<IOption[]>();
  }

  ngOnInit() {
    console.log(this.selectOptionsPayload, this.selectOptionsUrl);
    this.http.directQuery(this.selectOptionsUrl, this.selectOptionsPayload)
      .pipe(
        map((value: ApiResult) => {
          return value.results;
        })
      )
      .subscribe((data: IOption[]) => {
        this.dropDownOptions = data;
        this.dropDownValueChange.emit(this.dropDownOptions);
      });
  }
}
