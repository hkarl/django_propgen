import {ForeignModelProperty} from './base/foreign-model.property';
import {DefaultComponent} from '../decorators/default-component.decorator';
import {ForeignKeyFormComponent} from './formcomponents/foreign.form.component';

@DefaultComponent(ForeignKeyFormComponent)
export class ForeignKeyModelProperty extends ForeignModelProperty<number> {
  public constructor(init?: Partial<ForeignKeyModelProperty>) {
    super();
    Object.assign(this, init);
  }

}
