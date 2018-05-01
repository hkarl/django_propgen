import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ModelFormComponent} from './base/model.form.component';
import {ModelPropertyType} from '../base/model.property.type';

@Component({
  selector: 'propgen-text-form-input',
  template: '<mat-form-field hintLabel="{{helpText}}">\n' +
  '  <textarea matTextareaAutosize matInput matAutosizeMinRows="5" matAutosizeMaxRows="30" [formControl]="formControl" placeholder="{{placeholder}}"></textarea>\n' +
  '</mat-form-field>'
})
export class TextFormComponent extends ModelFormComponent {
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

}
