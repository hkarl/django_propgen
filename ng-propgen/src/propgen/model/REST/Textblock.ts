import {StringModelProperty} from '../../modelcreator/string.model.property';
import {MarkdownModelProperty} from '../../modelcreator/markdown.model.property';
import {SortableEntity} from '../SortableEntity';
import {AutogeneratableModel} from '../AutogeneratableModel';
import {Autogeneratable} from '../../decorators/autogeneratable.decorator';
import {Validators} from '@angular/forms';
import {RouteMode} from '../../components/catch-all/catch-all.component';


@Autogeneratable({
  backendPath: '/Textblock',
  routes: [
    {
      path: 'textblocks',
      mode: RouteMode.List,
      data: {
        title: 'Textblocks'
      }
    },
    {
      path: 'textblock/:id',
      mode: RouteMode.Detail,
      data: {
        title: 'Textblock'
      }
    }
  ],
  orderable: true,
  hasVersioning: true
}, {
  name: {
    type: StringModelProperty,
    verboseName: 'Short name of the textblock',
    helpText: 'This name is used to refer to the textblock in templates',
    validators: [Validators.maxLength(64)]
  },
  description: {
    type: StringModelProperty,
    verboseName: 'Brief description',
    helpText: 'Provide a brief description of this block; leave empty if clear; does not end up in output'
  },
  filename: {
    type: StringModelProperty,
    verboseName: 'Filename for the content of the textblock',
    helpText: 'Provide a filename if you want the content of this textblock to be written to a markdown file. If empty, ' +
    'no file is produced automatically; content has to be used in a template explicitly, then.',
    validators: [Validators.maxLength(64)]
  },
  textblock: {
    type: MarkdownModelProperty,
    verboseName: 'Actual text',
    helpText: 'Actual text for this block, in Markdown format'
  }
})
export class Textblock extends AutogeneratableModel {
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
