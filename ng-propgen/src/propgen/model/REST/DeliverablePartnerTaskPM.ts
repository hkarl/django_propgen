import {RESTModelInterface} from '../RESTModelInterface';

export class DeliverablePartnerTaskPM implements RESTModelInterface {
  public id: number;
  public effort: number;
  public partner: number;
  public task: number;
  public deliverable: number;
  constructor(init?: Partial<DeliverablePartnerTaskPM>) {
    Object.assign(this, init);
  }

}
