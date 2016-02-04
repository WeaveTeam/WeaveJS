"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FeatureLayer = undefined;

var _openlayers = require("openlayers");

var ol = _interopRequireWildcard(_openlayers);

var _lodash = require("lodash");

var lodash = _interopRequireWildcard(_lodash);

var _Layer2 = require("./Layer");

var _Layer3 = _interopRequireDefault(_Layer2);

var _StandardLib = require("../../../utils/StandardLib");

var _StandardLib2 = _interopRequireDefault(_StandardLib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

var FeatureLayer = exports.FeatureLayer = function (_Layer) {
    _inherits(FeatureLayer, _Layer);

    function FeatureLayer(parent, layerName) {
        _classCallCheck(this, FeatureLayer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FeatureLayer).call(this, parent, layerName));

        _this.updateMetaStyle = _this.updateMetaStyle_unbound.bind(_this);
        _this.debounced_updateMetaStyles = lodash.debounce(_this.updateMetaStyles.bind(_this), 0);
        _this.olLayer = new ol.layer.Vector();
        _this.source = new ol.source.Vector({ wrapX: false });
        /* Every feature that is added should register a handler to automatically recompute the metastyles when the styles change. */
        _this.source.on("addfeature", _this.onFeatureAdd, _this);
        _this.changedItems = new Set();
        _this.selectionKeySet = _this.layerPath.weave.getObject("defaultSelectionKeySet");
        _this.probeKeySet = _this.layerPath.weave.getObject("defaultProbeKeySet");
        _this.filteredKeySet = _this.layerPath.getObject("filteredKeySet");
        var selectionKeyHandler = _this.updateSetFromKeySet.bind(_this, _this.selectionKeySet, new Set());
        var probeKeyHandler = _this.updateSetFromKeySet.bind(_this, _this.probeKeySet, new Set());
        Weave.getCallbacks(_this.selectionKeySet).addGroupedCallback(_this, selectionKeyHandler, true);
        Weave.getCallbacks(_this.probeKeySet).addGroupedCallback(_this, probeKeyHandler, true);
        Weave.getCallbacks(_this.filteredKeySet).addGroupedCallback(_this, _this.updateMetaStyles, true);
        _this.selectableBoolean = _this.settingsPath.getObject("selectable");
        _this.settingsPath.push("selectable").addCallback(_this, _this.updateMetaStyles);
        return _this;
    }

    _createClass(FeatureLayer, [{
        key: "onFeatureAdd",
        value: function onFeatureAdd(vectorEvent) {
            vectorEvent.feature.on("propertychange", this.onFeaturePropertyChange, this);
        }
    }, {
        key: "onFeaturePropertyChange",
        value: function onFeaturePropertyChange(objectEvent) {
            var propertyName = objectEvent.key;
            if (!lodash.contains(FeatureLayer.Styles, propertyName)) {
                /* The property that changed isn't one of our metaStyle properties, so we don't care. */
                return;
            } else {
                /* The property that changed was a metastyle, and as such the styles should be recomputed */
                this.debounced_updateMetaStyles();
            }
        }
    }, {
        key: "getToolTipColumns",
        value: function getToolTipColumns() {
            return [];
        }
    }, {
        key: "updateSetFromKeySet",
        value: function updateSetFromKeySet(keySet, previousContents) {
            if (!this.source) return; //HACK
            var wasEmpty = previousContents.size === 0;
            var isEmpty = keySet.keys.length === 0;
            /* If the selection keyset becomes empty or nonempty, we should recompute all the styles. Otherwise, only recompute the styles of the features which changed. */
            if (keySet === this.selectionKeySet && isEmpty !== wasEmpty) {
                this.updateMetaStyles();
            } else {
                this.changedItems.clear();
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = keySet.keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var key = _step.value;

                        if (!previousContents.has(key)) this.changedItems.add(key);
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

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = previousContents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var key = _step2.value;

                        if (!keySet.containsKey(key)) this.changedItems.add(key);
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

                this.changedItems.forEach(function (featureId) {
                    var feature = this.source.getFeatureById(featureId);
                    if (feature) {
                        this.updateMetaStyle(feature);
                    }
                }, this);
            }
            previousContents.clear();
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = keySet.keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var key = _step3.value;

                    previousContents.add(key);
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
        }
    }, {
        key: "updateMetaStyles",
        value: function updateMetaStyles() {
            if (!this.source) return; //HACK
            this.source.forEachFeature(this.updateMetaStyle, this);
        }
    }, {
        key: "updateMetaStyle_unbound",
        value: function updateMetaStyle_unbound(feature) {
            var id = feature.getId();
            var nullStyle = new ol.style.Style({});
            var unselectedStyle = feature.get("unselectedStyle") || nullStyle;
            var normalStyle = feature.get("normalStyle") || nullStyle;
            var selectedStyle = feature.get("selectedStyle") || nullStyle;
            var probedStyle = feature.get("probedStyle") || nullStyle;
            var zOrder = feature.get("zOrder") || 0;
            var replace = feature.get("replace");
            var newStyle = undefined;
            if (!this.filteredKeySet.containsKey(id)) {
                feature.setStyle(nullStyle);
                return;
            }
            if (!this.selectableBoolean.state) {
                feature.setStyle(normalStyle);
                return;
            }
            if (!this.selectionKeySet.containsKey(id) && !this.probeKeySet.containsKey(id) && this.selectionKeySet.keys.length > 0) {
                if (replace) {
                    newStyle = unselectedStyle;
                    newStyle.setZIndex(zOrder);
                } else {
                    newStyle = [].concat(unselectedStyle);
                    newStyle[0].setZIndex(zOrder);
                }
            } else {
                newStyle = [].concat(normalStyle);
                newStyle[0].setZIndex(zOrder);
            }
            if (this.selectionKeySet.containsKey(id)) {
                if (replace) {
                    newStyle = selectedStyle;
                    newStyle.setZIndex(Number.MAX_SAFE_INTEGER - 3);
                } else {
                    newStyle = newStyle.concat(selectedStyle);
                    newStyle[0].setZIndex(Number.MAX_SAFE_INTEGER - 3);
                }
            }
            if (this.probeKeySet.containsKey(id)) {
                if (replace) {
                    newStyle = probedStyle;
                    newStyle.setZIndex(Number.MAX_SAFE_INTEGER);
                } else {
                    newStyle = newStyle.concat(probedStyle);
                    newStyle[0].setZIndex(Number.MAX_SAFE_INTEGER);
                }
            }
            feature.setStyle(newStyle);
        }
    }], [{
        key: "toColorArray",
        value: function toColorArray(color, alpha) {
            var colorArray;
            if (typeof color == "number") {
                colorArray = ol.color.asArray("#" + _StandardLib2.default.decimalToHex(color));
            } else {
                if (color[0] === "#") {
                    colorArray = ol.color.asArray(color);
                } else {
                    colorArray = ol.color.asArray("#" + _StandardLib2.default.decimalToHex(Number(color)));
                }
            }
            colorArray = [].concat(colorArray); /* Should not be modified since it is cached in ol.color.asArray */
            if (!colorArray) {
                return null;
            }
            colorArray[3] = Number(alpha);
            return colorArray;
        }
    }, {
        key: "toColorRGBA",
        value: function toColorRGBA(colorString, alpha) {
            var colorArray = FeatureLayer.toColorArray(colorString, alpha);
            return ol.color.asString(colorArray);
        }
    }, {
        key: "olFillFromWeaveFill",
        value: function olFillFromWeaveFill(fill, fade) {
            if (fade === undefined) fade = 1;
            var color = fill.color && FeatureLayer.toColorArray(fill.color, fill.alpha * fade) || [0, 0, 0, 0];
            return new ol.style.Fill({ color: color });
        }
    }, {
        key: "olStrokeFromWeaveStroke",
        value: function olStrokeFromWeaveStroke(stroke, fade) {
            if (fade === undefined) fade = 1;
            var color = stroke.color !== undefined && stroke.color !== null && FeatureLayer.toColorArray(stroke.color, stroke.alpha * fade) || [0, 0, 0, 1];
            var lineCap = stroke.lineCap === "none" ? "butt" : stroke.lineCap || "round";
            var lineJoin = stroke.lineJoin === null ? "round" : stroke.lineJoin || "round";
            var miterLimit = Number(stroke.miterLimit);
            var width = Number(stroke.weight);
            if (width == 0) color[3] = 0; /* If the width is 0, set alpha to 0 to avoid rendering; canvas context would ignore setting width to 0 */
            return new ol.style.Stroke({ color: color, lineCap: lineCap, lineJoin: lineJoin, miterLimit: miterLimit, width: width });
        }
    }, {
        key: "getOlProbedStyle",
        value: function getOlProbedStyle(baseStrokeStyle) {
            var width = baseStrokeStyle.getWidth();
            return [new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: [0, 0, 0, 1],
                    width: width + FeatureLayer.PROBE_HALO_WIDTH + FeatureLayer.PROBE_LINE_WIDTH
                }),
                zIndex: Number.MAX_SAFE_INTEGER - 2
            }), new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: [255, 255, 255, 1],
                    width: width + FeatureLayer.PROBE_HALO_WIDTH
                }),
                zIndex: Number.MAX_SAFE_INTEGER - 1
            })];
        }
    }, {
        key: "getOlSelectionStyle",
        value: function getOlSelectionStyle(baseStrokeStyle) {
            var width = baseStrokeStyle.getWidth();
            var lineCap = baseStrokeStyle.getLineCap();
            var lineJoin = baseStrokeStyle.getLineJoin();
            var miterLimit = baseStrokeStyle.getMiterLimit();
            return [new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: [0, 0, 0, 0.5],
                    width: width + FeatureLayer.SELECT_WIDTH,
                    lineCap: lineCap, lineJoin: lineJoin, miterLimit: miterLimit }),
                zIndex: Number.MAX_SAFE_INTEGER - 4
            })];
        }
    }]);

    return FeatureLayer;
}(_Layer3.default);

