import { NgModule, Injectable } from '@angular/core';
import {
  Routes,
  RouterModule,
} from '@angular/router';

import { ViewportComponent } from './viewport/viewport.component';
import { EmptyComponentComponent } from './component/empty-component/empty-component.component';

const routes: Routes = [
  {
    path: 'viewport/:param1/:param2',
    component: ViewportComponent
  }, {
    path: '**',
    component: EmptyComponentComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
