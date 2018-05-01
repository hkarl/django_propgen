import {RESTModelInterface} from '../RESTModelInterface';

export class TaskPartnerPM implements RESTModelInterface {
  public id: number;
  public effort: number;
  public partner: number;
  public task: number;
  constructor(init?: Partial<TaskPartnerPM>) {
    Object.assign(this, init);
  }
}
