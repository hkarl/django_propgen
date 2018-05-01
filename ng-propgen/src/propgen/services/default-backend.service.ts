import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {Version} from '../model/REST/Version';
import {hasOwnProperty} from 'tslint/lib/utils';
import {RESTModelInterface} from '../model/RESTModelInterface';
import {environment} from '../../environments/environment';

@Injectable()
export class DefaultBackendService {
  constructor(protected http: HttpClient) {}

  public static get baseUrl() {
    return environment.backend;
  }
  // start caching

  private _cachedItems: { [endpoint: string]: BehaviorSubject<RESTModelInterface[]> } = {};
  private cacheValidUntil: { [endpoint: string]: number } = {};
  private _inProgress: { [endpoint: string]: boolean } = {};
  private getCachedItems(endpoint: string): RESTModelInterface[] {
    return this._cachedItems[endpoint].getValue();
  }
  private setCachedItems(endpoint: string, items: RESTModelInterface[]) {
    this._cachedItems[endpoint].next(items);
  }
  protected isCacheValid(endpoint: string): boolean {
    return endpoint in this.cacheValidUntil && this.cacheValidUntil[endpoint] > Date.now();
  }
  protected resetCache(endpoint: string): void {
    this.cacheValidUntil[endpoint] = 0;
    this._cachedItems[endpoint] = new BehaviorSubject([]);
  }
  protected updateCache(endpoint: string, item: RESTModelInterface) {
    let endpointCache = this.getCachedItems(endpoint);
    const index = endpointCache.findIndex(i => item.id === i.id);
    if (index > -1) {
      endpointCache[index] = item;
    } else {
      endpointCache.push(item);
    }
    this._cachedItems[endpoint].next(endpointCache);
  }
  protected removeFromCache(endpoint: string, item: RESTModelInterface) {
    let endpointCache = this.getCachedItems(endpoint);
    const index = endpointCache.findIndex(i => i.id === item.id);
    if (index > -1) {
      const cache = this.getCachedItems(endpoint);
      cache.splice(index, 1);
      this.setCachedItems(endpoint, cache);
      this._cachedItems[endpoint].next(this.getCachedItems(endpoint));
    } else {
      console.warn('deleted ' + endpoint + '/' + item.id + ' but could not find it in cache');
    }
  }

  // end caching

  // start public interfaces

  public getAll(endpoint: string): Observable<RESTModelInterface[]> {
    if(!(endpoint in this._cachedItems)) {
      this.resetCache(endpoint);
    }
    if (!this.isCacheValid(endpoint) && (!(endpoint in this._inProgress) && !this._inProgress[endpoint])) {
      this._inProgress[endpoint] = true;
      this.internalRetrieveAllItems(endpoint).subscribe(data => {
        this._inProgress[endpoint] = false;
        this.setCachedItems(endpoint, data.object_list);
        this.cacheValidUntil[endpoint] = Date.now() + (1000 * environment.cacheValidTime);
      }, (error) => {
        this._inProgress[endpoint] = false;
        this._cachedItems[endpoint].error(error);
      });
    }
    return new Observable(fn => this._cachedItems[endpoint].subscribe(fn));
  }
  public get(endpoint: string, id: number): Promise<RESTModelInterface> {
    if(!(endpoint in this._cachedItems)) {
      this.resetCache(endpoint);
    }
    return new Promise((resolve, reject) => {
      if (this.isCacheValid(endpoint)) {
        const item = this.getCachedItems(endpoint).find(i => i.id === id);
        if (item) {
          resolve(item);
          return;
        }
      }
      this.internalRetrieveItem(endpoint, id).subscribe(data => {
        resolve(data.sm);
        this.updateCache(endpoint, data.sm);
      }, (error) => {
        reject(error);
      });
    });
  }
  public save(endpoint, item: RESTModelInterface): Promise<void> {
    if(!(endpoint in this._cachedItems)) {
      this.resetCache(endpoint);
    }
    return new Promise<void>((resolve, reject) => {
      if (!item) {
        reject();
        return;
      }
      const oldItem = this.getCachedItems(endpoint).find(f => f.id === item.id);
      if (oldItem) {
        this.internalUpdateItem(endpoint, item).subscribe(() => {
          this.updateCache(endpoint, item);
          resolve();
        }, (error) => {
          console.error(error);
          reject(error);
        });
      } else {
        if(hasOwnProperty(item, 'id')) {
          delete item['id'];
        }
        this.internalCreateItem(endpoint, item).subscribe((result) => {
          this.updateCache(endpoint, result);
          resolve();
        }, (error) => reject(error));
      }
    });
  }
  public delete(endpoint, item: RESTModelInterface): Promise<void> {
    if(!(endpoint in this._cachedItems)) {
      this.resetCache(endpoint);
    }
    return new Promise<void>((resolve, reject) => {
      if (!item) {
        reject();
        return;
      }
      this.internalDeleteItem(endpoint, item.id).subscribe(() => {
        this.removeFromCache(endpoint, item);
        resolve();
      }, (error) => {
        reject(error);
      });
    });
  }
  public saveOrder(endpoint, items: RESTModelInterface[]): Promise<void> {
    if(!(endpoint in this._cachedItems)) {
      this.resetCache(endpoint);
    }
    return new Promise<void>((resolve, reject) => {
      if(!items) {
        reject();
        return;
      }
      if(items.length === 0) {
        resolve();
        return;
      }
      const patchSet = items.map((d) => {
        return {
          id: d.id,
          order: d['order']
        }
      });
      this.http.patch(DefaultBackendService.baseUrl + endpoint + '/order/', patchSet).subscribe(() => {
        resolve();
      }, (error) => {
        reject(error);
      });
    });
  }

  // start versioning
  public getVersions(endpoint, id: number): Promise<Array<Version<RESTModelInterface>>> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(DefaultBackendService.baseUrl + endpoint + '/' + id + '/Version/').subscribe((data) => {
        resolve(data.versions.map((d) => new Version(d)));
      }, (error) => {
        reject(error);
      });
    });
  }
  public getVersion(endpoint, id: number, versionId: number): Promise<Version<RESTModelInterface>> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(DefaultBackendService.baseUrl + endpoint + '/' + id + '/Version/' + versionId + '/').subscribe((data) => {
        resolve(new Version(data.version));
      }, (error) => {
        reject(error);
      });
    });
  }
  // end versioning

  // end public interfaces

  // start internals
  protected internalCreateItem(path: string, item: RESTModelInterface): Observable<any> {
    return this.http.post(DefaultBackendService.baseUrl + path + '/', item);
  }
  protected internalRetrieveItem(path: string, id: number): Observable<any> {
    return this.http.get(DefaultBackendService.baseUrl + path + '/' + id + '/');
  }
  protected internalRetrieveAllItems(path: string): Observable<any> {
    return this.http.get(DefaultBackendService.baseUrl + path + '/');
  }
  protected internalUpdateItem(path: string, item: RESTModelInterface): Observable<any> {
    return this.http.put(DefaultBackendService.baseUrl + path + '/' + item.id + '/', item);
  }
  protected internalDeleteItem(path: string, id: number): Observable<any> {
    return this.http.delete(DefaultBackendService.baseUrl + path + '/' + id + '/');
  }
  // end internals
}
