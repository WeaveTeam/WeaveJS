"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _openlayers = require("openlayers");

var ol = _interopRequireWildcard(_openlayers);

var _lodash = require("lodash");

var lodash = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../typings/jquery/jquery.d.ts"/>
///<reference path="../../../typings/weave/weavejs.d.ts"/>

var ProbeInteraction = function (_ol$interaction$Point) {
    _inherits(ProbeInteraction, _ol$interaction$Point);

    function ProbeInteraction(tool) {
        _classCallCheck(this, ProbeInteraction);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ProbeInteraction).call(this, { handleMoveEvent: ProbeInteraction.prototype.handleMoveEvent }));

        _this.tool = tool;
        return _this;
    }

    _createClass(ProbeInteraction, [{
        key: "setMap",
        value: function setMap(map) {
            _get(Object.getPrototypeOf(ProbeInteraction.prototype), "setMap", this).call(this, map);
            var element = map.getTargetElement();
            map.getTargetElement().addEventListener('mouseout', this.handleOutEvent.bind(this));
        }
    }, {
        key: "onFeatureAtPixel",
        value: function onFeatureAtPixel(feature, layer) {
            var zIndex = layer.getZIndex();
            if (zIndex > this.topZIndex) {
                var weaveLayerObject = layer.get("layerObject");
                this.topKeySet = weaveLayerObject.probeKeySet || this.topKeySet;
                this.topZIndex = zIndex;
                this.topKey = feature.getId();
                this.topLayer = weaveLayerObject;
            }
        }
    }, {
        key: "pixelToKey",
        value: function pixelToKey(pixel) {
            var map = this.getMap();
            this.topKeySet = null;
            this.topZIndex = -Infinity;
            this.topLayer = null;
            this.topKey = null;
            map.forEachFeatureAtPixel(pixel, this.onFeatureAtPixel, this, ProbeInteraction.layerFilter);
            if (this.topKey && this.topKeySet) {
                this.topKeySet.replaceKeys([this.topKey]);
            }
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = map.getLayers().getArray()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var layer = _step.value;

                    if (!ProbeInteraction.layerFilter(layer)) continue;
                    var weaveLayerObject = layer.get("layerObject");
                    var keySet = weaveLayerObject.probeKeySet;
                    if (keySet && keySet != this.topKeySet) {
                        keySet.clearKeys();
                    }
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

            return this.topKey;
        }
    }, {
        key: "handleMoveEvent",
        value: function handleMoveEvent(event) {
            if (!this.tool.props.toolTip) return;
            var key = this.pixelToKey(event.pixel);
            var toolTipState = {};
            if (key) {
                var browserEvent = event.originalEvent;
                toolTipState.showToolTip = true;
                toolTipState.title = this.getToolTipTitle(key);
                toolTipState.columnNamesToValue = this.getToolTipData(key, this.topLayer.getToolTipColumns());
                var _ref = [browserEvent.clientX, browserEvent.clientY];
                toolTipState.x = _ref[0];
                toolTipState.y = _ref[1];
            } else {
                toolTipState.showToolTip = false;
            }
            this.tool.props.toolTip.setState(toolTipState);
        }
    }, {
        key: "handleOutEvent",
        value: function handleOutEvent(event) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.getMap().getLayers().getArray()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var layer = _step2.value;

                    if (!ProbeInteraction.layerFilter(layer)) continue;
                    var weaveLayerObject = layer.get("layerObject");
                    var keySet = weaveLayerObject.probeKeySet;
                    if (keySet) {
                        keySet.clearKeys();
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            var toolTipState = {};
            toolTipState.showToolTip = false;
            this.tool.props.toolTip.setState(toolTipState);
        }
        /* TODO: Move this into WeaveTool */

    }, {
        key: "getToolTipData",
        value: function getToolTipData(key) {
            var additionalColumns = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

            var columnHashMap = this.tool.toolPath.weave.root.getObject("Probed Columns");
            var result = {};
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = columnHashMap.getObjects().concat(additionalColumns)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var child = _step3.value;

                    var title = child.getMetadata("title");
                    var value = child.getValueFromKey(key, String);
                    if (value) {
                        result[title] = value;
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return result;
        }
        /* TODO: Move this into WeaveTool */

    }, {
        key: "getToolTipTitle",
        value: function getToolTipTitle(key /* IQualifiedKey */) {
            var titleHashMap = this.tool.toolPath.weave.root.getObject("Probe Header Columns");
            return lodash.map(titleHashMap.getObjects(), function (d) {
                return d.getValueFromKey(key, String);
            }).join(", ");
        }
    }], [{
        key: "layerFilter",
        value: function layerFilter(layer) {
            return layer.get("selectable");
        }
    }]);

    return ProbeInteraction;
}(ol.interaction.Pointer);

