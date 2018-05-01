import {StringModelProperty} from '../../modelcreator/string.model.property';
import {SortableEntity} from '../SortableEntity';
import {Autogeneratable} from '../../decorators/autogeneratable.decorator';
import {AutogeneratableModel} from '../AutogeneratableModel';
import {Validators} from '@angular/forms';
import {RouteMode} from '../../components/catch-all/catch-all.component';

@Autogeneratable({
  backendPath: '/Partnertype',
  routes: [
    {
      path: 'partnertypes',
      mode: RouteMode.List,
      data: {
        title: 'Partner types'
      }
    },
    {
      path: 'partnertype/:id',
      mode: RouteMode.Detail,
      data: {
        title: 'Partner type'
      }
    }
  ],
  orderable: true,
  hasVersioning: true
}, {
  shortname: {
    type: StringModelProperty,
    helpText: "Short form of partner types",
    defaultValue: '',
    validators: [Validators.maxLength(20)]
  },
  description: {
    type: StringModelProperty,
    defaultValue: '',
    validators: [Validators.maxLength(128)]
  }
})
export class PartnerType extends AutogeneratableModel {
  toListItem() {
    return new Promise<SortableEntity>((resolve) => {
      resolve(new SortableEntity(this.id, this['shortname'] + ' ' + this['description']));
    });
  }
}
