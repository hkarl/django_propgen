import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SortableEntity} from '../../model/SortableEntity';

export type CrossTableValue = {
  colId: number,
  rowId: number,
  value: number
};

export type CrossTableData = {
  cols: SortableEntity[];
  rows: SortableEntity[];
  values: CrossTableValue[];
  colDescription: string;
  rowDescription: string;
};

@Component({
  selector: 'propgen-cross-table',
  templateUrl: './cross-table.component.html',
  styleUrls: ['./cross-table.component.css']
})
export class CrossTableComponent implements OnInit {

  private _data: CrossTableData = {
    cols: [],
    rows: [],
    values: [],
    colDescription: 'x',
    rowDescription: 'y'
  };
  public values = [];
  public get tableName(): string {
    return this._data.rowDescription + ' / ' + this._data.colDescription;
  }
  @Input() public set data(d: CrossTableData) {
    this._data = d;
    this.values = [];
    for(let row of d.rows) {
      let transformedRow = {
        'name': row.title
      };
      for(let col of d.cols) {
        let index = d.values.findIndex(v => v.rowId === row.id && v.colId === col.id);
        if(index > -1) {
          transformedRow[col.title] = d.values[index].value;
        }
        else {
          transformedRow[col.title] = '-';
        }
      }
      this.values.push(transformedRow);
    }
  }
  public get data(): CrossTableData {
    return this._data;
  }
  @Output() public update = new EventEmitter<CrossTableValue>();
  constructor() { }

  ngOnInit() {
  }

  public onBlur($event, rowIndex: number, col: SortableEntity) {
    if(!$event || !$event.target) {
      return;
    }
    const newValue = parseFloat($event.target.value);
    if(isNaN(newValue) || !isFinite(newValue)) {
      // TODO: give feedback that this is not OK
      return;
    }
    const row = this.data.rows[rowIndex];
    const existing = this.data.values.find(v => v.colId === col.id && v.rowId === row.id);
    if(existing) {
      // even though this is defined as a number (and it should be), Django presents it as a string.
      // also the runtime is actually JS and there is no type checking there, so
      // existing.value === newValue
      // ends up being something like
      // "10.00" === 10
      // which results in a false statement
      // so we cast this to any to be able to parse it as a float again during runtime and ensure type integrity
      const existingValue = parseFloat((<any>existing.value));
      if(!isNaN(existingValue) && isFinite(existingValue) && existingValue === newValue) {
        // no changes, do nothing
        return;
      }
      existing.value = newValue;
    }
    this.update.emit({
      rowId: row.id,
      colId: col.id,
      value: newValue
    });
  }

}
