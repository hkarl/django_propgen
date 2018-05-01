"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SortablejsBinding = (function () {
    function SortablejsBinding(target) {
        this.target = target;
    }
    SortablejsBinding.prototype.insert = function (index, item) {
        if (this.isFormArray) {
            this.target.insert(index, item);
        }
        else {
            this.target.splice(index, 0, item);
        }
    };
    SortablejsBinding.prototype.get = function (index) {
        return this.isFormArray ? this.target.at(index) : this.target[index];
    };
    SortablejsBinding.prototype.remove = function (index) {
        var item;
        if (this.isFormArray) {
            item = this.target.at(index);
            this.target.removeAt(index);
        }
        else {
            item = this.target.splice(index, 1)[0];
        }
        return item;
    };
    Object.defineProperty(SortablejsBinding.prototype, "isFormArray", {
        get: function () {
            return !!this.target.at && !!this.target.insert && !!this.target.reset;
        },
        enumerable: true,
        configurable: true
    });
    return SortablejsBinding;
}());
exports.SortablejsBinding = SortablejsBinding;
//# sourceMappingURL=sortablejs-binding.js.map