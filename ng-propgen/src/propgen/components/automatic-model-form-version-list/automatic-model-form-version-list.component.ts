import {Component, Input, OnDestroy} from '@angular/core';
import {Version} from '../../model/REST';
import {RESTModelInterface} from '../../model/RESTModelInterface';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar, MatSnackBarRef, SimpleSnackBar} from '@angular/material';
import {AutomatedBackendService} from '../../services/automated-backend.service';
import {AutogeneratableSettings} from '../../decorators/autogeneratable.decorator';

@Component({
  selector: 'propgen-automatic-model-form-version-list',
  template: '<h1>Versions of {{title}}</h1>' +
  '<mat-paginator *ngIf="data.length > 10" [length]="data.length" [pageSize]="pageSize" [pageIndex]="page" (page)="onPaginatorChanged($event)"></mat-paginator>' +
  '<mat-list>' +
  '  <mat-list-item *ngFor="let d of currentData">' +
  '    <h3 mat-line class="mat-headline">{{d.object_repr}}</h3>' +
  '    <p mat-line>{{d.revision.date_created}} by {{d.revision.user ? d.revision.user : "None"}}</p>' +
  '    <p mat-line>{{d.revision.comment}}</p>' +
  '    <a mat-line routerLink="../version/{{d.id}}">Details</a>' +
  '  </mat-list-item>' +
  '</mat-list>'
})
export class AutomaticModelFormVersionListComponent implements OnDestroy {
  constructor(protected backend: AutomatedBackendService, protected snackBar: MatSnackBar) {
  }
  public title: string;
  public ready = false;
  protected snackBarRef: MatSnackBarRef<SimpleSnackBar>;
  ngOnDestroy() {
    if(this.snackBarRef) {
      this.snackBarRef.dismiss();
    }
  }
  protected _data = [];
  public get data() {
    return this._data;
  }
  public set data(d: Array<Version<RESTModelInterface>>) {
    this._data = d;
    this.updatePageData();
  }
  protected _type;
  protected _id;
  @Input() public set type(t) {
    this._type = t;
    this.fetch();
  };
  @Input() public set params(p: any) {
    this._id = p.id;
    this.title = p.title;
    this.fetch();
  }
  public fetch() {
    if(this._id && this._type) {
      let id = Number(this._id);
      if (!isNaN(id) || id < 1) {
        // requested specific id, fetch from server
        this.backend.getVersions(this._type, id).then((result) => {
          this.data = result;
          this.ready = true;
        }).catch((error) => {
          console.error(error);
          if (error instanceof HttpErrorResponse && error.status === 404) {
            // Django returns a 500 status code if the ID does not exist, but this is the future proof way
            this.snackBarRef = this.snackBar.open('The ID you requested does not exist in the database.', 'Dismiss', {
              verticalPosition: "top"
            });
          }
          else {
            let message = 'Could not get data from server.';
            if (this.data) {
              // already have some from the cache
              message += ' Your data might be outdated.';
            }
            this.snackBarRef = this.snackBar.open(message, 'Reload page', {
              verticalPosition: "top"
            });
            this.snackBarRef.onAction().subscribe(() => {
              window.location.reload();
            });
          }
        });
      }
    }
  }

  public currentData = [];
  public pageSize = 10;
  public page = 0;
  public onPaginatorChanged($event) {
    this.pageSize = $event.pageSize;
    this.page = $event.pageIndex;

    this.updatePageData();
  }
  protected updatePageData() {
    let startIndex = this.pageSize * this.page;
    let endIndex = startIndex + this.pageSize;
    this.currentData = this.data.slice(startIndex, endIndex + 1);
  }
}
