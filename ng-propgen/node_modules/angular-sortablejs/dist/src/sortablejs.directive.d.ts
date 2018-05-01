import { ApplicationRef, ElementRef, NgZone, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { SortablejsOptions } from './sortablejs-options';
import { SortablejsService } from './sortablejs.service';
import { SortablejsBindingTarget } from './sortablejs-binding-target';
export declare class SortablejsDirective implements OnInit, OnChanges, OnDestroy {
    private globalConfig;
    private service;
    private element;
    private zone;
    private applicationRef;
    private renderer;
    sortablejs: SortablejsBindingTarget;
    inputOptions: SortablejsOptions;
    inputCloneFunction: <T>(item: T) => T;
    private _sortable;
    runInsideAngular: boolean;
    constructor(globalConfig: SortablejsOptions, service: SortablejsService, element: ElementRef, zone: NgZone, applicationRef: ApplicationRef, renderer: Renderer2);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    private getBindings();
    private readonly options;
    private readonly optionsWithoutEvents;
    private proxyEvent(eventName, ...params);
    private readonly isCloning;
    private clone<T>(item);
    private detectChanges();
    private readonly overridenOptions;
}
