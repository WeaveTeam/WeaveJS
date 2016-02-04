"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); ///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require("lodash");

var lodash = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Layer = function () {
    function Layer(parent, layerName) {
        _classCallCheck(this, Layer);

        this.layerPath = parent.plottersPath.push(layerName);
        this.settingsPath = parent.layerSettingsPath.push(layerName);
        this.projectionPath = parent.toolPath.push("projectionSRS");
        this.parent = parent;
        this.layerName = layerName;
        this._olLayer = null;
        this._layerReadyCallbacks = new Map();
        this.linkProperty(this.settingsPath.push("alpha"), "opacity");
        this.linkProperty(this.settingsPath.push("visible"), "visible");
        this.linkProperty(this.settingsPath.push("selectable"), "selectable");
        /* TODO max and minvisiblescale, map to min/max resolution. */
    }

    _createClass(Layer, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "linkProperty",
        value: function linkProperty(propertyPath, propertyName, inTransform) {
            var _this = this;

            /* change in path modifying propertyName */
            inTransform = inTransform || lodash.identity;
            var callback = function callback() {
                if (_this.olLayer) {
                    _this.olLayer.set(propertyName, inTransform(propertyPath.getState()));
                }
            };
            this._layerReadyCallbacks.set(propertyName, callback);
            propertyPath.addCallback(this, callback, false, false);
        }
    }, {
        key: "dispose",
        value: function dispose() {
            if (this._olLayer != null) {
                this.parent.map.removeLayer(this._olLayer);
            }
        }
    }, {
        key: "source",
        get: function get() {
            return this.olLayer && this.olLayer.getSource();
        },
        set: function set(value) {
            this.olLayer.setSource(value);
        }
        /* Handles initial apply of linked properties, adding/removing from map */

    }, {
        key: "olLayer",
        set: function set(value) {
            this._olLayer = value;
            if (value) {
                this.parent.map.addLayer(value);
                value.set("layerObject", this); /* Need to store this backref */
                if (value) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = this._layerReadyCallbacks.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var name = _step.value;

                            this._layerReadyCallbacks.get(name)();
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }
            }
        },
        get: function get() {
            return this._olLayer;
        }
    }, {
        key: "inputProjection",
        get: function get() {
            return null;
        }
    }, {
        key: "outputProjection",
        get: function get() {
            return this.projectionPath.getState() || "EPSG:3857";
        }
    }], [{
        key: "registerClass",
        value: function registerClass(asClassName, jsClass, interfaces) {
            if (!Layer.layerRegistry) {
                Layer.layerRegistry = new Map();
            }
            Layer.layerRegistry.set(asClassName, jsClass);
        }
    }, {
        key: "newLayer",
        value: function newLayer(parent, layerName) {
            var path = parent.plottersPath.push(layerName);
            var layerType = path.getType();
            var LayerClass = Layer.layerRegistry.get(layerType);
            if (LayerClass) {
                return new LayerClass(parent, layerName);
            }
            return null;
        }
    }]);

    return Layer;
}();

