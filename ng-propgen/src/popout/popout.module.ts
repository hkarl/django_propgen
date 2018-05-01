import {NgModule} from '@angular/core';
import {MarkdownModule} from 'ngx-md';
import {RouterModule} from '@angular/router';
import {MarkdownComponent} from './components/markdown/markdown.component';
import {PropgenSharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [
    MarkdownComponent
  ],
  imports: [
    MarkdownModule,
    RouterModule.forChild([
      {
        path: 'markdown/:multiId',
        component: MarkdownComponent
      }
    ]),
    PropgenSharedModule
  ],
  providers: [
  ],
})
export class PopoutModule {
}
