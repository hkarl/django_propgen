import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {CrossTableData, CrossTableValue} from '../cross-table/cross-table.component';
import {DefaultBackendService} from '../../services/default-backend.service';
import {Subscription} from 'rxjs/Subscription';
import {DeliverablePartnerTaskPM, Partner, Task, Deliverable} from '../../model/REST';
import {AutomatedBackendService} from '../../services/automated-backend.service';
import {SortableEntity} from '../../model/SortableEntity';

const endpoint = '/DeliverablePartnerTaskPM';

@Component({
  selector: 'propgen-deliverable-partner-task-effort',
  template: '<propgen-root></propgen-root>' +
  '<mat-form-field style="width: 100%"><mat-select placeholder="Select a dataset to be fixed" [(value)]="selected">' +
  '  <mat-optgroup label="Deliverables"><mat-option *ngFor="let d of deliverables" value="d-{{d.id}}">{{d.title}}</mat-option></mat-optgroup>' +
  '  <mat-optgroup label="Partners"><mat-option *ngFor="let p of partners" value="p-{{p.id}}">{{p.title}}</mat-option></mat-optgroup>' +
  '  <mat-optgroup label="Tasks"><mat-option *ngFor="let t of tasks" value="t-{{t.id}}">{{t.title}}</mat-option></mat-optgroup>' +
  '</mat-select></mat-form-field>' +
  '<propgen-cross-table [data]="data" (update)="onUpdate($event)"></propgen-cross-table>'
})
export class DeliverablePartnerTaskEffortComponent implements OnInit, OnDestroy {
  public data: CrossTableData = {
    cols: [],
    rows: [],
    values: [],
    colDescription: '',
    rowDescription: ''
  };
  private taskSubscription: Subscription;
  private partnerSubscription: Subscription;
  private deliverableSubscription: Subscription;
  private valueSubscription: Subscription;
  private deliverablePartnerTaskPM: DeliverablePartnerTaskPM[] = [];
  public tasks: SortableEntity[] = [];
  public deliverables: SortableEntity[] = [];
  public partners: SortableEntity[] = [];
  private _selected: string = null;
  public set selected(newValue: string) {
    this._selected = newValue;
    const id = this.getSelectedId();
    let values: CrossTableValue[] = [];
    switch(newValue[0]) {
      case 'd':
        values = this.deliverablePartnerTaskPM.filter(pm => pm.deliverable === id).map(pm => {
          return {
            colId: pm.partner,
            rowId: pm.task,
            value: pm.effort,
          }
        });
        this.data = {...this.data,
          values: values,
          colDescription: 'Partners', cols: this.partners,
          rowDescription: 'Tasks', rows: this.tasks
        };
        break;
      case 'p':
        values = this.deliverablePartnerTaskPM.filter(pm => pm.partner === id).map(pm => {
          return {
            colId: pm.deliverable,
            rowId: pm.task,
            value: pm.effort,
          }
        });
        this.data = {...this.data,
          values: values,
          colDescription: 'Deliverables', cols: this.deliverables,
          rowDescription: 'Tasks', rows: this.tasks
        };
        break;
      case 't':
        values = this.deliverablePartnerTaskPM.filter(pm => pm.task === id).map(pm => {
          return {
            colId: pm.deliverable,
            rowId: pm.partner,
            value: pm.effort,
          }
        });
        this.data = {...this.data,
          values: values,
          rowDescription: 'Partners', rows: this.partners,
          colDescription: 'Deliverables', cols: this.deliverables
        };
        break;
      default:
        return;
    }
  }
  public get selected() {
    return this._selected;
  }
  constructor(private backend: DefaultBackendService, private autoBackend: AutomatedBackendService, private injector: Injector) {
  }
  ngOnInit() {
    this.taskSubscription = this.autoBackend.getAll(Task).subscribe(
      (tasks) => {
        Promise.all(tasks.map((t) => {
          return new Task(t).toListItem(this.injector);
        })).then((data) => {
          // simple assignment does not trigger change detection;
          this.tasks = data;
        });
      }
    );
    this.partnerSubscription = this.autoBackend.getAll(Partner).subscribe(
      (partners) => {
        Promise.all(partners.map((p) => {
          return new Partner(p).toListItem(this.injector);
        })).then((data) => {
          this.partners = data;
        });
      }
    );
    this.deliverableSubscription = this.autoBackend.getAll(Deliverable).subscribe(
      (deliverables) => {
        Promise.all(deliverables.map((d) => {
          return new Deliverable(d).toListItem(this.injector);
        })).then((data) => {
          this.deliverables = data;
        });
      }
    );
    this.valueSubscription = this.backend.getAll(endpoint).subscribe(
      (values: DeliverablePartnerTaskPM[]) => {
        this.deliverablePartnerTaskPM = values;
      }
    );
  }
  ngOnDestroy() {
    if(this.valueSubscription) {
      this.valueSubscription.unsubscribe();
    }
    if(this.partnerSubscription) {
      this.partnerSubscription.unsubscribe();
    }
    if(this.taskSubscription) {
      this.taskSubscription.unsubscribe();
    }
    if(this.deliverableSubscription) {
      this.deliverableSubscription.unsubscribe();
    }
  }

  private getSelectedId(): number {
    return parseInt(this._selected.substr(2));;
  }

  public onUpdate($event: CrossTableValue) {
    let existing: DeliverablePartnerTaskPM = null;
    let pm: Partial<DeliverablePartnerTaskPM> = {};
    let id = this.getSelectedId();
    switch (this._selected[0]) {
      case 'd':
        existing = this.deliverablePartnerTaskPM.find(pm =>
          pm.deliverable === id && pm.partner === $event.colId && pm.task === $event.rowId);
        pm = {
          deliverable: id,
          partner: $event.colId,
          task: $event.rowId
        };
        break;
      case 'p':
        existing = this.deliverablePartnerTaskPM.find(pm =>
          pm.deliverable === $event.colId && pm.partner === id && pm.task === $event.rowId);
        pm = {
          deliverable: $event.colId,
          partner: id,
          task: $event.rowId
        };
        break;
      case 't':
        existing = this.deliverablePartnerTaskPM.find(pm =>
          pm.deliverable === $event.colId && pm.partner === $event.rowId && pm.task === id);
        pm = {
          deliverable: $event.colId,
          partner: $event.rowId,
          task: id
        };
        break;
      default:
        return;
    }


    if(!existing) {
      existing = new DeliverablePartnerTaskPM(pm);
    }
    existing.effort = $event.value;
    this.backend.save(endpoint, existing).then(() => {
    }).catch((error) => {
      // TODO: Snackbar
      console.error(error);
    });
  }
}
