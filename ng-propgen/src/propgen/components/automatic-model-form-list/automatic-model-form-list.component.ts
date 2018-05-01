import {Component, Injector, Input, OnDestroy} from '@angular/core';
import {SortableEntity} from '../../model/SortableEntity';
import {Router} from '@angular/router';
import {AutogeneratableModel} from '../../model/AutogeneratableModel';
import {ReorderService} from '../../services/reorder.service';
import {AutomatedBackendService} from '../../services/automated-backend.service';
import {AutogeneratableSettings} from '../../decorators/autogeneratable.decorator';
import {Subscription} from 'rxjs/Subscription';
import {RESTModelInterface} from '../../model/RESTModelInterface';
import {RouteMode} from '../catch-all/catch-all.component';

@Component({
  selector: 'propgen-automatic-model-form-list',
  template: '<propgen-sortable-list\n' +
  '  (onCreateEntity)="add()"\n' +
  '  (onEditEntity)="edit($event)"\n' +
  '  (onVersionEntity)="routeToVersion($event)"\n' +
  '  (onDeleteEntity)="delete($event)"' +
  '  [title]="title"\n' +
  '  (onReorder)="onReorder($event)"\n' +
  '  [entities]="sortableData"\n' +
  '  [hasVersioning]="hasVersioning"\n' +
  '  [canReorder]="canReorder"' +
  '  [canDelete]="canDelete">\n' +
  '</propgen-sortable-list>'
})
export class AutomaticModelFormListComponent implements OnDestroy {
  constructor(
    private router: Router,
    private reorder: ReorderService,
    private backend: AutomatedBackendService,
    private injector: Injector,
    ) {
  }
  private data: AutogeneratableModel[];
  public sortableData: SortableEntity[] = [];
  public title: string;
  protected path: string;
  public hasVersioning: boolean = false;
  public canReorder: boolean = false;
  public canDelete: boolean = false;
  private onReceiveData(next: RESTModelInterface[]) {
    this.data = next.map(d => new this._type(d));
    Promise.all(this.data.map((d) => {
      return d.toListItem(this.injector);
    })).then((data) => {
      this.sortableData = data;
    });
  }
  private onReceiveError(error) {
    console.error(error);
  }
  private subscription: Subscription;
  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  private _type: any;
  @Input() public set type(t: any) {
    this._type = t;
    this.subscription = this.backend.getAll(t).subscribe((next) => this.onReceiveData(next), (error) => this.onReceiveError(error));
    let generatorProperties: AutogeneratableSettings = t.prototype.getAutoGeneratorSettings();
    this.hasVersioning = generatorProperties.hasVersioning;
    this.canReorder = generatorProperties.orderable;
    this.canDelete = !generatorProperties.forbidDeletion;
    const detailRoute = generatorProperties.routes.find(r => r.mode === RouteMode.Detail);
    if(detailRoute) {
      this.path = detailRoute.path.replace(':id', '');
    }
    else {
      this.path = '';
    }
  }

  @Input() public set params(p: any) {
    this.title = p.title;
  }

  public add(): void {
    this.router.navigate([this.path, 'add']);
  }
  public edit($event): void {
    this.router.navigate([this.path, $event.id]);
  }
  public onReorder($event): void {
    if(this.canReorder) {
      // TODO: freeze UI and display progress notification
      let dirtyData = this.reorder.calculateReordering($event, this.data);
      this.backend.saveOrder(this._type, dirtyData).then(() => {

      }).catch((error) => {
        console.error(error);
      });
    }
  }
  public routeToVersion($event) {
    this.router.navigate([this.path, $event.id, 'versions']);
  }
  public delete($event: SortableEntity): void {
    const entity = this.data.find(d => d.id === $event.id);
    if(entity) {
      this.backend.delete(this._type, entity);
    }
    else {
      console.warn('Cannot delete', $event, 'since it does not exist');
    }
  }
}
