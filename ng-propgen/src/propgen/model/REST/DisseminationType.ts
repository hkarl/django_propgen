import {AutogeneratableModel} from '../AutogeneratableModel';
import {SortableEntity} from '../SortableEntity';
import {StringModelProperty} from '../../modelcreator/string.model.property';
import {TextModelProperty} from '../../modelcreator/text.model.property';
import {Autogeneratable} from '../../decorators/autogeneratable.decorator';
import {Validators} from '@angular/forms';
import {RouteMode} from '../../components/catch-all/catch-all.component';

@Autogeneratable({
  backendPath: '/DisseminationTypes',
  routes: [
    {
      path: 'disseminationtypes',
      mode: RouteMode.List,
      data: {
        title: 'Disemination types'
      }
    },
    {
      path: 'disseminationtype/:id',
      mode: RouteMode.Detail,
      data: {
        title: 'Dissemination type'
      }
    }
  ],
  hasVersioning: true,
  orderable: false
},{
  short: {
    type: StringModelProperty,
    validators: [Validators.maxLength(10)]
  },
  long: {
    type: StringModelProperty,
    validators: [Validators.maxLength(200)]
  },
  comments: {
    type: TextModelProperty
  }
})
export class DisseminationType extends AutogeneratableModel {
  toListItem() {
    return new Promise<SortableEntity>((resolve) => {
      resolve(new SortableEntity(this.id, this['long'] + ' (' + this['short'] + ')'));
    });
  }
}
