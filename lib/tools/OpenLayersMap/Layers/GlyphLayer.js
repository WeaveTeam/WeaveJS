"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _FeatureLayer2 = require("./FeatureLayer");

var _FeatureLayer3 = _interopRequireDefault(_FeatureLayer2);

var _lodash = require("lodash");

var lodash = _interopRequireWildcard(_lodash);

var _openlayers = require("openlayers");

var ol = _interopRequireWildcard(_openlayers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

var GlyphLayer = function (_FeatureLayer) {
    _inherits(GlyphLayer, _FeatureLayer);

    function GlyphLayer(parent, layerName) {
        _classCallCheck(this, GlyphLayer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GlyphLayer).call(this, parent, layerName));

        _this.projectionPath.addCallback(_this, _this.updateLocations);
        _this.layerPath.push("sourceProjection").addCallback(_this, _this.updateLocations);
        _this.layerPath.push("dataX").addCallback(_this, _this.updateLocations);
        _this.layerPath.push("dataY").addCallback(_this, _this.updateLocations, true);
        _this.filteredKeySet.setColumnKeySources([_this.layerPath.push("dataX").getObject(), _this.layerPath.push("dataY").getObject()]);
        return _this;
    }

    _createClass(GlyphLayer, [{
        key: "_getFeatureIds",
        value: function _getFeatureIds() {
            return lodash.map(this.source.getFeatures(), function (item) {
                return item.getId();
            });
        }
    }, {
        key: "updateLocations",
        value: function updateLocations() {
            /* Update feature locations */
            var records = this.layerPath.retrieveRecords(["dataX", "dataY"], this.layerPath.push("dataX"));
            var recordIds = lodash.pluck(records, "id");
            var removedIds = lodash.difference(this._getFeatureIds(), recordIds);
            var rawProj = this.layerPath.getState("sourceProjection") || this.layerPath.getObject("dataX").getMetadata("projection") || "EPSG:4326";
            var mapProj = this.projectionPath.getState() || "EPSG:3857";
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = removedIds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var id = _step.value;

                    var feature = this.source.getFeatureById(id);
                    this.source.removeFeature(feature);
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
                for (var _iterator2 = records[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var record = _step2.value;

                    var dataX = undefined,
                        dataY = undefined;
                    dataX = GlyphLayer._toPoint(record.dataX, "xMin", "xMax");
                    dataY = GlyphLayer._toPoint(record.dataY, "yMin", "yMax");
                    var point = new ol.geom.Point([dataX, dataY]);
                    point.transform(rawProj, mapProj);
                    var coords = point.getCoordinates();
                    if (!isFinite(coords[0]) || !isFinite(coords[1])) continue;
                    var feature = this.source.getFeatureById(record.id);
                    if (!feature) {
                        feature = new ol.Feature({});
                        feature.setId(record.id);
                        this.source.addFeature(feature);
                    }
                    feature.setGeometry(point);
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

            this.updateStyleData();
            this.updateMetaStyles();
        }
    }], [{
        key: "_toPoint",
        value: function _toPoint(datum, field1, field2) {
            if ((typeof datum === "undefined" ? "undefined" : _typeof(datum)) === "object") {
                var firstPoly = datum[0];
                return (firstPoly.bounds[field1] + firstPoly.bounds[field2]) / 2;
            } else {
                return datum;
            }
        }
    }]);

    return GlyphLayer;
}(_FeatureLayer3.default);

exports.default = GlyphLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2x5cGhMYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyY3RzL3Rvb2xzL09wZW5MYXllcnNNYXAvTGF5ZXJzL0dseXBoTGF5ZXIudHMiXSwibmFtZXMiOlsiR2x5cGhMYXllciIsIkdseXBoTGF5ZXIuY29uc3RydWN0b3IiLCJHbHlwaExheWVyLl9nZXRGZWF0dXJlSWRzIiwiR2x5cGhMYXllci5fdG9Qb2ludCIsIkdseXBoTGF5ZXIudXBkYXRlTG9jYXRpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0lBS1ksQUFBTSxBQUFNLEFBQVEsQUFDekI7Ozs7SUFBSyxBQUFFLEFBQU0sQUFBWSxBQUVoQzs7Ozs7Ozs7Ozs7Ozs7SUFBa0MsQUFBWTs7O0FBRTdDLHdCQUFZLEFBQU0sUUFBRSxBQUFTOzBDQUU1Qjs7a0dBQU0sQUFBTSxRQUFFLEFBQVMsQUFBQyxBQUFDOztBQUV6QixBQUFJLGNBQUMsQUFBYyxlQUFDLEFBQVcsQUFBQyxBQUFJLG1CQUFFLEFBQUksTUFBQyxBQUFlLEFBQUMsQUFBQztBQUM1RCxBQUFJLGNBQUMsQUFBUyxVQUFDLEFBQUksS0FBQyxBQUFrQixBQUFDLG9CQUFDLEFBQVcsQUFBQyxBQUFJLG1CQUFFLEFBQUksTUFBQyxBQUFlLEFBQUMsQUFBQztBQUVoRixBQUFJLGNBQUMsQUFBUyxVQUFDLEFBQUksS0FBQyxBQUFPLEFBQUMsU0FBQyxBQUFXLEFBQUMsQUFBSSxtQkFBRSxBQUFJLE1BQUMsQUFBZSxBQUFDLEFBQUM7QUFDckUsQUFBSSxjQUFDLEFBQVMsVUFBQyxBQUFJLEtBQUMsQUFBTyxBQUFDLFNBQUMsQUFBVyxBQUFDLEFBQUksbUJBQUUsQUFBSSxNQUFDLEFBQWUsaUJBQUUsQUFBSSxBQUFDLEFBQUM7QUFFckUsQUFBSSxjQUFDLEFBQWUsZUFBQyxBQUFtQixvQkFBQyxDQUFDLEFBQUksTUFBQyxBQUFTLFVBQUMsQUFBSSxLQUFDLEFBQU8sQUFBQyxTQUFDLEFBQVMsQUFB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QUN6QixBQUFJLDZCQUFDLEFBQU0sT0FBQyxBQUFVLFdBQUMsQUFBTyxBQUFDLEFBQUMsQUFDakMsQUFBQzs7QUFDRCxBQUFPLDRCQUFDLEFBQVcsWUFBQyxBQUFLLEFBQUMsQUFBQyxBQUM1QixBQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQUNELEFBQUksaUJBQUMsQUFBZSxBQUFFLEFBQUM7QUFDdkIsQUFBSSxpQkFBQyxBQUFnQixBQUFFLEFBQUMsQUFDekIsQUFBQyxBQUNGLEFBQUMsQUFFRDs7OztpQ0F6RGlCLEFBQUssT0FBRSxBQUFNLFFBQUUsQUFBTTtBQUNwQyxBQUFFLEFBQUMsZ0JBQUMsUUFBTyxBQUFLLDBEQUFLLEFBQVEsQUFBQztBQUU3QixvQkFBSSxBQUFTLFlBQUcsQUFBSyxNQUFDLEFBQUMsQUFBQyxBQUFDLEdBRDFCLEFBQUM7QUFFQSxBQUFNLHVCQUFDLENBQUMsQUFBUyxVQUFDLEFBQU0sT0FBQyxBQUFNLEFBQUMsVUFBRyxBQUFTLFVBQUMsQUFBTSxPQUFDLEFBQU0sQUFBQyxBQUFDLFdBQUcsQUFBQyxBQUFDLEFBQ2xFLEFBQUMsQUFDRCxBQUFJO21CQUNKLEFBQUM7QUFDQSxBQUFNLHVCQUFDLEFBQUssQUFBQyxBQUNkLEFBQUMsQUFDRixBQUFDLEFBRUQsQUFBZTs7Ozs7Ozs7a0JBNkNELEFBQVUsQUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uL3R5cGluZ3MvbG9kYXNoL2xvZGFzaC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vLi4vdHlwaW5ncy9vcGVubGF5ZXJzL29wZW5sYXllcnMuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uL3R5cGluZ3Mvd2VhdmUvd2VhdmVqcy5kLnRzXCIvPlxuXG5pbXBvcnQgRmVhdHVyZUxheWVyIGZyb20gXCIuL0ZlYXR1cmVMYXllclwiO1xuaW1wb3J0ICogYXMgbG9kYXNoIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIG9sIGZyb20gXCJvcGVubGF5ZXJzXCI7XG5cbmFic3RyYWN0IGNsYXNzIEdseXBoTGF5ZXIgZXh0ZW5kcyBGZWF0dXJlTGF5ZXIge1xuXG5cdGNvbnN0cnVjdG9yKHBhcmVudCwgbGF5ZXJOYW1lKVxuXHR7XG5cdFx0c3VwZXIocGFyZW50LCBsYXllck5hbWUpO1xuXG5cdFx0dGhpcy5wcm9qZWN0aW9uUGF0aC5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLnVwZGF0ZUxvY2F0aW9ucyk7XG5cdFx0dGhpcy5sYXllclBhdGgucHVzaChcInNvdXJjZVByb2plY3Rpb25cIikuYWRkQ2FsbGJhY2sodGhpcywgdGhpcy51cGRhdGVMb2NhdGlvbnMpO1xuXG5cdFx0dGhpcy5sYXllclBhdGgucHVzaChcImRhdGFYXCIpLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMudXBkYXRlTG9jYXRpb25zKTtcblx0XHR0aGlzLmxheWVyUGF0aC5wdXNoKFwiZGF0YVlcIikuYWRkQ2FsbGJhY2sodGhpcywgdGhpcy51cGRhdGVMb2NhdGlvbnMsIHRydWUpO1xuXG5cdFx0KDxhbnk+dGhpcy5maWx0ZXJlZEtleVNldCkuc2V0Q29sdW1uS2V5U291cmNlcyhbdGhpcy5sYXllclBhdGgucHVzaChcImRhdGFYXCIpLmdldE9iamVjdCgpLCB0aGlzLmxheWVyUGF0aC5wdXNoKFwiZGF0YVlcIikuZ2V0T2JqZWN0KCldKTtcblx0fVxuXG5cdF9nZXRGZWF0dXJlSWRzKCkge1xuXHRcdHJldHVybiBsb2Rhc2gubWFwKHRoaXMuc291cmNlLmdldEZlYXR1cmVzKCksIChpdGVtOm9sLkZlYXR1cmUpID0+IGl0ZW0uZ2V0SWQoKSk7XG5cdH1cblxuXHRzdGF0aWMgX3RvUG9pbnQoZGF0dW0sIGZpZWxkMSwgZmllbGQyKSB7XG5cdFx0aWYgKHR5cGVvZiBkYXR1bSA9PT0gXCJvYmplY3RcIilcblx0XHR7XG5cdFx0XHRsZXQgZmlyc3RQb2x5ID0gZGF0dW1bMF07XG5cdFx0XHRyZXR1cm4gKGZpcnN0UG9seS5ib3VuZHNbZmllbGQxXSArIGZpcnN0UG9seS5ib3VuZHNbZmllbGQyXSkgLyAyO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGRhdHVtO1xuXHRcdH1cblx0fVxuXG5cdHVwZGF0ZUxvY2F0aW9ucygpIHtcblx0XHQvKiBVcGRhdGUgZmVhdHVyZSBsb2NhdGlvbnMgKi9cblx0XHR2YXIgcmVjb3JkcyA9IHRoaXMubGF5ZXJQYXRoLnJldHJpZXZlUmVjb3JkcyhbXCJkYXRhWFwiLCBcImRhdGFZXCJdLCB0aGlzLmxheWVyUGF0aC5wdXNoKFwiZGF0YVhcIikpO1xuXG5cdFx0dmFyIHJlY29yZElkcyA9IGxvZGFzaC5wbHVjayhyZWNvcmRzLCBcImlkXCIpO1xuXG5cdFx0dmFyIHJlbW92ZWRJZHMgPSBsb2Rhc2guZGlmZmVyZW5jZSh0aGlzLl9nZXRGZWF0dXJlSWRzKCksIHJlY29yZElkcyk7XG5cblx0XHR2YXIgcmF3UHJvaiA9IHRoaXMubGF5ZXJQYXRoLmdldFN0YXRlKFwic291cmNlUHJvamVjdGlvblwiKSB8fCB0aGlzLmxheWVyUGF0aC5nZXRPYmplY3QoXCJkYXRhWFwiKS5nZXRNZXRhZGF0YShcInByb2plY3Rpb25cIikgfHwgXCJFUFNHOjQzMjZcIjtcblx0XHR2YXIgbWFwUHJvaiA9IHRoaXMucHJvamVjdGlvblBhdGguZ2V0U3RhdGUoKSB8fCBcIkVQU0c6Mzg1N1wiO1xuXG5cdFx0Zm9yIChsZXQgaWQgb2YgcmVtb3ZlZElkcylcblx0XHR7XG5cdFx0XHRsZXQgZmVhdHVyZSA9IHRoaXMuc291cmNlLmdldEZlYXR1cmVCeUlkKGlkKTtcblx0XHRcdHRoaXMuc291cmNlLnJlbW92ZUZlYXR1cmUoZmVhdHVyZSk7XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgcmVjb3JkIG9mIHJlY29yZHMpXG5cdFx0e1xuXHRcdFx0bGV0IGRhdGFYLCBkYXRhWTtcblxuXHRcdFx0ZGF0YVggPSBHbHlwaExheWVyLl90b1BvaW50KHJlY29yZC5kYXRhWCwgXCJ4TWluXCIsIFwieE1heFwiKTtcblx0XHRcdGRhdGFZID0gR2x5cGhMYXllci5fdG9Qb2ludChyZWNvcmQuZGF0YVksIFwieU1pblwiLCBcInlNYXhcIik7XG5cblx0XHRcdGxldCBwb2ludCA9IG5ldyBvbC5nZW9tLlBvaW50KFtkYXRhWCwgZGF0YVldKTtcblx0XHRcdHBvaW50LnRyYW5zZm9ybShyYXdQcm9qLCBtYXBQcm9qKTtcblx0XHRcdFxuXHRcdFx0dmFyIGNvb3JkcyA9IHBvaW50LmdldENvb3JkaW5hdGVzKCk7XG5cdFx0XHRpZiAoIWlzRmluaXRlKGNvb3Jkc1swXSkgfHwgIWlzRmluaXRlKGNvb3Jkc1sxXSkpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHRsZXQgZmVhdHVyZSA9IHRoaXMuc291cmNlLmdldEZlYXR1cmVCeUlkKHJlY29yZC5pZCk7XG5cdFx0XHRpZiAoIWZlYXR1cmUpXG5cdFx0XHR7XG5cdFx0XHRcdGZlYXR1cmUgPSBuZXcgb2wuRmVhdHVyZSh7fSk7XG5cdFx0XHRcdGZlYXR1cmUuc2V0SWQocmVjb3JkLmlkKTtcblx0XHRcdFx0dGhpcy5zb3VyY2UuYWRkRmVhdHVyZShmZWF0dXJlKTtcblx0XHRcdH1cblx0XHRcdGZlYXR1cmUuc2V0R2VvbWV0cnkocG9pbnQpO1xuXHRcdH1cblx0XHR0aGlzLnVwZGF0ZVN0eWxlRGF0YSgpO1xuXHRcdHRoaXMudXBkYXRlTWV0YVN0eWxlcygpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdseXBoTGF5ZXI7XG4iXX0=
