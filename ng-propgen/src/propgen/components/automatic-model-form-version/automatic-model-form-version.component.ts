import {Component, Input, OnDestroy} from '@angular/core';
import {MatSnackBar, MatSnackBarRef, SimpleSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {Version} from '../../model/REST';
import {RESTModelInterface} from '../../model/RESTModelInterface';
import {AutomatedBackendService} from '../../services/automated-backend.service';

@Component({
  selector: 'propgen-automatic-model-form-version',
  template: '<propgen-detail-editor\n' +
  '  [readonly]="true"\n' +
  '  [enabled]="ready"\n' +
  '  [(ngModel)]="data"\n' +
  '  (onCancel)="onCancel()">\n' +
  '</propgen-detail-editor>'
})
export class AutomaticModelFormVersionComponent implements OnDestroy {
  constructor(
    protected snackBar: MatSnackBar,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backend: AutomatedBackendService
  ) {
  }
  public ready = false;
  protected snackBarRef: MatSnackBarRef<SimpleSnackBar>;
  public data: RESTModelInterface;
  protected version: Version<any>;
  protected _id;
  protected _versionId;
  protected _type;
  @Input() public set params(p: any) {
    this._id = p.id;
    this._versionId = p.versionId;
    this.fetch();
  }
  @Input() public set type(t) {
    this._type = t;
    this.fetch();
  }
  ngOnDestroy(): void {
    if(this.snackBarRef) {
      this.snackBarRef.dismiss();
    }
  }
  public onCancel() {
    this.router.navigate(['../../versions/'], { relativeTo: this.route });
  }
  protected fetch() {
    if(this._type && this._id && this._versionId) {
      let id = Number(this._id);
      let versionId = Number(this._versionId);
      if (!isNaN(id) && id > 0 && !isNaN(versionId) && versionId > 0) {
        // requested specific id, fetch from server
        this.backend.getVersion(this._type, id, versionId).then((result) => {
          this.version = result;
          let object = JSON.parse(result.serialized_data)[0];
          this.data = new this._type(object.fields);
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
}
