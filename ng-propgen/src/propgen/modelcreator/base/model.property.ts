import {ValidatorFn, Validators} from '@angular/forms';

export abstract class ModelProperty<T = {}> {
  public name: string;
  public verboseName: string;
  public helpText: string;
  public required: boolean;
  public defaultValue: T;
  public getValidators(): Array<ValidatorFn> {
    if(this.required) {
      return [Validators.required];
    }
    return [];
  };
  public component: any;
}
