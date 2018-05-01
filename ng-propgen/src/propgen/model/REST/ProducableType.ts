import {AutogeneratableModel} from '../AutogeneratableModel';
import {SortableEntity} from '../SortableEntity';
import {StringModelProperty} from '../../modelcreator/string.model.property';
import {TextModelProperty} from '../../modelcreator/text.model.property';
import {Autogeneratable} from '../../decorators/autogeneratable.decorator';
import {Validators} from '@angular/forms';
import {RouteMode} from '../../components/catch-all/catch-all.component';

@Autogeneratable({
  backendPath: '/ProducableTypes',
  routes: [
    {
      path: 'producabletypes',
      mode: RouteMode.List,
      data: {
        title: 'Producable types'
      }
    },
    {
      path: 'producabletype/:id',
      mode: RouteMode.Detail,
      data: {
        title: 'Producable type'
      }
    }
  ],
  orderable: false,
  hasVersioning: true
},{
  short: {
    type: StringModelProperty,
    validators: [Validators.maxLength(10)]
  },
  long: {
    type: StringModelProperty,
    validators: [Validators.maxLength(100)]
  },
  comments: {
    type: TextModelProperty,
  }
})
export class ProducableType extends AutogeneratableModel {
  toListItem() {
    return new Promise<SortableEntity>((resolve) => {
      resolve(new SortableEntity(this.id, this['long'] + ' (' + this['short'] + ')'));
    });
  }
}