exports.default = Layer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmN0cy90b29scy9PcGVuTGF5ZXJzTWFwL0xheWVycy9MYXllci50cyJdLCJuYW1lcyI6WyJMYXllciIsIkxheWVyLmNvbnN0cnVjdG9yIiwiTGF5ZXIucmVnaXN0ZXJDbGFzcyIsIkxheWVyLm5ld0xheWVyIiwiTGF5ZXIuaGFuZGxlTWlzc2luZ1Nlc3Npb25TdGF0ZVByb3BlcnRpZXMiLCJMYXllci5zb3VyY2UiLCJMYXllci5vbExheWVyIiwiTGF5ZXIuaW5wdXRQcm9qZWN0aW9uIiwiTGF5ZXIub3V0cHV0UHJvamVjdGlvbiIsIkxheWVyLmxpbmtQcm9wZXJ0eSIsIkxheWVyLmRpc3Bvc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUtZLEFBQU0sQUFBTSxBQUFRLEFBRWhDOzs7Ozs7O0FBc0NDLG1CQUFZLEFBQU0sUUFBRSxBQUFTOzs7QUFFNUIsQUFBSSxhQUFDLEFBQVMsWUFBRyxBQUFNLE9BQUMsQUFBWSxhQUFDLEFBQUksS0FBQyxBQUFTLEFBQUMsQUFBQztBQUNyRCxBQUFJLGFBQUMsQUFBWSxlQUFHLEFBQU0sT0FBQyxBQUFpQixrQkFBQyxBQUFJLEtBQUMsQUFBUyxBQUFDLEFBQUM7QUFDN0QsQUFBSSxhQUFDLEFBQWMsaUJBQUcsQUFBTSxPQUFDLEFBQVEsU0FBQyxBQUFJLEtBQUMsQUFBZSxBQUFDLEFBQUM7QUFDNUQsQUFBSSxhQUFDLEFBQU0sU0FBRyxBQUFNLEFBQUM7QUFDckIsQUFBSSxhQUFDLEFBQVMsWUFBRyxBQUFTLEFBQUM7QUFDM0IsQUFBSSxhQUFDLEFBQVEsV0FBRyxBQUFJLEFBQUM7QUFDckIsQUFBSSxhQUFDLEFBQW9CLHVCQUFHLElBQUksQUFBRyxBQUFtQixBQUFDO0FBRXZELEFBQUksYUFBQyxBQUFZLGFBQUMsQUFBSSxLQUFDLEFBQVksYUFBQyxBQUFJLEtBQUMsQUFBTyxBQUFDLFVBQUUsQUFBUyxBQUFDLEFBQUM7QUFD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QUFBVyxTQUFFLEFBQXNCO0FBRTNFLEFBQUUsQUFBQyxnQkFBQyxDQUFDLEFBQUssTUFBQyxBQUFhLEFBQUMsZUFDekIsQUFBQztBQUNBLEFBQUssc0JBQUMsQUFBYSxnQkFBRyxJQUFJLEFBQUcsQUFBYyxBQUFDLEFBQzdDLEFBQUM7O0FBQ0QsQUFBSyxrQkFBQyxBQUFhLGNBQUMsQUFBRyxJQUFDLEFBQVcsYUFBRSxBQUFPLEFBQUMsQUFBQyxBQUMvQyxBQUFDLEFBRUQsQUFBTyxBQUFROzs7O2lDQUFDLEFBQXdCLFFBQUUsQUFBZ0I7QUFFekQsZ0JBQUksQUFBSSxPQUFhLEFBQU0sT0FBQyxBQUFZLGFBQUMsQUFBSSxLQUFDLEFBQVMsQUFBQyxBQUFDO0FBQ3pELGdCQUFJLEFBQVMsWUFBVSxBQUFJLEtBQUMsQUFBTyxBQUFFLEFBQUM7QUFDdEMsZ0JBQUksQUFBVSxhQUFPLEFBQUssTUFBQyxBQUFhLGNBQUMsQUFBRyxJQUFDLEFBQVMsQUFBQyxBQUFDO0FBQ3hELEFBQUUsQUFBQyxnQkFBQyxBQUFVLEFBQUMsWUFDZixBQUFDO0FBQ0EsQUFBTSx1QkFBQyxJQUFJLEFBQVUsV0FBQyxBQUFNLFFBQUUsQUFBUyxBQUFDLEFBQUMsQUFDMUMsQUFBQzs7QUFDRCxBQUFNLG1CQUFDLEFBQUksQUFBQyxBQUNiLEFBQUMsQUFFRCxBQUFtQzs7Ozs7OztrQkE2RnJCLEFBQUssQUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uL3R5cGluZ3MvbG9kYXNoL2xvZGFzaC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vLi4vdHlwaW5ncy9vcGVubGF5ZXJzL29wZW5sYXllcnMuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uL3R5cGluZ3Mvd2VhdmUvd2VhdmVqcy5kLnRzXCIvPlxuXG5pbXBvcnQgT3BlbkxheWVyc01hcFRvb2wgZnJvbSBcIi4uLy4uL09wZW5MYXllcnNNYXBUb29sXCI7XG5pbXBvcnQgKiBhcyBsb2Rhc2ggZnJvbSBcImxvZGFzaFwiO1xuXG5hYnN0cmFjdCBjbGFzcyBMYXllciB7XG5cdHN0YXRpYyBsYXllclJlZ2lzdHJ5Ok1hcDxzdHJpbmcsYW55Pjtcblx0c3RhdGljIHJlZ2lzdGVyQ2xhc3MoYXNDbGFzc05hbWU6c3RyaW5nLCBqc0NsYXNzOmFueSwgaW50ZXJmYWNlcz86QXJyYXk8YW55Pilcblx0e1xuXHRcdGlmICghTGF5ZXIubGF5ZXJSZWdpc3RyeSlcblx0XHR7XG5cdFx0XHRMYXllci5sYXllclJlZ2lzdHJ5ID0gbmV3IE1hcDxzdHJpbmcsYW55PigpO1xuXHRcdH1cblx0XHRMYXllci5sYXllclJlZ2lzdHJ5LnNldChhc0NsYXNzTmFtZSwganNDbGFzcyk7XG5cdH1cblxuXHRzdGF0aWMgbmV3TGF5ZXIocGFyZW50Ok9wZW5MYXllcnNNYXBUb29sLCBsYXllck5hbWU6c3RyaW5nKVxuXHR7XG5cdFx0bGV0IHBhdGg6V2VhdmVQYXRoID0gcGFyZW50LnBsb3R0ZXJzUGF0aC5wdXNoKGxheWVyTmFtZSk7XG5cdFx0bGV0IGxheWVyVHlwZTpzdHJpbmcgPSBwYXRoLmdldFR5cGUoKTtcblx0XHRsZXQgTGF5ZXJDbGFzczphbnkgPSBMYXllci5sYXllclJlZ2lzdHJ5LmdldChsYXllclR5cGUpO1xuXHRcdGlmIChMYXllckNsYXNzKVxuXHRcdHtcblx0XHRcdHJldHVybiBuZXcgTGF5ZXJDbGFzcyhwYXJlbnQsIGxheWVyTmFtZSk7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0aGFuZGxlTWlzc2luZ1Nlc3Npb25TdGF0ZVByb3BlcnRpZXMobmV3U3RhdGUpXG5cdHtcblxuXHR9XG5cblx0bGF5ZXJQYXRoOldlYXZlUGF0aDtcblx0c2V0dGluZ3NQYXRoOldlYXZlUGF0aDtcblx0cHJvamVjdGlvblBhdGg6V2VhdmVQYXRoO1xuXHRsYXllck5hbWU6c3RyaW5nO1xuXHRwYXJlbnQ6T3BlbkxheWVyc01hcFRvb2w7XG5cblx0X29sTGF5ZXI6b2wubGF5ZXIuTGF5ZXI7XG5cdF9sYXllclJlYWR5Q2FsbGJhY2tzOk1hcDxzdHJpbmcsRnVuY3Rpb24+O1xuXG5cblx0Y29uc3RydWN0b3IocGFyZW50LCBsYXllck5hbWUpXG5cdHtcblx0XHR0aGlzLmxheWVyUGF0aCA9IHBhcmVudC5wbG90dGVyc1BhdGgucHVzaChsYXllck5hbWUpO1xuXHRcdHRoaXMuc2V0dGluZ3NQYXRoID0gcGFyZW50LmxheWVyU2V0dGluZ3NQYXRoLnB1c2gobGF5ZXJOYW1lKTtcblx0XHR0aGlzLnByb2plY3Rpb25QYXRoID0gcGFyZW50LnRvb2xQYXRoLnB1c2goXCJwcm9qZWN0aW9uU1JTXCIpO1xuXHRcdHRoaXMucGFyZW50ID0gcGFyZW50O1xuXHRcdHRoaXMubGF5ZXJOYW1lID0gbGF5ZXJOYW1lO1xuXHRcdHRoaXMuX29sTGF5ZXIgPSBudWxsO1xuXHRcdHRoaXMuX2xheWVyUmVhZHlDYWxsYmFja3MgPSBuZXcgTWFwPHN0cmluZyxGdW5jdGlvbj4oKTtcblxuXHRcdHRoaXMubGlua1Byb3BlcnR5KHRoaXMuc2V0dGluZ3NQYXRoLnB1c2goXCJhbHBoYVwiKSwgXCJvcGFjaXR5XCIpO1xuXHRcdHRoaXMubGlua1Byb3BlcnR5KHRoaXMuc2V0dGluZ3NQYXRoLnB1c2goXCJ2aXNpYmxlXCIpLCBcInZpc2libGVcIik7XG5cdFx0dGhpcy5saW5rUHJvcGVydHkodGhpcy5zZXR0aW5nc1BhdGgucHVzaChcInNlbGVjdGFibGVcIiksIFwic2VsZWN0YWJsZVwiKTtcblx0XHQvKiBUT0RPIG1heCBhbmQgbWludmlzaWJsZXNjYWxlLCBtYXAgdG8gbWluL21heCByZXNvbHV0aW9uLiAqL1xuXHR9XG5cblx0Z2V0IHNvdXJjZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5vbExheWVyICYmIHRoaXMub2xMYXllci5nZXRTb3VyY2UoKTtcblx0fVxuXG5cdHNldCBzb3VyY2UodmFsdWUpIHtcblx0XHR0aGlzLm9sTGF5ZXIuc2V0U291cmNlKHZhbHVlKTtcblx0fVxuXG5cdC8qIEhhbmRsZXMgaW5pdGlhbCBhcHBseSBvZiBsaW5rZWQgcHJvcGVydGllcywgYWRkaW5nL3JlbW92aW5nIGZyb20gbWFwICovXG5cdHNldCBvbExheWVyKHZhbHVlKSB7XG5cdFx0dGhpcy5fb2xMYXllciA9IHZhbHVlO1xuXG5cdFx0aWYgKHZhbHVlKSB7XG5cdFx0XHR0aGlzLnBhcmVudC5tYXAuYWRkTGF5ZXIodmFsdWUpO1xuXG5cdFx0XHR2YWx1ZS5zZXQoXCJsYXllck9iamVjdFwiLCB0aGlzKTsgLyogTmVlZCB0byBzdG9yZSB0aGlzIGJhY2tyZWYgKi9cblxuXHRcdFx0aWYgKHZhbHVlKSB7XG5cdFx0XHRcdGZvciAobGV0IG5hbWUgb2YgdGhpcy5fbGF5ZXJSZWFkeUNhbGxiYWNrcy5rZXlzKCkpIHtcblx0XHRcdFx0XHR0aGlzLl9sYXllclJlYWR5Q2FsbGJhY2tzLmdldChuYW1lKSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Z2V0IG9sTGF5ZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX29sTGF5ZXI7XG5cdH1cblx0XG5cdGdldCBpbnB1dFByb2plY3Rpb24oKVxuXHR7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0XG5cdGdldCBvdXRwdXRQcm9qZWN0aW9uKClcblx0e1xuXHRcdHJldHVybiB0aGlzLnByb2plY3Rpb25QYXRoLmdldFN0YXRlKCkgfHwgXCJFUFNHOjM4NTdcIjtcblx0fVxuXG5cdGxpbmtQcm9wZXJ0eShwcm9wZXJ0eVBhdGg6V2VhdmVQYXRoLCBwcm9wZXJ0eU5hbWU6c3RyaW5nLCBpblRyYW5zZm9ybT86RnVuY3Rpb24pXG5cdHtcblx0XHQvKiBjaGFuZ2UgaW4gcGF0aCBtb2RpZnlpbmcgcHJvcGVydHlOYW1lICovXG5cdFx0aW5UcmFuc2Zvcm0gPSBpblRyYW5zZm9ybSB8fCBsb2Rhc2guaWRlbnRpdHk7XG5cblx0XHR2YXIgY2FsbGJhY2sgPSAoKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLm9sTGF5ZXIpIHtcblx0XHRcdFx0XHR0aGlzLm9sTGF5ZXIuc2V0KHByb3BlcnR5TmFtZSwgaW5UcmFuc2Zvcm0ocHJvcGVydHlQYXRoLmdldFN0YXRlKCkpKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdHRoaXMuX2xheWVyUmVhZHlDYWxsYmFja3Muc2V0KHByb3BlcnR5TmFtZSwgY2FsbGJhY2spO1xuXG5cdFx0cHJvcGVydHlQYXRoLmFkZENhbGxiYWNrKHRoaXMsIGNhbGxiYWNrLCBmYWxzZSwgZmFsc2UpO1xuXHR9XG5cblx0ZGlzcG9zZSgpXG5cdHtcblx0XHRpZiAodGhpcy5fb2xMYXllciAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLnBhcmVudC5tYXAucmVtb3ZlTGF5ZXIodGhpcy5fb2xMYXllcik7XG5cdFx0fVxuXHR9XG59XG5leHBvcnQgZGVmYXVsdCBMYXllcjtcbiJdfQ==