import {StringModelProperty} from '../../modelcreator/string.model.property';
import {AutogeneratableModel} from './../AutogeneratableModel';
import {Autogeneratable} from '../../decorators/autogeneratable.decorator';
import {Validators} from '@angular/forms';
import {RouteMode} from '../../components/catch-all/catch-all.component';

@Autogeneratable({
  backendPath: '/Bibliography',
  routes: [
    {
      path: 'bibliography',
      mode: RouteMode.List,
      data: {
        title: 'Bibliography'
      }
    },
    {
      path: 'bibliography/:id',
      mode: RouteMode.Detail,
      data: {
        title: 'Bibliography'
      }
    }
  ],
  orderable: false,
  hasVersioning: true
}, {
  filename: {
    type: StringModelProperty,
    verboseName: 'Name of the bibliography file, including extension',
    helpText: 'Extension of the filename will be used to determine how to process this file.',
    validators: [Validators.maxLength(64)]
  },
  bibliography: {
    type: StringModelProperty,
    verboseName: 'Bibliographic information',
    helpText: 'Enter the actual bibliographic information, depending on the format you are using.'
  }
})
export class Bibliography extends AutogeneratableModel {
}
