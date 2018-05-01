import {Component, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {Message, WindowService} from '../../../shared/services/window.service';

@Component({
  selector: 'propgen-popout-markdown',
  template: '<markdown [data]="text"></markdown>'
})
export class MarkdownComponent implements OnDestroy {
  protected subscription: Subscription;
  public text: string;
  constructor(protected windowService: WindowService) {
    this.subscription = this.windowService.onMessage().subscribe((value: Message) => {
      if(this.text !== value.data) {
        this.text = value.data;
      }
    });
  }
  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
