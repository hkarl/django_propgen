// this service does not serve ANY purpose other than referencing all the automated models
// if they are not referenced anywhere the AOT compiler will remove them before execution of decorators
// and no route registering happens anywhere

import {Injectable, Type} from '@angular/core';
import {
  Deliverable, DisseminationType, Milestone, Partner, PartnerType, ProducableType, Project, Setting, Task, Template, Textblock,
  Workpackage
} from '../model/REST';
import {AutogeneratableModel} from '../model/AutogeneratableModel';

@Injectable()
export class AutomatedShakePreventionService {
  private instances: Type<AutogeneratableModel>[] = [];
  public initialize() {
    // store all models so we have a reference for static code analysis
    this.instances.push(Deliverable);
    this.instances.push(DisseminationType);
    this.instances.push(Milestone);
    this.instances.push(Partner);
    this.instances.push(PartnerType);
    this.instances.push(ProducableType);
    this.instances.push(Project);
    this.instances.push(Setting);
    this.instances.push(Task);
    this.instances.push(Template);
    this.instances.push(Textblock);
    this.instances.push(Workpackage);
  }
}
