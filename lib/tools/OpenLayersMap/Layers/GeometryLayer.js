"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _openlayers = require("openlayers");

var ol = _interopRequireWildcard(_openlayers);

var _FeatureLayer2 = require("./FeatureLayer");

var _Layer = require("./Layer");

var _Layer2 = _interopRequireDefault(_Layer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

var GeometryLayer = function (_FeatureLayer) {
    _inherits(GeometryLayer, _FeatureLayer);

    function GeometryLayer(parent, layerName) {
        _classCallCheck(this, GeometryLayer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GeometryLayer).call(this, parent, layerName));

        _this.geoJsonParser = new ol.format.GeoJSON();
        _this.geoColumnPath = _this.layerPath.push("geometryColumn");
        _this.fillStylePath = _this.layerPath.push("fill");
        _this.lineStylePath = _this.layerPath.push("line");
        _this.geoColumnPath.addCallback(_this, _this.updateGeometryData);
        _this.projectionPath.addCallback(_this, _this.updateGeometryData);
        Weave.getCallbacks(_this.filteredKeySet).removeCallback(_this, _this.updateMetaStyles);
        _this.fillStylePath.addCallback(_this, _this.updateStyleData);
        _this.lineStylePath.addCallback(_this, _this.updateStyleData);
        _this.filteredKeySet.setColumnKeySources([_this.geoColumnPath.getObject("internalDynamicColumn")]);
        Weave.getCallbacks(_this.filteredKeySet).addGroupedCallback(_this, _this.updateGeometryData, true);
        return _this;
    }

    _createClass(GeometryLayer, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "updateGeometryData",
        value: function updateGeometryData() {
            this.source.clear();
            var idc = this.geoColumnPath.getObject("internalDynamicColumn");
            var keys = this.filteredKeySet.keys;
            var rawGeometries = weavejs.data.ColumnUtils.getGeoJsonGeometries(idc, keys);
            for (var idx = 0; idx < keys.length; idx++) {
                var rawGeom = rawGeometries[idx];
                if (!rawGeom) continue;
                var id = keys[idx];
                var geometry = this.geoJsonParser.readGeometry(rawGeom, { dataProjection: this.inputProjection, featureProjection: this.outputProjection });
                var feature = new ol.Feature({ geometry: geometry });
                feature.setId(id);
                this.source.addFeature(feature);
            }
            this.updateStyleData();
            this.updateMetaStyles();
        }
    }, {
        key: "getToolTipColumns",
        value: function getToolTipColumns() {
            var additionalColumns = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.fillStylePath.getChildren().concat(this.lineStylePath.getChildren())[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var column = _step.value;

                    var internalColumn = weavejs.data.ColumnUtils.hack_findInternalDynamicColumn(column.getObject());
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

            return additionalColumns;
        }
    }, {
        key: "updateStyleData",
        value: function updateStyleData() {
            var fillEnabled = this.fillStylePath.getObject("enable").state;
            var strokeEnabled = this.lineStylePath.getObject("enable").state;
            var fillStyle = this.fillStylePath.getObject();
            var strokeStyle = this.lineStylePath.getObject();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.filteredKeySet.keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var key = _step2.value;

                    var record = {};
                    record.id = key;
                    record.fill = fillStyle.getStyle(key);
                    record.stroke = strokeStyle.getStyle(key);
                    var olStroke = _FeatureLayer2.FeatureLayer.olStrokeFromWeaveStroke(record.stroke);
                    var olFill = _FeatureLayer2.FeatureLayer.olFillFromWeaveFill(record.fill);
                    var olStrokeFaded = _FeatureLayer2.FeatureLayer.olStrokeFromWeaveStroke(record.stroke, 0.5);
                    var olFillFaded = _FeatureLayer2.FeatureLayer.olFillFromWeaveFill(record.fill, 0.5);
                    var normalStyle = [new ol.style.Style({
                        fill: fillEnabled ? olFill : undefined,
                        stroke: strokeEnabled ? olStroke : undefined,
                        zIndex: 0
                    })];
                    var unselectedStyle = [new ol.style.Style({
                        fill: fillEnabled ? olFill : undefined,
                        stroke: strokeEnabled ? olStrokeFaded : undefined,
                        zIndex: 0
                    })];
                    var selectedStyle = (strokeEnabled || fillEnabled) && _FeatureLayer2.FeatureLayer.getOlSelectionStyle(olStroke);
                    var probedStyle = (strokeEnabled || fillEnabled) && _FeatureLayer2.FeatureLayer.getOlProbedStyle(olStroke);
                    var feature = this.source.getFeatureById(record.id);
                    if (feature) {
                        var metaStyle = {};
                        metaStyle.normalStyle = normalStyle;
                        metaStyle.unselectedStyle = unselectedStyle;
                        metaStyle.selectedStyle = selectedStyle;
                        metaStyle.probedStyle = probedStyle;
                        feature.setProperties(metaStyle);
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
        }
    }, {
        key: "inputProjection",
        get: function get() {
            var projectionSpec = this.geoColumnPath.getObject("internalDynamicColumn").getMetadata('projection');
            return projectionSpec || this.outputProjection;
        }
    }]);

    return GeometryLayer;
}(_FeatureLayer2.FeatureLayer);

