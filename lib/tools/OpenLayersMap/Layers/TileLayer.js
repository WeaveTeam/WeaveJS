"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _openlayers = require("openlayers");

var ol = _interopRequireWildcard(_openlayers);

var _Layer2 = require("./Layer");

var _Layer3 = _interopRequireDefault(_Layer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

var TileLayer = function (_Layer) {
    _inherits(TileLayer, _Layer);

    function TileLayer(parent, layerName) {
        _classCallCheck(this, TileLayer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TileLayer).call(this, parent, layerName));

        _this.olLayer = new ol.layer.Tile();
        _this.servicePath = _this.layerPath.push("service", null);
        _this.oldProviderName = null;
        _this.servicePath.addCallback(_this, _this.updateTileSource, true);
        _this.projectionPath.addCallback(_this, _this.updateValidExtents, true);
        return _this;
    }

    _createClass(TileLayer, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "updateValidExtents",
        value: function updateValidExtents() {
            var proj = ol.proj.get(this.projectionPath.getState() || "EPSG:3857");
            if (proj) this.olLayer.setExtent(proj.getExtent());else console.log('invalid proj -> no extent');
        }
    }, {
        key: "getCustomWMSSource",
        value: function getCustomWMSSource() {
            var customWMSPath = this.servicePath;
            if (customWMSPath.push("wmsURL").getType()) {
                var url = customWMSPath.getState("wmsURL");
                var attributions = customWMSPath.getState("creditInfo");
                var projection = customWMSPath.getState("tileProjectionSRS");
                return new ol.source.XYZ({
                    url: url, attributions: attributions, projection: projection
                });
            }
        }
    }, {
        key: "getModestMapsSource",
        value: function getModestMapsSource() {
            var providerNamePath = this.servicePath.push("providerName");
            if (providerNamePath.getType()) {
                var providerName = providerNamePath.getState();
                if (providerName === this.oldProviderName) {
                    return undefined;
                }
                switch (providerName) {
                    case "Stamen WaterColor":
                        return new ol.source.Stamen({ layer: "watercolor" });
                    case "Stamen Toner":
                        return new ol.source.Stamen({ layer: "toner" });
                    case "Open MapQuest Aerial":
                        return new ol.source.MapQuest({ layer: "sat" });
                    case "Open MapQuest":
                        return new ol.source.MapQuest({ layer: "osm" });
                    case "Open Street Map":
                        return new ol.source.OSM({ wrapX: false });
                    case "Blue Marble Map":
                        return new ol.source.TileWMS({ url: "http://neowms.sci.gsfc.nasa.gov/wms/wms", wrapX: false });
                    default:
                        return null;
                }
            }
        }
    }, {
        key: "updateTileSource",
        value: function updateTileSource() {
            var serviceDriverName = this.servicePath.getType();
            var newLayer = null;
            switch (serviceDriverName) {
                case "weave.services.wms::ModestMapsWMS":
                    newLayer = this.getModestMapsSource();
                    break;
                case "weave.services.wms::CustomWMS":
                    newLayer = this.getCustomWMSSource();
                    break;
                default:
                    newLayer = null;
            }
            if (newLayer !== undefined) {
                this.source = newLayer;
            }
        }
    }]);

    return TileLayer;
}(_Layer3.default);

