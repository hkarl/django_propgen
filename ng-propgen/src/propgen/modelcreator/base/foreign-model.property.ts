import {ModelProperty} from './model.property';

export abstract class ForeignModelProperty<T = {}> extends ModelProperty<T> {
  public service: any;
  public type: any;
}
