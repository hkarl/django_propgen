import {StringModelProperty} from '../../modelcreator/string.model.property';
import {MarkdownModelProperty} from '../../modelcreator/markdown.model.property';
import {ForeignKeyModelProperty} from '../../modelcreator/foreign-single.model.property';
import {Partner} from './Partner';
import {AutogeneratableModel} from '../AutogeneratableModel';
import {Autogeneratable} from '../../decorators/autogeneratable.decorator';
import {Validators} from '@angular/forms';
import {RouteMode} from '../../components/catch-all/catch-all.component';



@Autogeneratable({
  backendPath: '/Workpackage',
  routes: [
    {
      path: 'workpackages',
      mode: RouteMode.List,
      data: {
        title: 'Workpackages'
      }
    },
    {
      path: 'workpackage/:id',
      mode: RouteMode.Detail,
      data: {
        title: 'Workpackage'
      }
    }
  ],
  orderable: true,
  hasVersioning: true
},
{
  title: {
    type: StringModelProperty,
    validators: [Validators.maxLength(255)]
  }
  ,
  tag: {
    type: StringModelProperty,
    validators: [Validators.maxLength(20)]
  }
  ,
  objectives: {
    type: MarkdownModelProperty,
  }
  ,
  description: {
    type: MarkdownModelProperty,
  }
  ,
  type: {
    type: StringModelProperty,
    verboseName: 'WP Type (RTD, MGMT, ...)',
    helpText: 'Type of the WP, according to predefined EU list',
    defaultValue: 'RTD',
    validators: [Validators.maxLength(10)]
  }
  ,
  lead: {
    type: ForeignKeyModelProperty,
    foreignType: Partner
  }
})
export class Workpackage extends AutogeneratableModel {

}
