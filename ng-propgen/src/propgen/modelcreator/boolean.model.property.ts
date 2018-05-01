import {ModelProperty} from './base/model.property';
import {DefaultComponent} from '../decorators/default-component.decorator';
import {BooleanFormComponent} from './formcomponents/boolean.form.component';

@DefaultComponent(BooleanFormComponent)
export class BooleanModelProperty extends ModelProperty<boolean> {
  public constructor(init?: Partial<BooleanModelProperty>) {
    super();
    Object.assign(this, init);
  }
}
