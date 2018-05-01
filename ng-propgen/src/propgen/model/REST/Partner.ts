import {PartnerType} from './PartnerType';
import {StringModelProperty} from '../../modelcreator/string.model.property';
import {ForeignKeyModelProperty} from '../../modelcreator/foreign-single.model.property';
import {MarkdownModelProperty} from '../../modelcreator/markdown.model.property';
import {NumberModelProperty} from '../../modelcreator/number.model.property';
import {SortableEntity} from '../SortableEntity';
import {Autogeneratable} from '../../decorators/autogeneratable.decorator';
import {Injector} from '@angular/core';
import {AutogeneratableModel, eightDigitsRegex, fiveDigitsRegex, tenDigitsRegex} from '../AutogeneratableModel';
import {Validators} from '@angular/forms';
import {RouteMode} from '../../components/catch-all/catch-all.component';



@Autogeneratable({
  backendPath: '/Partner',
  routes: [
    {
      path: 'partners',
      mode: RouteMode.List,
      data: {
        title: 'Partners'
      }
    },
    {
      path: 'partner/:id',
      mode: RouteMode.Detail,
      data: {
        title: 'Partner'
      }
    }
  ],
  orderable: true,
  hasVersioning: true
}, {
  partnername: {
    type: StringModelProperty,
    validators: [Validators.maxLength(255)]
  },
  shortname: {
    type: StringModelProperty,
    validators: [Validators.maxLength(20)]
  },
  partnertype: {
    type: ForeignKeyModelProperty,
    foreignType: PartnerType
  },
  pic: {
    type: StringModelProperty,
    verboseName: 'PIC',
    helpText: 'Participant Identification Code',
    defaultValue: '',
  },
  description: {
    type: MarkdownModelProperty,
    verboseName: 'Partner description in general',
    helpText: 'General description text, will appear before the subsections defined below.\n' +
    'Typically empty if you fill in the following sections.'
  },
  organization: {
    type: MarkdownModelProperty,
    verboseName: 'Organization',
    helpText: 'a description of the legal entity and its main tasks,\n' +
    'with an explanation of how its profile matches the tasks in the proposal'
  },
  individuals: {
    type: MarkdownModelProperty,
    verboseName: 'Individual researchers',
    helpText: 'CV or description of key personnel'
  },
  partnerpublications: {
    type: MarkdownModelProperty,
    verboseName: 'Relevant publications, products and/or services',
    helpText: 'Up to 5 relevant publications, products, services'
  },
  partnerprojects: {
    type: MarkdownModelProperty,
    verboseName: 'Previous projects',
    helpText: 'Up to 5 previous projects or activities, relevant to the proposal'
  },
  infrastructure: {
    type: MarkdownModelProperty,
    verboseName: 'Significant infrastructure',
    helpText: 'Significant infrastructure and/or major technical equipment,\n' +
    'relevant to the project'
  },
  country: {
    type: StringModelProperty,
    validators: [Validators.maxLength(3)]
  },
  PMcost: {
    type: NumberModelProperty,
    verboseName: 'Person month cost',
    helpText: 'This relates to the Direct Personnel Cost (Col. A) via the number of personmonths',
    defaultValue: 0,
    validators: [Validators.pattern(eightDigitsRegex)]
  },
  reimbursement_rate: {
    type: NumberModelProperty,
    verboseName: 'Reimbursement rate',
    helpText: 'Make sure the reimbursement rate is consistent with the partner type',
    validators: [Validators.pattern(fiveDigitsRegex)]
  },
  _other_direct_cost: {
    type: NumberModelProperty,
    verboseName: 'Other direct cost',
    helpText: 'Corresponds to Col. B. If negative, the value is computed from other fields!',
    defaultValue: -1,
    validators: [Validators.pattern(tenDigitsRegex)]
  },
  other_direct_cost_explanation: {
    type: MarkdownModelProperty,
    verboseName: 'Explanation for other direct cost',
    helpText: 'Provide explanation for other direct cost if they exceed 15% of the personnel cost (as per guidelines).'
  },
  subcontract_cost: {
    type: NumberModelProperty,
    verboseName: 'Subcontracting cost',
    helpText: 'Total cost of all subcontracting done by this partner',
    defaultValue: 0,
    validators: [Validators.pattern(tenDigitsRegex)]
  },
  subcontract_cost_explanation: {
    type: MarkdownModelProperty,
    verboseName: 'Explanation for subcontracts',
    helpText: 'Usually, explanation for subcontracting is necessary'
  },
  finanical_support_3rd: {
    type: NumberModelProperty,
    verboseName: 'Fincancial support for 3rd parties',
    defaultValue: 0,
    validators: [Validators.pattern(tenDigitsRegex)]
  },
  finanical_support_3rd_explanation: {
    type: MarkdownModelProperty,
    verboseName: 'Explanation of financial support to 3rd party',
    helpText: 'Provide explanation'
  },
  inkind_contributions: {
    type: NumberModelProperty,
    verboseName: 'In-kind contributions',
    defaultValue: 0,
    validators: [Validators.pattern(tenDigitsRegex)]
  },
  inkind_contributions_explanations: {
    type: MarkdownModelProperty,
    verboseName: 'Explanation of in-kind contributions'
  },
  special_uni_cost: {
    type: NumberModelProperty,
    verboseName: 'Special unit cost',
    defaultValue: 0,
    validators: [Validators.pattern(tenDigitsRegex)]
  },
  special_uni_cost_explanation: {
    type: MarkdownModelProperty,
    verboseName: 'Explanation of special unit cost'
  },
  _requested_contribution: {
    type: NumberModelProperty,
    verboseName: 'Requested contribution',
    helpText: 'Default negative value means requested contribution equals maximum contribution.\n' +
    'Only fill in this field if you want to request less money than the maximum\n' +
    'allows you to do. This is usually not recommended.',
    validators: [Validators.pattern(tenDigitsRegex)]
  }
})
export class Partner extends AutogeneratableModel {
  toListItem(injector?: Injector) {
    return new Promise<SortableEntity>((resolve) => {
      resolve(new SortableEntity(this.id, this['shortname']));
    });
  }
}
