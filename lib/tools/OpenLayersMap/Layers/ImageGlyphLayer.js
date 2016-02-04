"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

var _openlayers = require("openlayers");

var ol = _interopRequireWildcard(_openlayers);

var _GlyphLayer2 = require("./GlyphLayer");

var _GlyphLayer3 = _interopRequireDefault(_GlyphLayer2);

var _FeatureLayer = require("./FeatureLayer");

var _FeatureLayer2 = _interopRequireDefault(_FeatureLayer);

var _ImageGlyphCache = require("./ImageGlyphCache");

var _ImageGlyphCache2 = _interopRequireDefault(_ImageGlyphCache);

var _Layer = require("./Layer");

var _Layer2 = _interopRequireDefault(_Layer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

var ImageGlyphLayer = function (_GlyphLayer) {
    _inherits(ImageGlyphLayer, _GlyphLayer);

    function ImageGlyphLayer(parent, layerName) {
        _classCallCheck(this, ImageGlyphLayer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ImageGlyphLayer).call(this, parent, layerName));

        _this.imageGlyphCache = new _ImageGlyphCache2.default(_this.layerPath.getObject());
        _this.layerPath.push("imageSize").addCallback(_this, _this.updateStyleData);
        _this.layerPath.push("imageURL").addCallback(_this, _this.updateStyleData);
        _this.layerPath.push("alpha").addCallback(_this, _this.updateStyleData);
        _this.layerPath.push("color").addCallback(_this, _this.updateStyleData, true);
        return _this;
    }

    _createClass(ImageGlyphLayer, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "setIconStyle",
        value: function setIconStyle(feature, img, iconSize) {
            var styles = {};
            if (!img.complete || !img.src) {
                (0, _jquery2.default)(img).one("load", this.setIconStyle.bind(this, feature, img, iconSize));
                return;
            }
            var maxDim = Math.max(img.naturalHeight, img.naturalWidth);
            var scale = undefined;
            if (isNaN(iconSize)) {
                scale = 1;
            } else {
                scale = iconSize / maxDim;
            }
            var imgSize = [img.naturalWidth, img.naturalHeight];
            var _arr = ["normal", "selected", "probed", "unselected"];
            for (var _i = 0; _i < _arr.length; _i++) {
                var stylePrefix = _arr[_i];
                var icon = undefined;
                if (stylePrefix === "probed") {
                    icon = new ol.style.Icon({ img: img, imgSize: imgSize, scale: scale * 2.0 });
                } else {
                    icon = new ol.style.Icon({ img: img, imgSize: imgSize, scale: scale });
                }
                if (stylePrefix === "unselected") {
                    icon.setOpacity(1 / 3);
                }
                styles[stylePrefix + "Style"] = new ol.style.Style({ image: icon });
            }
            styles.replace = true;
            feature.setProperties(styles);
        }
    }, {
        key: "updateStyleData",
        value: function updateStyleData() {
            /* Update feature styles */
            var records = this.layerPath.retrieveRecords(["alpha", "color", "imageURL", "imageSize"], this.layerPath.push("dataX"));
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = records[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var record = _step.value;

                    var feature = this.source.getFeatureById(record.id);
                    if (!feature) {
                        continue;
                    }
                    var imageSize = Number(record.imageSize || NaN);
                    var color = _FeatureLayer2.default.toColorRGBA(record.color, record.alpha);
                    if (!record.imageURL) {
                        feature.setStyle(null);
                        continue;
                    }
                    var img = this.imageGlyphCache.getImage(record.imageURL, color);
                    this.setIconStyle(feature, img, imageSize);
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
    }]);

    return ImageGlyphLayer;
}(_GlyphLayer3.default);

