import {ModelProperty} from './base/model.property';
import {Validators} from '@angular/forms';
import {DefaultComponent} from '../decorators/default-component.decorator';
import {EmailFormComponent} from './formcomponents/email.form.component';

@DefaultComponent(EmailFormComponent)
export class EmailModelProperty extends ModelProperty<string> {
  public constructor(init?: Partial<EmailModelProperty>) {
    super();
    Object.assign(this, init);
  }

  public getValidators() {
    let base = super.getValidators();
    base.push(Validators.email);
    return base;
  }
}
