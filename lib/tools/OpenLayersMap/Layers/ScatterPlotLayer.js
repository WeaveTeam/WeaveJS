"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _openlayers = require("openlayers");

var ol = _interopRequireWildcard(_openlayers);

var _lodash = require("lodash");

var lodash = _interopRequireWildcard(_lodash);

var _StandardLib = require("../../../utils/StandardLib");

var _StandardLib2 = _interopRequireDefault(_StandardLib);

var _FeatureLayer = require("./FeatureLayer");

var _GlyphLayer2 = require("./GlyphLayer");

var _GlyphLayer3 = _interopRequireDefault(_GlyphLayer2);

var _Layer = require("./Layer");

var _Layer2 = _interopRequireDefault(_Layer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

var ScatterPlotLayer = function (_GlyphLayer) {
    _inherits(ScatterPlotLayer, _GlyphLayer);

    function ScatterPlotLayer(parent, layerName) {
        _classCallCheck(this, ScatterPlotLayer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ScatterPlotLayer).call(this, parent, layerName));

        _this.sizeBy = _this.layerPath.push("sizeBy").addCallback(_this, _this.updateStyleData, true);
        _this.fillStylePath = _this.layerPath.push("fill").addCallback(_this, _this.updateStyleData);
        _this.lineStylePath = _this.layerPath.push("line").addCallback(_this, _this.updateStyleData);
        _this.maxRadiusPath = _this.layerPath.push("maxScreenRadius").addCallback(_this, _this.updateStyleData);
        _this.minRadiusPath = _this.layerPath.push("minScreenRadius").addCallback(_this, _this.updateStyleData);
        _this.defaultRadiusPath = _this.layerPath.push("defaultScreenRadius").addCallback(_this, _this.updateStyleData, true);
        return _this;
    }

    _createClass(ScatterPlotLayer, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "getToolTipColumns",
        value: function getToolTipColumns() {
            var additionalColumns = new Array();
            var internalColumn = undefined;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.fillStylePath.getChildren().concat(this.lineStylePath.getChildren())[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var column = _step.value;

                    internalColumn = weavejs.data.ColumnUtils.hack_findInternalDynamicColumn(column.getObject());
                    if (internalColumn) additionalColumns.push(internalColumn);
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

            internalColumn = weavejs.data.ColumnUtils.hack_findInternalDynamicColumn(this.sizeBy.getObject());
            if (internalColumn) additionalColumns.push(internalColumn);
            return additionalColumns;
        }
    }, {
        key: "updateStyleData",
        value: function updateStyleData() {
            var fillEnabled = this.fillStylePath.push("enable").getState();
            var strokeEnabled = this.lineStylePath.push("enable").getState();
            var styleRecords = this.layerPath.retrieveRecords({
                fill: {
                    color: this.fillStylePath.push("color"),
                    alpha: this.fillStylePath.push("alpha"),
                    imageURL: this.fillStylePath.push("imageURL")
                },
                stroke: {
                    color: this.lineStylePath.push("color"),
                    alpha: this.lineStylePath.push("alpha"),
                    weight: this.lineStylePath.push("weight"),
                    lineCap: this.lineStylePath.push("caps"),
                    lineJoin: this.lineStylePath.push("joints"),
                    miterLimit: this.lineStylePath.push("miterLimit")
                }
            });
            var styleRecordsIndex = lodash.indexBy(styleRecords, "id");
            var sizeByNumeric = this.layerPath.retrieveRecords({ sizeBy: this.sizeBy }, { dataType: "number" });
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = sizeByNumeric[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var record = _step2.value;

                    var id = record.id;
                    var fullRecord = styleRecordsIndex[id];
                    if (fullRecord) {
                        fullRecord.sizeBy = record.sizeBy;
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

            var sizeBy = lodash.pluck(styleRecords, "sizeBy");
            var sizeByMax = lodash.max(sizeBy);
            var sizeByMin = lodash.min(sizeBy);
            var absMax = Math.max(Math.abs(sizeByMax), Math.abs(sizeByMin));
            var minScreenRadius = this.minRadiusPath.getState();
            var maxScreenRadius = this.maxRadiusPath.getState();
            var defaultScreenRadius = this.defaultRadiusPath.getState();
            styleRecords = lodash.sortByOrder(styleRecords, ["sizeBy", "id"], ["desc", "asc"]);
            var zOrder = 0;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = styleRecords[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var record = _step3.value;

                    var screenRadius = undefined;
                    var normSize = _StandardLib2.default.normalize(Math.abs(record.sizeBy), 0, absMax);
                    if (isNaN(normSize) || record.sizeBy === null) {
                        screenRadius = defaultScreenRadius;
                    } else {
                        screenRadius = minScreenRadius + normSize * (maxScreenRadius - minScreenRadius);
                    }
                    var olStroke = _FeatureLayer.FeatureLayer.olStrokeFromWeaveStroke(record.stroke);
                    var olFill = _FeatureLayer.FeatureLayer.olFillFromWeaveFill(record.fill);
                    var olStrokeFaded = _FeatureLayer.FeatureLayer.olStrokeFromWeaveStroke(record.stroke, 0.5);
                    var olFillFaded = _FeatureLayer.FeatureLayer.olFillFromWeaveFill(record.fill, 0.5);
                    var olSelectionStyle = _FeatureLayer.FeatureLayer.getOlSelectionStyle(olStroke);
                    var olProbedStyle = _FeatureLayer.FeatureLayer.getOlProbedStyle(olStroke);
                    var normalStyle = [new ol.style.Style({
                        image: new ol.style.Circle({
                            fill: fillEnabled ? olFill : undefined, stroke: strokeEnabled ? olStroke : undefined,
                            radius: screenRadius
                        })
                    })];
                    var unselectedStyle = [new ol.style.Style({
                        image: new ol.style.Circle({
                            fill: fillEnabled ? olFillFaded : undefined, stroke: strokeEnabled ? olStrokeFaded : undefined,
                            radius: screenRadius
                        })
                    })];
                    var selectedStyle = (strokeEnabled || fillEnabled) && [new ol.style.Style({
                        image: new ol.style.Circle({
                            stroke: olSelectionStyle[0].getStroke(),
                            radius: screenRadius
                        }),
                        zIndex: olSelectionStyle[0].getZIndex()
                    })];
                    var probedStyle = (strokeEnabled || fillEnabled) && [new ol.style.Style({
                        image: new ol.style.Circle({
                            stroke: olProbedStyle[0].getStroke(),
                            radius: screenRadius
                        }),
                        zIndex: olProbedStyle[0].getZIndex()
                    }), new ol.style.Style({
                        image: new ol.style.Circle({
                            stroke: olProbedStyle[1].getStroke(),
                            radius: screenRadius
                        }),
                        zIndex: olProbedStyle[1].getZIndex()
                    })];
                    var feature = this.source.getFeatureById(record.id);
                    if (feature) {
                        var metaStyle = {};
                        metaStyle.normalStyle = normalStyle;
                        metaStyle.unselectedStyle = unselectedStyle;
                        metaStyle.selectedStyle = selectedStyle;
                        metaStyle.probedStyle = probedStyle;
                        feature.setProperties(metaStyle);
                    }
                    zOrder++;
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
    }]);

    return ScatterPlotLayer;
}(_GlyphLayer3.default);

_Layer2.default.registerClass("weave.visualization.plotters::ScatterPlotPlotter", ScatterPlotLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
exports.default = ScatterPlotLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NhdHRlclBsb3RMYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyY3RzL3Rvb2xzL09wZW5MYXllcnNNYXAvTGF5ZXJzL1NjYXR0ZXJQbG90TGF5ZXIudHMiXSwibmFtZXMiOlsiU2NhdHRlclBsb3RMYXllciIsIlNjYXR0ZXJQbG90TGF5ZXIuY29uc3RydWN0b3IiLCJTY2F0dGVyUGxvdExheWVyLmhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzIiwiU2NhdHRlclBsb3RMYXllci5nZXRUb29sVGlwQ29sdW1ucyIsIlNjYXR0ZXJQbG90TGF5ZXIudXBkYXRlU3R5bGVEYXRhIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBSVksQUFBRSxBQUFNLEFBQVksQUFDekI7Ozs7SUFBSyxBQUFNLEFBQU0sQUFBUSxBQUV6QixBQUFXLEFBQU0sQUFBNEIsQUFDN0MsQUFBQyxBQUFZLEFBQXNCLEFBQU0sQUFBZ0IsQUFDekQsQUFBVSxBQUFNLEFBQWMsQUFDOUIsQUFBSyxBQUFNLEFBQVMsQUFLM0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBK0IsQUFBVTs7O0FBU3hDLDhCQUFZLEFBQU0sUUFBRSxBQUFTO2dEQUU1Qjs7d0dBQU0sQUFBTSxRQUFFLEFBQVMsQUFBQyxBQUFDOztBQUV6QixBQUFJLGNBQUMsQUFBTSxTQUFHLEFBQUksTUFBQyxBQUFTLFVBQUMsQUFBSSxLQUFDLEFBQVEsQUFBQyxVQUFDLEFBQVcsQUFBQyxBQUFJLG1CQUFFLEFBQUksTUFBQyxBQUFlLGlCQUFFLEFBQUksQUFBQyxBQUFDO0FBRTFGLEFBQUksY0FBQyxBQUFhLGdCQUFHLEFBQUksTUFBQyxBQUFTLFVBQUMsQUFBSSxLQUFDLEFBQU0sQUFBQyxRQUFDLEFBQVcsQUFBQyxBQUFJLG1CQUFFLEFBQUksTUFBQyxBQUFlLEFBQUMsQUFBQztBQUN6RixBQUFJLGNBQUMsQUFBYSxnQkFBRyxBQUFJLE1BQUMsQUFBUyxVQUFDLEFB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LEFBQVMsWUFBTyxBQUFFLEFBQUM7QUFFdkIsQUFBUyxrQ0FBQyxBQUFXLGNBQUcsQUFBVyxBQUFDO0FBQ3BDLEFBQVMsa0NBQUMsQUFBZSxrQkFBRyxBQUFlLEFBQUM7QUFDNUMsQUFBUyxrQ0FBQyxBQUFhLGdCQUFHLEFBQWEsQUFBQztBQUN4QyxBQUFTLGtDQUFDLEFBQVcsY0FBRyxBQUFXLEFBQUM7QUFFcEMsQUFBTyxnQ0FBQyxBQUFhLGNBQUMsQUFBUyxBQUFDLEFBQUMsQUFDbEMsQUFBQzs7QUFFRCxBQUFNLEFBQUUsQUFBQyxBQUNWLEFBQUMsQUFDRixBQUFDLEFBQ0YsQUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNELEFBQUssZ0JBQUMsQUFBYSxjQUFDLEFBQWtELG9EQUFFLEFBQWdCLGtCQUFFLENBQUMsQUFBTyxRQUFDLEFBQUcsSUFBQyxBQUFJLEtBQUMsQUFBZ0MsQUFBQyxBQUFDLEFBQUMsQUFDL0k7a0JBQWUsQUFBZ0IsQUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uL3R5cGluZ3MvbG9kYXNoL2xvZGFzaC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vLi4vdHlwaW5ncy9vcGVubGF5ZXJzL29wZW5sYXllcnMuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uL3R5cGluZ3Mvd2VhdmUvd2VhdmVqcy5kLnRzXCIvPlxuXG5pbXBvcnQgKiBhcyBvbCBmcm9tIFwib3BlbmxheWVyc1wiO1xuaW1wb3J0ICogYXMgbG9kYXNoIGZyb20gXCJsb2Rhc2hcIjtcblxuaW1wb3J0IFN0YW5kYXJkTGliIGZyb20gXCIuLi8uLi8uLi91dGlscy9TdGFuZGFyZExpYlwiO1xuaW1wb3J0IHtGZWF0dXJlTGF5ZXIsIE1ldGFTdHlsZVByb3BlcnRpZXN9IGZyb20gXCIuL0ZlYXR1cmVMYXllclwiO1xuaW1wb3J0IEdseXBoTGF5ZXIgZnJvbSBcIi4vR2x5cGhMYXllclwiO1xuaW1wb3J0IExheWVyIGZyb20gXCIuL0xheWVyXCI7XG5cbmRlY2xhcmUgdmFyIFdlYXZlOmFueTtcbmRlY2xhcmUgdmFyIHdlYXZlanM6YW55O1xuXG5jbGFzcyBTY2F0dGVyUGxvdExheWVyIGV4dGVuZHMgR2x5cGhMYXllciB7XG5cblx0c2l6ZUJ5OldlYXZlUGF0aDtcblx0ZmlsbFN0eWxlUGF0aDpXZWF2ZVBhdGg7XG5cdGxpbmVTdHlsZVBhdGg6V2VhdmVQYXRoO1xuXHRtYXhSYWRpdXNQYXRoOldlYXZlUGF0aDtcblx0bWluUmFkaXVzUGF0aDpXZWF2ZVBhdGg7XG5cdGRlZmF1bHRSYWRpdXNQYXRoOldlYXZlUGF0aDtcblxuXHRjb25zdHJ1Y3RvcihwYXJlbnQsIGxheWVyTmFtZSlcblx0e1xuXHRcdHN1cGVyKHBhcmVudCwgbGF5ZXJOYW1lKTtcblxuXHRcdHRoaXMuc2l6ZUJ5ID0gdGhpcy5sYXllclBhdGgucHVzaChcInNpemVCeVwiKS5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLnVwZGF0ZVN0eWxlRGF0YSwgdHJ1ZSk7XG5cblx0XHR0aGlzLmZpbGxTdHlsZVBhdGggPSB0aGlzLmxheWVyUGF0aC5wdXNoKFwiZmlsbFwiKS5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLnVwZGF0ZVN0eWxlRGF0YSk7XG5cdFx0dGhpcy5saW5lU3R5bGVQYXRoID0gdGhpcy5sYXllclBhdGgucHVzaChcImxpbmVcIikuYWRkQ2FsbGJhY2sodGhpcywgdGhpcy51cGRhdGVTdHlsZURhdGEpO1xuXHRcdHRoaXMubWF4UmFkaXVzUGF0aCA9IHRoaXMubGF5ZXJQYXRoLnB1c2goXCJtYXhTY3JlZW5SYWRpdXNcIikuYWRkQ2FsbGJhY2sodGhpcywgdGhpcy51cGRhdGVTdHlsZURhdGEpO1xuXHRcdHRoaXMubWluUmFkaXVzUGF0aCA9IHRoaXMubGF5ZXJQYXRoLnB1c2goXCJtaW5TY3JlZW5SYWRpdXNcIikuYWRkQ2FsbGJhY2sodGhpcywgdGhpcy51cGRhdGVTdHlsZURhdGEpO1xuXG5cdFx0dGhpcy5kZWZhdWx0UmFkaXVzUGF0aCA9IHRoaXMubGF5ZXJQYXRoLnB1c2goXCJkZWZhdWx0U2NyZWVuUmFkaXVzXCIpLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMudXBkYXRlU3R5bGVEYXRhLCB0cnVlKTtcblx0fVxuXG5cdGhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzKG5ld1N0YXRlKVxuXHR7XG5cblx0fVxuXG5cdGdldFRvb2xUaXBDb2x1bW5zKCk6IEFycmF5PGFueT4gLyogQXJyYXk8SUF0dHJpYnV0ZUNvbHVtbj4gKi8ge1xuXHRcdGxldCBhZGRpdGlvbmFsQ29sdW1uczogQXJyYXk8YW55PiA9IG5ldyBBcnJheTxhbnk+KCk7XG5cdFx0bGV0IGludGVybmFsQ29sdW1uOiBhbnk7XG5cblx0XHRmb3IgKGxldCBjb2x1bW4gb2YgdGhpcy5maWxsU3R5bGVQYXRoLmdldENoaWxkcmVuKCkuY29uY2F0KHRoaXMubGluZVN0eWxlUGF0aC5nZXRDaGlsZHJlbigpKSkge1xuXHRcdFx0aW50ZXJuYWxDb2x1bW4gPSB3ZWF2ZWpzLmRhdGEuQ29sdW1uVXRpbHMuaGFja19maW5kSW50ZXJuYWxEeW5hbWljQ29sdW1uKGNvbHVtbi5nZXRPYmplY3QoKSk7XG5cdFx0XHRpZiAoaW50ZXJuYWxDb2x1bW4pXG5cdFx0XHRcdGFkZGl0aW9uYWxDb2x1bW5zLnB1c2goaW50ZXJuYWxDb2x1bW4pO1xuXHRcdH1cblxuXHRcdGludGVybmFsQ29sdW1uID0gd2VhdmVqcy5kYXRhLkNvbHVtblV0aWxzLmhhY2tfZmluZEludGVybmFsRHluYW1pY0NvbHVtbih0aGlzLnNpemVCeS5nZXRPYmplY3QoKSk7XG5cdFx0aWYgKGludGVybmFsQ29sdW1uKVxuXHRcdFx0YWRkaXRpb25hbENvbHVtbnMucHVzaChpbnRlcm5hbENvbHVtbik7XG5cblx0XHRyZXR1cm4gYWRkaXRpb25hbENvbHVtbnM7XG5cdH1cblxuXHR1cGRhdGVTdHlsZURhdGEoKVxuXHR7XG5cblx0XHRsZXQgZmlsbEVuYWJsZWQgPSB0aGlzLmZpbGxTdHlsZVBhdGgucHVzaChcImVuYWJsZVwiKS5nZXRTdGF0ZSgpO1xuXHRcdGxldCBzdHJva2VFbmFibGVkID0gdGhpcy5saW5lU3R5bGVQYXRoLnB1c2goXCJlbmFibGVcIikuZ2V0U3RhdGUoKTtcblxuXHRcdHZhciBzdHlsZVJlY29yZHM6YW55ID0gdGhpcy5sYXllclBhdGgucmV0cmlldmVSZWNvcmRzKHtcblx0XHRcdGZpbGw6IHtcblx0XHRcdFx0Y29sb3I6IHRoaXMuZmlsbFN0eWxlUGF0aC5wdXNoKFwiY29sb3JcIiksXG5cdFx0XHRcdGFscGhhOiB0aGlzLmZpbGxTdHlsZVBhdGgucHVzaChcImFscGhhXCIpLFxuXHRcdFx0XHRpbWFnZVVSTDogdGhpcy5maWxsU3R5bGVQYXRoLnB1c2goXCJpbWFnZVVSTFwiKVxuXHRcdFx0fSxcblx0XHRcdHN0cm9rZToge1xuXHRcdFx0XHRjb2xvcjogdGhpcy5saW5lU3R5bGVQYXRoLnB1c2goXCJjb2xvclwiKSxcblx0XHRcdFx0YWxwaGE6IHRoaXMubGluZVN0eWxlUGF0aC5wdXNoKFwiYWxwaGFcIiksXG5cdFx0XHRcdHdlaWdodDogdGhpcy5saW5lU3R5bGVQYXRoLnB1c2goXCJ3ZWlnaHRcIiksXG5cdFx0XHRcdGxpbmVDYXA6IHRoaXMubGluZVN0eWxlUGF0aC5wdXNoKFwiY2Fwc1wiKSxcblx0XHRcdFx0bGluZUpvaW46IHRoaXMubGluZVN0eWxlUGF0aC5wdXNoKFwiam9pbnRzXCIpLFxuXHRcdFx0XHRtaXRlckxpbWl0OiB0aGlzLmxpbmVTdHlsZVBhdGgucHVzaChcIm1pdGVyTGltaXRcIilcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHZhciBzdHlsZVJlY29yZHNJbmRleCA9IGxvZGFzaC5pbmRleEJ5KHN0eWxlUmVjb3JkcywgXCJpZFwiKTtcblxuXHRcdHZhciBzaXplQnlOdW1lcmljID0gdGhpcy5sYXllclBhdGgucmV0cmlldmVSZWNvcmRzKHtzaXplQnk6IHRoaXMuc2l6ZUJ5fSwge2RhdGFUeXBlOiBcIm51bWJlclwifSk7XG5cblx0XHRmb3IgKGxldCByZWNvcmQgb2Ygc2l6ZUJ5TnVtZXJpYylcblx0XHR7XG5cdFx0XHRsZXQgaWQgPSByZWNvcmQuaWQ7XG5cdFx0XHRsZXQgZnVsbFJlY29yZDphbnkgPSBzdHlsZVJlY29yZHNJbmRleFtpZF07XG5cdFx0XHRpZiAoZnVsbFJlY29yZClcblx0XHRcdHtcblx0XHRcdFx0ZnVsbFJlY29yZC5zaXplQnkgPSByZWNvcmQuc2l6ZUJ5O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxldCBzaXplQnkgPSBsb2Rhc2gucGx1Y2soc3R5bGVSZWNvcmRzLCBcInNpemVCeVwiKTtcblx0XHRsZXQgc2l6ZUJ5TWF4ID0gbG9kYXNoLm1heChzaXplQnkpO1xuXHRcdGxldCBzaXplQnlNaW4gPSBsb2Rhc2gubWluKHNpemVCeSk7XG5cdFx0bGV0IGFic01heCA9IE1hdGgubWF4KE1hdGguYWJzKHNpemVCeU1heCksIE1hdGguYWJzKHNpemVCeU1pbikpO1xuXHRcdGxldCBtaW5TY3JlZW5SYWRpdXMgPSB0aGlzLm1pblJhZGl1c1BhdGguZ2V0U3RhdGUoKTtcblx0XHRsZXQgbWF4U2NyZWVuUmFkaXVzID0gdGhpcy5tYXhSYWRpdXNQYXRoLmdldFN0YXRlKCk7XG5cdFx0bGV0IGRlZmF1bHRTY3JlZW5SYWRpdXMgPSB0aGlzLmRlZmF1bHRSYWRpdXNQYXRoLmdldFN0YXRlKCk7XG5cblx0XHRzdHlsZVJlY29yZHMgPSBsb2Rhc2guc29ydEJ5T3JkZXIoc3R5bGVSZWNvcmRzLCBbXCJzaXplQnlcIiwgXCJpZFwiXSwgW1wiZGVzY1wiLCBcImFzY1wiXSk7XG5cblx0XHRsZXQgek9yZGVyID0gMDtcblxuXHRcdGZvciAobGV0IHJlY29yZCBvZiBzdHlsZVJlY29yZHMpXG5cdFx0e1xuXHRcdFx0bGV0IHNjcmVlblJhZGl1cztcblxuXHRcdFx0bGV0IG5vcm1TaXplID0gU3RhbmRhcmRMaWIubm9ybWFsaXplKE1hdGguYWJzKHJlY29yZC5zaXplQnkpLCAwLCBhYnNNYXgpO1xuXG5cdFx0XHRpZiAoaXNOYU4obm9ybVNpemUpIHx8IHJlY29yZC5zaXplQnkgPT09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHNjcmVlblJhZGl1cyA9IGRlZmF1bHRTY3JlZW5SYWRpdXM7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHNjcmVlblJhZGl1cyA9IG1pblNjcmVlblJhZGl1cyArIChub3JtU2l6ZSAqIChtYXhTY3JlZW5SYWRpdXMgLSBtaW5TY3JlZW5SYWRpdXMpKTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IG9sU3Ryb2tlID0gRmVhdHVyZUxheWVyLm9sU3Ryb2tlRnJvbVdlYXZlU3Ryb2tlKHJlY29yZC5zdHJva2UpO1xuXHRcdFx0bGV0IG9sRmlsbCA9IEZlYXR1cmVMYXllci5vbEZpbGxGcm9tV2VhdmVGaWxsKHJlY29yZC5maWxsKTtcblxuXHRcdFx0bGV0IG9sU3Ryb2tlRmFkZWQgPSBGZWF0dXJlTGF5ZXIub2xTdHJva2VGcm9tV2VhdmVTdHJva2UocmVjb3JkLnN0cm9rZSwgMC41KTtcblx0XHRcdGxldCBvbEZpbGxGYWRlZCA9IEZlYXR1cmVMYXllci5vbEZpbGxGcm9tV2VhdmVGaWxsKHJlY29yZC5maWxsLCAwLjUpO1xuXG5cdFx0XHRsZXQgb2xTZWxlY3Rpb25TdHlsZSA9IEZlYXR1cmVMYXllci5nZXRPbFNlbGVjdGlvblN0eWxlKG9sU3Ryb2tlKTtcblx0XHRcdGxldCBvbFByb2JlZFN0eWxlID0gRmVhdHVyZUxheWVyLmdldE9sUHJvYmVkU3R5bGUob2xTdHJva2UpO1xuXG5cdFx0XHRsZXQgbm9ybWFsU3R5bGUgPSBbbmV3IG9sLnN0eWxlLlN0eWxlKHtcblx0XHRcdFx0aW1hZ2U6IG5ldyBvbC5zdHlsZS5DaXJjbGUoe1xuXHRcdFx0XHRcdGZpbGw6IGZpbGxFbmFibGVkID8gb2xGaWxsIDogdW5kZWZpbmVkLCBzdHJva2U6IHN0cm9rZUVuYWJsZWQgPyBvbFN0cm9rZSA6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRyYWRpdXM6IHNjcmVlblJhZGl1c1xuXHRcdFx0XHR9KVxuXHRcdFx0fSldO1xuXG5cdFx0XHRsZXQgdW5zZWxlY3RlZFN0eWxlID0gW25ldyBvbC5zdHlsZS5TdHlsZSh7XG5cdFx0XHRcdGltYWdlOiBuZXcgb2wuc3R5bGUuQ2lyY2xlKHtcblx0XHRcdFx0XHRmaWxsOiBmaWxsRW5hYmxlZCA/IG9sRmlsbEZhZGVkIDogdW5kZWZpbmVkLCBzdHJva2U6IHN0cm9rZUVuYWJsZWQgPyBvbFN0cm9rZUZhZGVkIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdHJhZGl1czogc2NyZWVuUmFkaXVzXG5cdFx0XHRcdH0pXG5cdFx0XHR9KV07XG5cblx0XHRcdGxldCBzZWxlY3RlZFN0eWxlID0gKHN0cm9rZUVuYWJsZWQgfHwgZmlsbEVuYWJsZWQpICYmIFtcblx0XHRcdFx0bmV3IG9sLnN0eWxlLlN0eWxlKHtcblx0XHRcdFx0XHRpbWFnZTogbmV3IG9sLnN0eWxlLkNpcmNsZSh7XG5cdFx0XHRcdFx0XHRzdHJva2U6IG9sU2VsZWN0aW9uU3R5bGVbMF0uZ2V0U3Ryb2tlKCksXG5cdFx0XHRcdFx0XHRyYWRpdXM6IHNjcmVlblJhZGl1c1xuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdHpJbmRleDogb2xTZWxlY3Rpb25TdHlsZVswXS5nZXRaSW5kZXgoKVxuXHRcdFx0XHR9KVxuXHRcdFx0XTtcblxuXHRcdFx0bGV0IHByb2JlZFN0eWxlID0gKHN0cm9rZUVuYWJsZWQgfHwgZmlsbEVuYWJsZWQpICYmIFtcblx0XHRcdFx0bmV3IG9sLnN0eWxlLlN0eWxlKHtcblx0XHRcdFx0XHRpbWFnZTogbmV3IG9sLnN0eWxlLkNpcmNsZSh7XG5cdFx0XHRcdFx0XHRzdHJva2U6IG9sUHJvYmVkU3R5bGVbMF0uZ2V0U3Ryb2tlKCksXG5cdFx0XHRcdFx0XHRyYWRpdXM6IHNjcmVlblJhZGl1c1xuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdHpJbmRleDogb2xQcm9iZWRTdHlsZVswXS5nZXRaSW5kZXgoKVxuXHRcdFx0XHR9KSxcblx0XHRcdFx0bmV3IG9sLnN0eWxlLlN0eWxlKHtcblx0XHRcdFx0XHRpbWFnZTogbmV3IG9sLnN0eWxlLkNpcmNsZSh7XG5cdFx0XHRcdFx0XHRzdHJva2U6IG9sUHJvYmVkU3R5bGVbMV0uZ2V0U3Ryb2tlKCksXG5cdFx0XHRcdFx0XHRyYWRpdXM6IHNjcmVlblJhZGl1c1xuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdHpJbmRleDogb2xQcm9iZWRTdHlsZVsxXS5nZXRaSW5kZXgoKVxuXHRcdFx0XHR9KVxuXHRcdFx0XTtcblxuXHRcdFx0bGV0IGZlYXR1cmUgPSB0aGlzLnNvdXJjZS5nZXRGZWF0dXJlQnlJZChyZWNvcmQuaWQpO1xuXG5cdFx0XHRpZiAoZmVhdHVyZSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IG1ldGFTdHlsZTphbnkgPSB7fTtcblxuXHRcdFx0XHRtZXRhU3R5bGUubm9ybWFsU3R5bGUgPSBub3JtYWxTdHlsZTtcblx0XHRcdFx0bWV0YVN0eWxlLnVuc2VsZWN0ZWRTdHlsZSA9IHVuc2VsZWN0ZWRTdHlsZTtcblx0XHRcdFx0bWV0YVN0eWxlLnNlbGVjdGVkU3R5bGUgPSBzZWxlY3RlZFN0eWxlO1xuXHRcdFx0XHRtZXRhU3R5bGUucHJvYmVkU3R5bGUgPSBwcm9iZWRTdHlsZTtcblx0XHRcdFx0XG5cdFx0XHRcdGZlYXR1cmUuc2V0UHJvcGVydGllcyhtZXRhU3R5bGUpO1xuXHRcdFx0fVxuXG5cdFx0XHR6T3JkZXIrKztcblx0XHR9XG5cdH1cbn1cbkxheWVyLnJlZ2lzdGVyQ2xhc3MoXCJ3ZWF2ZS52aXN1YWxpemF0aW9uLnBsb3R0ZXJzOjpTY2F0dGVyUGxvdFBsb3R0ZXJcIiwgU2NhdHRlclBsb3RMYXllciwgW3dlYXZlanMuYXBpLmNvcmUuSUxpbmthYmxlT2JqZWN0V2l0aE5ld1Byb3BlcnRpZXNdKTtcbmV4cG9ydCBkZWZhdWx0IFNjYXR0ZXJQbG90TGF5ZXI7XG4iXX0=
