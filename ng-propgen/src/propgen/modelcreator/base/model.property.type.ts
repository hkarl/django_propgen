import {Type} from '@angular/core';
import {ModelProperty} from './model.property';
import {ValidatorFn} from '@angular/forms';
import {AutogeneratableModel} from '../../model/AutogeneratableModel';

export type ModelPropertyType = {
  type: Type<ModelProperty>;
  name?: string;
  verboseName?: string;
  helpText?: string;
  required?: boolean;
  defaultValue?: any;
  component?: any;
  validators?: ValidatorFn[];
  foreignType?: Type<AutogeneratableModel>;
}
