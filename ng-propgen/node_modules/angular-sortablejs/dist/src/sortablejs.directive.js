"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var globals_1 = require("./globals");
var sortablejs_service_1 = require("./sortablejs.service");
var sortablejs_bindings_1 = require("./sortablejs-bindings");
var OriginalSortable = require('sortablejs');
var SortablejsDirective = (function () {
    function SortablejsDirective(globalConfig, service, element, zone, applicationRef, renderer) {
        this.globalConfig = globalConfig;
        this.service = service;
        this.element = element;
        this.zone = zone;
        this.applicationRef = applicationRef;
        this.renderer = renderer;
        this.runInsideAngular = false;
    }
    SortablejsDirective.prototype.ngOnInit = function () {
        var _this = this;
        if (this.runInsideAngular) {
            this._sortable = OriginalSortable.create(this.element.nativeElement, this.options);
        }
        else {
            this.zone.runOutsideAngular(function () {
                _this._sortable = OriginalSortable.create(_this.element.nativeElement, _this.options);
            });
        }
    };
    SortablejsDirective.prototype.ngOnChanges = function (changes) {
        var _this = this;
        var optionsChange = changes['inputOptions'];
        if (optionsChange && !optionsChange.isFirstChange()) {
            var previousOptions_1 = optionsChange.previousValue;
            var currentOptions_1 = optionsChange.currentValue;
            Object.keys(currentOptions_1).forEach(function (optionName) {
                if (currentOptions_1[optionName] !== previousOptions_1[optionName]) {
                    _this._sortable.option(optionName, _this.options[optionName]);
                }
            });
        }
    };
    SortablejsDirective.prototype.ngOnDestroy = function () {
        if (this._sortable) {
            this._sortable.destroy();
        }
    };
    SortablejsDirective.prototype.getBindings = function () {
        if (!this.sortablejs) {
            return new sortablejs_bindings_1.SortablejsBindings([]);
        }
        else if (this.sortablejs instanceof sortablejs_bindings_1.SortablejsBindings) {
            return this.sortablejs;
        }
        else {
            return new sortablejs_bindings_1.SortablejsBindings([this.sortablejs]);
        }
    };
    Object.defineProperty(SortablejsDirective.prototype, "options", {
        get: function () {
            return __assign({}, this.optionsWithoutEvents, this.overridenOptions);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SortablejsDirective.prototype, "optionsWithoutEvents", {
        get: function () {
            return __assign({}, (this.globalConfig || {}), (this.inputOptions || {}));
        },
        enumerable: true,
        configurable: true
    });
    SortablejsDirective.prototype.proxyEvent = function (eventName) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        if (this.optionsWithoutEvents && this.optionsWithoutEvents[eventName]) {
            (_a = this.optionsWithoutEvents)[eventName].apply(_a, params);
        }
        this.detectChanges();
        var _a;
    };
    Object.defineProperty(SortablejsDirective.prototype, "isCloning", {
        get: function () {
            return this._sortable.options.group.checkPull(this._sortable, this._sortable) === 'clone';
        },
        enumerable: true,
        configurable: true
    });
    SortablejsDirective.prototype.clone = function (item) {
        return (this.inputCloneFunction || (function (_item) { return _item; }))(item);
    };
    SortablejsDirective.prototype.detectChanges = function () {
        this.applicationRef.tick();
    };
    Object.defineProperty(SortablejsDirective.prototype, "overridenOptions", {
        get: function () {
            var _this = this;
            return {
                onAdd: function (event) {
                    _this.service.transfer = function (items) {
                        _this.getBindings().injectIntoEvery(event.newIndex, items);
                        _this.proxyEvent('onAdd', event);
                    };
                    _this.proxyEvent('onAddOriginal', event);
                },
                onRemove: function (event) {
                    var bindings = _this.getBindings();
                    if (bindings.provided) {
                        if (_this.isCloning) {
                            _this.service.transfer(bindings.getFromEvery(event.oldIndex).map(function (item) { return _this.clone(item); }));
                            _this.renderer.removeChild(event.item.parentNode, event.item);
                            _this.renderer.insertBefore(event.clone.parentNode, event.item, event.clone);
                            _this.renderer.removeChild(event.clone.parentNode, event.clone);
                        }
                        else {
                            _this.service.transfer(bindings.extractFromEvery(event.oldIndex));
                        }
                        _this.service.transfer = null;
                    }
                    _this.proxyEvent('onRemove', event);
                },
                onUpdate: function (event) {
                    var bindings = _this.getBindings();
                    bindings.injectIntoEvery(event.newIndex, bindings.extractFromEvery(event.oldIndex));
                    _this.proxyEvent('onUpdate', event);
                },
            };
        },
        enumerable: true,
        configurable: true
    });
    return SortablejsDirective;
}());
SortablejsDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: '[sortablejs]'
            },] },
];
SortablejsDirective.ctorParameters = function () { return [
    { type: undefined, decorators: [{ type: core_1.Optional }, { type: core_1.Inject, args: [globals_1.GLOBALS,] },] },
    { type: sortablejs_service_1.SortablejsService, },
    { type: core_1.ElementRef, },
    { type: core_1.NgZone, },
    { type: core_1.ApplicationRef, },
    { type: core_1.Renderer2, },
]; };
SortablejsDirective.propDecorators = {
    'sortablejs': [{ type: core_1.Input },],
    'inputOptions': [{ type: core_1.Input, args: ['sortablejsOptions',] },],
    'inputCloneFunction': [{ type: core_1.Input, args: ['sortablejsCloneFunction',] },],
    'runInsideAngular': [{ type: core_1.Input },],
};
exports.SortablejsDirective = SortablejsDirective;
//# sourceMappingURL=sortablejs.directive.js.map