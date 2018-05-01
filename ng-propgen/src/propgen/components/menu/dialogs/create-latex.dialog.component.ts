import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'propgen-create-latex-dialog',
  template: '<h1 mat-dialog-title>Created LaTeX Templates</h1>' +
  '<div mat-dialog-content>' +
  '  <div *ngFor="let template of keys">{{template}} => {{data[template]}}</div>' +
  '</div>' +
  '<div mat-dialog-actions>' +
  '  <button mat-raised-button mat-dialog-close>Ok</button>' +
  '</div>'
})
export class CreateLatexDialogComponent {
  public keys: string[];
  constructor(private dialogRef: MatDialogRef<CreateLatexDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {[key:string]: string}) {
    this.keys = Object.keys(data);
  }
}
