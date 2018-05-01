import {AutogeneratableModel} from '../AutogeneratableModel';
import {StringModelProperty} from '../../modelcreator/string.model.property';
import {ForeignKeyModelProperty} from '../../modelcreator/foreign-single.model.property';
import {Partner} from './Partner';
import {NumberModelProperty} from '../../modelcreator/number.model.property';
import {EmailModelProperty} from '../../modelcreator/email.model.property';
import {Autogeneratable} from '../../decorators/autogeneratable.decorator';
import {Validators} from '@angular/forms';
import {RouteMode} from '../../components/catch-all/catch-all.component';

@Autogeneratable({
  backendPath: '/Project',
  routes: [
    {
      path: 'project',
      mode: RouteMode.Detail,
      data: {
        id: 1,
        title: 'Project'
      }
    }
  ],
  orderable: false,
  hasVersioning: true
}, {
  title: {
    type: StringModelProperty,
    verboseName: 'Project title',
    validators: [Validators.maxLength(512)]
  },
  shortname: {
    type: StringModelProperty,
    verboseName: 'Project short name or acronym',
    validators: [Validators.maxLength(128)]
  },
  lead: {
    type: ForeignKeyModelProperty,
    verboseName: 'Project coordinator (partner)',
    foreignType: Partner
  },
  duration: {
    type: NumberModelProperty,
    verboseName: 'Project duration (in month)'
  },
  projecttype: {
    type: StringModelProperty,
    verboseName: 'Project type',
    helpText: 'Project type like STREP, IA, IP, ...',
    validators: [Validators.maxLength(64)]
  },
  callid: {
    type: StringModelProperty,
    verboseName: 'Call identifier',
    helpText: 'EU call ID like ICT FP7-ICT-2012-8',
    validators: [Validators.maxLength(30)]
  },
  callobjectives: {
    type: StringModelProperty,
    verboseName: 'Call objectives',
    helpText: 'Use identifiers or short names from call',
    validators: [Validators.maxLength(128)]
  },
  coordinatorName: {
    type: StringModelProperty,
    verboseName: 'Name of coordinating person',
    validators: [Validators.maxLength(128)]
  },
  coordinatorEmail: {
    type: EmailModelProperty,
    verboseName: 'Email of the coordinating person'
  },
  coordinatorPhone: {
    type: StringModelProperty,
    verboseName: 'Phone/FAX numbere of coordinator',
    validators: [Validators.maxLength(128)]
  }
})
export class Project extends AutogeneratableModel {
}