_Layer2.default.registerClass("weave.visualization.plotters::ImageGlyphPlotter", ImageGlyphLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
exports.default = ImageGlyphLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW1hZ2VHbHlwaExheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjdHMvdG9vbHMvT3BlbkxheWVyc01hcC9MYXllcnMvSW1hZ2VHbHlwaExheWVyLnRzIl0sIm5hbWVzIjpbIkltYWdlR2x5cGhMYXllciIsIkltYWdlR2x5cGhMYXllci5jb25zdHJ1Y3RvciIsIkltYWdlR2x5cGhMYXllci5oYW5kbGVNaXNzaW5nU2Vzc2lvblN0YXRlUHJvcGVydGllcyIsIkltYWdlR2x5cGhMYXllci5zZXRJY29uU3R5bGUiLCJJbWFnZUdseXBoTGF5ZXIudXBkYXRlU3R5bGVEYXRhIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQUtZLEFBQUUsQUFBTSxBQUFZLEFBQ3pCLEFBQVUsQUFBTSxBQUFjLEFBQzlCLEFBQVksQUFBTSxBQUFnQixBQUNsQyxBQUFlLEFBQU0sQUFBbUIsQUFDeEMsQUFBSyxBQUFNLEFBQVMsQUFLM0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUE4QixBQUFVOzs7QUFHdkMsNkJBQVksQUFBTSxRQUFFLEFBQVM7K0NBRTVCOzt1R0FBTSxBQUFNLFFBQUUsQUFBUyxBQUFDLEFBQUM7O0FBRXpCLEFBQUksY0FBQyxBQUFlLGtCQUFHLEFBQUksQUFBZSw4QkFBQyxBQUFJLE1BQUMsQUFBUyxVQUFDLEFBQVMsQUFBRSxBQUFDLEFBQUM7QUFFdkUsQUFBSSxjQUFDLEFBQVMsVUFBQyxBQUFJLEtBQUMsQUFBVyxBQUFDLGFBQUMsQUFBVyxBQUFDLEFBQUksbUJBQUUsQUFBSSxNQUFDLEFBQWUsQUFBQyxBQUFDO0FBQ3pFLEFBQUksY0FBQyxBQUFTLFVBQUMsQUFBSSxLQUFDLEFBQVUsQUFBQyxZQUFDLEFBQVcsQUFBQyxBQUFJLG1CQUFFLEFBQUksTUFBQyxBQUFlLEFBQUMsQUFBQztBQUN4RSxBQUFJLGNBQUMsQUFBUyxVQUFDLEFBQUksS0FBQyxBQUFPLEFBQUMsU0FBQyxBQUFXLEFBQUMsQUFB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QUFBQyxBQUFDLEFBQUcscUNBQVcsQUFBTyxBQUFDO3dCQUFsQixBQUFNLHFCQUNmLEFBQUM7O0FBQ0Esd0JBQUksQUFBTyxVQUFHLEFBQUksS0FBQyxBQUFNLE9BQUMsQUFBYyxlQUFDLEFBQU0sT0FBQyxBQUFFLEFBQUMsQUFBQztBQUVwRCxBQUFFLEFBQUMsd0JBQUMsQ0FBQyxBQUFPLEFBQUM7QUFFWixBQUFRLEFBQUMsQUFDVixBQUFDLGlDQUZELEFBQUM7O0FBSUQsd0JBQUksQUFBUyxZQUFHLEFBQU0sT0FBQyxBQUFNLE9BQUMsQUFBUyxhQUFJLEFBQUcsQUFBQyxBQUFDO0FBQ2hELHdCQUFJLEFBQUssUUFBRyxBQUFZLHVCQUFDLEFBQVcsWUFBQyxBQUFNLE9BQUMsQUFBSyxPQUFFLEFBQU0sT0FBQyxBQUFLLEFBQUMsQUFBQztBQUVqRSxBQUFFLEFBQUMsd0JBQUMsQ0FBQyxBQUFNLE9BQUMsQUFBUSxBQUFDO0FBRXBCLEFBQU8sZ0NBQUMsQUFBUSxTQUFDLEFBQUksQUFBQyxBQUFDO0FBQ3ZCLEFBQVEsQUFBQyxBQUNWLEFBQUMsaUNBSEQsQUFBQzs7QUFLRCx3QkFBSSxBQUFHLE1BQUcsQUFBSSxLQUFDLEFBQWUsZ0JBQUMsQUFBUSxTQUFDLEFBQU0sT0FBQyxBQUFRLFVBQUUsQUFBSyxBQUFDLEFBQUM7QUFFaEUsQUFBSSx5QkFBQyxBQUFZLGFBQUMsQUFBTyxTQUFFLEFBQUcsS0FBRSxBQUFTLEFBQUMsQUFBQyxBQUM1QyxBQUFDLEFBQ0YsQUFBQyxBQUNGLEFBQUM7Ozs7Ozs7Ozs7Ozs7OzthQTNCQyxBQUEyQjs7Ozs7OztBQTZCN0IsQUFBSyxnQkFBQyxBQUFhLGNBQUMsQUFBaUQsbURBQUUsQUFBZSxpQkFBRSxDQUFDLEFBQU8sUUFBQyxBQUFHLElBQUMsQUFBSSxLQUFDLEFBQWdDLEFBQUMsQUFBQyxBQUFDLEFBQzdJO2tCQUFlLEFBQWUsQUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uL3R5cGluZ3MvbG9kYXNoL2xvZGFzaC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vLi4vdHlwaW5ncy9vcGVubGF5ZXJzL29wZW5sYXllcnMuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uL3R5cGluZ3Mvd2VhdmUvd2VhdmVqcy5kLnRzXCIvPlxuXG5pbXBvcnQganF1ZXJ5IGZyb20gXCJqcXVlcnlcIjtcbmltcG9ydCAqIGFzIG9sIGZyb20gXCJvcGVubGF5ZXJzXCI7XG5pbXBvcnQgR2x5cGhMYXllciBmcm9tIFwiLi9HbHlwaExheWVyXCI7XG5pbXBvcnQgRmVhdHVyZUxheWVyIGZyb20gXCIuL0ZlYXR1cmVMYXllclwiO1xuaW1wb3J0IEltYWdlR2x5cGhDYWNoZSBmcm9tIFwiLi9JbWFnZUdseXBoQ2FjaGVcIjtcbmltcG9ydCBMYXllciBmcm9tIFwiLi9MYXllclwiO1xuXG5kZWNsYXJlIHZhciB3ZWF2ZWpzOmFueTtcbmRlY2xhcmUgdmFyIFdlYXZlOmFueTtcblxuY2xhc3MgSW1hZ2VHbHlwaExheWVyIGV4dGVuZHMgR2x5cGhMYXllciB7XG5cblx0cHJpdmF0ZSBpbWFnZUdseXBoQ2FjaGU6SW1hZ2VHbHlwaENhY2hlO1xuXHRjb25zdHJ1Y3RvcihwYXJlbnQsIGxheWVyTmFtZSlcblx0e1xuXHRcdHN1cGVyKHBhcmVudCwgbGF5ZXJOYW1lKTtcblxuXHRcdHRoaXMuaW1hZ2VHbHlwaENhY2hlID0gbmV3IEltYWdlR2x5cGhDYWNoZSh0aGlzLmxheWVyUGF0aC5nZXRPYmplY3QoKSk7XG5cblx0XHR0aGlzLmxheWVyUGF0aC5wdXNoKFwiaW1hZ2VTaXplXCIpLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMudXBkYXRlU3R5bGVEYXRhKTtcblx0XHR0aGlzLmxheWVyUGF0aC5wdXNoKFwiaW1hZ2VVUkxcIikuYWRkQ2FsbGJhY2sodGhpcywgdGhpcy51cGRhdGVTdHlsZURhdGEpO1xuXHRcdHRoaXMubGF5ZXJQYXRoLnB1c2goXCJhbHBoYVwiKS5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLnVwZGF0ZVN0eWxlRGF0YSk7XG5cdFx0dGhpcy5sYXllclBhdGgucHVzaChcImNvbG9yXCIpLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMudXBkYXRlU3R5bGVEYXRhLCB0cnVlKTtcblx0fVxuXG5cdGhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzKG5ld1N0YXRlKSBcblx0e1xuXG5cdH1cblxuXHRzZXRJY29uU3R5bGUoZmVhdHVyZTpvbC5GZWF0dXJlLCBpbWcsIGljb25TaXplOiBudW1iZXIpXG5cdHtcblx0XHRsZXQgc3R5bGVzOmFueSA9IHt9O1xuXG5cdFx0aWYgKCFpbWcuY29tcGxldGUgfHwgIWltZy5zcmMpXG5cdFx0e1xuXHRcdFx0anF1ZXJ5KGltZykub25lKFwibG9hZFwiLCB0aGlzLnNldEljb25TdHlsZS5iaW5kKHRoaXMsIGZlYXR1cmUsIGltZywgaWNvblNpemUpKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgbWF4RGltOiBudW1iZXIgPSBNYXRoLm1heChpbWcubmF0dXJhbEhlaWdodCwgaW1nLm5hdHVyYWxXaWR0aCk7XG5cdFx0bGV0IHNjYWxlOiBudW1iZXI7XG5cdFx0aWYgKGlzTmFOKGljb25TaXplKSlcblx0XHR7XG5cdFx0XHRzY2FsZSA9IDE7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRzY2FsZSA9IGljb25TaXplIC8gbWF4RGltO1xuXHRcdH1cblxuXHRcdGxldCBpbWdTaXplID0gW2ltZy5uYXR1cmFsV2lkdGgsIGltZy5uYXR1cmFsSGVpZ2h0XTtcblxuXHRcdGZvciAobGV0IHN0eWxlUHJlZml4IG9mIFtcIm5vcm1hbFwiLCBcInNlbGVjdGVkXCIsIFwicHJvYmVkXCIsIFwidW5zZWxlY3RlZFwiXSlcblx0XHR7XG5cdFx0XHRsZXQgaWNvbjtcblx0XHRcdGlmIChzdHlsZVByZWZpeCA9PT0gXCJwcm9iZWRcIilcblx0XHRcdHtcblx0XHRcdFx0aWNvbiA9IG5ldyBvbC5zdHlsZS5JY29uKHtpbWcsIGltZ1NpemUsIHNjYWxlOiBzY2FsZSAqIDIuMH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRpY29uID0gbmV3IG9sLnN0eWxlLkljb24oe2ltZywgaW1nU2l6ZSwgc2NhbGV9KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHN0eWxlUHJlZml4ID09PSBcInVuc2VsZWN0ZWRcIilcblx0XHRcdHtcblx0XHRcdFx0aWNvbi5zZXRPcGFjaXR5KDEgLyAzKTtcblx0XHRcdH1cblxuXHRcdFx0c3R5bGVzW3N0eWxlUHJlZml4ICsgXCJTdHlsZVwiXSA9IG5ldyBvbC5zdHlsZS5TdHlsZSh7aW1hZ2U6IGljb259KTtcblx0XHR9XG5cblx0XHRzdHlsZXMucmVwbGFjZSA9IHRydWU7XG5cblx0XHRmZWF0dXJlLnNldFByb3BlcnRpZXMoc3R5bGVzKTtcblx0fVxuXG5cdHVwZGF0ZVN0eWxlRGF0YSgpIHtcblx0XHQvKiBVcGRhdGUgZmVhdHVyZSBzdHlsZXMgKi9cblxuXHRcdHZhciByZWNvcmRzID0gdGhpcy5sYXllclBhdGgucmV0cmlldmVSZWNvcmRzKFtcImFscGhhXCIsIFwiY29sb3JcIiwgXCJpbWFnZVVSTFwiLCBcImltYWdlU2l6ZVwiXSwgdGhpcy5sYXllclBhdGgucHVzaChcImRhdGFYXCIpKTtcblxuXHRcdGZvciAobGV0IHJlY29yZCBvZiByZWNvcmRzKVxuXHRcdHtcblx0XHRcdGxldCBmZWF0dXJlID0gdGhpcy5zb3VyY2UuZ2V0RmVhdHVyZUJ5SWQocmVjb3JkLmlkKTtcblxuXHRcdFx0aWYgKCFmZWF0dXJlKVxuXHRcdFx0e1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGltYWdlU2l6ZSA9IE51bWJlcihyZWNvcmQuaW1hZ2VTaXplIHx8IE5hTik7XG5cdFx0XHRsZXQgY29sb3IgPSBGZWF0dXJlTGF5ZXIudG9Db2xvclJHQkEocmVjb3JkLmNvbG9yLCByZWNvcmQuYWxwaGEpO1xuXG5cdFx0XHRpZiAoIXJlY29yZC5pbWFnZVVSTClcblx0XHRcdHtcblx0XHRcdFx0ZmVhdHVyZS5zZXRTdHlsZShudWxsKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBpbWcgPSB0aGlzLmltYWdlR2x5cGhDYWNoZS5nZXRJbWFnZShyZWNvcmQuaW1hZ2VVUkwsIGNvbG9yKTtcblxuXHRcdFx0dGhpcy5zZXRJY29uU3R5bGUoZmVhdHVyZSwgaW1nLCBpbWFnZVNpemUpO1xuXHRcdH1cblx0fVxufVxuXG5MYXllci5yZWdpc3RlckNsYXNzKFwid2VhdmUudmlzdWFsaXphdGlvbi5wbG90dGVyczo6SW1hZ2VHbHlwaFBsb3R0ZXJcIiwgSW1hZ2VHbHlwaExheWVyLCBbd2VhdmVqcy5hcGkuY29yZS5JTGlua2FibGVPYmplY3RXaXRoTmV3UHJvcGVydGllc10pO1xuZXhwb3J0IGRlZmF1bHQgSW1hZ2VHbHlwaExheWVyO1xuIl19
