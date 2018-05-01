import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {SortablejsModule} from 'angular-sortablejs';
import {MarkdownModule} from 'ngx-md';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    RouterModule.forRoot([
        {
          path: 'popout',
          loadChildren: '../popout/popout.module#PopoutModule'
        },
        {
          path: '',
          loadChildren: '../propgen/propgen.module#PropgenModule'
        },
      ],
      {
        enableTracing: false,
      }),
    SortablejsModule.forRoot({}),
    MarkdownModule.forRoot(),

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
