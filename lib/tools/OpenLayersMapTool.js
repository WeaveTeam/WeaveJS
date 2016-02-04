"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _openlayers = require("openlayers");

var ol = _interopRequireWildcard(_openlayers);

var _lodash = require("lodash");

var lodash = _interopRequireWildcard(_lodash);

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

var _WeaveTool = require("../WeaveTool");

var _Layer = require("./OpenLayersMap/Layers/Layer");

var _Layer2 = _interopRequireDefault(_Layer);

var _GeometryLayer = require("./OpenLayersMap/Layers/GeometryLayer");

var _GeometryLayer2 = _interopRequireDefault(_GeometryLayer);

var _TileLayer = require("./OpenLayersMap/Layers/TileLayer");

var _TileLayer2 = _interopRequireDefault(_TileLayer);

var _ImageGlyphLayer = require("./OpenLayersMap/Layers/ImageGlyphLayer");

var _ImageGlyphLayer2 = _interopRequireDefault(_ImageGlyphLayer);

var _ScatterPlotLayer = require("./OpenLayersMap/Layers/ScatterPlotLayer");

var _ScatterPlotLayer2 = _interopRequireDefault(_ScatterPlotLayer);

var _LabelLayer = require("./OpenLayersMap/Layers/LabelLayer");

var _LabelLayer2 = _interopRequireDefault(_LabelLayer);

var _PanCluster = require("./OpenLayersMap/PanCluster");

var _PanCluster2 = _interopRequireDefault(_PanCluster);

var _InteractionModeCluster = require("./OpenLayersMap/InteractionModeCluster");

var _InteractionModeCluster2 = _interopRequireDefault(_InteractionModeCluster);

var _ProbeInteraction = require("./OpenLayersMap/ProbeInteraction");

var _ProbeInteraction2 = _interopRequireDefault(_ProbeInteraction);

var _DragSelection = require("./OpenLayersMap/DragSelection");

var _DragSelection2 = _interopRequireDefault(_DragSelection);

var _CustomZoomToExtent = require("./OpenLayersMap/CustomZoomToExtent");