_Layer2.default.registerClass("weave.visualization.plotters::GeometryPlotter", GeometryLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
exports.default = GeometryLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VvbWV0cnlMYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyY3RzL3Rvb2xzL09wZW5MYXllcnNNYXAvTGF5ZXJzL0dlb21ldHJ5TGF5ZXIudHMiXSwibmFtZXMiOlsiR2VvbWV0cnlMYXllciIsIkdlb21ldHJ5TGF5ZXIuY29uc3RydWN0b3IiLCJHZW9tZXRyeUxheWVyLmhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzIiwiR2VvbWV0cnlMYXllci5pbnB1dFByb2plY3Rpb24iLCJHZW9tZXRyeUxheWVyLnVwZGF0ZUdlb21ldHJ5RGF0YSIsIkdlb21ldHJ5TGF5ZXIuZ2V0VG9vbFRpcENvbHVtbnMiLCJHZW9tZXRyeUxheWVyLnVwZGF0ZVN0eWxlRGF0YSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUlZLEFBQUUsQUFBTSxBQUFZLEFBQ3pCLEFBQUMsQUFBWSxBQUFzQixBQUFNLEFBQWdCLEFBQ3pELEFBQUssQUFBTSxBQUFTLEFBTTNCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUE0QixBQUFZOzs7QUFTdkMsMkJBQVksQUFBTSxRQUFFLEFBQVM7NkNBRTVCOztxR0FBTSxBQUFNLFFBQUUsQUFBUyxBQUFDLEFBQUM7O0FBRXpCLEFBQUksY0FBQyxBQUFhLGdCQUFHLElBQUksQUFBRSxHQUFDLEFBQU0sT0FBQyxBQUFPLEFBQUUsQUFBQztBQUU3QyxBQUFJLGNBQUMsQUFBYSxnQkFBRyxBQUFJLE1BQUMsQUFBUyxVQUFDLEFBQUksS0FBQyxBQUFnQixBQUFDLEFBQUM7QUFDM0QsQUFBSSxjQUFDLEFBQWEsZ0JBQUcsQUFBSSxNQUFDLEFBQVMsVUFBQyxBQUFJLEtBQUMsQUFBTSxBQUFDLEFBQUM7QUFFakQsQUFBSSxjQUFDLEFBQWEsZ0JBQUcsQUFBSSxNQUFDLEFBQVMsVUFBQyxBQUFJLEtBQUMsQUFBTSxBQUFDLEFBQUM7QUFFakQsQUFBSSxjQUFDLEFBQWEsY0FBQyxBQUFXLEFBQUMsQUFBSSxtQkFB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QUFlLEFBQUM7QUFDNUMsQUFBUyxrQ0FBQyxBQUFhLGdCQUFHLEFBQWEsQUFBQztBQUN4QyxBQUFTLGtDQUFDLEFBQVcsY0FBRyxBQUFXLEFBQUM7QUFFcEMsQUFBTyxnQ0FBQyxBQUFhLGNBQUMsQUFBUyxBQUFDLEFBQUMsQUFDbEMsQUFBQyxBQUNGLEFBQUMsQUFDRixBQUFDLEFBQ0YsQUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbEdDLGdCQUFJLEFBQWMsaUJBQUcsQUFBSSxLQUFDLEFBQWEsY0FBQyxBQUFTLFVBQUMsQUFBdUIsQUFBQyx5QkFBQyxBQUFXLFlBQUMsQUFBWSxBQUFDLEFBQUM7QUFDckcsQUFBTSxtQkFBQyxBQUFjLGtCQUFJLEFBQUksS0FBQyxBQUFnQixBQUFDLEFBQ2hELEFBQUMsQUFFRCxBQUFrQjs7Ozs7OztBQWdHbkIsQUFBSyxnQkFBQyxBQUFhLGNBQUMsQUFBK0MsaURBQUUsQUFBYSxlQUFFLENBQUMsQUFBTyxRQUFDLEFBQUcsSUFBQyxBQUFJLEtBQUMsQUFBZ0MsQUFBQyxBQUFDLEFBQUMsQUFDekk7a0JBQWUsQUFBYSxBQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vLi4vdHlwaW5ncy9sb2Rhc2gvbG9kYXNoLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi8uLi90eXBpbmdzL29wZW5sYXllcnMvb3BlbmxheWVycy5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vLi4vdHlwaW5ncy93ZWF2ZS93ZWF2ZWpzLmQudHNcIi8+XG5cbmltcG9ydCAqIGFzIG9sIGZyb20gXCJvcGVubGF5ZXJzXCI7XG5pbXBvcnQge0ZlYXR1cmVMYXllciwgTWV0YVN0eWxlUHJvcGVydGllc30gZnJvbSBcIi4vRmVhdHVyZUxheWVyXCI7XG5pbXBvcnQgTGF5ZXIgZnJvbSBcIi4vTGF5ZXJcIjtcblxuaW1wb3J0IElRdWFsaWZpZWRLZXkgPSB3ZWF2ZWpzLmFwaS5kYXRhLklRdWFsaWZpZWRLZXk7XG5pbXBvcnQgSUxpbmthYmxlSGFzaE1hcCA9IHdlYXZlanMuYXBpLmNvcmUuSUxpbmthYmxlSGFzaE1hcDtcbmltcG9ydCBJQXR0cmlidXRlQ29sdW1uID0gd2VhdmVqcy5hcGkuZGF0YS5JQXR0cmlidXRlQ29sdW1uO1xuXG5jbGFzcyBHZW9tZXRyeUxheWVyIGV4dGVuZHMgRmVhdHVyZUxheWVyIHtcblxuXHRnZW9Kc29uUGFyc2VyOmFueTsgLy9UT0RPIG9sLmZvcm1hdC5HZW9KU09OXG5cdGdlb0NvbHVtblBhdGg6IFdlYXZlUGF0aDtcblxuXHRmaWxsU3R5bGVQYXRoOiBXZWF2ZVBhdGg7XG5cblx0bGluZVN0eWxlUGF0aDogV2VhdmVQYXRoO1xuXG5cdGNvbnN0cnVjdG9yKHBhcmVudCwgbGF5ZXJOYW1lKVxuXHR7XG5cdFx0c3VwZXIocGFyZW50LCBsYXllck5hbWUpO1xuXG5cdFx0dGhpcy5nZW9Kc29uUGFyc2VyID0gbmV3IG9sLmZvcm1hdC5HZW9KU09OKCk7XG5cblx0XHR0aGlzLmdlb0NvbHVtblBhdGggPSB0aGlzLmxheWVyUGF0aC5wdXNoKFwiZ2VvbWV0cnlDb2x1bW5cIik7XG5cdFx0dGhpcy5maWxsU3R5bGVQYXRoID0gdGhpcy5sYXllclBhdGgucHVzaChcImZpbGxcIik7XG5cblx0XHR0aGlzLmxpbmVTdHlsZVBhdGggPSB0aGlzLmxheWVyUGF0aC5wdXNoKFwibGluZVwiKTtcblxuXHRcdHRoaXMuZ2VvQ29sdW1uUGF0aC5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLnVwZGF0ZUdlb21ldHJ5RGF0YSk7XG5cdFx0dGhpcy5wcm9qZWN0aW9uUGF0aC5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLnVwZGF0ZUdlb21ldHJ5RGF0YSk7XG5cdFx0V2VhdmUuZ2V0Q2FsbGJhY2tzKHRoaXMuZmlsdGVyZWRLZXlTZXQpLnJlbW92ZUNhbGxiYWNrKHRoaXMsIHRoaXMudXBkYXRlTWV0YVN0eWxlcyk7XG5cblx0XHR0aGlzLmZpbGxTdHlsZVBhdGguYWRkQ2FsbGJhY2sodGhpcywgdGhpcy51cGRhdGVTdHlsZURhdGEpO1xuXHRcdHRoaXMubGluZVN0eWxlUGF0aC5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLnVwZGF0ZVN0eWxlRGF0YSk7XG5cdFx0dGhpcy5maWx0ZXJlZEtleVNldC5zZXRDb2x1bW5LZXlTb3VyY2VzKFt0aGlzLmdlb0NvbHVtblBhdGguZ2V0T2JqZWN0KFwiaW50ZXJuYWxEeW5hbWljQ29sdW1uXCIpXSk7XG5cblx0XHRXZWF2ZS5nZXRDYWxsYmFja3ModGhpcy5maWx0ZXJlZEtleVNldCkuYWRkR3JvdXBlZENhbGxiYWNrKHRoaXMsIHRoaXMudXBkYXRlR2VvbWV0cnlEYXRhLCB0cnVlKTtcblx0fVxuXG5cdGhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzKG5ld1N0YXRlKVxuXHR7XG5cblx0fVxuICAgIFxuXHRnZXQgaW5wdXRQcm9qZWN0aW9uKClcblx0e1xuXHRcdHZhciBwcm9qZWN0aW9uU3BlYyA9IHRoaXMuZ2VvQ29sdW1uUGF0aC5nZXRPYmplY3QoXCJpbnRlcm5hbER5bmFtaWNDb2x1bW5cIikuZ2V0TWV0YWRhdGEoJ3Byb2plY3Rpb24nKTtcblx0XHRyZXR1cm4gcHJvamVjdGlvblNwZWMgfHwgdGhpcy5vdXRwdXRQcm9qZWN0aW9uO1xuXHR9XG5cdFxuXHR1cGRhdGVHZW9tZXRyeURhdGEoKVxuXHR7XG5cdFx0dGhpcy5zb3VyY2UuY2xlYXIoKTtcblxuXHRcdHZhciBpZGMgPSB0aGlzLmdlb0NvbHVtblBhdGguZ2V0T2JqZWN0KFwiaW50ZXJuYWxEeW5hbWljQ29sdW1uXCIpO1xuXHRcdHZhciBrZXlzOkFycmF5PElRdWFsaWZpZWRLZXk+ID0gdGhpcy5maWx0ZXJlZEtleVNldC5rZXlzO1xuXHRcdHZhciByYXdHZW9tZXRyaWVzID0gd2VhdmVqcy5kYXRhLkNvbHVtblV0aWxzLmdldEdlb0pzb25HZW9tZXRyaWVzKGlkYywga2V5cyk7XG5cblx0XHRmb3IgKGxldCBpZHggPSAwOyBpZHggPCBrZXlzLmxlbmd0aDsgaWR4KyspXG5cdFx0e1xuICAgICAgICAgICAgbGV0IHJhd0dlb20gPSByYXdHZW9tZXRyaWVzW2lkeF07XG4gICAgICAgICAgICBpZiAoIXJhd0dlb20pXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBcblx0XHRcdGxldCBpZCA9IGtleXNbaWR4XTtcblxuXHRcdFx0bGV0IGdlb21ldHJ5ID0gdGhpcy5nZW9Kc29uUGFyc2VyLnJlYWRHZW9tZXRyeShyYXdHZW9tLCB7ZGF0YVByb2plY3Rpb246IHRoaXMuaW5wdXRQcm9qZWN0aW9uLCBmZWF0dXJlUHJvamVjdGlvbjogdGhpcy5vdXRwdXRQcm9qZWN0aW9ufSk7XG5cblx0XHRcdGxldCBmZWF0dXJlID0gbmV3IG9sLkZlYXR1cmUoe2dlb21ldHJ5fSk7XG5cdFx0XHRmZWF0dXJlLnNldElkKGlkKTtcblxuXHRcdFx0dGhpcy5zb3VyY2UuYWRkRmVhdHVyZShmZWF0dXJlKTtcblx0XHR9XG5cblx0XHR0aGlzLnVwZGF0ZVN0eWxlRGF0YSgpO1xuXHRcdHRoaXMudXBkYXRlTWV0YVN0eWxlcygpO1xuXHR9XG5cblx0Z2V0VG9vbFRpcENvbHVtbnMoKTpJQXR0cmlidXRlQ29sdW1uW11cblx0e1xuXHRcdGxldCBhZGRpdGlvbmFsQ29sdW1uczpJQXR0cmlidXRlQ29sdW1uW10gPSBbXTtcblxuXHRcdGZvciAobGV0IGNvbHVtbiBvZiB0aGlzLmZpbGxTdHlsZVBhdGguZ2V0Q2hpbGRyZW4oKS5jb25jYXQodGhpcy5saW5lU3R5bGVQYXRoLmdldENoaWxkcmVuKCkpKVxuXHRcdHtcblx0XHRcdGxldCBpbnRlcm5hbENvbHVtbiA9IHdlYXZlanMuZGF0YS5Db2x1bW5VdGlscy5oYWNrX2ZpbmRJbnRlcm5hbER5bmFtaWNDb2x1bW4oY29sdW1uLmdldE9iamVjdCgpKTtcblx0XHRcdGlmIChpbnRlcm5hbENvbHVtbilcblx0XHRcdFx0YWRkaXRpb25hbENvbHVtbnMucHVzaChpbnRlcm5hbENvbHVtbik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFkZGl0aW9uYWxDb2x1bW5zO1xuXHR9XG5cblx0dXBkYXRlU3R5bGVEYXRhKClcblx0e1xuXHRcdGxldCBmaWxsRW5hYmxlZDogYm9vbGVhbiA9IHRoaXMuZmlsbFN0eWxlUGF0aC5nZXRPYmplY3QoXCJlbmFibGVcIikuc3RhdGU7XG5cdFx0bGV0IHN0cm9rZUVuYWJsZWQ6IGJvb2xlYW4gPSB0aGlzLmxpbmVTdHlsZVBhdGguZ2V0T2JqZWN0KFwiZW5hYmxlXCIpLnN0YXRlO1xuXHRcdGxldCBmaWxsU3R5bGUgPSB0aGlzLmZpbGxTdHlsZVBhdGguZ2V0T2JqZWN0KCk7XG5cdFx0bGV0IHN0cm9rZVN0eWxlID0gdGhpcy5saW5lU3R5bGVQYXRoLmdldE9iamVjdCgpO1xuXG5cdFx0Zm9yIChsZXQga2V5IG9mIHRoaXMuZmlsdGVyZWRLZXlTZXQua2V5cylcblx0XHR7XG5cdFx0XHRsZXQgcmVjb3JkOiBhbnkgPSB7fTtcblxuXHRcdFx0cmVjb3JkLmlkID0ga2V5O1xuXHRcdFx0cmVjb3JkLmZpbGwgPSBmaWxsU3R5bGUuZ2V0U3R5bGUoa2V5KTtcblx0XHRcdHJlY29yZC5zdHJva2UgPSBzdHJva2VTdHlsZS5nZXRTdHlsZShrZXkpO1xuXG5cdFx0XHRsZXQgb2xTdHJva2UgPSBGZWF0dXJlTGF5ZXIub2xTdHJva2VGcm9tV2VhdmVTdHJva2UocmVjb3JkLnN0cm9rZSk7XG5cblx0XHRcdGxldCBvbEZpbGwgPSBGZWF0dXJlTGF5ZXIub2xGaWxsRnJvbVdlYXZlRmlsbChyZWNvcmQuZmlsbCk7XG5cblx0XHRcdGxldCBvbFN0cm9rZUZhZGVkID0gRmVhdHVyZUxheWVyLm9sU3Ryb2tlRnJvbVdlYXZlU3Ryb2tlKHJlY29yZC5zdHJva2UsIDAuNSk7XG5cdFx0XHRsZXQgb2xGaWxsRmFkZWQgPSBGZWF0dXJlTGF5ZXIub2xGaWxsRnJvbVdlYXZlRmlsbChyZWNvcmQuZmlsbCwgMC41KTtcblxuXHRcdFx0bGV0IG5vcm1hbFN0eWxlID0gW25ldyBvbC5zdHlsZS5TdHlsZSh7XG5cdFx0XHRcdGZpbGw6IGZpbGxFbmFibGVkID8gb2xGaWxsIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRzdHJva2U6IHN0cm9rZUVuYWJsZWQgPyBvbFN0cm9rZSA6IHVuZGVmaW5lZCxcblx0XHRcdFx0ekluZGV4OiAwXG5cdFx0XHR9KV07XG5cblx0XHRcdGxldCB1bnNlbGVjdGVkU3R5bGUgPSBbbmV3IG9sLnN0eWxlLlN0eWxlKHtcblx0XHRcdFx0ZmlsbDogZmlsbEVuYWJsZWQgPyBvbEZpbGwgOiB1bmRlZmluZWQsXG5cdFx0XHRcdHN0cm9rZTogc3Ryb2tlRW5hYmxlZCA/IG9sU3Ryb2tlRmFkZWQgOiB1bmRlZmluZWQsXG5cdFx0XHRcdHpJbmRleDogMFxuXHRcdFx0fSldO1xuXG5cdFx0XHRsZXQgc2VsZWN0ZWRTdHlsZSA9IChzdHJva2VFbmFibGVkIHx8IGZpbGxFbmFibGVkKSAmJiBGZWF0dXJlTGF5ZXIuZ2V0T2xTZWxlY3Rpb25TdHlsZShvbFN0cm9rZSk7XG5cdFx0XHRsZXQgcHJvYmVkU3R5bGUgPSAoc3Ryb2tlRW5hYmxlZCB8fCBmaWxsRW5hYmxlZCkgJiYgRmVhdHVyZUxheWVyLmdldE9sUHJvYmVkU3R5bGUob2xTdHJva2UpO1xuXG5cdFx0XHRsZXQgZmVhdHVyZSA9IHRoaXMuc291cmNlLmdldEZlYXR1cmVCeUlkKHJlY29yZC5pZCk7XG5cblx0XHRcdGlmIChmZWF0dXJlKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbWV0YVN0eWxlOmFueSA9IHt9O1xuXHRcdFx0XHRcblx0XHRcdFx0bWV0YVN0eWxlLm5vcm1hbFN0eWxlID0gbm9ybWFsU3R5bGU7XG5cdFx0XHRcdG1ldGFTdHlsZS51bnNlbGVjdGVkU3R5bGUgPSB1bnNlbGVjdGVkU3R5bGU7XG5cdFx0XHRcdG1ldGFTdHlsZS5zZWxlY3RlZFN0eWxlID0gc2VsZWN0ZWRTdHlsZTtcblx0XHRcdFx0bWV0YVN0eWxlLnByb2JlZFN0eWxlID0gcHJvYmVkU3R5bGU7XG5cblx0XHRcdFx0ZmVhdHVyZS5zZXRQcm9wZXJ0aWVzKG1ldGFTdHlsZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbkxheWVyLnJlZ2lzdGVyQ2xhc3MoXCJ3ZWF2ZS52aXN1YWxpemF0aW9uLnBsb3R0ZXJzOjpHZW9tZXRyeVBsb3R0ZXJcIiwgR2VvbWV0cnlMYXllciwgW3dlYXZlanMuYXBpLmNvcmUuSUxpbmthYmxlT2JqZWN0V2l0aE5ld1Byb3BlcnRpZXNdKTtcbmV4cG9ydCBkZWZhdWx0IEdlb21ldHJ5TGF5ZXI7XG4iXX0=