import {ModelProperty} from './base/model.property';
import {Validators} from '@angular/forms';
import {DefaultComponent} from '../decorators/default-component.decorator';
import {StringFormComponent} from './formcomponents/string.form.component';

@DefaultComponent(StringFormComponent)
export class StringModelProperty extends ModelProperty<string> {
  public minLength: number;
  public maxLength: number;
  public constructor(init?: Partial<StringModelProperty>) {
    super();
    Object.assign(this, init);
  }

  public getValidators() {
    let base = super.getValidators();
    if(this.minLength > 0) {
      base.push(Validators.minLength(this.minLength));
    }
    if(this.maxLength > 0) {
      base.push(Validators.maxLength(this.maxLength));
    }
    return base;
  }

}