var _CustomZoomToExtent2 = _interopRequireDefault(_CustomZoomToExtent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../typings/jquery/jquery.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>

var WeaveOpenLayersMap = function (_React$Component) {
    _inherits(WeaveOpenLayersMap, _React$Component);

    function WeaveOpenLayersMap(props) {
        _classCallCheck(this, WeaveOpenLayersMap);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WeaveOpenLayersMap).call(this, props));

        _GeometryLayer2.default;
        _TileLayer2.default;
        _ImageGlyphLayer2.default;
        _ScatterPlotLayer2.default;
        _LabelLayer2.default; /* Forces the inclusion of the layers. */
        _this.layers = new Map();
        _this.toolPath = props.toolPath;
        return _this;
    }

    _createClass(WeaveOpenLayersMap, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            this.map = new ol.Map({
                interactions: ol.interaction.defaults({ dragPan: false }),
                controls: [],
                target: this.element
            });
            /* Setup custom interactions */
            this.interactionModePath = this.toolPath.weave.path("WeaveProperties", "toolInteractions", "defaultDragMode");
            var dragPan = new ol.interaction.DragPan();
            var dragSelect = new _DragSelection2.default();
            var probeInteraction = new _ProbeInteraction2.default(this);
            var dragZoom = new ol.interaction.DragZoom({ condition: ol.events.condition.always });
            this.map.addInteraction(dragPan);
            this.map.addInteraction(dragSelect);
            this.map.addInteraction(probeInteraction);
            this.map.addInteraction(dragZoom);
            this.interactionModePath.addCallback(this, function () {
                var interactionMode = _this2.interactionModePath.getState() || "select";
                dragPan.setActive(interactionMode === "pan");
                dragSelect.setActive(interactionMode === "select");
                dragZoom.setActive(interactionMode === "zoom");
            }, true);
            /* Setup custom controls */
            this.zoomButtons = new ol.control.Zoom();
            this.slider = new ol.control.ZoomSlider();
            this.pan = new _PanCluster2.default();
            this.zoomExtent = new _CustomZoomToExtent2.default({ label: (0, _jquery2.default)("<span>").addClass("fa fa-arrows-alt").css({ "font-weight": "normal" })[0] });
            (0, _jquery2.default)(this.element).find("canvas.ol-unselectable").attr("tabIndex", 1024); /* Hack to make the canvas focusable. */
            this.map.addControl(this.zoomButtons);
            this.toolPath.push("showZoomControls").addCallback(this, this.updateEnableZoomControl_weaveToOl, true);
            this.toolPath.push("showMouseModeControls").addCallback(this, this.updateEnableMouseModeControl_weaveToOl, true);
            this.mouseModeButtons = new _InteractionModeCluster2.default({ interactionModePath: this.interactionModePath });
            this.plotManager = this.toolPath.push("children", "visualization", "plotManager");
            /* Todo replace override[X,Y][Min,Max] with a single overrideZoomBounds element; alternatively,
             * make a set of parameters on zoombounds itself. */
            var _arr = ["Min", "Max"];
            for (var _i = 0; _i < _arr.length; _i++) {
                var extreme = _arr[_i];var _arr2 = ["X", "Y"];

                for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
                    var axis = _arr2[_i2];
                    this.plotManager.push("override" + axis + extreme).addCallback(this, this.updateViewParameters_weaveToOl);
                }
            }this.toolPath.push("projectionSRS").addCallback(this, this.updateViewParameters_weaveToOl, true);
            this.plottersPath = this.plotManager.push("plotters");
            this.layerSettingsPath = this.plotManager.push("layerSettings");
            this.zoomBoundsPath = this.plotManager.push("zoomBounds");
            this.plotManager.addCallback(this, this.requestDetail, true);
            this.plottersPath.getObject().childListCallbacks.addImmediateCallback(this, this.updatePlotters_weaveToOl, true);
            this.zoomBoundsPath.addCallback(this, this.updateZoomAndCenter_weaveToOl, true);
        }
    }, {
        key: "updateViewParameters_weaveToOl",
        value: function updateViewParameters_weaveToOl() {
            var extent = [];
            var _arr3 = ["Min", "Max"];
            for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
                var extreme = _arr3[_i3];var _arr4 = ["X", "Y"];

                for (var _i4 = 0; _i4 < _arr4.length; _i4++) {
                    var axis = _arr4[_i4];
                    extent.push(this.plotManager.push("override" + axis + extreme).getState());
                }
            }if (!lodash.every(extent, Number.isFinite)) {
                extent = undefined;
            }
            var projection = this.toolPath.push("projectionSRS").getState() || "EPSG:3857";
            var view = new ol.View({ projection: projection, extent: extent });
            view.set("extent", extent);
            this.centerCallbackHandle = view.on("change:center", this.updateCenter_olToWeave, this);
            this.resolutionCallbackHandle = view.on("change:resolution", this.updateZoom_olToWeave, this);
            this.map.setView(view);
            this.updateZoomAndCenter_weaveToOl();
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            this.map.updateSize();
            var viewport = this.map.getViewport();
            var screenBounds = new weavejs.geom.Bounds2D(0, 0, viewport.clientWidth, viewport.clientHeight);
            this.zoomBoundsPath.getObject().setScreenBounds(screenBounds, true);
        }
    }, {
        key: "updateControlPositions",
        value: function updateControlPositions() {
            if (this.toolPath.push("showZoomControls").getState()) {
                (0, _jquery2.default)(this.element).find(".ol-control.panCluster").css({ top: "0.5em", left: "0.5em" });
                (0, _jquery2.default)(this.element).find(".ol-control.ol-zoom").css({ top: "5.5em", left: "2.075em" });
                (0, _jquery2.default)(this.element).find(".ol-control.ol-zoomslider").css({ top: "9.25em", left: "2.075em" });
                (0, _jquery2.default)(this.element).find(".ol-control.iModeCluster").css({ top: "20.75em", left: "0.6em" });
            } else {
                (0, _jquery2.default)(this.element).find(".ol-control.ol-zoom-extent").css({ top: "0.5em", left: "0.5em" });
                (0, _jquery2.default)(this.element).find(".ol-control.ol-zoom").css({ top: "2.625em", left: "0.5em" });
                (0, _jquery2.default)(this.element).find(".ol-control.iModeCluster").css({ top: "5.6em", left: "0.5em" });
            }
        }
    }, {
        key: "updateEnableMouseModeControl_weaveToOl",
        value: function updateEnableMouseModeControl_weaveToOl() {
            var showMouseModeControls = this.toolPath.push("showMouseModeControls").getState();
            if (showMouseModeControls) {
                this.map.addControl(this.mouseModeButtons);
            } else {
                this.map.removeControl(this.mouseModeButtons);
            }
            this.updateControlPositions();
        }
    }, {
        key: "updateEnableZoomControl_weaveToOl",
        value: function updateEnableZoomControl_weaveToOl() {
            var showZoomControls = this.toolPath.push("showZoomControls").getState();
            if (showZoomControls) {
                this.map.addControl(this.slider);
                this.map.addControl(this.pan);
                this.map.removeControl(this.zoomExtent);
            } else {
                this.map.removeControl(this.slider);
                this.map.removeControl(this.pan);
                this.map.addControl(this.zoomExtent);
            }
            this.updateControlPositions();
        }
    }, {
        key: "updateCenter_olToWeave",
        value: function updateCenter_olToWeave() {
            var _map$getView$getCente = this.map.getView().getCenter();

            var _map$getView$getCente2 = _slicedToArray(_map$getView$getCente, 2);

            var xCenter = _map$getView$getCente2[0];
            var yCenter = _map$getView$getCente2[1];

            var zoomBounds = this.zoomBoundsPath.getObject();
            var dataBounds = new weavejs.geom.Bounds2D();
            zoomBounds.getDataBounds(dataBounds);
            dataBounds.setXCenter(xCenter);
            dataBounds.setYCenter(yCenter);
            zoomBounds.setDataBounds(dataBounds);
        }
    }, {
        key: "updateZoom_olToWeave",
        value: function updateZoom_olToWeave() {
            var view = this.map.getView();
            var resolution = view.getResolution();
            /* If the resolution is being set between constrained levels,
             * odds are good that this is the result of a slider manipulation.
             * While the user is dragging the slider, we shouldn't update the
             * session state, because this will trigger reconstraining the
             * resolution, which will lead to it feeling "jerky" */
            if (resolution != view.constrainResolution(resolution)) {
                return;
            }
            var zoomBounds = this.zoomBoundsPath.getObject();
            var dataBounds = new weavejs.geom.Bounds2D();
            var screenBounds = new weavejs.geom.Bounds2D();
            zoomBounds.getDataBounds(dataBounds);
            zoomBounds.getScreenBounds(screenBounds);
            dataBounds.setWidth(screenBounds.getWidth() * resolution);
            dataBounds.setHeight(screenBounds.getHeight() * resolution);
            dataBounds.makeSizePositive();
            zoomBounds.setDataBounds(dataBounds);
        }
    }, {
        key: "updateZoomAndCenter_weaveToOl",
        value: function updateZoomAndCenter_weaveToOl() {
            var _this3 = this;

            var zoomBounds = this.zoomBoundsPath.getObject();
            var dataBounds = new weavejs.geom.Bounds2D();
            zoomBounds.getDataBounds(dataBounds);
            var center = [dataBounds.getXCenter(), dataBounds.getYCenter()];
            var scale = zoomBounds.getXScale();
            var view = this.map.getView();
            view.un("change:center", this.updateCenter_olToWeave, this);
            view.un("change:resolution", this.updateZoom_olToWeave, this);
            view.setCenter(center);
            view.setResolution(view.constrainResolution(1 / scale));
            lodash.defer(function () {
                view.on("change:center", _this3.updateCenter_olToWeave, _this3);
                view.on("change:resolution", _this3.updateZoom_olToWeave, _this3);
            });
        }
    }, {
        key: "requestDetail",
        value: function requestDetail() {
            var zoomBounds = this.zoomBoundsPath.getObject();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.plottersPath.getNames()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var name = _step.value;

                    var layer = this.layers.get(name);
                    if (!layer) continue;
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = Weave.getDescendants(this.plottersPath.getObject(name), weavejs.data.column.StreamedGeometryColumn)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var sgc = _step2.value;

                            if (layer.inputProjection == layer.outputProjection) {
                                weavejs.data.column.StreamedGeometryColumn.metadataRequestMode = 'xyz';
                                sgc.requestGeometryDetailForZoomBounds(zoomBounds);
                            } else {
                                //TODO - don't request everything when reprojecting
                                weavejs.data.column.StreamedGeometryColumn.metadataRequestMode = 'all';
                                sgc.requestGeometryDetail(sgc.collectiveBounds, 0);
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
    }, {
        key: "updatePlotters_weaveToOl",
        value: function updatePlotters_weaveToOl() {
            var oldNames = Array.from(this.layers.keys());
            var newNames = this.plottersPath.getNames();
            var removedNames = lodash.difference(oldNames, newNames);
            var addedNames = lodash.difference(newNames, oldNames);
            removedNames.forEach(function (name) {
                if (this.layers.get(name)) {
                    this.layers.get(name).dispose();
                }
                this.layers.delete(name);
            }, this);
            addedNames.forEach(function (name) {
                var layer = _Layer2.default.newLayer(this, name);
                this.layers.set(name, layer);
            }, this);
            /* */
            for (var idx in newNames) {
                var layer = this.layers.get(newNames[idx]);
                if (!layer || !layer.olLayer) {
                    continue;
                }
                layer.olLayer.setZIndex(idx + 2);
            }
        }
    }, {
        key: "destroy",
        value: function destroy() {}
    }, {
        key: "render",
        value: function render() {
            var _this4 = this;

            return React.createElement("div", { ref: function ref(c) {
                    _this4.element = c;
                }, style: { width: "100%", height: "100%" } });
        }
    }]);

    return WeaveOpenLayersMap;
}(React.Component);