exports.default = ProbeInteraction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvYmVJbnRlcmFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyY3RzL3Rvb2xzL09wZW5MYXllcnNNYXAvUHJvYmVJbnRlcmFjdGlvbi50cyJdLCJuYW1lcyI6WyJQcm9iZUludGVyYWN0aW9uIiwiUHJvYmVJbnRlcmFjdGlvbi5jb25zdHJ1Y3RvciIsIlByb2JlSW50ZXJhY3Rpb24uc2V0TWFwIiwiUHJvYmVJbnRlcmFjdGlvbi5vbkZlYXR1cmVBdFBpeGVsIiwiUHJvYmVJbnRlcmFjdGlvbi5sYXllckZpbHRlciIsIlByb2JlSW50ZXJhY3Rpb24ucGl4ZWxUb0tleSIsIlByb2JlSW50ZXJhY3Rpb24uaGFuZGxlTW92ZUV2ZW50IiwiUHJvYmVJbnRlcmFjdGlvbi5oYW5kbGVPdXRFdmVudCIsIlByb2JlSW50ZXJhY3Rpb24uZ2V0VG9vbFRpcERhdGEiLCJQcm9iZUludGVyYWN0aW9uLmdldFRvb2xUaXBUaXRsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBS1ksQUFBRSxBQUFNLEFBQVksQUFDekI7Ozs7SUFBSyxBQUFNLEFBQU0sQUFBUSxBQVFoQzs7Ozs7Ozs7Ozs7Ozs7OztBQVFDLDhCQUFZLEFBQXNCOzs7d0dBRTNCLEVBQUMsQUFBZSxpQkFBRSxBQUFnQixpQkFBQyxBQUFTLFVBQUMsQUFBZSxBQUFDLEFBQUMsQUFBQzs7QUFDckUsQUFBSSxjQUFDLEFBQUksT0FBRyxBQUFJLEFBQUMsQUFDbEIsQUFBQyxBQUVELEFBQU0sS0FKTDs7Ozs7OytCQUlNLEFBQVU7QUFFaEIsQUFBSyxBQUFDLEFBQU0sK0ZBQUMsQUFBRyxBQUFDLEFBQUM7QUFDbEIsZ0JBQUksQUFBTyxVQUFZLEFBQUcsSUFBQyxBQUFnQixBQUFFLEFBQUM7QUFFOUMsQUFBRyxnQkFBQyxBQUFnQixBQUFFLG1CQUFDLEFBQWdCLGlCQUFDLEFBQVUsWUFBRSxBQUFJLEtBQUMsQUFBYyxlQUFDLEFBQUksS0FBQyxBQUFJLEFBQUMsQUFBQyxBQUFD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YUFBMUMsQ0FBdEMsQUFBTSxDQUEyRSxBQUFJLEtBQUMsQUFBSSxBQUFDLEFBQUMsQUFDcEcsQUFBQyxBQUNGLEFBQUM7Ozs7b0NBeEcyQixBQUFtQjtBQUU3QyxBQUFNLG1CQUFDLEFBQUssTUFBQyxBQUFHLElBQUMsQUFBWSxBQUFDLEFBQUMsQUFDaEMsQUFBQyxBQUVPLEFBQVU7Ozs7O0VBMUMyQixBQUFFLEdBQUMsQUFBVyxZQUFDLEFBQU8iLCJzb3VyY2VzQ29udGVudCI6WyIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3Mvb3BlbmxheWVycy9vcGVubGF5ZXJzLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi90eXBpbmdzL2pxdWVyeS9qcXVlcnkuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3Mvd2VhdmUvd2VhdmVqcy5kLnRzXCIvPlxuXG5pbXBvcnQgKiBhcyBvbCBmcm9tIFwib3BlbmxheWVyc1wiO1xuaW1wb3J0ICogYXMgbG9kYXNoIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCBGZWF0dXJlTGF5ZXIgZnJvbSBcIi4vTGF5ZXJzL0ZlYXR1cmVMYXllclwiO1xuaW1wb3J0IE9wZW5MYXllcnNNYXBUb29sIGZyb20gXCIuLi9PcGVuTGF5ZXJzTWFwVG9vbFwiO1xuaW1wb3J0IHtJVG9vbFRpcFN0YXRlfSBmcm9tIFwiLi4vdG9vbHRpcFwiO1xuXG5pbXBvcnQgSVF1YWxpZmllZEtleSA9IHdlYXZlanMuYXBpLmRhdGEuSVF1YWxpZmllZEtleTtcbmltcG9ydCBLZXlTZXQgPSB3ZWF2ZWpzLmRhdGEua2V5LktleVNldDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvYmVJbnRlcmFjdGlvbiBleHRlbmRzIG9sLmludGVyYWN0aW9uLlBvaW50ZXJcbntcblx0cHJpdmF0ZSB0b3BLZXk6IElRdWFsaWZpZWRLZXk7XG5cdHByaXZhdGUgdG9wWkluZGV4OiBudW1iZXI7XG5cdHByaXZhdGUgdG9wS2V5U2V0OiBLZXlTZXQ7XG5cdHByaXZhdGUgdG9wTGF5ZXI6IEZlYXR1cmVMYXllcjtcblx0cHJpdmF0ZSB0b29sOiBPcGVuTGF5ZXJzTWFwVG9vbDtcblxuXHRjb25zdHJ1Y3Rvcih0b29sOk9wZW5MYXllcnNNYXBUb29sKVxuXHR7XG5cdFx0c3VwZXIoe2hhbmRsZU1vdmVFdmVudDogUHJvYmVJbnRlcmFjdGlvbi5wcm90b3R5cGUuaGFuZGxlTW92ZUV2ZW50fSk7XG5cdFx0dGhpcy50b29sID0gdG9vbDtcblx0fVxuXG5cdHNldE1hcChtYXA6b2wuTWFwKVxuXHR7XG5cdFx0c3VwZXIuc2V0TWFwKG1hcCk7XG5cdFx0bGV0IGVsZW1lbnQ6IEVsZW1lbnQgPSBtYXAuZ2V0VGFyZ2V0RWxlbWVudCgpO1xuXG5cdFx0bWFwLmdldFRhcmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIHRoaXMuaGFuZGxlT3V0RXZlbnQuYmluZCh0aGlzKSk7XG5cdH1cblxuXHRwcml2YXRlIG9uRmVhdHVyZUF0UGl4ZWwoZmVhdHVyZTogb2wuRmVhdHVyZSwgbGF5ZXI6IG9sLmxheWVyLkxheWVyKTp2b2lkXG5cdHtcblx0XHRsZXQgekluZGV4OiBudW1iZXIgPSBsYXllci5nZXRaSW5kZXgoKTtcblxuXG5cdFx0aWYgKHpJbmRleCA+IHRoaXMudG9wWkluZGV4KVxuXHRcdHtcblx0XHRcdGxldCB3ZWF2ZUxheWVyT2JqZWN0OiBGZWF0dXJlTGF5ZXIgPSBsYXllci5nZXQoXCJsYXllck9iamVjdFwiKTtcblx0XHRcdHRoaXMudG9wS2V5U2V0ID0gd2VhdmVMYXllck9iamVjdC5wcm9iZUtleVNldCB8fCB0aGlzLnRvcEtleVNldDtcblx0XHRcdHRoaXMudG9wWkluZGV4ID0gekluZGV4O1xuXHRcdFx0dGhpcy50b3BLZXkgPSBmZWF0dXJlLmdldElkKCk7XG5cdFx0XHR0aGlzLnRvcExheWVyID0gd2VhdmVMYXllck9iamVjdDtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHN0YXRpYyBsYXllckZpbHRlcihsYXllcjpvbC5sYXllci5CYXNlKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gbGF5ZXIuZ2V0KFwic2VsZWN0YWJsZVwiKTtcblx0fVxuXG5cdHByaXZhdGUgcGl4ZWxUb0tleShwaXhlbDpvbC5QaXhlbCk6YW55XG5cdHtcblx0XHRsZXQgbWFwOiBvbC5NYXAgPSB0aGlzLmdldE1hcCgpO1xuXG5cdFx0dGhpcy50b3BLZXlTZXQgPSBudWxsO1xuXHRcdHRoaXMudG9wWkluZGV4ID0gLUluZmluaXR5O1xuXHRcdHRoaXMudG9wTGF5ZXIgPSBudWxsO1xuXHRcdHRoaXMudG9wS2V5ID0gbnVsbDtcblx0XHRcblx0XHRtYXAuZm9yRWFjaEZlYXR1cmVBdFBpeGVsKHBpeGVsLCB0aGlzLm9uRmVhdHVyZUF0UGl4ZWwsIHRoaXMsIFByb2JlSW50ZXJhY3Rpb24ubGF5ZXJGaWx0ZXIpO1xuXG5cblxuXHRcdGlmICh0aGlzLnRvcEtleSAmJiB0aGlzLnRvcEtleVNldClcblx0XHR7XG5cdFx0XHR0aGlzLnRvcEtleVNldC5yZXBsYWNlS2V5cyhbdGhpcy50b3BLZXldKTtcblx0XHR9XG5cdFx0XG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgbWFwLmdldExheWVycygpLmdldEFycmF5KCkpXG5cdFx0e1xuXHRcdFx0aWYgKCFQcm9iZUludGVyYWN0aW9uLmxheWVyRmlsdGVyKGxheWVyKSkgY29udGludWU7XG5cdFx0XHRsZXQgd2VhdmVMYXllck9iamVjdDogRmVhdHVyZUxheWVyID0gbGF5ZXIuZ2V0KFwibGF5ZXJPYmplY3RcIik7XG5cdFx0XHRsZXQga2V5U2V0OiBLZXlTZXQgPSB3ZWF2ZUxheWVyT2JqZWN0LnByb2JlS2V5U2V0O1xuXHRcdFx0aWYgKGtleVNldCAmJiBrZXlTZXQgIT0gdGhpcy50b3BLZXlTZXQpXG5cdFx0XHR7XG5cdFx0XHRcdGtleVNldC5jbGVhcktleXMoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy50b3BLZXk7XG5cdH1cblxuXHRwcml2YXRlIGhhbmRsZU1vdmVFdmVudChldmVudDpvbC5NYXBCcm93c2VyRXZlbnQpXG5cdHtcbiAgICAgICAgaWYgKCF0aGlzLnRvb2wucHJvcHMudG9vbFRpcClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgXG5cdFx0bGV0IGtleTphbnkgLypJUXVhbGlmaWVkS2V5Ki8gPSB0aGlzLnBpeGVsVG9LZXkoZXZlbnQucGl4ZWwpO1xuXHRcdGxldCB0b29sVGlwU3RhdGU6IElUb29sVGlwU3RhdGUgPSB7fTtcblxuXHRcdGlmIChrZXkpIHtcblx0XHRcdGxldCBicm93c2VyRXZlbnQ6IE1vdXNlRXZlbnQgPSA8TW91c2VFdmVudD4oZXZlbnQub3JpZ2luYWxFdmVudCk7XG5cblx0XHRcdHRvb2xUaXBTdGF0ZS5zaG93VG9vbFRpcCA9IHRydWU7XG5cdFx0XHR0b29sVGlwU3RhdGUudGl0bGUgPSB0aGlzLmdldFRvb2xUaXBUaXRsZShrZXkpO1xuXHRcdFx0dG9vbFRpcFN0YXRlLmNvbHVtbk5hbWVzVG9WYWx1ZSA9IHRoaXMuZ2V0VG9vbFRpcERhdGEoa2V5LCB0aGlzLnRvcExheWVyLmdldFRvb2xUaXBDb2x1bW5zKCkpO1xuXHRcdFx0W3Rvb2xUaXBTdGF0ZS54LCB0b29sVGlwU3RhdGUueV0gPSBbYnJvd3NlckV2ZW50LmNsaWVudFgsIGJyb3dzZXJFdmVudC5jbGllbnRZXTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHRvb2xUaXBTdGF0ZS5zaG93VG9vbFRpcCA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdHRoaXMudG9vbC5wcm9wcy50b29sVGlwLnNldFN0YXRlKHRvb2xUaXBTdGF0ZSk7XG5cdH1cblxuXHRoYW5kbGVPdXRFdmVudChldmVudDpNb3VzZUV2ZW50KVxuXHR7XG5cdFx0Zm9yIChsZXQgbGF5ZXIgb2YgdGhpcy5nZXRNYXAoKS5nZXRMYXllcnMoKS5nZXRBcnJheSgpKSB7XG5cdFx0XHRpZiAoIVByb2JlSW50ZXJhY3Rpb24ubGF5ZXJGaWx0ZXIobGF5ZXIpKSBjb250aW51ZTtcblx0XHRcdGxldCB3ZWF2ZUxheWVyT2JqZWN0OiBGZWF0dXJlTGF5ZXIgPSBsYXllci5nZXQoXCJsYXllck9iamVjdFwiKTtcblx0XHRcdGxldCBrZXlTZXQ6IEtleVNldCA9IHdlYXZlTGF5ZXJPYmplY3QucHJvYmVLZXlTZXQ7XG5cdFx0XHRpZiAoa2V5U2V0KSB7XG5cdFx0XHRcdGtleVNldC5jbGVhcktleXMoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgdG9vbFRpcFN0YXRlOiBJVG9vbFRpcFN0YXRlID0ge307XG5cdFx0dG9vbFRpcFN0YXRlLnNob3dUb29sVGlwID0gZmFsc2U7XG5cdFx0dGhpcy50b29sLnByb3BzLnRvb2xUaXAuc2V0U3RhdGUodG9vbFRpcFN0YXRlKTtcblx0fVxuXHRcblx0LyogVE9ETzogTW92ZSB0aGlzIGludG8gV2VhdmVUb29sICovXG5cdGdldFRvb2xUaXBEYXRhKGtleTpJUXVhbGlmaWVkS2V5LCBhZGRpdGlvbmFsQ29sdW1uczpJQXR0cmlidXRlQ29sdW1uW10gPSBbXSk6IHsgW2NvbHVtbk5hbWU6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB9IFxuXHR7XG5cdFx0bGV0IGNvbHVtbkhhc2hNYXAgPSB0aGlzLnRvb2wudG9vbFBhdGgud2VhdmUucm9vdC5nZXRPYmplY3QoXCJQcm9iZWQgQ29sdW1uc1wiKTtcblxuXHRcdHZhciByZXN1bHQ6IHsgW2NvbHVtbk5hbWU6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB9ID0ge307XG5cblx0XHRmb3IgKGxldCBjaGlsZCBvZiBjb2x1bW5IYXNoTWFwLmdldE9iamVjdHMoKS5jb25jYXQoYWRkaXRpb25hbENvbHVtbnMpKVxuXHRcdHtcblx0XHRcdGxldCB0aXRsZTpzdHJpbmcgPSBjaGlsZC5nZXRNZXRhZGF0YShcInRpdGxlXCIpO1xuXHRcdFx0bGV0IHZhbHVlOnN0cmluZyA9IGNoaWxkLmdldFZhbHVlRnJvbUtleShrZXksIFN0cmluZyk7XG5cdFx0XHRpZiAodmFsdWUpXG5cdFx0XHR7XG5cdFx0XHRcdHJlc3VsdFt0aXRsZV0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cdFxuXHQvKiBUT0RPOiBNb3ZlIHRoaXMgaW50byBXZWF2ZVRvb2wgKi9cblx0Z2V0VG9vbFRpcFRpdGxlKGtleTphbnkgLyogSVF1YWxpZmllZEtleSAqLyk6IHN0cmluZ1xuXHR7XG5cdFx0bGV0IHRpdGxlSGFzaE1hcCA9IHRoaXMudG9vbC50b29sUGF0aC53ZWF2ZS5yb290LmdldE9iamVjdChcIlByb2JlIEhlYWRlciBDb2x1bW5zXCIpO1xuXG5cdFx0cmV0dXJuIGxvZGFzaC5tYXAodGl0bGVIYXNoTWFwLmdldE9iamVjdHMoKSwgKGQ6YW55KSA9PiBkLmdldFZhbHVlRnJvbUtleShrZXksIFN0cmluZykpLmpvaW4oXCIsIFwiKTtcblx0fVxufSJdfQ==