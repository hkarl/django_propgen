import {AutogeneratableModel} from '../AutogeneratableModel';
import {StringModelProperty} from '../../modelcreator/string.model.property';
import {TextModelProperty} from '../../modelcreator/text.model.property';
import {BooleanModelProperty} from '../../modelcreator/boolean.model.property';
import {SortableEntity} from '../SortableEntity';
import {Autogeneratable} from '../../decorators/autogeneratable.decorator';
import {Validators} from '@angular/forms';
import {RouteMode} from '../../components/catch-all/catch-all.component';

@Autogeneratable({
  backendPath: '/Template',
  routes: [
    {
      path: 'templates',
      mode: RouteMode.List,
      data: {
        title: 'Templates'
      }
    },
    {
      path: 'template/:id',
      mode: RouteMode.Detail,
      data: {
        title: 'Template'
      }
    }
  ],
  orderable: false,
  hasVersioning: true
}, {
  name: {
    type: StringModelProperty,
    verboseName: 'Name of the produced file',
    validators: [Validators.maxLength(64)]
  },
  description: {
    type: TextModelProperty,
    verboseName: 'Description',
    helpText: 'Provide a brief description of what this template does'
  },
  template: {
    type: TextModelProperty,
    verboseName: 'Actual template text',
    helpText: 'Use Jinja2-style templates'
  },
  startpoint: {
    type: BooleanModelProperty,
    verboseName: 'Start point',
    helpText: 'Should this template be offered as a possible starting point from which to produce PDFs?'
  }
})
export class Template extends AutogeneratableModel {
  toListItem() {
    return new Promise<SortableEntity>((resolve) => {
      let title = this['name'];
      if(this['description']) {
        title += ' (' + this['description'].substring(0, 50) + ')';
      }
      resolve(new SortableEntity(this.id, title));
    });
  }

}
