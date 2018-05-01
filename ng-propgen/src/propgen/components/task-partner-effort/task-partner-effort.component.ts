import {Component, Injector, OnDestroy, OnInit, Type} from '@angular/core';
import {CrossTableData, CrossTableValue} from '../cross-table/cross-table.component';
import {DefaultBackendService} from '../../services/default-backend.service';
import {Subscription} from 'rxjs/Subscription';
import {Partner, Task, TaskPartnerPM} from '../../model/REST';
import {AutomatedBackendService} from '../../services/automated-backend.service';

const endpoint = '/TaskPartnerPM';

@Component({
  selector: 'propgen-task-partner-effort',
  template: '<propgen-root></propgen-root><propgen-cross-table [data]="data" (update)="onUpdate($event)"></propgen-cross-table>'
})
export class TaskPartnerEffortComponent implements OnInit, OnDestroy {
  public data: CrossTableData = {
    cols: [],
    rows: [],
    values: [],
    colDescription: 'Partner',
    rowDescription: 'Task'
  };
  private taskSubscription: Subscription;
  private partnerSubscription: Subscription;
  private valueSubscription: Subscription;
  private taskPartnerPM: TaskPartnerPM[] = [];
  constructor(private backend: DefaultBackendService, private autoBackend: AutomatedBackendService, private injector: Injector) {
  }
  ngOnInit() {
    this.taskSubscription = this.autoBackend.getAll(Task).subscribe(
      (tasks) => {
        Promise.all(tasks.map((t) => {
          return new Task(t).toListItem(this.injector);
        })).then((data) => {
          // simple assignment does not trigger change detection;
          this.data = { ...this.data, rows: data };
        });
      }
    );
    this.partnerSubscription = this.autoBackend.getAll(Partner).subscribe(
      (partners) => {
        Promise.all(partners.map((p) => {
          return new Partner(p).toListItem(this.injector);
        })).then((data) => {
          // simple assignment does not trigger change detection;
          this.data = { ...this.data, cols: data };
        });
      }
    );
    this.valueSubscription = this.backend.getAll(endpoint).subscribe(
      (values: TaskPartnerPM[]) => {
        this.taskPartnerPM = values;
        this.data = { ...this.data, values: values.map(v => {
          return {
            colId: v.partner,
            rowId: v.task,
            value: v.effort,
          }
        })};
      }
    )
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
  }
  public onUpdate($event: CrossTableValue) {
    let existing = this.taskPartnerPM.find(pm => pm.partner === $event.colId && pm.task === $event.rowId);
    if(!existing) {
      existing = new TaskPartnerPM({
        partner: $event.colId,
        task: $event.rowId,
        effort: $event.value
      });
    }
    else {
      existing.effort = $event.value;
    }
    this.backend.save(endpoint, existing).then(() => {
    }).catch((error) => {
      // TODO: Snackbar
      console.error(error);
    });
  }
}
