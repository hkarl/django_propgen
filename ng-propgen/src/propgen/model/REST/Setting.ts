import {AutogeneratableModel} from '../AutogeneratableModel';
import {StringModelProperty} from '../../modelcreator/string.model.property';
import {TextModelProperty} from '../../modelcreator/text.model.property';
import {SortableEntity} from '../SortableEntity';
import {Autogeneratable} from '../../decorators/autogeneratable.decorator';
import {Validators} from '@angular/forms';
import {RouteMode} from '../../components/catch-all/catch-all.component';

@Autogeneratable({
  backendPath: '/Setting',
  routes: [
    {
      path: 'settings',
      mode: RouteMode.List,
      data: {
        title: 'Settings'
      }
    },
    {
      path: 'setting/:id',
      mode: RouteMode.Detail,
      data: {
        title: 'Setting'
      }
    }
  ],
  orderable: false,
  hasVersioning: true
}, {
  group: {
    type: StringModelProperty,
    verboseName: 'Settings group',
    validators: [Validators.maxLength(64)]
  },
  name: {
    type: StringModelProperty,
    verboseName: 'Settings name',
    validators: [Validators.maxLength(128)]
  },
  value: {
    type: StringModelProperty,
    verboseName: 'Settings value',
    validators: [Validators.maxLength(256)]
  },
  description: {
    type: TextModelProperty,
    verboseName: 'Description of this setting',
    helpText: 'Explain what this setting does, where it is used.'
  }
})
export class Setting extends AutogeneratableModel {
  toListItem() {
    return new Promise<SortableEntity>((resolve) => {
      resolve(new SortableEntity(this.id, this['group'] + '.' + this['name'] + ' = ' + this['value']));
    });
  }

}