exports.default = WeaveOpenLayersMap;

(0, _WeaveTool.registerToolImplementation)("weave.visualization.tools::MapTool", WeaveOpenLayersMap);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlbkxheWVyc01hcFRvb2wuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjdHMvdG9vbHMvT3BlbkxheWVyc01hcFRvb2wudHN4Il0sIm5hbWVzIjpbIldlYXZlT3BlbkxheWVyc01hcCIsIldlYXZlT3BlbkxheWVyc01hcC5jb25zdHJ1Y3RvciIsIldlYXZlT3BlbkxheWVyc01hcC5oYW5kbGVNaXNzaW5nU2Vzc2lvblN0YXRlUHJvcGVydGllcyIsIldlYXZlT3BlbkxheWVyc01hcC5jb21wb25lbnREaWRNb3VudCIsIldlYXZlT3BlbkxheWVyc01hcC51cGRhdGVWaWV3UGFyYW1ldGVyc193ZWF2ZVRvT2wiLCJXZWF2ZU9wZW5MYXllcnNNYXAuY29tcG9uZW50RGlkVXBkYXRlIiwiV2VhdmVPcGVuTGF5ZXJzTWFwLnVwZGF0ZUNvbnRyb2xQb3NpdGlvbnMiLCJXZWF2ZU9wZW5MYXllcnNNYXAudXBkYXRlRW5hYmxlTW91c2VNb2RlQ29udHJvbF93ZWF2ZVRvT2wiLCJXZWF2ZU9wZW5MYXllcnNNYXAudXBkYXRlRW5hYmxlWm9vbUNvbnRyb2xfd2VhdmVUb09sIiwiV2VhdmVPcGVuTGF5ZXJzTWFwLnVwZGF0ZUNlbnRlcl9vbFRvV2VhdmUiLCJXZWF2ZU9wZW5MYXllcnNNYXAudXBkYXRlWm9vbV9vbFRvV2VhdmUiLCJXZWF2ZU9wZW5MYXllcnNNYXAudXBkYXRlWm9vbUFuZENlbnRlcl93ZWF2ZVRvT2wiLCJXZWF2ZU9wZW5MYXllcnNNYXAucmVxdWVzdERldGFpbCIsIldlYXZlT3BlbkxheWVyc01hcC51cGRhdGVQbG90dGVyc193ZWF2ZVRvT2wiLCJXZWF2ZU9wZW5MYXllcnNNYXAuZGVzdHJveSIsIldlYXZlT3BlbkxheWVyc01hcC5yZW5kZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQU9ZLEFBQUUsQUFBTSxBQUFZLEFBQ3pCOzs7O0lBQUssQUFBTSxBQUFNLEFBQVEsQUFDekI7Ozs7SUFBSyxBQUFLLEFBQU0sQUFB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LFNBQUksQ0FBQyxBQUFLLE1BQUMsQUFBTyxBQUFDO0FBQzVCLEFBQVEsQUFBQyxBQUNWLEFBQUMsNkJBRjZCLEFBQUM7O0FBSS9CLEFBQUssc0JBQUMsQUFBTyxRQUFDLEFBQVMsVUFBQyxBQUFHLE1BQUcsQUFBQyxBQUFDLEFBQUMsQUFDbEMsQUFBQyxBQUNGLEFBQUMsQUFFRCxBQUFPO2FBWk4sQUFBRyxBQUFDOzs7O2tDQWVMLEFBQUMsQUFFRCxBQUFNOzs7Ozs7QUFDQyxBQUFNLG1CQUFDLEFBQUMsQUFBRyw2QkFBQyxBQUFHLEFBQUMsa0JBQUUsQUFBYTtBQUFNLEFBQUksMkJBQUMsQUFBTyxVQUFHLEFBQUMsQUFBQyxBQUFDLEFBQUM7aUJBQXZDLEVBQXdDLEFBQUssQUFBQyxPQUFDLEVBQUMsQUFBSyxPQUFFLEFBQU0sUUFBRSxBQUFNLFFBQUUsQUFBTSxBQUFDLEFBQUMsQUFBRSxBQUFDLEFBQ3ZHLEFBQUMsQUFDTCxBQUFDLEFBRUQ7Ozs7O0VBdFRpQyxBQUFLLE1BQUMsQUFBUzs7a0JBc1RqQyxBQUFrQixBQUFDOztBQUVsQyxBQUEwQiwyQ0FBQyxBQUFvQyxzQ0FBRSxBQUFrQixBQUFDLEFBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3Mvb3BlbmxheWVycy9vcGVubGF5ZXJzLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2pxdWVyeS9qcXVlcnkuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3Mvd2VhdmUvd2VhdmVqcy5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvcmVhY3QvcmVhY3QuZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0L3JlYWN0LWRvbS5kLnRzXCIvPlxuXG5pbXBvcnQgKiBhcyBvbCBmcm9tIFwib3BlbmxheWVyc1wiO1xuaW1wb3J0ICogYXMgbG9kYXNoIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0ICogYXMgUmVhY3RET00gZnJvbSBcInJlYWN0LWRvbVwiO1xuaW1wb3J0IGpxdWVyeSBmcm9tIFwianF1ZXJ5XCI7XG5cbmltcG9ydCB7SVZpc1Rvb2wsIElWaXNUb29sUHJvcHMsIElWaXNUb29sU3RhdGV9IGZyb20gXCIuL0lWaXNUb29sXCI7XG5pbXBvcnQge3JlZ2lzdGVyVG9vbEltcGxlbWVudGF0aW9ufSBmcm9tIFwiLi4vV2VhdmVUb29sXCI7XG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuaW1wb3J0IExheWVyIGZyb20gXCIuL09wZW5MYXllcnNNYXAvTGF5ZXJzL0xheWVyXCI7XG5pbXBvcnQgRmVhdHVyZUxheWVyIGZyb20gXCIuL09wZW5MYXllcnNNYXAvTGF5ZXJzL0ZlYXR1cmVMYXllclwiO1xuaW1wb3J0IEdlb21ldHJ5TGF5ZXIgZnJvbSBcIi4vT3BlbkxheWVyc01hcC9MYXllcnMvR2VvbWV0cnlMYXllclwiO1xuaW1wb3J0IFRpbGVMYXllciBmcm9tIFwiLi9PcGVuTGF5ZXJzTWFwL0xheWVycy9UaWxlTGF5ZXJcIjtcbmltcG9ydCBJbWFnZUdseXBoTGF5ZXIgZnJvbSBcIi4vT3BlbkxheWVyc01hcC9MYXllcnMvSW1hZ2VHbHlwaExheWVyXCI7XG5pbXBvcnQgU2NhdHRlclBsb3RMYXllciBmcm9tIFwiLi9PcGVuTGF5ZXJzTWFwL0xheWVycy9TY2F0dGVyUGxvdExheWVyXCI7XG5pbXBvcnQgTGFiZWxMYXllciBmcm9tIFwiLi9PcGVuTGF5ZXJzTWFwL0xheWVycy9MYWJlbExheWVyXCI7XG4vKiBlc2xpbnQtZW5hYmxlICovXG5cbmltcG9ydCBQYW5DbHVzdGVyIGZyb20gXCIuL09wZW5MYXllcnNNYXAvUGFuQ2x1c3RlclwiO1xuaW1wb3J0IEludGVyYWN0aW9uTW9kZUNsdXN0ZXIgZnJvbSBcIi4vT3BlbkxheWVyc01hcC9JbnRlcmFjdGlvbk1vZGVDbHVzdGVyXCI7XG5pbXBvcnQgUHJvYmVJbnRlcmFjdGlvbiBmcm9tIFwiLi9PcGVuTGF5ZXJzTWFwL1Byb2JlSW50ZXJhY3Rpb25cIjtcbmltcG9ydCBEcmFnU2VsZWN0aW9uIGZyb20gXCIuL09wZW5MYXllcnNNYXAvRHJhZ1NlbGVjdGlvblwiO1xuaW1wb3J0IEN1c3RvbVpvb21Ub0V4dGVudCBmcm9tIFwiLi9PcGVuTGF5ZXJzTWFwL0N1c3RvbVpvb21Ub0V4dGVudFwiO1xuLyogZ2xvYmFsIFdlYXZlLCB3ZWF2ZWpzICovXG5cbmRlY2xhcmUgdmFyIFdlYXZlOmFueTtcbmRlY2xhcmUgdmFyIHdlYXZlanM6YW55O1xuXG5jbGFzcyBXZWF2ZU9wZW5MYXllcnNNYXAgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVZpc1Rvb2xQcm9wcywgSVZpc1Rvb2xTdGF0ZT4ge1xuXG5cdGxheWVyczpNYXA8c3RyaW5nLExheWVyPjtcblx0aW50ZXJhY3Rpb25Nb2RlUGF0aDpXZWF2ZVBhdGg7XG5cdG1hcDpvbC5NYXA7XG5cdHpvb21CdXR0b25zOm9sLmNvbnRyb2wuWm9vbTtcblx0c2xpZGVyOm9sLmNvbnRyb2wuWm9vbVNsaWRlcjtcblx0em9vbUV4dGVudDogb2wuY29udHJvbC5ab29tVG9FeHRlbnQ7XG5cdHBhbjpQYW5DbHVzdGVyO1xuXHRtb3VzZU1vZGVCdXR0b25zOkludGVyYWN0aW9uTW9kZUNsdXN0ZXI7XG5cdHBsb3RNYW5hZ2VyOldlYXZlUGF0aDtcblx0cGxvdHRlcnNQYXRoOldlYXZlUGF0aDtcblx0bGF5ZXJTZXR0aW5nc1BhdGg6V2VhdmVQYXRoO1xuXHR6b29tQm91bmRzUGF0aDpXZWF2ZVBhdGg7XG5cblx0Y2VudGVyQ2FsbGJhY2tIYW5kbGU6YW55O1xuXHRyZXNvbHV0aW9uQ2FsbGJhY2tIYW5kbGU6YW55O1xuXHRwcml2YXRlIGVsZW1lbnQ6RWxlbWVudDtcblx0cHVibGljIHRvb2xQYXRoOldlYXZlUGF0aDtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wcylcblx0e1xuXHRcdHN1cGVyKHByb3BzKTtcblx0XHRHZW9tZXRyeUxheWVyOyBUaWxlTGF5ZXI7IEltYWdlR2x5cGhMYXllcjsgU2NhdHRlclBsb3RMYXllcjsgTGFiZWxMYXllcjsvKiBGb3JjZXMgdGhlIGluY2x1c2lvbiBvZiB0aGUgbGF5ZXJzLiAqL1xuXHRcdHRoaXMubGF5ZXJzID0gbmV3IE1hcDxzdHJpbmcsTGF5ZXI+KCk7XG5cdFx0dGhpcy50b29sUGF0aCA9IHByb3BzLnRvb2xQYXRoO1xuXHR9XG5cblx0aGFuZGxlTWlzc2luZ1Nlc3Npb25TdGF0ZVByb3BlcnRpZXMobmV3U3RhdGUpOnZvaWRcblx0e1xuXG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpOnZvaWRcblx0e1xuXHRcdHRoaXMubWFwID0gbmV3IG9sLk1hcCh7XG5cdFx0XHRpbnRlcmFjdGlvbnM6IG9sLmludGVyYWN0aW9uLmRlZmF1bHRzKHsgZHJhZ1BhbjogZmFsc2UgfSksXG5cdFx0XHRjb250cm9sczogW10sXG5cdFx0XHR0YXJnZXQ6IHRoaXMuZWxlbWVudFxuXHRcdH0pO1xuXG5cdFx0LyogU2V0dXAgY3VzdG9tIGludGVyYWN0aW9ucyAqL1xuXG5cdFx0dGhpcy5pbnRlcmFjdGlvbk1vZGVQYXRoID0gdGhpcy50b29sUGF0aC53ZWF2ZS5wYXRoKFwiV2VhdmVQcm9wZXJ0aWVzXCIsIFwidG9vbEludGVyYWN0aW9uc1wiLCBcImRlZmF1bHREcmFnTW9kZVwiKTtcblxuXHRcdGxldCBkcmFnUGFuOiBvbC5pbnRlcmFjdGlvbi5EcmFnUGFuID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYWdQYW4oKTtcblx0XHRsZXQgZHJhZ1NlbGVjdDogRHJhZ1NlbGVjdGlvbiA9IG5ldyBEcmFnU2VsZWN0aW9uKCk7XG5cdFx0bGV0IHByb2JlSW50ZXJhY3Rpb246IFByb2JlSW50ZXJhY3Rpb24gPSBuZXcgUHJvYmVJbnRlcmFjdGlvbih0aGlzKTtcblx0XHRsZXQgZHJhZ1pvb206IG9sLmludGVyYWN0aW9uLkRyYWdab29tID0gbmV3IG9sLmludGVyYWN0aW9uLkRyYWdab29tKHsgY29uZGl0aW9uOiBvbC5ldmVudHMuY29uZGl0aW9uLmFsd2F5cyB9KTtcblxuXHRcdHRoaXMubWFwLmFkZEludGVyYWN0aW9uKGRyYWdQYW4pO1xuXHRcdHRoaXMubWFwLmFkZEludGVyYWN0aW9uKGRyYWdTZWxlY3QpO1xuXHRcdHRoaXMubWFwLmFkZEludGVyYWN0aW9uKHByb2JlSW50ZXJhY3Rpb24pO1xuXHRcdHRoaXMubWFwLmFkZEludGVyYWN0aW9uKGRyYWdab29tKTtcblxuXHRcdHRoaXMuaW50ZXJhY3Rpb25Nb2RlUGF0aC5hZGRDYWxsYmFjayh0aGlzLCAoKSA9PiB7XG5cdFx0XHRsZXQgaW50ZXJhY3Rpb25Nb2RlID0gdGhpcy5pbnRlcmFjdGlvbk1vZGVQYXRoLmdldFN0YXRlKCkgfHwgXCJzZWxlY3RcIjtcblx0XHRcdGRyYWdQYW4uc2V0QWN0aXZlKGludGVyYWN0aW9uTW9kZSA9PT0gXCJwYW5cIik7XG5cdFx0XHRkcmFnU2VsZWN0LnNldEFjdGl2ZShpbnRlcmFjdGlvbk1vZGUgPT09IFwic2VsZWN0XCIpO1xuXHRcdFx0ZHJhZ1pvb20uc2V0QWN0aXZlKGludGVyYWN0aW9uTW9kZSA9PT0gXCJ6b29tXCIpO1xuXHRcdH0sIHRydWUpO1xuXG5cdFx0LyogU2V0dXAgY3VzdG9tIGNvbnRyb2xzICovXG5cblx0XHR0aGlzLnpvb21CdXR0b25zID0gbmV3IG9sLmNvbnRyb2wuWm9vbSgpO1xuXHRcdHRoaXMuc2xpZGVyID0gbmV3IG9sLmNvbnRyb2wuWm9vbVNsaWRlcigpO1xuXHRcdHRoaXMucGFuID0gbmV3IFBhbkNsdXN0ZXIoKTtcblx0XHR0aGlzLnpvb21FeHRlbnQgPSBuZXcgQ3VzdG9tWm9vbVRvRXh0ZW50KHsgbGFiZWw6IGpxdWVyeShcIjxzcGFuPlwiKS5hZGRDbGFzcyhcImZhIGZhLWFycm93cy1hbHRcIikuY3NzKHsgXCJmb250LXdlaWdodFwiOiBcIm5vcm1hbFwiIH0pWzBdfSk7XG5cblx0XHRqcXVlcnkodGhpcy5lbGVtZW50KS5maW5kKFwiY2FudmFzLm9sLXVuc2VsZWN0YWJsZVwiKS5hdHRyKFwidGFiSW5kZXhcIiwgMTAyNCk7IC8qIEhhY2sgdG8gbWFrZSB0aGUgY2FudmFzIGZvY3VzYWJsZS4gKi9cblxuXHRcdHRoaXMubWFwLmFkZENvbnRyb2wodGhpcy56b29tQnV0dG9ucyk7XG5cblx0XHR0aGlzLnRvb2xQYXRoLnB1c2goXCJzaG93Wm9vbUNvbnRyb2xzXCIpLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMudXBkYXRlRW5hYmxlWm9vbUNvbnRyb2xfd2VhdmVUb09sLCB0cnVlKTtcblx0XHR0aGlzLnRvb2xQYXRoLnB1c2goXCJzaG93TW91c2VNb2RlQ29udHJvbHNcIikuYWRkQ2FsbGJhY2sodGhpcywgdGhpcy51cGRhdGVFbmFibGVNb3VzZU1vZGVDb250cm9sX3dlYXZlVG9PbCwgdHJ1ZSk7XG5cblx0XHR0aGlzLm1vdXNlTW9kZUJ1dHRvbnMgPSBuZXcgSW50ZXJhY3Rpb25Nb2RlQ2x1c3Rlcih7aW50ZXJhY3Rpb25Nb2RlUGF0aDogdGhpcy5pbnRlcmFjdGlvbk1vZGVQYXRofSk7XG5cblx0XHR0aGlzLnBsb3RNYW5hZ2VyID0gdGhpcy50b29sUGF0aC5wdXNoKFwiY2hpbGRyZW5cIiwgXCJ2aXN1YWxpemF0aW9uXCIsIFwicGxvdE1hbmFnZXJcIik7XG5cblx0XHQvKiBUb2RvIHJlcGxhY2Ugb3ZlcnJpZGVbWCxZXVtNaW4sTWF4XSB3aXRoIGEgc2luZ2xlIG92ZXJyaWRlWm9vbUJvdW5kcyBlbGVtZW50OyBhbHRlcm5hdGl2ZWx5LFxuXHRcdCAqIG1ha2UgYSBzZXQgb2YgcGFyYW1ldGVycyBvbiB6b29tYm91bmRzIGl0c2VsZi4gKi9cblxuXHRcdGZvciAobGV0IGV4dHJlbWUgb2YgW1wiTWluXCIsIFwiTWF4XCJdKVxuXHRcdFx0Zm9yIChsZXQgYXhpcyBvZiBbXCJYXCIsIFwiWVwiXSlcblx0XHRcdFx0dGhpcy5wbG90TWFuYWdlci5wdXNoKFwib3ZlcnJpZGVcIiArIGF4aXMgKyBleHRyZW1lKS5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLnVwZGF0ZVZpZXdQYXJhbWV0ZXJzX3dlYXZlVG9PbCk7XG5cblx0XHR0aGlzLnRvb2xQYXRoLnB1c2goXCJwcm9qZWN0aW9uU1JTXCIpLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMudXBkYXRlVmlld1BhcmFtZXRlcnNfd2VhdmVUb09sLCB0cnVlKTtcblxuXG5cdFx0dGhpcy5wbG90dGVyc1BhdGggPSB0aGlzLnBsb3RNYW5hZ2VyLnB1c2goXCJwbG90dGVyc1wiKTtcblx0XHR0aGlzLmxheWVyU2V0dGluZ3NQYXRoID0gdGhpcy5wbG90TWFuYWdlci5wdXNoKFwibGF5ZXJTZXR0aW5nc1wiKTtcblx0XHR0aGlzLnpvb21Cb3VuZHNQYXRoID0gdGhpcy5wbG90TWFuYWdlci5wdXNoKFwiem9vbUJvdW5kc1wiKTtcblxuXHRcdHRoaXMucGxvdE1hbmFnZXIuYWRkQ2FsbGJhY2sodGhpcywgdGhpcy5yZXF1ZXN0RGV0YWlsLCB0cnVlKTtcblx0XHR0aGlzLnBsb3R0ZXJzUGF0aC5nZXRPYmplY3QoKS5jaGlsZExpc3RDYWxsYmFja3MuYWRkSW1tZWRpYXRlQ2FsbGJhY2sodGhpcywgdGhpcy51cGRhdGVQbG90dGVyc193ZWF2ZVRvT2wsIHRydWUpO1xuXHRcdHRoaXMuem9vbUJvdW5kc1BhdGguYWRkQ2FsbGJhY2sodGhpcywgdGhpcy51cGRhdGVab29tQW5kQ2VudGVyX3dlYXZlVG9PbCwgdHJ1ZSk7XG5cdH1cblxuXHR1cGRhdGVWaWV3UGFyYW1ldGVyc193ZWF2ZVRvT2woKTp2b2lkXG5cdHtcblx0XHRsZXQgZXh0ZW50ID0gW107XG5cblx0XHRmb3IgKGxldCBleHRyZW1lIG9mIFtcIk1pblwiLCBcIk1heFwiXSlcblx0XHRcdGZvciAobGV0IGF4aXMgb2YgW1wiWFwiLCBcIllcIl0pXG5cdFx0XHRcdGV4dGVudC5wdXNoKHRoaXMucGxvdE1hbmFnZXIucHVzaChcIm92ZXJyaWRlXCIgKyBheGlzICsgZXh0cmVtZSkuZ2V0U3RhdGUoKSk7XG5cblx0XHRpZiAoIWxvZGFzaC5ldmVyeShleHRlbnQsIE51bWJlci5pc0Zpbml0ZSkpXG5cdFx0e1xuXHRcdFx0ZXh0ZW50ID0gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGxldCBwcm9qZWN0aW9uID0gdGhpcy50b29sUGF0aC5wdXNoKFwicHJvamVjdGlvblNSU1wiKS5nZXRTdGF0ZSgpIHx8IFwiRVBTRzozODU3XCI7XG5cdFx0bGV0IHZpZXcgPSBuZXcgb2wuVmlldyh7cHJvamVjdGlvbiwgZXh0ZW50fSk7XG5cdFx0dmlldy5zZXQoXCJleHRlbnRcIiwgZXh0ZW50KTtcblxuXHRcdHRoaXMuY2VudGVyQ2FsbGJhY2tIYW5kbGUgPSB2aWV3Lm9uKFwiY2hhbmdlOmNlbnRlclwiLCB0aGlzLnVwZGF0ZUNlbnRlcl9vbFRvV2VhdmUsIHRoaXMpO1xuXHRcdHRoaXMucmVzb2x1dGlvbkNhbGxiYWNrSGFuZGxlID0gdmlldy5vbihcImNoYW5nZTpyZXNvbHV0aW9uXCIsIHRoaXMudXBkYXRlWm9vbV9vbFRvV2VhdmUsIHRoaXMpO1xuXHRcdHRoaXMubWFwLnNldFZpZXcodmlldyk7XG5cblx0XHR0aGlzLnVwZGF0ZVpvb21BbmRDZW50ZXJfd2VhdmVUb09sKCk7XG5cdH1cblxuXHRjb21wb25lbnREaWRVcGRhdGUoKTp2b2lkXG5cdHtcblx0XHR0aGlzLm1hcC51cGRhdGVTaXplKCk7XG5cdFx0dmFyIHZpZXdwb3J0ID0gdGhpcy5tYXAuZ2V0Vmlld3BvcnQoKTtcblx0XHR2YXIgc2NyZWVuQm91bmRzID0gbmV3IHdlYXZlanMuZ2VvbS5Cb3VuZHMyRCgwLCAwLCB2aWV3cG9ydC5jbGllbnRXaWR0aCwgdmlld3BvcnQuY2xpZW50SGVpZ2h0KTtcblx0XHR0aGlzLnpvb21Cb3VuZHNQYXRoLmdldE9iamVjdCgpLnNldFNjcmVlbkJvdW5kcyhzY3JlZW5Cb3VuZHMsIHRydWUpO1xuXHR9XG5cblx0dXBkYXRlQ29udHJvbFBvc2l0aW9ucygpOnZvaWRcblx0e1xuXHRcdGlmICh0aGlzLnRvb2xQYXRoLnB1c2goXCJzaG93Wm9vbUNvbnRyb2xzXCIpLmdldFN0YXRlKCkpXG5cdFx0e1xuXHRcdFx0anF1ZXJ5KHRoaXMuZWxlbWVudCkuZmluZChcIi5vbC1jb250cm9sLnBhbkNsdXN0ZXJcIikuY3NzKHt0b3A6IFwiMC41ZW1cIiwgbGVmdDogXCIwLjVlbVwifSk7XG5cdFx0XHRqcXVlcnkodGhpcy5lbGVtZW50KS5maW5kKFwiLm9sLWNvbnRyb2wub2wtem9vbVwiKS5jc3Moe3RvcDogXCI1LjVlbVwiLCBsZWZ0OiBcIjIuMDc1ZW1cIn0pO1xuXHRcdFx0anF1ZXJ5KHRoaXMuZWxlbWVudCkuZmluZChcIi5vbC1jb250cm9sLm9sLXpvb21zbGlkZXJcIikuY3NzKHt0b3A6IFwiOS4yNWVtXCIsIGxlZnQ6IFwiMi4wNzVlbVwifSk7XG5cdFx0XHRqcXVlcnkodGhpcy5lbGVtZW50KS5maW5kKFwiLm9sLWNvbnRyb2wuaU1vZGVDbHVzdGVyXCIpLmNzcyh7dG9wOiBcIjIwLjc1ZW1cIiwgbGVmdDogXCIwLjZlbVwifSk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRqcXVlcnkodGhpcy5lbGVtZW50KS5maW5kKFwiLm9sLWNvbnRyb2wub2wtem9vbS1leHRlbnRcIikuY3NzKHt0b3A6IFwiMC41ZW1cIiwgbGVmdDogXCIwLjVlbVwifSk7XG5cdFx0XHRqcXVlcnkodGhpcy5lbGVtZW50KS5maW5kKFwiLm9sLWNvbnRyb2wub2wtem9vbVwiKS5jc3MoeyB0b3A6IFwiMi42MjVlbVwiLCBsZWZ0OiBcIjAuNWVtXCIgfSk7XG5cdFx0XHRqcXVlcnkodGhpcy5lbGVtZW50KS5maW5kKFwiLm9sLWNvbnRyb2wuaU1vZGVDbHVzdGVyXCIpLmNzcyh7IHRvcDogXCI1LjZlbVwiLCBsZWZ0OiBcIjAuNWVtXCIgfSk7XG5cdFx0fVxuXHR9XG5cblxuXHR1cGRhdGVFbmFibGVNb3VzZU1vZGVDb250cm9sX3dlYXZlVG9PbCgpOnZvaWRcblx0e1xuXHRcdGxldCBzaG93TW91c2VNb2RlQ29udHJvbHMgPSB0aGlzLnRvb2xQYXRoLnB1c2goXCJzaG93TW91c2VNb2RlQ29udHJvbHNcIikuZ2V0U3RhdGUoKTtcblx0XHRpZiAoc2hvd01vdXNlTW9kZUNvbnRyb2xzKVxuXHRcdHtcblx0XHRcdHRoaXMubWFwLmFkZENvbnRyb2wodGhpcy5tb3VzZU1vZGVCdXR0b25zKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHRoaXMubWFwLnJlbW92ZUNvbnRyb2wodGhpcy5tb3VzZU1vZGVCdXR0b25zKTtcblx0XHR9XG5cdFx0dGhpcy51cGRhdGVDb250cm9sUG9zaXRpb25zKCk7XG5cdH1cblxuXG5cdHVwZGF0ZUVuYWJsZVpvb21Db250cm9sX3dlYXZlVG9PbCgpOnZvaWRcblx0e1xuXHRcdGxldCBzaG93Wm9vbUNvbnRyb2xzID0gdGhpcy50b29sUGF0aC5wdXNoKFwic2hvd1pvb21Db250cm9sc1wiKS5nZXRTdGF0ZSgpO1xuXHRcdGlmIChzaG93Wm9vbUNvbnRyb2xzKVxuXHRcdHtcblx0XHRcdHRoaXMubWFwLmFkZENvbnRyb2wodGhpcy5zbGlkZXIpO1xuXHRcdFx0dGhpcy5tYXAuYWRkQ29udHJvbCh0aGlzLnBhbik7XG5cdFx0XHR0aGlzLm1hcC5yZW1vdmVDb250cm9sKHRoaXMuem9vbUV4dGVudCk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aGlzLm1hcC5yZW1vdmVDb250cm9sKHRoaXMuc2xpZGVyKTtcblx0XHRcdHRoaXMubWFwLnJlbW92ZUNvbnRyb2wodGhpcy5wYW4pO1xuXHRcdFx0dGhpcy5tYXAuYWRkQ29udHJvbCh0aGlzLnpvb21FeHRlbnQpO1xuXHRcdH1cblx0XHR0aGlzLnVwZGF0ZUNvbnRyb2xQb3NpdGlvbnMoKTtcblx0fVxuXG5cdHVwZGF0ZUNlbnRlcl9vbFRvV2VhdmUoKTp2b2lkXG5cdHtcblx0XHR2YXIgW3hDZW50ZXIsIHlDZW50ZXJdID0gdGhpcy5tYXAuZ2V0VmlldygpLmdldENlbnRlcigpO1xuXG5cdFx0dmFyIHpvb21Cb3VuZHMgPSB0aGlzLnpvb21Cb3VuZHNQYXRoLmdldE9iamVjdCgpO1xuXG5cdFx0dmFyIGRhdGFCb3VuZHMgPSBuZXcgd2VhdmVqcy5nZW9tLkJvdW5kczJEKCk7XG5cdFx0em9vbUJvdW5kcy5nZXREYXRhQm91bmRzKGRhdGFCb3VuZHMpO1xuXHRcdGRhdGFCb3VuZHMuc2V0WENlbnRlcih4Q2VudGVyKTtcblx0XHRkYXRhQm91bmRzLnNldFlDZW50ZXIoeUNlbnRlcik7XG5cdFx0em9vbUJvdW5kcy5zZXREYXRhQm91bmRzKGRhdGFCb3VuZHMpO1xuXHR9XG5cblx0dXBkYXRlWm9vbV9vbFRvV2VhdmUoKTp2b2lkXG5cdHtcblx0XHRsZXQgdmlldyA9IHRoaXMubWFwLmdldFZpZXcoKTtcblx0XHR2YXIgcmVzb2x1dGlvbiA9IHZpZXcuZ2V0UmVzb2x1dGlvbigpO1xuXG5cdFx0LyogSWYgdGhlIHJlc29sdXRpb24gaXMgYmVpbmcgc2V0IGJldHdlZW4gY29uc3RyYWluZWQgbGV2ZWxzLCBcblx0XHQgKiBvZGRzIGFyZSBnb29kIHRoYXQgdGhpcyBpcyB0aGUgcmVzdWx0IG9mIGEgc2xpZGVyIG1hbmlwdWxhdGlvbi5cblx0XHQgKiBXaGlsZSB0aGUgdXNlciBpcyBkcmFnZ2luZyB0aGUgc2xpZGVyLCB3ZSBzaG91bGRuJ3QgdXBkYXRlIHRoZVxuXHRcdCAqIHNlc3Npb24gc3RhdGUsIGJlY2F1c2UgdGhpcyB3aWxsIHRyaWdnZXIgcmVjb25zdHJhaW5pbmcgdGhlIFxuXHRcdCAqIHJlc29sdXRpb24sIHdoaWNoIHdpbGwgbGVhZCB0byBpdCBmZWVsaW5nIFwiamVya3lcIiAqL1xuXHRcdGlmIChyZXNvbHV0aW9uICE9IHZpZXcuY29uc3RyYWluUmVzb2x1dGlvbihyZXNvbHV0aW9uKSlcblx0XHR7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIHpvb21Cb3VuZHMgPSB0aGlzLnpvb21Cb3VuZHNQYXRoLmdldE9iamVjdCgpO1xuXG5cdFx0dmFyIGRhdGFCb3VuZHMgPSBuZXcgd2VhdmVqcy5nZW9tLkJvdW5kczJEKCk7XG5cdFx0dmFyIHNjcmVlbkJvdW5kcyA9IG5ldyB3ZWF2ZWpzLmdlb20uQm91bmRzMkQoKTtcblx0XHR6b29tQm91bmRzLmdldERhdGFCb3VuZHMoZGF0YUJvdW5kcyk7XG5cdFx0em9vbUJvdW5kcy5nZXRTY3JlZW5Cb3VuZHMoc2NyZWVuQm91bmRzKTtcblx0XHRkYXRhQm91bmRzLnNldFdpZHRoKHNjcmVlbkJvdW5kcy5nZXRXaWR0aCgpICogcmVzb2x1dGlvbik7XG5cdFx0ZGF0YUJvdW5kcy5zZXRIZWlnaHQoc2NyZWVuQm91bmRzLmdldEhlaWdodCgpICogcmVzb2x1dGlvbik7XG5cdFx0ZGF0YUJvdW5kcy5tYWtlU2l6ZVBvc2l0aXZlKCk7XG5cdFx0em9vbUJvdW5kcy5zZXREYXRhQm91bmRzKGRhdGFCb3VuZHMpO1xuXHR9XG5cblx0dXBkYXRlWm9vbUFuZENlbnRlcl93ZWF2ZVRvT2woKTp2b2lkXG5cdHtcblx0XHR2YXIgem9vbUJvdW5kcyA9IHRoaXMuem9vbUJvdW5kc1BhdGguZ2V0T2JqZWN0KCk7XG5cdFx0dmFyIGRhdGFCb3VuZHMgPSBuZXcgd2VhdmVqcy5nZW9tLkJvdW5kczJEKCk7XG5cdFx0em9vbUJvdW5kcy5nZXREYXRhQm91bmRzKGRhdGFCb3VuZHMpO1xuXHRcdHZhciBjZW50ZXIgPSBbZGF0YUJvdW5kcy5nZXRYQ2VudGVyKCksIGRhdGFCb3VuZHMuZ2V0WUNlbnRlcigpXTtcblx0XHR2YXIgc2NhbGUgPSB6b29tQm91bmRzLmdldFhTY2FsZSgpO1xuXHRcdGxldCB2aWV3ID0gdGhpcy5tYXAuZ2V0VmlldygpO1xuXHRcdFxuXHRcdHZpZXcudW4oXCJjaGFuZ2U6Y2VudGVyXCIsIHRoaXMudXBkYXRlQ2VudGVyX29sVG9XZWF2ZSwgdGhpcyk7XG5cdFx0dmlldy51bihcImNoYW5nZTpyZXNvbHV0aW9uXCIsIHRoaXMudXBkYXRlWm9vbV9vbFRvV2VhdmUsIHRoaXMpO1xuXG5cdFx0dmlldy5zZXRDZW50ZXIoY2VudGVyKTtcblx0XHR2aWV3LnNldFJlc29sdXRpb24odmlldy5jb25zdHJhaW5SZXNvbHV0aW9uKDEgLyBzY2FsZSkpO1xuXG5cdFx0bG9kYXNoLmRlZmVyKCgpID0+IHtcblx0XHRcdHZpZXcub24oXCJjaGFuZ2U6Y2VudGVyXCIsIHRoaXMudXBkYXRlQ2VudGVyX29sVG9XZWF2ZSwgdGhpcyk7XG5cdFx0XHR2aWV3Lm9uKFwiY2hhbmdlOnJlc29sdXRpb25cIiwgdGhpcy51cGRhdGVab29tX29sVG9XZWF2ZSwgdGhpcyk7XG5cdFx0fSk7XG5cdH1cblx0XG5cdHJlcXVlc3REZXRhaWwoKTp2b2lkXG5cdHtcblx0XHR2YXIgem9vbUJvdW5kcyA9IHRoaXMuem9vbUJvdW5kc1BhdGguZ2V0T2JqZWN0KCk7XG5cdFx0Zm9yICh2YXIgbmFtZSBvZiB0aGlzLnBsb3R0ZXJzUGF0aC5nZXROYW1lcygpKVxuXHRcdHtcblx0XHRcdHZhciBsYXllcjpMYXllciA9IHRoaXMubGF5ZXJzLmdldChuYW1lKTtcblx0XHRcdGlmICghbGF5ZXIpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0Zm9yICh2YXIgc2djIG9mIFdlYXZlLmdldERlc2NlbmRhbnRzKHRoaXMucGxvdHRlcnNQYXRoLmdldE9iamVjdChuYW1lKSwgd2VhdmVqcy5kYXRhLmNvbHVtbi5TdHJlYW1lZEdlb21ldHJ5Q29sdW1uKSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKGxheWVyLmlucHV0UHJvamVjdGlvbiA9PSBsYXllci5vdXRwdXRQcm9qZWN0aW9uKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0d2VhdmVqcy5kYXRhLmNvbHVtbi5TdHJlYW1lZEdlb21ldHJ5Q29sdW1uLm1ldGFkYXRhUmVxdWVzdE1vZGUgPSAneHl6Jztcblx0XHRcdFx0XHRzZ2MucmVxdWVzdEdlb21ldHJ5RGV0YWlsRm9yWm9vbUJvdW5kcyh6b29tQm91bmRzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvL1RPRE8gLSBkb24ndCByZXF1ZXN0IGV2ZXJ5dGhpbmcgd2hlbiByZXByb2plY3Rpbmdcblx0XHRcdFx0XHR3ZWF2ZWpzLmRhdGEuY29sdW1uLlN0cmVhbWVkR2VvbWV0cnlDb2x1bW4ubWV0YWRhdGFSZXF1ZXN0TW9kZSA9ICdhbGwnO1xuXHRcdFx0XHRcdHNnYy5yZXF1ZXN0R2VvbWV0cnlEZXRhaWwoc2djLmNvbGxlY3RpdmVCb3VuZHMsIDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0dXBkYXRlUGxvdHRlcnNfd2VhdmVUb09sKCk6dm9pZFxuXHR7XG5cdFx0dmFyIG9sZE5hbWVzID0gQXJyYXkuZnJvbSh0aGlzLmxheWVycy5rZXlzKCkpO1xuXHRcdHZhciBuZXdOYW1lcyA9IHRoaXMucGxvdHRlcnNQYXRoLmdldE5hbWVzKCk7XG5cblx0XHR2YXIgcmVtb3ZlZE5hbWVzID0gbG9kYXNoLmRpZmZlcmVuY2Uob2xkTmFtZXMsIG5ld05hbWVzKTtcblx0XHR2YXIgYWRkZWROYW1lcyA9IGxvZGFzaC5kaWZmZXJlbmNlKG5ld05hbWVzLCBvbGROYW1lcyk7XG5cblx0XHRyZW1vdmVkTmFtZXMuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuXHRcdFx0aWYgKHRoaXMubGF5ZXJzLmdldChuYW1lKSkge1xuXHRcdFx0XHR0aGlzLmxheWVycy5nZXQobmFtZSkuZGlzcG9zZSgpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5sYXllcnMuZGVsZXRlKG5hbWUpO1xuXHRcdH0sIHRoaXMpO1xuXG5cdFx0YWRkZWROYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG5cdFx0XHRsZXQgbGF5ZXI6TGF5ZXIgPSBMYXllci5uZXdMYXllcih0aGlzLCBuYW1lKTtcblx0XHRcdHRoaXMubGF5ZXJzLnNldChuYW1lLCBsYXllcik7XG5cdFx0fSwgdGhpcyk7XG5cdFx0LyogKi9cblx0XHRmb3IgKGxldCBpZHggaW4gbmV3TmFtZXMpXG5cdFx0e1xuXHRcdFx0bGV0IGxheWVyOkxheWVyID0gdGhpcy5sYXllcnMuZ2V0KG5ld05hbWVzW2lkeF0pO1xuXG5cdFx0XHRpZiAoIWxheWVyIHx8ICFsYXllci5vbExheWVyKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRsYXllci5vbExheWVyLnNldFpJbmRleChpZHggKyAyKTtcblx0XHR9XG5cdH1cblxuXHRkZXN0cm95KCk6dm9pZFxuXHR7XG5cblx0fVxuXG5cdHJlbmRlcigpOkpTWC5FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIDxkaXYgcmVmPXsoYzpIVE1MRWxlbWVudCkgPT4ge3RoaXMuZWxlbWVudCA9IGM7fX0gc3R5bGU9e3t3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogXCIxMDAlXCJ9fS8+O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2VhdmVPcGVuTGF5ZXJzTWFwO1xuXG5yZWdpc3RlclRvb2xJbXBsZW1lbnRhdGlvbihcIndlYXZlLnZpc3VhbGl6YXRpb24udG9vbHM6Ok1hcFRvb2xcIiwgV2VhdmVPcGVuTGF5ZXJzTWFwKTtcbiJdfQ==