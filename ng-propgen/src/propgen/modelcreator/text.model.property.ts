import {ModelProperty} from './base/model.property';
import {DefaultComponent} from '../decorators/default-component.decorator';
import {TextFormComponent} from './formcomponents/text.form.component';

@DefaultComponent(TextFormComponent)
export class TextModelProperty extends ModelProperty<string> {
  public constructor(init?: Partial<TextModelProperty>) {
    super();
    Object.assign(this, init);
  }

}
