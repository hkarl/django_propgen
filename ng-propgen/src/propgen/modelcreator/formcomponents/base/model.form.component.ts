import {EventEmitter} from '@angular/core';
import {ModelProperty} from '../../base/model.property';
import {FormControl} from '@angular/forms';
import {ModelPropertyType} from '../../base/model.property.type';

export abstract class ModelFormComponent {
  public abstract data: any;
  public abstract dataChange: EventEmitter<any>;
  public abstract setPropertyDescription(desc: ModelPropertyType);
  public placeholder: string;
  public helpText: string;
  protected _formControl: FormControl = new FormControl();

  public get formControl(): FormControl {
    return this._formControl;
  }

  protected updatePlaceholder(desc: ModelPropertyType) {
    if(desc.verboseName) {
      this.placeholder = desc.verboseName;
    }
    else {
      this.placeholder = desc.name.charAt(0).toUpperCase() + desc.name.slice(1);
    }
  }
  protected updateHelpText(desc: ModelPropertyType) {
    if(desc.helpText) {
      this.helpText = desc.helpText;
    }
  }
  public get errorText(): string {
    if(this._formControl.errors && this._formControl.errors.required) {
      return 'This property is required';
    }
    let text = this.getErrorText();
    if(!text) {
      console.error('Unknown validation error: ', this._formControl.errors);
      text = 'Encountered an unknown validation error';
    }
    return text;
  }
  protected getErrorText() {
    return null;
  }
}
