import {StringModelProperty} from '../../modelcreator/string.model.property';
import {MarkdownModelProperty} from '../../modelcreator/markdown.model.property';
import {NumberModelProperty} from '../../modelcreator/number.model.property';
import {ForeignKeyModelProperty} from '../../modelcreator/foreign-single.model.property';
import {ForeignManyModelProperty} from '../../modelcreator/foreign-many.model.property';
import {Partner} from './Partner';
import {Task} from './Task';
import {Workpackage} from './Workpackage';
import {AutogeneratableModel} from '../AutogeneratableModel';
import {Autogeneratable} from '../../decorators/autogeneratable.decorator';
import {Validators} from '@angular/forms';
import {RouteMode} from '../../components/catch-all/catch-all.component';


@Autogeneratable({
  backendPath: '/Milestone',
  routes: [
    {
      path: 'milestones',
      mode: RouteMode.List,
      data: {
        title: 'Milestones'
      }
    },
    {
      path: 'milestone/:id',
      mode: RouteMode.Detail,
      data: {
        title: 'Milestone'
      }
    }
  ],
  orderable: true,
  hasVersioning: true
},{
  title: {
    type: StringModelProperty,
    validators: [Validators.maxLength(255)]
  },
  tag: {
    type: StringModelProperty,
    validators: [Validators.maxLength(20)]
  },
  description: {
    type: MarkdownModelProperty
  },
  due: {
    type: NumberModelProperty,
    validators: [Validators.min(0)]
  },
  lead: {
    type: ForeignKeyModelProperty,
    foreignType: Partner
  },
  maintask: {
    type: ForeignKeyModelProperty,
    foreignType: Task
  },
  secondarytasks: {
    type: ForeignManyModelProperty,
    foreignType: Task
  },
  verification: {
    type: MarkdownModelProperty
  },
  wp: {
    type: ForeignKeyModelProperty,
    foreignType: Workpackage
  }
})
export class Milestone extends AutogeneratableModel {
}
