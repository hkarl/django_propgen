import {RESTModelInterface} from '../RESTModelInterface';

export class MilestonePartnerTaskPM implements RESTModelInterface {
  public id: number;
  public effort: number;
  public partner: number;
  public task: number;
  public milestone: number;
  constructor(init?: Partial<MilestonePartnerTaskPM>) {
    Object.assign(this, init);
  }
}
