import { SortablejsBindingTarget } from './sortablejs-binding-target';
export declare class SortablejsBinding {
    private target;
    constructor(target: SortablejsBindingTarget);
    insert(index: number, item: any): void;
    get(index: number): any;
    remove(index: number): any;
    private readonly isFormArray;
}
