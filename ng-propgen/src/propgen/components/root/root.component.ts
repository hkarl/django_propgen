import {Component} from '@angular/core';
import {DefaultBackendService} from '../../services/default-backend.service';

@Component({
  selector: 'propgen-root',
  templateUrl: './root.component.html'
})
export class RootComponent {
  public backend = DefaultBackendService.baseUrl;
}
