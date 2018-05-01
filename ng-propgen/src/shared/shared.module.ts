import {NgModule} from '@angular/core';
import {WindowService} from './services/window.service';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    WindowService
  ],
  exports: []
})
export class PropgenSharedModule {
}
