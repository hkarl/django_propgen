import {ModelProperty} from './base/model.property';
import {Validators} from '@angular/forms';
import {DefaultComponent} from '../decorators/default-component.decorator';
import {NumberFormComponent} from './formcomponents/number.form.component';

@DefaultComponent(NumberFormComponent)
export class NumberModelProperty extends ModelProperty<number> {
  public maxDigits: number;
  public decimalPlaces: number;
  public minValue: number = null;
  public maxValue: number = null;
  public constructor(init?: Partial<NumberModelProperty>) {
    super();
    Object.assign(this, init);
  }

  public getValidators() {
    let base = super.getValidators();
    if(this.minValue !== null) {
      base.push(Validators.min(this.minValue));
    }
    else if(this.maxDigits > 0) {
      base.push(Validators.min(-(Math.pow(10, this.maxDigits - 1) + 1)));
    }
    if(this.maxValue !== null) {
      base.push(Validators.max(this.maxValue));
    }
    else if(this.maxDigits > 0) {
      base.push(Validators.max((Math.pow(10, this.maxDigits - 1) + 1)));
    }
    return base;
  }

}
