"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var globals_1 = require("./globals");
var sortablejs_directive_1 = require("./sortablejs.directive");
var sortablejs_service_1 = require("./sortablejs.service");
var SortablejsModule = (function () {
    function SortablejsModule() {
    }
    SortablejsModule.forRoot = function (globalOptions) {
        return {
            ngModule: SortablejsModule,
            providers: [
                sortablejs_service_1.SortablejsService,
                { provide: globals_1.GLOBALS, useValue: globalOptions }
            ]
        };
    };
    return SortablejsModule;
}());
SortablejsModule.decorators = [
    { type: core_1.NgModule, args: [{
                declarations: [sortablejs_directive_1.SortablejsDirective],
                exports: [sortablejs_directive_1.SortablejsDirective],
                providers: [sortablejs_service_1.SortablejsService]
            },] },
];
SortablejsModule.ctorParameters = function () { return []; };
exports.SortablejsModule = SortablejsModule;
//# sourceMappingURL=sortablejs.module.js.map