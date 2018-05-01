import {StringModelProperty} from '../../modelcreator/string.model.property';
import {NumberModelProperty} from '../../modelcreator/number.model.property';
import {ForeignKeyModelProperty} from '../../modelcreator/foreign-single.model.property';
import {Workpackage} from './Workpackage';
import {Partner} from './Partner';
import {MarkdownModelProperty} from '../../modelcreator/markdown.model.property';
import {AutogeneratableModel} from '../AutogeneratableModel';
import {Autogeneratable} from '../../decorators/autogeneratable.decorator';
import {Validators} from '@angular/forms';
import {RouteMode} from '../../components/catch-all/catch-all.component';


@Autogeneratable({
  backendPath: '/Task',
  routes: [
    {
      path: 'tasks',
      mode: RouteMode.List,
      data: {
        title: 'Tasks'
      }
    },
    {
      path: 'task/:id',
      mode: RouteMode.Detail,
      data: {
        title: 'Task'
      }
    }
  ],
  hasVersioning: true,
  orderable: true
}, {
  title: {
    type: StringModelProperty,
    validators: [Validators.maxLength(255)]
  },
  tag: {
    type: StringModelProperty,
    validators: [Validators.maxLength(20)]
  },
  objectives: {
    type: MarkdownModelProperty
  },
  description: {
    type: MarkdownModelProperty
  },
  start: {
    type: NumberModelProperty,
    validators: [Validators.min(0)]
  },
  end: {
    type: NumberModelProperty,
    validators: [Validators.min(0)]
  },
  wp: {
    type: ForeignKeyModelProperty,
    foreignType: Workpackage
  },
  lead: {
    type: ForeignKeyModelProperty,
    foreignType: Partner
  }
})
export class Task extends AutogeneratableModel {
}
