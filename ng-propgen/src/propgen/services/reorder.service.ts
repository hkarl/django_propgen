import {Injectable} from '@angular/core';
import {SortableEntity} from '../model/SortableEntity';
import {AutogeneratableModel} from '../model/AutogeneratableModel';

@Injectable()
export class ReorderService {
  public calculateReordering(sortableEntities: Array<SortableEntity>, data: Array<AutogeneratableModel>): Array<AutogeneratableModel> {
    // the arrays should always be the same length
    if(sortableEntities.length != data.length) {
      throw new Error("Trying to reorder arrays of different length");
    }
    let dirty: Array<AutogeneratableModel> = [];
    let firstDifferingIndex = 0;
    while(firstDifferingIndex < data.length && sortableEntities[firstDifferingIndex].id === data[firstDifferingIndex].id) {
      firstDifferingIndex++;
    }
    if(firstDifferingIndex === data.length) {
      // nothing to do here, return
      return dirty;
    }
    let lastDifferingIndex = firstDifferingIndex + 1;
    while(lastDifferingIndex < data.length && sortableEntities[lastDifferingIndex].id !== data[lastDifferingIndex].id) {
      lastDifferingIndex++;
    }
    // Array.prototype.slice() does not include the end-index so we do not have to decrement here
    dirty = data.slice(firstDifferingIndex, lastDifferingIndex);
    // get the order properties in the current order of entities
    let orderProperties = dirty.map((d) => d['order']);
    for(let i = firstDifferingIndex; i < lastDifferingIndex; i++) {
      let model = data.find((d) => d.id === sortableEntities[i].id);
      model['order'] = orderProperties[i - firstDifferingIndex];
    }

    return dirty;
  }
}
