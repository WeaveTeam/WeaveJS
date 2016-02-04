"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _openlayers = require("openlayers");

var ol = _interopRequireWildcard(_openlayers);

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

var LabelLayer = function (_GlyphLayer) {
    _inherits(LabelLayer, _GlyphLayer);

    function LabelLayer(parent, layerName) {
        _classCallCheck(this, LabelLayer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LabelLayer).call(this, parent, layerName));

        _this.size = _this.layerPath.getObject("size");
        _this.text = _this.layerPath.getObject("text");
        _this.color = _this.layerPath.getObject("color");
        _this.size.addGroupedCallback(_this, _this.updateStyleData);
        _this.text.addGroupedCallback(_this, _this.updateStyleData);
        _this.color.addGroupedCallback(_this, _this.updateStyleData, true);
        return _this;
    }

    _createClass(LabelLayer, [{
        key: "updateStyleData",
        value: function updateStyleData() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.text.keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var key = _step.value;

                    var feature = this.source.getFeatureById(key.toString());
                    if (!feature) {
                        continue;
                    }
                    var text = this.text.getValueFromKey(key, String);
                    var size = this.size.getValueFromKey(key, Number);
                    var color = this.color.getValueFromKey(key, String);
                    var font = size + "px sans-serif";
                    var textColor = _FeatureLayer.FeatureLayer.toColorRGBA(color, 1);
                    var fadedTextColor = _FeatureLayer.FeatureLayer.toColorRGBA(color, 0.5);
                    var selectedStroke = new ol.style.Stroke({
                        color: "rgba(128,128,128,0.75)", width: 3
                    });
                    var probeStroke = new ol.style.Stroke({ color: "white", width: 2 });
                    var normalFill = new ol.style.Fill({ color: textColor });
                    var fadedFill = new ol.style.Fill({ color: fadedTextColor });
                    var normalText = new ol.style.Text({ text: text, font: font, fill: normalFill });
                    var probedText = new ol.style.Text({ text: text, font: font, fill: normalFill, stroke: probeStroke });
                    var selectedText = new ol.style.Text({ text: text, font: font, fill: normalFill, stroke: selectedStroke });
                    var unselectedText = new ol.style.Text({ text: text, font: font, fill: fadedFill });
                    var metaStyle = {};
                    metaStyle.normalStyle = new ol.style.Style({ text: normalText });
                    metaStyle.unselectedStyle = new ol.style.Style({ text: unselectedText });
                    metaStyle.selectedStyle = new ol.style.Style({ text: selectedText });
                    metaStyle.probedStyle = new ol.style.Style({ text: probedText });
                    metaStyle.replace = true;
                    feature.setProperties(metaStyle);
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

    return LabelLayer;
}(_GlyphLayer3.default);

_Layer2.default.registerClass("weave.visualization.plotters::TextGlyphPlotter", LabelLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
exports.default = LabelLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGFiZWxMYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyY3RzL3Rvb2xzL09wZW5MYXllcnNNYXAvTGF5ZXJzL0xhYmVsTGF5ZXIudHMiXSwibmFtZXMiOlsiTGFiZWxMYXllciIsIkxhYmVsTGF5ZXIuY29uc3RydWN0b3IiLCJMYWJlbExheWVyLnVwZGF0ZVN0eWxlRGF0YSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUlZLEFBQUUsQUFBTSxBQUFZLEFBSXpCLEFBQUMsQUFBWSxBQUFzQixBQUFNLEFBQWdCLEFBQ3pELEFBQVUsQUFBTSxBQUFjLEFBQzlCLEFBQUssQUFBTSxBQUFTLEFBTTNCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBeUIsQUFBVTs7O0FBZWxDLHdCQUFZLEFBQXdCLFFBQUUsQUFBZ0I7MENBRXJEOztrR0FBTSxBQUFNLFFBQUUsQUFBUyxBQUFDLEFBQUM7O0FBRXpCLEFBQUksY0FBQyxBQUFJLE9BQUcsQUFBSSxNQUFDLEFBQVMsVUFBQyxBQUFTLFVBQUMsQUFBTSxBQUFDLEFBQUM7QUFDN0MsQUFBSSxjQUFDLEFBQUksT0FBRyxBQUFJLE1BQUMsQUFBUyxVQUFDLEFBQVMsVUFBQyxBQUFNLEFBQUMsQUFBQztBQUM3QyxBQUFJLGNBQUMsQUFBSyxRQUFHLEFBQUksTUFBQyxBQUFTLFVBQUMsQUFBUyxVQUFDLEFBQU8sQUFBQyxBQUFDO0FBRS9DLEFBQUksY0FBQyxBQUFJLEtBQUMsQUFBa0IsQUFBQyxBQUFJLDBCQUFFLEFBQUksTUFBQyxBQUFlLEFBQUM7QUFDeEQsQUFBSSxjQUFDLEFBQUksS0FBQyxBQUFrQixBQUFDLEFBQUksMEJBQUUsQUFBSSxNQUFDLEFBQWUsQUFBQztBQUN4RCxBQUFJLGNBQUMsQUFBSyxNQUFDLEFBQWtCLEFBQUMsQUFBSSwwQkFBRSxBQUFJLE1BQUMsQUFBZSxpQkFBRSxBQUFJLEFBQUMsQUFBQyxBQUNqRSxBQUFDLEFBRUQsQUFBZTs7Ozs7Ozs7Ozs7O0FBRWQs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QUFBYSxnQkFBRyxJQUFJLEFBQUUsR0FBQyxBQUFLLE1BQUMsQUFBSyxNQUFDLEVBQUMsQUFBSSxNQUFFLEFBQVksQUFBQyxBQUFDLEFBQUM7QUFDbkUsQUFBUyw4QkFBQyxBQUFXLGNBQUcsSUFBSSxBQUFFLEdBQUMsQUFBSyxNQUFDLEFBQUssTUFBQyxFQUFFLEFBQUksTUFBRSxBQUFVLEFBQUUsQUFBQyxBQUFDO0FBRWpFLEFBQVMsOEJBQUMsQUFBTyxVQUFHLEFBQUksQUFBQztBQUV6QixBQUFPLDRCQUFDLEFBQWEsY0FBQyxBQUFTLEFBQUMsQUFBQyxBQUNsQyxBQUFDLEFBQ0YsQUFBQyxBQUNGLEFBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxBQUFLLGdCQUFDLEFBQWEsY0FBQyxBQUFnRCxrREFBRSxBQUFVLFlBQUUsQ0FBQyxBQUFPLFFBQUMsQUFBRyxJQUFDLEFBQUksS0FBQyxBQUFnQyxBQUFDLEFBQUMsQUFBQyxBQUN2STtrQkFBZSxBQUFVLEFBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uL3R5cGluZ3Mvb3BlbmxheWVycy9vcGVubGF5ZXJzLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi8uLi90eXBpbmdzL3dlYXZlL3dlYXZlanMuZC50c1wiLz5cblxuaW1wb3J0ICogYXMgb2wgZnJvbSBcIm9wZW5sYXllcnNcIjtcbmltcG9ydCAqIGFzIGxvZGFzaCBmcm9tIFwibG9kYXNoXCI7XG5cbmltcG9ydCBTdGFuZGFyZExpYiBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvU3RhbmRhcmRMaWJcIjtcbmltcG9ydCB7RmVhdHVyZUxheWVyLCBNZXRhU3R5bGVQcm9wZXJ0aWVzfSBmcm9tIFwiLi9GZWF0dXJlTGF5ZXJcIjtcbmltcG9ydCBHbHlwaExheWVyIGZyb20gXCIuL0dseXBoTGF5ZXJcIjtcbmltcG9ydCBMYXllciBmcm9tIFwiLi9MYXllclwiO1xuaW1wb3J0IE9wZW5MYXllcnNNYXBUb29sIGZyb20gXCIuLi8uLi9PcGVuTGF5ZXJzTWFwVG9vbFwiO1xuXG5kZWNsYXJlIHZhciBXZWF2ZTogYW55O1xuZGVjbGFyZSB2YXIgd2VhdmVqczogYW55O1xuXG5jbGFzcyBMYWJlbExheWVyIGV4dGVuZHMgR2x5cGhMYXllciB7XG5cdHB1YmxpYyBhbmdsZTogYW55IC8qd2VhdmVqcy5hcGkuZGF0YS5JQXR0cmlidXRlQ29sdW1uKi87XG5cdHB1YmxpYyBib2xkOiBhbnkgLyp3ZWF2ZWpzLmFwaS5kYXRhLklBdHRyaWJ1dGVDb2x1bW4qLztcblx0cHVibGljIGNvbG9yOiBhbnkgLyp3ZWF2ZWpzLmFwaS5kYXRhLklBdHRyaWJ1dGVDb2x1bW4qLztcblx0cHVibGljIGZvbnQ6IGFueSAvKndlYXZlanMuYXBpLmRhdGEuSUF0dHJpYnV0ZUNvbHVtbiovO1xuXHRwdWJsaWMgaEFsaWduOiBhbnkgLyp3ZWF2ZWpzLmFwaS5kYXRhLklBdHRyaWJ1dGVDb2x1bW4qLztcblx0cHVibGljIHZBbGlnbjogYW55IC8qd2VhdmVqcy5hcGkuZGF0YS5JQXR0cmlidXRlQ29sdW1uKi87XG5cdHB1YmxpYyBpdGFsaWM6IGFueSAvKndlYXZlanMuYXBpLmRhdGEuSUF0dHJpYnV0ZUNvbHVtbiovO1xuXHRwdWJsaWMgc2l6ZTogYW55IC8qd2VhdmVqcy5hcGkuZGF0YS5JQXR0cmlidXRlQ29sdW1uKi87XG5cdHB1YmxpYyB0ZXh0OiBhbnkgLyp3ZWF2ZWpzLmFwaS5kYXRhLklBdHRyaWJ1dGVDb2x1bW4qLztcblx0cHVibGljIHVuZGVybGluZTogYW55IC8qd2VhdmVqcy5hcGkuZGF0YS5JQXR0cmlidXRlQ29sdW1uKi87XG5cblx0cHJpdmF0ZSBjb2x1bW5zOiBNYXA8c3RyaW5nLGFueT47XG5cblxuXHRjb25zdHJ1Y3RvcihwYXJlbnQ6T3BlbkxheWVyc01hcFRvb2wsIGxheWVyTmFtZTpzdHJpbmcpXG5cdHtcblx0XHRzdXBlcihwYXJlbnQsIGxheWVyTmFtZSk7XG5cblx0XHR0aGlzLnNpemUgPSB0aGlzLmxheWVyUGF0aC5nZXRPYmplY3QoXCJzaXplXCIpO1xuXHRcdHRoaXMudGV4dCA9IHRoaXMubGF5ZXJQYXRoLmdldE9iamVjdChcInRleHRcIik7XG5cdFx0dGhpcy5jb2xvciA9IHRoaXMubGF5ZXJQYXRoLmdldE9iamVjdChcImNvbG9yXCIpO1xuXG5cdFx0dGhpcy5zaXplLmFkZEdyb3VwZWRDYWxsYmFjayh0aGlzLCB0aGlzLnVwZGF0ZVN0eWxlRGF0YSlcblx0XHR0aGlzLnRleHQuYWRkR3JvdXBlZENhbGxiYWNrKHRoaXMsIHRoaXMudXBkYXRlU3R5bGVEYXRhKVxuXHRcdHRoaXMuY29sb3IuYWRkR3JvdXBlZENhbGxiYWNrKHRoaXMsIHRoaXMudXBkYXRlU3R5bGVEYXRhLCB0cnVlKTtcblx0fVxuXG5cdHVwZGF0ZVN0eWxlRGF0YSgpOnZvaWQgXG5cdHtcblx0XHRmb3IgKGxldCBrZXkgb2YgdGhpcy50ZXh0LmtleXMpXG5cdFx0e1xuXHRcdFx0bGV0IGZlYXR1cmU6IG9sLkZlYXR1cmUgPSB0aGlzLnNvdXJjZS5nZXRGZWF0dXJlQnlJZChrZXkudG9TdHJpbmcoKSk7XG5cdFx0XHRpZiAoIWZlYXR1cmUpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgdGV4dDogc3RyaW5nID0gdGhpcy50ZXh0LmdldFZhbHVlRnJvbUtleShrZXksIFN0cmluZyk7XG5cdFx0XHRsZXQgc2l6ZTogbnVtYmVyID0gdGhpcy5zaXplLmdldFZhbHVlRnJvbUtleShrZXksIE51bWJlcik7XG5cdFx0XHRsZXQgY29sb3I6IHN0cmluZyA9IHRoaXMuY29sb3IuZ2V0VmFsdWVGcm9tS2V5KGtleSwgU3RyaW5nKTtcblx0XHRcdGxldCBmb250OiBzdHJpbmcgPSBgJHtzaXplfXB4IHNhbnMtc2VyaWZgO1xuXG5cdFx0XHRsZXQgdGV4dENvbG9yOiBzdHJpbmcgPSBGZWF0dXJlTGF5ZXIudG9Db2xvclJHQkEoY29sb3IsIDEpO1xuXHRcdFx0bGV0IGZhZGVkVGV4dENvbG9yOiBzdHJpbmcgPSBGZWF0dXJlTGF5ZXIudG9Db2xvclJHQkEoY29sb3IsIDAuNSk7XG5cblx0XHRcdGxldCBzZWxlY3RlZFN0cm9rZTogb2wuc3R5bGUuU3Ryb2tlID0gbmV3IG9sLnN0eWxlLlN0cm9rZSh7XG5cdFx0XHRcdGNvbG9yOiBcInJnYmEoMTI4LDEyOCwxMjgsMC43NSlcIiwgd2lkdGg6IDNcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgcHJvYmVTdHJva2U6b2wuc3R5bGUuU3Ryb2tlID0gbmV3IG9sLnN0eWxlLlN0cm9rZSh7Y29sb3I6IFwid2hpdGVcIiwgd2lkdGg6IDJ9KTtcblxuXHRcdFx0bGV0IG5vcm1hbEZpbGw6IG9sLnN0eWxlLkZpbGwgPSBuZXcgb2wuc3R5bGUuRmlsbCh7IGNvbG9yOiB0ZXh0Q29sb3IgfSk7XG5cdFx0XHRsZXQgZmFkZWRGaWxsOiBvbC5zdHlsZS5GaWxsID0gbmV3IG9sLnN0eWxlLkZpbGwoeyBjb2xvcjogZmFkZWRUZXh0Q29sb3IgfSk7XG5cdFxuXHRcdFx0bGV0IG5vcm1hbFRleHQgPSBuZXcgb2wuc3R5bGUuVGV4dCh7IHRleHQsIGZvbnQsIGZpbGw6IG5vcm1hbEZpbGwgfSk7XG5cdFx0XHRsZXQgcHJvYmVkVGV4dCA9IG5ldyBvbC5zdHlsZS5UZXh0KHsgdGV4dCwgZm9udCwgZmlsbDogbm9ybWFsRmlsbCwgc3Ryb2tlOiBwcm9iZVN0cm9rZSB9KTtcblx0XHRcdGxldCBzZWxlY3RlZFRleHQgPSBuZXcgb2wuc3R5bGUuVGV4dCh7IHRleHQsIGZvbnQsIGZpbGw6IG5vcm1hbEZpbGwsIHN0cm9rZTogc2VsZWN0ZWRTdHJva2UgfSk7XG5cdFx0XHRsZXQgdW5zZWxlY3RlZFRleHQgPSBuZXcgb2wuc3R5bGUuVGV4dCh7IHRleHQsIGZvbnQsIGZpbGw6IGZhZGVkRmlsbCB9KTtcblxuXHRcdFx0bGV0IG1ldGFTdHlsZTogYW55ID0ge307XG5cblx0XHRcdG1ldGFTdHlsZS5ub3JtYWxTdHlsZSA9IG5ldyBvbC5zdHlsZS5TdHlsZSh7IHRleHQ6IG5vcm1hbFRleHQgfSk7XG5cdFx0XHRtZXRhU3R5bGUudW5zZWxlY3RlZFN0eWxlID0gbmV3IG9sLnN0eWxlLlN0eWxlKHsgdGV4dDogdW5zZWxlY3RlZFRleHQgfSk7XG5cdFx0XHRtZXRhU3R5bGUuc2VsZWN0ZWRTdHlsZSA9IG5ldyBvbC5zdHlsZS5TdHlsZSh7dGV4dDogc2VsZWN0ZWRUZXh0fSk7XG5cdFx0XHRtZXRhU3R5bGUucHJvYmVkU3R5bGUgPSBuZXcgb2wuc3R5bGUuU3R5bGUoeyB0ZXh0OiBwcm9iZWRUZXh0IH0pO1xuXHRcdFx0XG5cdFx0XHRtZXRhU3R5bGUucmVwbGFjZSA9IHRydWU7XG5cblx0XHRcdGZlYXR1cmUuc2V0UHJvcGVydGllcyhtZXRhU3R5bGUpO1xuXHRcdH1cblx0fVxufVxuXG5MYXllci5yZWdpc3RlckNsYXNzKFwid2VhdmUudmlzdWFsaXphdGlvbi5wbG90dGVyczo6VGV4dEdseXBoUGxvdHRlclwiLCBMYWJlbExheWVyLCBbd2VhdmVqcy5hcGkuY29yZS5JTGlua2FibGVPYmplY3RXaXRoTmV3UHJvcGVydGllc10pO1xuZXhwb3J0IGRlZmF1bHQgTGFiZWxMYXllcjtcbiJdfQ==