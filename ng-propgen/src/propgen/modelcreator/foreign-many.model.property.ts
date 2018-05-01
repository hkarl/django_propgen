import {ForeignModelProperty} from './base/foreign-model.property';
import {DefaultComponent} from '../decorators/default-component.decorator';
import {ForeignManyFormComponent} from './formcomponents/foreign-many.form.component';

@DefaultComponent(ForeignManyFormComponent)
export class ForeignManyModelProperty extends ForeignModelProperty<Array<number>> {
  public defaultValue: Array<number> = [];
  public constructor(init?: Partial<ForeignManyModelProperty>) {
    super();
    Object.assign(this, init);
  }

}
