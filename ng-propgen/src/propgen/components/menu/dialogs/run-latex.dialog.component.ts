import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DefaultBackendService} from '../../../services/default-backend.service';

export type ProcessResult = {
  stdout: string;
  stderr: string;
  returncode: number;
};

export type RunLatexResponse = {
  obj: {
    id: number;
    name: string;
  };
  warning: string;
  result: string;
  pdf: string;
  run1: {
    warning: string;
    result: ProcessResult;
    exception: string;
  },
  bibtex: {
    warning: string;
    result: ProcessResult;
    exception: string;
  }
}

@Component({
  selector: 'propgen-run-latex-dialog',
  template: '<h1 mat-dialog-title>Generating PDF...</h1>' +
  '<div mat-dialog-content>' +
  '  <mat-accordion>' +
  '    <mat-expansion-panel *ngFor="let d of data">' +
  '      <mat-expansion-panel-header>' +
  '        <mat-panel-title>' +
  '          <a *ngIf="d.result === \'ok\'" href="{{ backend }}/media/produced/{{ d.pdf }}" target="_blank">' +
  '            <mat-icon>get_app</mat-icon>' +
  '          </a>' +
  '          {{d.obj.name}}' +
  '        </mat-panel-title>' +
  '        <mat-panel-description>' +
  '          {{d.pdf}} - {{d.result}}' +
  '        </mat-panel-description>' +
  '      </mat-expansion-panel-header>' +
  '      <h4>pdftex</h4>' +
  '      <pre>{{d.run1.result.stdout}}</pre>' +
  '      <h4>bibtex</h4>' +
  '      <pre>{{d.bibtex.result.stdout}}</pre>' +
  '    </mat-expansion-panel>' +
  '  </mat-accordion>' +
  '</div>' +
  '<div mat-dialog-actions>' +
  '  <button mat-raised-button mat-dialog-close>Ok</button>' +
  '  <a mat-raised-button href="{{ backend }}/media/produced/output.tgz">Download all files</a>' +
  '</div>',
})
export class RunLatexDialogComponent {
  public backend = DefaultBackendService.baseUrl;
  constructor(private dialogRef: MatDialogRef<RunLatexDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: RunLatexResponse[]) {}
}
