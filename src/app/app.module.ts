import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import {SuiModule} from 'ng2-semantic-ui';
import { Tab } from 'ng2-semantic-ui/dist';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Routing module
import { AppRoutingModule } from './app-routing.module';

// Components
import { AppComponent } from './app.component';
import { ViewportComponent } from './viewport/viewport.component';
import { ImageGridComponent } from './component/image-grid/image-grid.component';
import { FormComponent } from './component/form/form.component';
import { TableComponent } from './component/table/table.component';

// Service
import { HttpService } from './services/http.service';
import { ComponentLoaderService } from './services/component-loader.service';
import { ConfigService } from './services/config.service';
import { ModalComponent, ModalContent } from './component/modal/modal.component';
import { StoreContainer } from './services/store.container.service';
import { DecimalPipe } from './pipes/decimal.pipe';
import { MultiItemComponent, EditField } from './component/multi-item/multi-item.component';
import { SuiSelectExtComponent } from './component/sui-select-ext/sui-select-ext.component';
import { DateFormFieldComponent } from './component/date-form-field/date-form-field.component';
import { UserService } from './services/user.service';
import { InterceptorService } from './services/interceptor.service';
import { AuthService } from './services/auth.service';
import { EmptyComponentComponent } from './component/empty-component/empty-component.component';
import { MessageService } from './services/message.service';

export function initAPP(authService: AuthService) {
  return () => authService.authBootstrap();
}

@NgModule({
  declarations: [
    AppComponent,
    ViewportComponent,
    ImageGridComponent,
    TableComponent,
    FormComponent,
    ModalComponent,
    ModalContent,
    DecimalPipe,
    MultiItemComponent,
    EditField,
    SuiSelectExtComponent,
    DateFormFieldComponent,
    EmptyComponentComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    SuiModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [
    HttpService,
    UserService,
    StoreContainer,
    ComponentLoaderService,
    ConfigService,
    AuthService,
    MessageService,
    {
      provide: APP_INITIALIZER,
      useFactory: initAPP,
      deps: [AuthService],
      multi: true
    }, {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }],
  bootstrap: [AppComponent],
  entryComponents: [
    TableComponent,
    FormComponent,
    ModalComponent
  ]
})
export class AppModule { }
