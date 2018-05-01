import {StringModelProperty} from './string.model.property';
import {ModelProperty} from './base/model.property';
import {DefaultComponent} from '../decorators/default-component.decorator';
import {MarkdownPreviewComponent} from './formcomponents/markdown-preview/markdown-preview.component';

@DefaultComponent(MarkdownPreviewComponent)
export class MarkdownModelProperty extends ModelProperty<string> {
  public constructor(init?: Partial<StringModelProperty>) {
    super();
    Object.assign(this, init);
  }

}
