import {Injectable} from '@angular/core';
import {DefaultBackendService} from './default-backend.service';
import {Observable} from 'rxjs/Observable';
import {RESTModelInterface} from '../model/RESTModelInterface';
import {Project, Version} from '../model/REST';
import {AutomatedShakePreventionService} from './automated-shake-prevention.service';



@Injectable()
export class AutomatedBackendService {
  constructor(protected backend: DefaultBackendService) {
  }

  protected static pathFromConstructor(constructor) {
    return constructor.prototype.getAutoGeneratorSettings().backendPath;
  }

  public delete(constructor, item: RESTModelInterface): Promise<void> {
    return this.backend.delete(AutomatedBackendService.pathFromConstructor(constructor), item);
  }

  public getAll(constructor): Observable<RESTModelInterface[]> {
    return this.backend.getAll(AutomatedBackendService.pathFromConstructor(constructor));
  }

  public get(constructor, id: number): Promise<RESTModelInterface> {
    return this.backend.get(AutomatedBackendService.pathFromConstructor(constructor), id);
  }

  public getVersion(constructor, id: number, versionId: number): Promise<Version<RESTModelInterface>> {
    return this.backend.getVersion(AutomatedBackendService.pathFromConstructor(constructor), id, versionId);
  }

  public getVersions(constructor, id: number): Promise<Array<Version<RESTModelInterface>>> {
    return this.backend.getVersions(AutomatedBackendService.pathFromConstructor(constructor), id);
  }

  public save(constructor, item: RESTModelInterface): Promise<void> {
    return this.backend.save(AutomatedBackendService.pathFromConstructor(constructor), item);
  }

  public saveOrder(constructor, items: RESTModelInterface[]): Promise<void> {
    return this.backend.saveOrder(AutomatedBackendService.pathFromConstructor(constructor), items);
  }


}
