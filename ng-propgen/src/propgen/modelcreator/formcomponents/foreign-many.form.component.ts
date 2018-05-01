import {Component, EventEmitter, Injector, Input, Output} from '@angular/core';
import {ModelFormComponent} from './base/model.form.component';
import {SortableEntity} from '../../model/SortableEntity';
import {ModelPropertyType} from '../base/model.property.type';
import {AutomatedBackendService} from '../../services/automated-backend.service';

@Component({
  selector: 'propgen-foreign-key-form-input',
  template: '<mat-form-field hintLabel="{{helpText}}">\n' +
  '  <mat-select [formControl]="formControl" placeholder="{{placeholder}}" multiple>' +
  '    <mat-option *ngFor="let e of entityList" [value]="e.id">{{ e.title }}</mat-option>' +
  '  </mat-select>\n' +
  '</mat-form-field>'
})
export class ForeignManyFormComponent extends ModelFormComponent {
  constructor(private backend: AutomatedBackendService, private injector: Injector) {
    super();
    this.formControl.valueChanges.subscribe((value) => {
      this.data = value;
    });
  }
  private _data: Array<number>;
  get data(): Array<number> {
    return this._data;
  };
  @Input() set data(d: Array<number>) {
    if(d !== this._data) {
      this._data = d;
      this.dataChange.emit(d);
      this.formControl.setValue(d);
    }
  }
  @Output() dataChange = new EventEmitter<Array<number>>();
  private _propertyDescription: ModelPropertyType;
  @Input() set propertyDescription(desc: ModelPropertyType) {
    this._propertyDescription = desc;
    this.backend.getAll(desc.foreignType).subscribe((data) => {
      Promise.all(data.map((d) => {
        return new desc.foreignType(d).toListItem(this.injector);
      })).then((data) => {
        this.entityList = data;
      });
    });
    this.updatePlaceholder(desc);
    this.updateHelpText(desc);
    this.formControl.setValidators(desc.validators);
  };
  public setPropertyDescription(desc: ModelPropertyType) {
    this.propertyDescription = desc;
  }

  public entityList: SortableEntity[];


}
