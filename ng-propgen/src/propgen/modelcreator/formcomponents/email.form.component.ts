import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ModelFormComponent} from './base/model.form.component';
import {ModelPropertyType} from '../base/model.property.type';

@Component({
  selector: 'propgen-email-form-input',
  template: '<mat-form-field hintLabel="{{helpText}}">\n' +
  '  <input type="email" matInput placeholder="{{placeholder}}" [formControl]="formControl"/>\n' +
  '  <mat-error *ngIf="formControl.invalid && (formControl.dirty && formControl.touched)">{{errorText}}</mat-error>' +
  '</mat-form-field>'
})
export class EmailFormComponent extends ModelFormComponent {
  constructor() {
    super();
    this.formControl.valueChanges.subscribe((value) => {
      this.data = value;
    });
  }
  private _data: string;
  get data(): string {
    return this._data;
  };
  @Input() set data(d: string) {
    if(d !== this._data) {
      this._data = d;
      this.dataChange.emit(d);
      this.formControl.setValue(d);
    }
  }
  @Output() dataChange = new EventEmitter<string>();
  private _propertyDescription: ModelPropertyType;
  @Input() set propertyDescription(desc: ModelPropertyType) {
    this._propertyDescription = desc;
    this.updatePlaceholder(desc);
    this.updateHelpText(desc);
    this.formControl.setValidators(desc.validators);
  };
  public setPropertyDescription(desc: ModelPropertyType) {
    this.propertyDescription = desc;
  }
  protected getErrorText(): string {
    if(this._formControl.hasError('email')) {
      return 'Please enter a valid email address';
    }
  }

}