FeatureLayer.SELECT_WIDTH = 5;
FeatureLayer.PROBE_HALO_WIDTH = 4;
FeatureLayer.PROBE_LINE_WIDTH = 1;
FeatureLayer.Styles = {
    NORMAL: "normalStyle",
    UNSELECTED: "unselectedStyle",
    SELECTED: "selectedStyle",
    PROBED: "probedStyle"
};
;
;
exports.default = FeatureLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmVhdHVyZUxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjdHMvdG9vbHMvT3BlbkxheWVyc01hcC9MYXllcnMvRmVhdHVyZUxheWVyLnRzIl0sIm5hbWVzIjpbIkZlYXR1cmVMYXllciIsIkZlYXR1cmVMYXllci5jb25zdHJ1Y3RvciIsIkZlYXR1cmVMYXllci5vbkZlYXR1cmVBZGQiLCJGZWF0dXJlTGF5ZXIub25GZWF0dXJlUHJvcGVydHlDaGFuZ2UiLCJGZWF0dXJlTGF5ZXIuZ2V0VG9vbFRpcENvbHVtbnMiLCJGZWF0dXJlTGF5ZXIudG9Db2xvckFycmF5IiwiRmVhdHVyZUxheWVyLnRvQ29sb3JSR0JBIiwiRmVhdHVyZUxheWVyLnVwZGF0ZVNldEZyb21LZXlTZXQiLCJGZWF0dXJlTGF5ZXIudXBkYXRlTWV0YVN0eWxlcyIsIkZlYXR1cmVMYXllci51cGRhdGVNZXRhU3R5bGVfdW5ib3VuZCIsIkZlYXR1cmVMYXllci5vbEZpbGxGcm9tV2VhdmVGaWxsIiwiRmVhdHVyZUxheWVyLm9sU3Ryb2tlRnJvbVdlYXZlU3Ryb2tlIiwiRmVhdHVyZUxheWVyLmdldE9sUHJvYmVkU3R5bGUiLCJGZWF0dXJlTGF5ZXIuZ2V0T2xTZWxlY3Rpb25TdHlsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFJWSxBQUFFLEFBQU0sQUFBWSxBQUN6Qjs7OztJQUFLLEFBQU0sQUFBTSxBQUFRLEFBRXpCLEFBQUssQUFBTSxBQUFTLEFBQ3BCLEFBQVcsQUFBTSxBQUE0QixBQU1wRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUEyQyxBQUFLOzs7QUFpQi9DLDBCQUFZLEFBQU0sUUFBRSxBQUFTOzs7b0dBRXRCLEFBQU0sUUFBRSxBQUFTLEFBQUMsQUFBQzs7QUFFekIsQUFBSSxjQUFDLEFBQWUsa0JBQUcsQUFBSSxNQUFDLEFBQXVCLHdCQUFDLEFBQUksQUFBQyxBQUFJLEFBQUMsQUFBQztBQUMvRCxBQUFJLGNBQUMsQUFBMEIsNkJB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YUFBZ0IsbUJBQVUsQUFBQyxBQUFDO0FBQzVCLGFBQU0sU0FBVTtBQUN0QixBQUFNLFlBQUUsQUFBYTtBQUNyQixBQUFVLGdCQUFFLEFBQWlCO0FBQzdCLEFBQVEsY0FBRSxBQUFlO0FBQ3pCLEFBQU0sWUFBRSxBQUFhLEFBQ3JCLEFBQ0Q7O0FBQUEsQUFBQztBQU9ELEFBQUMsQUFFRjtrQkFBZSxBQUFZLEFBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uL3R5cGluZ3Mvb3BlbmxheWVycy9vcGVubGF5ZXJzLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi8uLi90eXBpbmdzL3dlYXZlL3dlYXZlanMuZC50c1wiLz5cblxuaW1wb3J0ICogYXMgb2wgZnJvbSBcIm9wZW5sYXllcnNcIjtcbmltcG9ydCAqIGFzIGxvZGFzaCBmcm9tIFwibG9kYXNoXCI7XG5cbmltcG9ydCBMYXllciBmcm9tIFwiLi9MYXllclwiO1xuaW1wb3J0IFN0YW5kYXJkTGliIGZyb20gXCIuLi8uLi8uLi91dGlscy9TdGFuZGFyZExpYlwiO1xuXG5pbXBvcnQgSVF1YWxpZmllZEtleSA9IHdlYXZlanMuYXBpLmRhdGEuSVF1YWxpZmllZEtleTtcbmltcG9ydCBLZXlTZXQgPSB3ZWF2ZWpzLmRhdGEua2V5LktleVNldDtcbmltcG9ydCBGaWx0ZXJlZEtleVNldCA9IHdlYXZlanMuZGF0YS5rZXkuRmlsdGVyZWRLZXlTZXQ7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBGZWF0dXJlTGF5ZXIgZXh0ZW5kcyBMYXllciB7XG5cdC8qIEEgRmVhdHVyZUxheWVyIGFzc3VtZXMgdGhhdCBlYWNoIGZlYXR1cmUgd2lsbCBoYXZlIG11bHRpcGxlIGN1c3RvbSBzdHlsZSBwcm9wZXJ0aWVzIG9uIGVhY2ggZmVhdHVyZSwgd2hpY2ggYXJlIG1hbmFnZWQgYmFzZWQgb24gc2VsZWN0aW9uLiAqL1xuXHRwcml2YXRlIHVwZGF0ZU1ldGFTdHlsZTpGdW5jdGlvbjtcblx0cHJpdmF0ZSBkZWJvdW5jZWRfdXBkYXRlTWV0YVN0eWxlczpGdW5jdGlvbjtcblxuXHRwcml2YXRlIGNoYW5nZWRJdGVtczpTZXQ8SVF1YWxpZmllZEtleT47XG5cblx0cHVibGljIHNlbGVjdGlvbktleVNldDpLZXlTZXQ7XG5cblx0cHVibGljIHByb2JlS2V5U2V0OktleVNldDtcblxuXHRwdWJsaWMgZmlsdGVyZWRLZXlTZXQ6RmlsdGVyZWRLZXlTZXQ7XG5cblx0cHJpdmF0ZSBzZWxlY3RhYmxlQm9vbGVhbjogYW55OyAvKkxpbmthYmxlQm9vbGVhbiovXG5cblx0c291cmNlOm9sLnNvdXJjZS5WZWN0b3I7XG5cblx0Y29uc3RydWN0b3IocGFyZW50LCBsYXllck5hbWUpXG5cdHtcblx0XHRzdXBlcihwYXJlbnQsIGxheWVyTmFtZSk7XG5cdFx0XG5cdFx0dGhpcy51cGRhdGVNZXRhU3R5bGUgPSB0aGlzLnVwZGF0ZU1ldGFTdHlsZV91bmJvdW5kLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5kZWJvdW5jZWRfdXBkYXRlTWV0YVN0eWxlcyA9IGxvZGFzaC5kZWJvdW5jZSh0aGlzLnVwZGF0ZU1ldGFTdHlsZXMuYmluZCh0aGlzKSwgMCk7XG5cblx0XHR0aGlzLm9sTGF5ZXIgPSBuZXcgb2wubGF5ZXIuVmVjdG9yKCk7XG5cdFx0dGhpcy5zb3VyY2UgPSBuZXcgb2wuc291cmNlLlZlY3Rvcih7d3JhcFg6IGZhbHNlfSk7XG5cblx0XHQvKiBFdmVyeSBmZWF0dXJlIHRoYXQgaXMgYWRkZWQgc2hvdWxkIHJlZ2lzdGVyIGEgaGFuZGxlciB0byBhdXRvbWF0aWNhbGx5IHJlY29tcHV0ZSB0aGUgbWV0YXN0eWxlcyB3aGVuIHRoZSBzdHlsZXMgY2hhbmdlLiAqL1xuXHRcdHRoaXMuc291cmNlLm9uKFwiYWRkZmVhdHVyZVwiLCB0aGlzLm9uRmVhdHVyZUFkZCwgdGhpcyk7XG5cblx0XHR0aGlzLmNoYW5nZWRJdGVtcyA9IG5ldyBTZXQoKTtcblxuXHRcdHRoaXMuc2VsZWN0aW9uS2V5U2V0ID0gdGhpcy5sYXllclBhdGgud2VhdmUuZ2V0T2JqZWN0KFwiZGVmYXVsdFNlbGVjdGlvbktleVNldFwiKVxuXHRcdHRoaXMucHJvYmVLZXlTZXQgPSB0aGlzLmxheWVyUGF0aC53ZWF2ZS5nZXRPYmplY3QoXCJkZWZhdWx0UHJvYmVLZXlTZXRcIik7XG5cdFx0dGhpcy5maWx0ZXJlZEtleVNldCA9IHRoaXMubGF5ZXJQYXRoLmdldE9iamVjdChcImZpbHRlcmVkS2V5U2V0XCIpO1xuXG5cdFx0bGV0IHNlbGVjdGlvbktleUhhbmRsZXIgPSB0aGlzLnVwZGF0ZVNldEZyb21LZXlTZXQuYmluZCh0aGlzLCB0aGlzLnNlbGVjdGlvbktleVNldCwgbmV3IFNldDxJUXVhbGlmaWVkS2V5PigpKTtcblx0XHRsZXQgcHJvYmVLZXlIYW5kbGVyID0gdGhpcy51cGRhdGVTZXRGcm9tS2V5U2V0LmJpbmQodGhpcywgdGhpcy5wcm9iZUtleVNldCwgbmV3IFNldDxJUXVhbGlmaWVkS2V5PigpKTtcblxuXHRcdFdlYXZlLmdldENhbGxiYWNrcyh0aGlzLnNlbGVjdGlvbktleVNldCkuYWRkR3JvdXBlZENhbGxiYWNrKHRoaXMsIHNlbGVjdGlvbktleUhhbmRsZXIsIHRydWUpO1xuXHRcdFdlYXZlLmdldENhbGxiYWNrcyh0aGlzLnByb2JlS2V5U2V0KS5hZGRHcm91cGVkQ2FsbGJhY2sodGhpcywgcHJvYmVLZXlIYW5kbGVyLCB0cnVlKTtcblx0XHRXZWF2ZS5nZXRDYWxsYmFja3ModGhpcy5maWx0ZXJlZEtleVNldCkuYWRkR3JvdXBlZENhbGxiYWNrKHRoaXMsIHRoaXMudXBkYXRlTWV0YVN0eWxlcywgdHJ1ZSk7XG5cdFx0dGhpcy5zZWxlY3RhYmxlQm9vbGVhbiA9IHRoaXMuc2V0dGluZ3NQYXRoLmdldE9iamVjdChcInNlbGVjdGFibGVcIik7XG5cblx0XHR0aGlzLnNldHRpbmdzUGF0aC5wdXNoKFwic2VsZWN0YWJsZVwiKS5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLnVwZGF0ZU1ldGFTdHlsZXMpO1xuXHR9XG5cblx0b25GZWF0dXJlQWRkKHZlY3RvckV2ZW50KVxuXHR7XG5cdFx0dmVjdG9yRXZlbnQuZmVhdHVyZS5vbihcInByb3BlcnR5Y2hhbmdlXCIsIHRoaXMub25GZWF0dXJlUHJvcGVydHlDaGFuZ2UsIHRoaXMpO1xuXHR9XG5cblx0b25GZWF0dXJlUHJvcGVydHlDaGFuZ2Uob2JqZWN0RXZlbnQpXG5cdHtcblx0XHRsZXQgcHJvcGVydHlOYW1lID0gb2JqZWN0RXZlbnQua2V5O1xuXG5cdFx0aWYgKCFsb2Rhc2guY29udGFpbnMoRmVhdHVyZUxheWVyLlN0eWxlcywgcHJvcGVydHlOYW1lKSlcblx0XHR7XG5cdFx0XHQvKiBUaGUgcHJvcGVydHkgdGhhdCBjaGFuZ2VkIGlzbid0IG9uZSBvZiBvdXIgbWV0YVN0eWxlIHByb3BlcnRpZXMsIHNvIHdlIGRvbid0IGNhcmUuICovXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHQvKiBUaGUgcHJvcGVydHkgdGhhdCBjaGFuZ2VkIHdhcyBhIG1ldGFzdHlsZSwgYW5kIGFzIHN1Y2ggdGhlIHN0eWxlcyBzaG91bGQgYmUgcmVjb21wdXRlZCAqL1xuXHRcdFx0dGhpcy5kZWJvdW5jZWRfdXBkYXRlTWV0YVN0eWxlcygpO1xuXHRcdH1cblx0fVxuXG5cdGFic3RyYWN0IHVwZGF0ZVN0eWxlRGF0YSgpOnZvaWQ7XG5cblx0Z2V0VG9vbFRpcENvbHVtbnMoKTogQXJyYXk8YW55PiAvKiBBcnJheTxJQXR0cmlidXRlQ29sdW1uPiAqL1xuXHR7XG5cdFx0cmV0dXJuIFtdO1xuXHR9XG5cblx0c3RhdGljIHRvQ29sb3JBcnJheShjb2xvcjogc3RyaW5nfG51bWJlciwgYWxwaGEpXG5cdHtcblx0XHR2YXIgY29sb3JBcnJheTtcblxuXHRcdGlmICh0eXBlb2YgY29sb3IgPT0gXCJudW1iZXJcIilcblx0XHR7XG5cdFx0XHRjb2xvckFycmF5ID0gb2wuY29sb3IuYXNBcnJheShcIiNcIiArIFN0YW5kYXJkTGliLmRlY2ltYWxUb0hleChjb2xvciBhcyBudW1iZXIpKTtcblx0XHR9XG5cdFx0ZWxzZSAvKiBpZiB0eXBlb2YgY29sb3IgaXMgc3RyaW5nICovXG5cdFx0e1xuXHRcdFx0aWYgKGNvbG9yWzBdID09PSBcIiNcIikge1xuXHRcdFx0XHRjb2xvckFycmF5ID0gb2wuY29sb3IuYXNBcnJheShjb2xvciBhcyBzdHJpbmcpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNvbG9yQXJyYXkgPSBvbC5jb2xvci5hc0FycmF5KFwiI1wiICsgU3RhbmRhcmRMaWIuZGVjaW1hbFRvSGV4KE51bWJlcihjb2xvciBhcyBzdHJpbmcpKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29sb3JBcnJheSA9IFtdLmNvbmNhdChjb2xvckFycmF5KTsgLyogU2hvdWxkIG5vdCBiZSBtb2RpZmllZCBzaW5jZSBpdCBpcyBjYWNoZWQgaW4gb2wuY29sb3IuYXNBcnJheSAqL1xuXG5cdFx0aWYgKCFjb2xvckFycmF5KSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRjb2xvckFycmF5WzNdID0gTnVtYmVyKGFscGhhKTtcblx0XHRyZXR1cm4gY29sb3JBcnJheTtcblx0fVxuXG5cdHN0YXRpYyB0b0NvbG9yUkdCQShjb2xvclN0cmluZywgYWxwaGEpXG5cdHtcblx0XHR2YXIgY29sb3JBcnJheSA9IEZlYXR1cmVMYXllci50b0NvbG9yQXJyYXkoY29sb3JTdHJpbmcsIGFscGhhKTtcblx0XHRyZXR1cm4gb2wuY29sb3IuYXNTdHJpbmcoY29sb3JBcnJheSk7XG5cdH1cblxuXHR1cGRhdGVTZXRGcm9tS2V5U2V0KGtleVNldDpLZXlTZXQsIHByZXZpb3VzQ29udGVudHM6U2V0PElRdWFsaWZpZWRLZXk+KVxuXHR7XG5cdFx0aWYgKCF0aGlzLnNvdXJjZSkgcmV0dXJuOyAvL0hBQ0tcblx0XHRcblx0XHRsZXQgd2FzRW1wdHk6Ym9vbGVhbiA9IHByZXZpb3VzQ29udGVudHMuc2l6ZSA9PT0gMDtcblx0XHRsZXQgaXNFbXB0eTpib29sZWFuID0ga2V5U2V0LmtleXMubGVuZ3RoID09PSAwO1xuXG5cdFx0LyogSWYgdGhlIHNlbGVjdGlvbiBrZXlzZXQgYmVjb21lcyBlbXB0eSBvciBub25lbXB0eSwgd2Ugc2hvdWxkIHJlY29tcHV0ZSBhbGwgdGhlIHN0eWxlcy4gT3RoZXJ3aXNlLCBvbmx5IHJlY29tcHV0ZSB0aGUgc3R5bGVzIG9mIHRoZSBmZWF0dXJlcyB3aGljaCBjaGFuZ2VkLiAqL1xuXHRcdGlmIChrZXlTZXQgPT09IHRoaXMuc2VsZWN0aW9uS2V5U2V0ICYmIGlzRW1wdHkgIT09IHdhc0VtcHR5KVxuXHRcdHtcblx0XHRcdHRoaXMudXBkYXRlTWV0YVN0eWxlcygpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGhpcy5jaGFuZ2VkSXRlbXMuY2xlYXIoKTtcblxuXHRcdFx0Zm9yIChsZXQga2V5IG9mIGtleVNldC5rZXlzKSB7XG5cdFx0XHRcdGlmICghcHJldmlvdXNDb250ZW50cy5oYXMoa2V5KSlcblx0XHRcdFx0XHR0aGlzLmNoYW5nZWRJdGVtcy5hZGQoa2V5KTtcblx0XHRcdH1cblxuXHRcdFx0Zm9yIChsZXQga2V5IG9mIHByZXZpb3VzQ29udGVudHMpIHtcblx0XHRcdFx0aWYgKCFrZXlTZXQuY29udGFpbnNLZXkoa2V5KSlcblx0XHRcdFx0XHR0aGlzLmNoYW5nZWRJdGVtcy5hZGQoa2V5KTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5jaGFuZ2VkSXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoZmVhdHVyZUlkKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgZmVhdHVyZSA9IHRoaXMuc291cmNlLmdldEZlYXR1cmVCeUlkKGZlYXR1cmVJZCk7XG5cdFx0XHRcdGlmIChmZWF0dXJlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhpcy51cGRhdGVNZXRhU3R5bGUoZmVhdHVyZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sIHRoaXMpO1xuXHRcdH1cblxuXHRcdHByZXZpb3VzQ29udGVudHMuY2xlYXIoKTtcblx0XHRmb3IgKGxldCBrZXkgb2Yga2V5U2V0LmtleXMpIHByZXZpb3VzQ29udGVudHMuYWRkKGtleSk7XG5cdH1cblxuXHR1cGRhdGVNZXRhU3R5bGVzKClcblx0e1xuXHRcdGlmICghdGhpcy5zb3VyY2UpIHJldHVybjsgLy9IQUNLXG5cblx0XHR0aGlzLnNvdXJjZS5mb3JFYWNoRmVhdHVyZSh0aGlzLnVwZGF0ZU1ldGFTdHlsZSwgdGhpcyk7XG5cdH1cblxuXHR1cGRhdGVNZXRhU3R5bGVfdW5ib3VuZChmZWF0dXJlKVxuXHR7XG5cdFx0bGV0IGlkOklRdWFsaWZpZWRLZXkgPSA8SVF1YWxpZmllZEtleT5mZWF0dXJlLmdldElkKCk7XG5cdFx0bGV0IG51bGxTdHlsZSA9IG5ldyBvbC5zdHlsZS5TdHlsZSh7fSk7XG5cdFx0bGV0IHVuc2VsZWN0ZWRTdHlsZSA9IGZlYXR1cmUuZ2V0KFwidW5zZWxlY3RlZFN0eWxlXCIpIHx8IG51bGxTdHlsZTtcblx0XHRsZXQgbm9ybWFsU3R5bGUgPSBmZWF0dXJlLmdldChcIm5vcm1hbFN0eWxlXCIpIHx8IG51bGxTdHlsZTtcblx0XHRsZXQgc2VsZWN0ZWRTdHlsZSA9IGZlYXR1cmUuZ2V0KFwic2VsZWN0ZWRTdHlsZVwiKSB8fCBudWxsU3R5bGU7XG5cdFx0bGV0IHByb2JlZFN0eWxlID0gZmVhdHVyZS5nZXQoXCJwcm9iZWRTdHlsZVwiKSB8fCBudWxsU3R5bGU7XG5cdFx0bGV0IHpPcmRlciA9IGZlYXR1cmUuZ2V0KFwiek9yZGVyXCIpIHx8IDA7XG5cdFx0bGV0IHJlcGxhY2UgPSBmZWF0dXJlLmdldChcInJlcGxhY2VcIik7XG5cdFx0bGV0IG5ld1N0eWxlO1xuXG5cdFx0aWYgKCF0aGlzLmZpbHRlcmVkS2V5U2V0LmNvbnRhaW5zS2V5KGlkKSlcblx0XHR7XG5cdFx0XHRmZWF0dXJlLnNldFN0eWxlKG51bGxTdHlsZSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLnNlbGVjdGFibGVCb29sZWFuLnN0YXRlKVxuXHRcdHtcblx0XHRcdGZlYXR1cmUuc2V0U3R5bGUobm9ybWFsU3R5bGUpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICghdGhpcy5zZWxlY3Rpb25LZXlTZXQuY29udGFpbnNLZXkoaWQpICYmICF0aGlzLnByb2JlS2V5U2V0LmNvbnRhaW5zS2V5KGlkKSAmJiB0aGlzLnNlbGVjdGlvbktleVNldC5rZXlzLmxlbmd0aCA+IDApXG5cdFx0e1xuXHRcdFx0aWYgKHJlcGxhY2UpXG5cdFx0XHR7XG5cdFx0XHRcdG5ld1N0eWxlID0gdW5zZWxlY3RlZFN0eWxlO1xuXHRcdFx0XHRuZXdTdHlsZS5zZXRaSW5kZXgoek9yZGVyKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0bmV3U3R5bGUgPSBbXS5jb25jYXQodW5zZWxlY3RlZFN0eWxlKTtcblx0XHRcdFx0bmV3U3R5bGVbMF0uc2V0WkluZGV4KHpPcmRlcik7XG5cdFx0XHR9XG5cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdG5ld1N0eWxlID0gW10uY29uY2F0KG5vcm1hbFN0eWxlKTtcblx0XHRcdG5ld1N0eWxlWzBdLnNldFpJbmRleCh6T3JkZXIpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnNlbGVjdGlvbktleVNldC5jb250YWluc0tleShpZCkpXG5cdFx0e1xuXHRcdFx0aWYgKHJlcGxhY2UpXG5cdFx0XHR7XG5cdFx0XHRcdG5ld1N0eWxlID0gc2VsZWN0ZWRTdHlsZTtcblx0XHRcdFx0bmV3U3R5bGUuc2V0WkluZGV4KE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIC0gMyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdG5ld1N0eWxlID0gbmV3U3R5bGUuY29uY2F0KHNlbGVjdGVkU3R5bGUpO1xuXHRcdFx0XHRuZXdTdHlsZVswXS5zZXRaSW5kZXgoTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgLSAzKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5wcm9iZUtleVNldC5jb250YWluc0tleShpZCkpXG5cdFx0e1xuXHRcdFx0aWYgKHJlcGxhY2UpXG5cdFx0XHR7XG5cdFx0XHRcdG5ld1N0eWxlID0gcHJvYmVkU3R5bGU7XG5cdFx0XHRcdG5ld1N0eWxlLnNldFpJbmRleChOdW1iZXIuTUFYX1NBRkVfSU5URUdFUik7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdG5ld1N0eWxlID0gbmV3U3R5bGUuY29uY2F0KHByb2JlZFN0eWxlKTtcblx0XHRcdFx0bmV3U3R5bGVbMF0uc2V0WkluZGV4KE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmZWF0dXJlLnNldFN0eWxlKG5ld1N0eWxlKTtcblx0fVxuXG5cdHN0YXRpYyBvbEZpbGxGcm9tV2VhdmVGaWxsKGZpbGwsIGZhZGU/KVxuXHR7XG5cdFx0aWYgKGZhZGUgPT09IHVuZGVmaW5lZCkgZmFkZSA9IDE7XG5cblx0XHRsZXQgY29sb3IgPSBmaWxsLmNvbG9yICYmIEZlYXR1cmVMYXllci50b0NvbG9yQXJyYXkoZmlsbC5jb2xvciwgZmlsbC5hbHBoYSAqIGZhZGUpIHx8IFswLCAwLCAwLCAwXTtcblx0XHRyZXR1cm4gbmV3IG9sLnN0eWxlLkZpbGwoe2NvbG9yfSk7XG5cdH1cblxuXHRzdGF0aWMgb2xTdHJva2VGcm9tV2VhdmVTdHJva2Uoc3Ryb2tlOmFueSwgZmFkZT86bnVtYmVyKVxuXHR7XG5cdFx0aWYgKGZhZGUgPT09IHVuZGVmaW5lZCkgZmFkZSA9IDE7XG5cblx0XHRsZXQgY29sb3I6QXJyYXk8bnVtYmVyPiA9IChzdHJva2UuY29sb3IgIT09IHVuZGVmaW5lZCAmJiBzdHJva2UuY29sb3IgIT09IG51bGwpICYmIEZlYXR1cmVMYXllci50b0NvbG9yQXJyYXkoc3Ryb2tlLmNvbG9yLCBzdHJva2UuYWxwaGEgKiBmYWRlKSB8fCBbMCwgMCwgMCwgMV07XG5cblx0XHRsZXQgbGluZUNhcDpzdHJpbmcgPSBzdHJva2UubGluZUNhcCA9PT0gXCJub25lXCIgPyBcImJ1dHRcIiA6IHN0cm9rZS5saW5lQ2FwIHx8IFwicm91bmRcIjtcblx0XHRsZXQgbGluZUpvaW46c3RyaW5nID0gc3Ryb2tlLmxpbmVKb2luID09PSBudWxsID8gXCJyb3VuZFwiIDogc3Ryb2tlLmxpbmVKb2luIHx8IFwicm91bmRcIjtcblx0XHRsZXQgbWl0ZXJMaW1pdDpudW1iZXIgPSBOdW1iZXIoc3Ryb2tlLm1pdGVyTGltaXQpO1xuXHRcdGxldCB3aWR0aDpudW1iZXIgPSBOdW1iZXIoc3Ryb2tlLndlaWdodCk7XG5cdFx0aWYgKHdpZHRoID09IDApIGNvbG9yWzNdID0gMDsgLyogSWYgdGhlIHdpZHRoIGlzIDAsIHNldCBhbHBoYSB0byAwIHRvIGF2b2lkIHJlbmRlcmluZzsgY2FudmFzIGNvbnRleHQgd291bGQgaWdub3JlIHNldHRpbmcgd2lkdGggdG8gMCAqL1xuXG5cdFx0cmV0dXJuIG5ldyBvbC5zdHlsZS5TdHJva2Uoe2NvbG9yLCBsaW5lQ2FwLCBsaW5lSm9pbiwgbWl0ZXJMaW1pdCwgd2lkdGh9KTtcblx0fVxuXG5cdHN0YXRpYyBnZXRPbFByb2JlZFN0eWxlKGJhc2VTdHJva2VTdHlsZSlcblx0e1xuXHRcdGxldCB3aWR0aCA9IGJhc2VTdHJva2VTdHlsZS5nZXRXaWR0aCgpO1xuXG5cdFx0cmV0dXJuIFtcblx0XHRcdFx0bmV3IG9sLnN0eWxlLlN0eWxlKHtcblx0XHRcdFx0XHRzdHJva2U6IG5ldyBvbC5zdHlsZS5TdHJva2Uoe1xuXHRcdFx0XHRcdFx0Y29sb3I6IFswLCAwLCAwLCAxXSxcblx0XHRcdFx0XHRcdHdpZHRoOiB3aWR0aCArIEZlYXR1cmVMYXllci5QUk9CRV9IQUxPX1dJRFRIICsgRmVhdHVyZUxheWVyLlBST0JFX0xJTkVfV0lEVEhcblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHR6SW5kZXg6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIC0gMlxuXHRcdFx0XHR9KSxcblx0XHRcdFx0bmV3IG9sLnN0eWxlLlN0eWxlKHtcblx0XHRcdFx0XHRzdHJva2U6IG5ldyBvbC5zdHlsZS5TdHJva2Uoe1xuXHRcdFx0XHRcdFx0Y29sb3I6IFsyNTUsIDI1NSwgMjU1LCAxXSxcblx0XHRcdFx0XHRcdHdpZHRoOiB3aWR0aCArIEZlYXR1cmVMYXllci5QUk9CRV9IQUxPX1dJRFRIXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0ekluZGV4OiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiAtIDFcblx0XHRcdFx0fSlcblx0XHRdO1xuXHR9XG5cblx0c3RhdGljIGdldE9sU2VsZWN0aW9uU3R5bGUoYmFzZVN0cm9rZVN0eWxlKVxuXHR7XG5cdFx0bGV0IHdpZHRoID0gYmFzZVN0cm9rZVN0eWxlLmdldFdpZHRoKCk7XG5cdFx0bGV0IGxpbmVDYXAgPSBiYXNlU3Ryb2tlU3R5bGUuZ2V0TGluZUNhcCgpO1xuXHRcdGxldCBsaW5lSm9pbiA9IGJhc2VTdHJva2VTdHlsZS5nZXRMaW5lSm9pbigpO1xuXHRcdGxldCBtaXRlckxpbWl0ID0gYmFzZVN0cm9rZVN0eWxlLmdldE1pdGVyTGltaXQoKTtcblxuXHRcdHJldHVybiBbbmV3IG9sLnN0eWxlLlN0eWxlKHtcblx0XHRcdFx0c3Ryb2tlOiBuZXcgb2wuc3R5bGUuU3Ryb2tlKHtcblx0XHRcdFx0XHRjb2xvcjogWzAsIDAsIDAsIDAuNV0sXG5cdFx0XHRcdFx0d2lkdGg6IHdpZHRoICsgRmVhdHVyZUxheWVyLlNFTEVDVF9XSURUSCxcblx0XHRcdFx0XHRsaW5lQ2FwLCBsaW5lSm9pbiwgbWl0ZXJMaW1pdH0pLFxuXHRcdFx0XHR6SW5kZXg6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIC0gNFxuXHRcdH0pXTtcblx0fVxuXG5cdHN0YXRpYyBTRUxFQ1RfV0lEVEg6bnVtYmVyID0gNTtcblx0c3RhdGljIFBST0JFX0hBTE9fV0lEVEg6bnVtYmVyID0gNDtcblx0c3RhdGljIFBST0JFX0xJTkVfV0lEVEg6bnVtYmVyID0gMTtcblx0c3RhdGljIFN0eWxlczpPYmplY3QgPSB7XG5cdFx0Tk9STUFMOiBcIm5vcm1hbFN0eWxlXCIsXG5cdFx0VU5TRUxFQ1RFRDogXCJ1bnNlbGVjdGVkU3R5bGVcIiwgLyogRm9yIHRoZSBjYXNlIHdoZXJlIGEgc2VsZWN0aW9uIGhhcyBiZWVuIG1hZGUgaW4gdGhlIGxheWVyIGJ1dCB0aGUgZWxlbWVudCBpcyBub3Qgb25lIG9mIHRoZW0uICovXG5cdFx0U0VMRUNURUQ6IFwic2VsZWN0ZWRTdHlsZVwiLFxuXHRcdFBST0JFRDogXCJwcm9iZWRTdHlsZVwiXHRcblx0fVxufTtcblxuZXhwb3J0IGludGVyZmFjZSBNZXRhU3R5bGVQcm9wZXJ0aWVzIHtcblx0bm9ybWFsU3R5bGU6IG9sLnN0eWxlLlN0eWxlfEFycmF5PG9sLnN0eWxlLlN0eWxlPjtcblx0dW5zZWxlY3RlZFN0eWxlOiBvbC5zdHlsZS5TdHlsZXxBcnJheTxvbC5zdHlsZS5TdHlsZT47XG5cdHNlbGVjdGVkU3R5bGU6IG9sLnN0eWxlLlN0eWxlfEFycmF5PG9sLnN0eWxlLlN0eWxlPjtcblx0cHJvYmVkU3R5bGU6IG9sLnN0eWxlLlN0eWxlfEFycmF5PG9sLnN0eWxlLlN0eWxlPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEZlYXR1cmVMYXllcjtcbiJdfQ==