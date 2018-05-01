import {RESTModelInterface} from '../RESTModelInterface';
import {Revision} from './Revision';

export class Version<T extends RESTModelInterface> implements RESTModelInterface {
  public id: number;
  public revision: Revision;
  public object_id: string;
  public object_repr: string;
  public serialized_data: string;
  public constructor(init?: Partial<Version<T>>) {
    Object.assign(this, init);
  }
  public getObject(): T {
    return this.constructor(JSON.parse(this.serialized_data));
  }
}
