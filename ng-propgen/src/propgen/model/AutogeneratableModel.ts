import {RESTModelInterface} from './RESTModelInterface';
import {SortableEntity} from './SortableEntity';
import {Injector} from '@angular/core';
import {AutogeneratableProperties, AutogeneratableSettings} from '../decorators/autogeneratable.decorator';

export const fiveDigitsRegex = /^\d{1,5}([,|\.]\d{1,2})?$/;
export const eightDigitsRegex = /^\d{1,8}([,|\.]\d{1,2})?$/;
export const tenDigitsRegex = /^\d{1,10}([,|\.]\d{1,2})?$/;

export abstract class AutogeneratableModel implements RESTModelInterface {
  public id: number = 0;

  public toListItem(injector: Injector): Promise<SortableEntity> {
    return new Promise<SortableEntity>((resolve) =>  {
      let properties = Object.keys(this.getProperties());
      let title = '<none>';
      if(properties.length > 0) {
        title = this[properties[0]];
      }
      resolve(new SortableEntity(this.id, title));
    });
  };
  public get verboseName(): string {
    return null;
  }
  public get helpText(): string {
    return null;
  }

  public constructor(data: Object = {}) {
    if('id' in data) {
      this.id = data['id'];
    }
    if('order' in data) {
      this['order'] = data['order'];
    }
    let _autoProperties = this.getProperties();
    for(let prop in _autoProperties) {
      if(prop in data) {
        this[prop] = data[prop];
      }
      else if(_autoProperties[prop].defaultValue) {
        this[prop] = _autoProperties[prop].defaultValue;
      }
    }
  }

  public getProperties(): AutogeneratableProperties {
    return {};
  };

  public getAutoGeneratorSettings(): AutogeneratableSettings {
    return null;
  }
}
