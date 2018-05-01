import {Component, Injector, OnDestroy, OnInit} from '@angular/core';
import {CrossTableData, CrossTableValue} from '../cross-table/cross-table.component';
import {DefaultBackendService} from '../../services/default-backend.service';
import {Subscription} from 'rxjs/Subscription';
import {Partner, Task, MilestonePartnerTaskPM, Milestone} from '../../model/REST';
import {AutomatedBackendService} from '../../services/automated-backend.service';
import {SortableEntity} from '../../model/SortableEntity';

const endpoint = '/MilestonePartnerTaskPM';

@Component({
  selector: 'propgen-milestone-partner-task-effort',
  template: '<propgen-root></propgen-root>' +
  '<mat-form-field style="width: 100%"><mat-select placeholder="Select a dataset to be fixed" [(value)]="selected">' +
  '  <mat-optgroup label="Milestones"><mat-option *ngFor="let m of milestones" value="m-{{m.id}}">{{m.title}}</mat-option></mat-optgroup>' +
  '  <mat-optgroup label="Partners"><mat-option *ngFor="let p of partners" value="p-{{p.id}}">{{p.title}}</mat-option></mat-optgroup>' +
  '  <mat-optgroup label="Tasks"><mat-option *ngFor="let t of tasks" value="t-{{t.id}}">{{t.title}}</mat-option></mat-optgroup>' +
  '</mat-select></mat-form-field>' +
  '<propgen-cross-table [data]="data" (update)="onUpdate($event)"></propgen-cross-table>'
})
export class MilestonePartnerTaskEffortComponent implements OnInit, OnDestroy {
  public data: CrossTableData = {
    cols: [],
    rows: [],
    values: [],
    colDescription: '',
    rowDescription: ''
  };
  private taskSubscription: Subscription;
  private partnerSubscription: Subscription;
  private milestoneSubscription: Subscription;
  private valueSubscription: Subscription;
  private milestonePartnerTaskPM: MilestonePartnerTaskPM[] = [];
  public tasks: SortableEntity[] = [];
  public milestones: SortableEntity[] = [];
  public partners: SortableEntity[] = [];
  private _selected: string = null;
  public set selected(newValue: string) {
    this._selected = newValue;
    const id = this.getSelectedId();
    let values: CrossTableValue[] = [];
    switch(newValue[0]) {
      case 'm':
        values = this.milestonePartnerTaskPM.filter(pm => pm.milestone === id).map(pm => {
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
        values = this.milestonePartnerTaskPM.filter(pm => pm.partner === id).map(pm => {
          return {
            colId: pm.milestone,
            rowId: pm.task,
            value: pm.effort,
          }
        });
        this.data = {...this.data,
          values: values,
          colDescription: 'Milestones', cols: this.milestones,
          rowDescription: 'Tasks', rows: this.tasks
        };
        break;
      case 't':
        values = this.milestonePartnerTaskPM.filter(pm => pm.task === id).map(pm => {
          return {
            colId: pm.partner,
            rowId: pm.milestone,
            value: pm.effort,
          }
        });
        this.data = {...this.data,
          values: values,
          colDescription: 'Partners', cols: this.partners,
          rowDescription: 'Milestones', rows: this.milestones
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
    this.milestoneSubscription = this.autoBackend.getAll(Milestone).subscribe(
      (milestones) => {
        Promise.all(milestones.map((d) => {
          return new Milestone(d).toListItem(this.injector);
        })).then((data) => {
          this.milestones = data;
        });
      }
    );
    this.valueSubscription = this.backend.getAll(endpoint).subscribe(
      (values: MilestonePartnerTaskPM[]) => {
        this.milestonePartnerTaskPM = values;
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
    if(this.milestoneSubscription) {
      this.milestoneSubscription.unsubscribe();
    }
  }

  private getSelectedId(): number {
    return parseInt(this._selected.substr(2));;
  }

  public onUpdate($event: CrossTableValue) {
    let existing: MilestonePartnerTaskPM = null;
    let pm: Partial<MilestonePartnerTaskPM> = {};
    let id = this.getSelectedId();
    switch (this._selected[0]) {
      case 'm':
        existing = this.milestonePartnerTaskPM.find(pm =>
          pm.milestone === id && pm.partner === $event.colId && pm.task === $event.rowId);
        pm = {
          milestone: id,
          partner: $event.colId,
          task: $event.rowId
        };
        break;
      case 'p':
        existing = this.milestonePartnerTaskPM.find(pm =>
          pm.milestone === $event.colId && pm.partner === id && pm.task === $event.rowId);
        pm = {
          milestone: $event.colId,
          partner: id,
          task: $event.rowId
        };
        break;
      case 't':
        existing = this.milestonePartnerTaskPM.find(pm =>
          pm.milestone === $event.rowId && pm.partner === $event.colId && pm.task === id);
        pm = {
          milestone: $event.rowId,
          partner: $event.colId,
          task: id
        };
        break;
      default:
        return;
    }


    if(!existing) {
      existing = new MilestonePartnerTaskPM(pm);
    }
    existing.effort = $event.value;
    this.backend.save(endpoint, existing).then(() => {
    }).catch((error) => {
      // TODO: Snackbar
      console.error(error);
    });
  }
}
