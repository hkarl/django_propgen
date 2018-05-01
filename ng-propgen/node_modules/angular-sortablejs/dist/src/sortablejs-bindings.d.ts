import { SortablejsBinding } from './sortablejs-binding';
import { SortablejsBindingTarget } from './sortablejs-binding-target';
export declare class SortablejsBindings {
    bindings: SortablejsBinding[];
    constructor(bindingTargets: SortablejsBindingTarget[]);
    injectIntoEvery(index: number, items: any[]): void;
    getFromEvery(index: number): any[];
    extractFromEvery(index: number): any[];
    readonly provided: boolean;
}
