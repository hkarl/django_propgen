import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ModelFormComponent} from './base/model.form.component';
import {ModelPropertyType} from '../base/model.property.type';

@Component({
  selector: 'propgen-boolean-form-input',
  template: '<mat-slide-toggle [formControl]="formControl">{{placeholder}}</mat-slide-toggle>' +
  '<div class="mat-form-field mat-form-field-should-float mat-form-field-can-float">' +
  '  <div class="mat-input-wrapper mat-form-field-wrapper">' +
  '    <div class="mat-input-subscript-wrapper mat-form-field-subscript-wrapper">' +
  '      <div class="mat-input-hint-wrapper mat-form-field-hint-wrapper">' +
  '        <div class="mat-hint">{{helpText}}</div>' +
  '        <div class="mat-input-hint-spacer mat-form-field-hint-spacer"></div>' +
  '      </div>' +
  '    </div>' +
  '  </div>' +
  '</div>'
})
export class BooleanFormComponent extends ModelFormComponent {
  constructor() {
    super();
    this.formControl.valueChanges.subscribe((value) => {
      this.data = value;
    });
  }
  private _data: boolean;
  get data(): boolean {
    return this._data;
  };
  @Input() set data(d: boolean) {
    if(d !== this._data) {
      this._data = d;
      this.dataChange.emit(d);
      this.formControl.setValue(d);
    }
  }
  @Output() dataChange = new EventEmitter<boolean>();
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
}