_Layer3.default.registerClass("weave.visualization.plotters::WMSPlotter", TileLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
exports.default = TileLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsZUxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjdHMvdG9vbHMvT3BlbkxheWVyc01hcC9MYXllcnMvVGlsZUxheWVyLnRzIl0sIm5hbWVzIjpbIlRpbGVMYXllciIsIlRpbGVMYXllci5jb25zdHJ1Y3RvciIsIlRpbGVMYXllci5oYW5kbGVNaXNzaW5nU2Vzc2lvblN0YXRlUHJvcGVydGllcyIsIlRpbGVMYXllci51cGRhdGVWYWxpZEV4dGVudHMiLCJUaWxlTGF5ZXIuZ2V0Q3VzdG9tV01TU291cmNlIiwiVGlsZUxheWVyLmdldE1vZGVzdE1hcHNTb3VyY2UiLCJUaWxlTGF5ZXIudXBkYXRlVGlsZVNvdXJjZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUlZLEFBQUUsQUFBTSxBQUFZLEFBQ3pCLEFBQUssQUFBTSxBQUFTLEFBSzNCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBd0IsQUFBSzs7O0FBSzVCLHVCQUFZLEFBQU0sUUFBRSxBQUFTOzs7aUdBRXRCLEFBQU0sUUFBRSxBQUFTLEFBQUMsQUFBQzs7QUFFekIsQUFBSSxjQUFDLEFBQU8sVUFBRyxJQUFJLEFBQUUsR0FBQyxBQUFLLE1BQUMsQUFBSSxBQUFFLEFBQUM7QUFDbkMsQUFBSSxjQUFDLEFBQVcsY0FBRyxBQUFJLE1BQUMsQUFBUyxVQUFDLEFBQUksS0FBQyxBQUFTLFdBQUUsQUFBSSxBQUFDLEFBQUM7QUFDeEQsQUFBSSxjQUFDLEFBQWUsa0JBQUcsQUFBSSxBQUFDLEtBSjVCO0FBTUEsQUFBSSxjQUFDLEFBQVcsWUFBQyxBQUFXLEFBQUMsQUFBSSxtQkFBRSxBQUFJLE1BQUMsQUFBZ0Isa0JBQUUsQUFBSSxBQUFDLEFBQUM7QUFDaEUsQUFBSSxjQUFDLEFBQWMsZUFBQyxBQUFXLEFBQUMsQUFBSSxtQkFBRSxBQUFJLE1BQUMsQUFBa0Isb0JBQUUsQUFBSSxBQUFDLEFBQUMsQUFDdEUsQUFBQyxBQUVELEFBQW1DOzs7Ozs7NERBQUMsQUFBUSxVQUc1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LGdCQUFJLEFBQWlCLG9CQUFHLEFBQUksS0FBQyxBQUFXLFlBQUMsQUFBTyxBQUFFLEFBQUM7QUFDbkQsZ0JBQUksQUFBUSxXQUFHLEFBQUksQUFBQztBQUNwQixBQUFNLEFBQUMsb0JBQUMsQUFBaUIsQUFBQyxBQUMxQixBQUFDO0FBQ0EscUJBQUssQUFBbUM7QUFDdkMsQUFBUSwrQkFBRyxBQUFJLEtBQUMsQUFBbUIsQUFBRSxBQUFDO0FBQ3RDLEFBQUssQUFBQztxQkFDRixBQUErQjtBQUNuQyxBQUFRLCtCQUFHLEFBQUksS0FBQyxBQUFrQixBQUFFLEFBQUM7QUFDckMsQUFBSyxBQUFDLDBCQUZQOztBQUlDLEFBQVEsK0JBQUcsQUFBSSxBQUFDLEFBQ2xCLEFBQUMsS0FGQTs7QUFJRCxBQUFFLEFBQUMsZ0JBQUMsQUFBUSxhQUFLLEFBQVMsQUFBQztBQUUxQixBQUFJLHFCQUFDLEFBQU0sU0FBRyxBQUFRLEFBQUMsQUFDeEIsQUFBQyxBQUNGLEFBQUMsQUFDRixBQUFDLFNBSkMsQUFBQzs7Ozs7Ozs7QUFNSCxBQUFLLGdCQUFDLEFBQWEsY0FBQyxBQUEwQyw0Q0FBRSxBQUFTLFdBQUUsQ0FBQyxBQUFPLFFBQUMsQUFBRyxJQUFDLEFBQUksS0FBQyxBQUFnQyxBQUFDLEFBQUMsQUFBQyxBQUNoSTtrQkFBZSxBQUFTLEFBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uL3R5cGluZ3Mvb3BlbmxheWVycy9vcGVubGF5ZXJzLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi8uLi90eXBpbmdzL3dlYXZlL3dlYXZlanMuZC50c1wiLz5cblxuaW1wb3J0ICogYXMgb2wgZnJvbSBcIm9wZW5sYXllcnNcIjtcbmltcG9ydCBMYXllciBmcm9tIFwiLi9MYXllclwiO1xuXG5kZWNsYXJlIHZhciBXZWF2ZTphbnk7XG5kZWNsYXJlIHZhciB3ZWF2ZWpzOmFueTtcblxuY2xhc3MgVGlsZUxheWVyIGV4dGVuZHMgTGF5ZXIge1xuXG5cdHNlcnZpY2VQYXRoOldlYXZlUGF0aDtcblx0b2xkUHJvdmlkZXJOYW1lOnN0cmluZztcblxuXHRjb25zdHJ1Y3RvcihwYXJlbnQsIGxheWVyTmFtZSlcblx0e1xuXHRcdHN1cGVyKHBhcmVudCwgbGF5ZXJOYW1lKTtcblxuXHRcdHRoaXMub2xMYXllciA9IG5ldyBvbC5sYXllci5UaWxlKCk7XG5cdFx0dGhpcy5zZXJ2aWNlUGF0aCA9IHRoaXMubGF5ZXJQYXRoLnB1c2goXCJzZXJ2aWNlXCIsIG51bGwpO1xuXHRcdHRoaXMub2xkUHJvdmlkZXJOYW1lID0gbnVsbDtcblxuXHRcdHRoaXMuc2VydmljZVBhdGguYWRkQ2FsbGJhY2sodGhpcywgdGhpcy51cGRhdGVUaWxlU291cmNlLCB0cnVlKTtcblx0XHR0aGlzLnByb2plY3Rpb25QYXRoLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMudXBkYXRlVmFsaWRFeHRlbnRzLCB0cnVlKTtcblx0fVxuXG5cdGhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzKG5ld1N0YXRlKVxuXHR7XG5cdFx0XG5cdH1cblxuXHR1cGRhdGVWYWxpZEV4dGVudHMoKVxuXHR7XG5cdFx0dmFyIHByb2ogPSBvbC5wcm9qLmdldCh0aGlzLnByb2plY3Rpb25QYXRoLmdldFN0YXRlKCkgfHwgXCJFUFNHOjM4NTdcIik7XG5cdFx0aWYgKHByb2opXG5cdFx0XHR0aGlzLm9sTGF5ZXIuc2V0RXh0ZW50KHByb2ouZ2V0RXh0ZW50KCkpO1xuXHRcdGVsc2Vcblx0XHRcdGNvbnNvbGUubG9nKCdpbnZhbGlkIHByb2ogLT4gbm8gZXh0ZW50Jyk7XG5cdH1cblx0Z2V0Q3VzdG9tV01TU291cmNlKClcblx0e1xuXHRcdHZhciBjdXN0b21XTVNQYXRoID0gdGhpcy5zZXJ2aWNlUGF0aDtcblxuXHRcdGlmIChjdXN0b21XTVNQYXRoLnB1c2goXCJ3bXNVUkxcIikuZ2V0VHlwZSgpKSB7XG5cdFx0XHRsZXQgdXJsID0gY3VzdG9tV01TUGF0aC5nZXRTdGF0ZShcIndtc1VSTFwiKTtcblx0XHRcdGxldCBhdHRyaWJ1dGlvbnMgPSBjdXN0b21XTVNQYXRoLmdldFN0YXRlKFwiY3JlZGl0SW5mb1wiKTtcblx0XHRcdGxldCBwcm9qZWN0aW9uID0gY3VzdG9tV01TUGF0aC5nZXRTdGF0ZShcInRpbGVQcm9qZWN0aW9uU1JTXCIpO1xuXG5cdFx0XHRyZXR1cm4gbmV3IG9sLnNvdXJjZS5YWVooe1xuXHRcdFx0XHR1cmwsIGF0dHJpYnV0aW9ucywgcHJvamVjdGlvblxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0TW9kZXN0TWFwc1NvdXJjZSgpXG5cdHtcblx0XHR2YXIgcHJvdmlkZXJOYW1lUGF0aCA9IHRoaXMuc2VydmljZVBhdGgucHVzaChcInByb3ZpZGVyTmFtZVwiKTtcblxuXHRcdGlmIChwcm92aWRlck5hbWVQYXRoLmdldFR5cGUoKSkge1xuXHRcdFx0bGV0IHByb3ZpZGVyTmFtZSA9IHByb3ZpZGVyTmFtZVBhdGguZ2V0U3RhdGUoKTtcblxuXHRcdFx0aWYgKHByb3ZpZGVyTmFtZSA9PT0gdGhpcy5vbGRQcm92aWRlck5hbWUpIHtcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdH1cblxuXHRcdFx0c3dpdGNoIChwcm92aWRlck5hbWUpXG5cdFx0XHR7XG5cdFx0XHRcdGNhc2UgXCJTdGFtZW4gV2F0ZXJDb2xvclwiOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgb2wuc291cmNlLlN0YW1lbih7bGF5ZXI6IFwid2F0ZXJjb2xvclwifSk7XG5cdFx0XHRcdGNhc2UgXCJTdGFtZW4gVG9uZXJcIjpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IG9sLnNvdXJjZS5TdGFtZW4oe2xheWVyOiBcInRvbmVyXCJ9KTtcblx0XHRcdFx0Y2FzZSBcIk9wZW4gTWFwUXVlc3QgQWVyaWFsXCI6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBvbC5zb3VyY2UuTWFwUXVlc3Qoe2xheWVyOiBcInNhdFwifSk7XG5cdFx0XHRcdGNhc2UgXCJPcGVuIE1hcFF1ZXN0XCI6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBvbC5zb3VyY2UuTWFwUXVlc3Qoe2xheWVyOiBcIm9zbVwifSk7XG5cdFx0XHRcdGNhc2UgXCJPcGVuIFN0cmVldCBNYXBcIjpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IG9sLnNvdXJjZS5PU00oe3dyYXBYOiBmYWxzZX0pO1xuXHRcdFx0XHRjYXNlIFwiQmx1ZSBNYXJibGUgTWFwXCI6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBvbC5zb3VyY2UuVGlsZVdNUyh7dXJsOiBcImh0dHA6Ly9uZW93bXMuc2NpLmdzZmMubmFzYS5nb3Yvd21zL3dtc1wiLCB3cmFwWDogZmFsc2V9KTtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHR1cGRhdGVUaWxlU291cmNlKClcblx0e1xuXHRcdHZhciBzZXJ2aWNlRHJpdmVyTmFtZSA9IHRoaXMuc2VydmljZVBhdGguZ2V0VHlwZSgpO1xuXHRcdHZhciBuZXdMYXllciA9IG51bGw7XG5cdFx0c3dpdGNoIChzZXJ2aWNlRHJpdmVyTmFtZSlcblx0XHR7XG5cdFx0XHRjYXNlIFwid2VhdmUuc2VydmljZXMud21zOjpNb2Rlc3RNYXBzV01TXCI6XG5cdFx0XHRcdG5ld0xheWVyID0gdGhpcy5nZXRNb2Rlc3RNYXBzU291cmNlKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIndlYXZlLnNlcnZpY2VzLndtczo6Q3VzdG9tV01TXCI6XG5cdFx0XHRcdG5ld0xheWVyID0gdGhpcy5nZXRDdXN0b21XTVNTb3VyY2UoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRuZXdMYXllciA9IG51bGw7XG5cdFx0fVxuXG5cdFx0aWYgKG5ld0xheWVyICE9PSB1bmRlZmluZWQpXG5cdFx0e1xuXHRcdFx0dGhpcy5zb3VyY2UgPSBuZXdMYXllcjtcblx0XHR9XG5cdH1cbn1cblxuTGF5ZXIucmVnaXN0ZXJDbGFzcyhcIndlYXZlLnZpc3VhbGl6YXRpb24ucGxvdHRlcnM6OldNU1Bsb3R0ZXJcIiwgVGlsZUxheWVyLCBbd2VhdmVqcy5hcGkuY29yZS5JTGlua2FibGVPYmplY3RXaXRoTmV3UHJvcGVydGllc10pO1xuZXhwb3J0IGRlZmF1bHQgVGlsZUxheWVyO1xuXG5cbiJdfQ==
