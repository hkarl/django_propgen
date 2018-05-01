import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {InstantiateResponse} from '../menu.component';

@Component({
  selector: 'propgen-instantiation-dialog',
  template: '<h1 mat-dialog-title>Instantiated Templates</h1>' +
  '<div mat-dialog-content>' +
  '  <h4>Textblocks</h4>' +
  '  <div *ngFor="let textblock of data[0]">{{textblock.obj.name}} => {{textblock.result}}</div>' +
  '  <h4>Templates</h4>' +
  '  <div *ngFor="let template of data[1]">{{template.obj.name}} => {{template.result}}</div>' +
  '  <h4>Bibliographies</h4>' +
  '  <div *ngFor="let bib of data[2]">{{bib.obj.name}} => {{bib.result}}</div>' +
  '</div>' +
  '<div mat-dialog-actions>' +
  '  <button mat-raised-button mat-dialog-close>Ok</button>' +
  '</div>'
})
export class InstantiationDialogComponent {
  constructor(private dialogRef: MatDialogRef<InstantiationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: [InstantiateResponse[], InstantiateResponse[], InstantiateResponse[]]) {}

}
