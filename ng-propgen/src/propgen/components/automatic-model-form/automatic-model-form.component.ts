import {Component, Input, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {MatSnackBar, MatSnackBarRef, SimpleSnackBar} from '@angular/material';
import {HttpErrorResponse} from '@angular/common/http';
import {AutomatedBackendService} from '../../services/automated-backend.service';
import {AutogeneratableSettings} from '../../decorators/autogeneratable.decorator';
import {AutogeneratableModel} from '../../model/AutogeneratableModel';
import {RouteMode} from '../catch-all/catch-all.component';

@Component({
  selector: 'propgen-automatic-model-form',
  template: '<propgen-detail-editor\n' +
  '  [title]="title"\n' +
  '  (onCancel)="onCancel()"\n' +
  '  (onSave)="onSave()"\n' +
  '    [enabled]="ready"\n' +
  '    [(ngModel)]="data">\n' +
  '    </propgen-detail-editor>'
})
export class AutomaticModelFormComponent implements OnDestroy {

  constructor(
    protected router: Router,
    protected snackBar: MatSnackBar,
    protected backend: AutomatedBackendService,
  ) {
  }
  public ready = false;
  public data: AutogeneratableModel;
  protected listPath: string;
  public title: string;
  protected snackBarRef: MatSnackBarRef<SimpleSnackBar>;
  private _type;
  private _id = null;
  @Input() public set params(p) {
    this.title = p.title;
    this._id = p.id;
    this.fetch();
  }
  @Input() public set type(t) {
    this._type = t;
    let generatorProperties: AutogeneratableSettings = t.prototype.getAutoGeneratorSettings();
    const listRoute = generatorProperties.routes.find(r => r.mode === RouteMode.List);
    if(listRoute) {
      this.listPath = listRoute.path;
    }
    else {
      this.listPath = '';
    }
    this.fetch();
  }
  private fetch() {
    if(this._type && this._id !== null) {
      let id = Number(this._id);
      if(!isNaN(id) || id < 1) {
        // requested specific id, fetch from server
        this.backend.get(this._type, id).then((result) => {
          this.data = new this._type(result);
          this.ready = true;
        }).catch((error) => {
          this.onError(error);
        });
      }
      else {
        try {
          // got a number less than 1 or a string => create new item
          this.data = new this._type({});
          this.ready = true;
        }
        catch(error) {
          this.onError(error);
        }
      }
    }
  }

  protected onError(error) {
    console.error(error);
    if(error instanceof HttpErrorResponse && error.status === 404) {
      // Django returns a 500 status code if the ID does not exist, but this is the future proof way
      this.snackBarRef = this.snackBar.open('The ID you requested does not exist in the database.', 'Back to overview', {
        verticalPosition: "top"
      });
      this.snackBarRef.onAction().subscribe(() => {
        this.routeToList();
      })
    }
    else {
      let message = 'Could not get data from server.';
      if(this.data) {
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
  }

  ngOnDestroy(): void {
    if(this.snackBarRef) {
      this.snackBarRef.dismiss();
    }
  }
  public onSave() {
    this.backend.save(this._type, this.data)
      .then(() => this.routeToList())
      .catch((error) => {
        console.error(error);
        this.snackBarRef = this.snackBar.open('Could not save changes. See error log for details.', 'Dismiss', {
          verticalPosition: "top"
        });
      });
  }
  public onCancel() {
    this.routeToList();
  }
  protected routeToList() {
    this.router.navigate([this.listPath]);
  }

}
