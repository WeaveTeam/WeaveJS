import * as ol from "openlayers";
import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ReactUtils from "../utils/ReactUtils";
import MouseUtils from "../utils/MouseUtils";
import $ from "../modules/jquery";
import proj4 from "../modules/proj4";
import JSZip from "../modules/jszip";
import PrintUtils from "../utils/PrintUtils";

import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import AbstractLayer from "./OpenLayersMap/Layers/AbstractLayer";
import AbstractFeatureLayer from "./OpenLayersMap/Layers/AbstractFeatureLayer";
import GeometryLayer from "./OpenLayersMap/Layers/GeometryLayer";
import TileLayer from "./OpenLayersMap/Layers/TileLayer";
import ImageGlyphLayer from "./OpenLayersMap/Layers/ImageGlyphLayer";
import ScatterPlotLayer from "./OpenLayersMap/Layers/ScatterPlotLayer";
import LabelLayer from "./OpenLayersMap/Layers/LabelLayer";

import CustomView from "./OpenLayersMap/CustomView";
import PanCluster from "./OpenLayersMap/PanCluster";
import InteractionModeCluster from "./OpenLayersMap/InteractionModeCluster";
import ProbeInteraction from "./OpenLayersMap/ProbeInteraction";
import DragSelection from "./OpenLayersMap/DragSelection";
import CustomDragZoom from "./OpenLayersMap/CustomDragZoom";
import CustomZoomToExtent from "./OpenLayersMap/CustomZoomToExtent";
import {MenuItemProps} from "../react-ui/Menu";
import Menu from "../react-ui/Menu";
import AbstractVisTool from "./AbstractVisTool";
import {OverrideBounds} from "./AbstractVisTool";
import ResizingDiv from "../react-ui/ResizingDiv";
import MiscUtils from "../utils/MiscUtils";

import Button from "../semantic-ui/Button";
import Checkbox from "../semantic-ui/Checkbox";
import Accordion from "../semantic-ui/Accordion";
import StatefulTextField from "../ui/StatefulTextField";
import ComboBox from "../semantic-ui/ComboBox";
import LayerManager from "./OpenLayersMap/LayerManager";
import {VBox,HBox} from "../react-ui/FlexBox";
import {linkReactStateRef} from "../utils/WeaveReactUtils";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ZoomBounds = weavejs.geom.ZoomBounds;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import DynamicState = weavejs.api.core.DynamicState;

import LinkableString = weavejs.core.LinkableString;
import LinkableVariable = weavejs.core.LinkableVariable;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableNumber = weavejs.core.LinkableNumber;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IColumnReference = weavejs.api.data.IColumnReference;
import ColumnUtils = weavejs.data.ColumnUtils;
import ColumnMetadata = weavejs.api.data.ColumnMetadata;
import DataType = weavejs.api.data.DataType;

import Bounds2D = weavejs.geom.Bounds2D;

interface Alignment
{
	vertical: "top" | "bottom";
	horizontal: "left" | "right";
}

function isAlignment(obj:any):boolean
{
	return obj && (obj.vertical == "top" || obj.vertical == "bottom") && (obj.horizontal == "left" || obj.horizontal == "right");
}

import URLRequest = weavejs.net.URLRequest;
import WeavePromise = weavejs.util.WeavePromise;
import SmartComponent from "../ui/SmartComponent";

// set ol proj4
ol.proj.setProj4(proj4);

export default class OpenLayersMapTool extends React.Component<IVisToolProps, IVisToolState>
{
	public static selectableLayerFilter(layer: ol.layer.Base): boolean
	{
		return layer.get("selectable");
	}

	private static projectionDbPromise = OpenLayersMapTool.loadProjDatabase();

	static get projectionDbReadyOrFailed():boolean
	{
		return !!OpenLayersMapTool.projectionDbPromise.getResult() || !!OpenLayersMapTool.projectionDbPromise.getError();
	}

	static getProjection(projectionName:string):ol.proj.Projection
	{
		let proj = ol.proj.get(projectionName);
		if (!proj)
		{
			let error = OpenLayersMapTool.projectionDbPromise.getError();
			let result = OpenLayersMapTool.projectionDbPromise.getResult();

			if (!error && !result)
				console.error("ProjDatabase.zip not ready by the time it was needed.");

			if (error)
				console.error("Failed to retrieve ProjDatabase.zip, and using a non-default projection:", error);

			if (result)
				console.error("Invalid projection selected:", projectionName);
		}

		return proj;
	}

	static loadProjDatabase():WeavePromise<boolean>
	{
		return weavejs.WeaveAPI.URLRequestUtils.request(null, new URLRequest("ProjDatabase.zip")).then(
			(result: Uint8Array) => JSZip().loadAsync(result)
		).then(
			(zip: JSZip) => zip.file("ProjDatabase.json").async("string")
		).then(
			JSON.parse
		).then(
			(db: { [name: string]: string }) =>
			{
				for (let newProjName of Object.keys(db)) {
					let projDef = db[newProjName];
					if (projDef)
						proj4.defs(newProjName, projDef);
				}
				return true;
			}
		);
	}

	static DEFAULT_PROJECTION:string = "EPSG:4326";

	static projectionVerifier(value:string):boolean
	{
		return !!OpenLayersMapTool.getProjection(value);
	}

	static isGeomColumnOrRef(column: (weavejs.api.data.IAttributeColumn | weavejs.api.data.IColumnReference)):boolean
	{
		let iac = Weave.AS(column, weavejs.api.data.IAttributeColumn);
		let icr = Weave.AS(column, weavejs.api.data.IColumnReference);

		let dataType: string;
		if (iac) {
			dataType = iac.getMetadata(ColumnMetadata.DATA_TYPE);
			if (dataType == DataType.GEOMETRY) {
				return true;
			}
		}
		else if (icr) {
			let metadata: { [property: string]: string } = icr.getColumnMetadata() as any;
			if (metadata) {
				dataType = metadata[ColumnMetadata.DATA_TYPE];
			}
			if (dataType == DataType.GEOMETRY) {
				return true;
			}
		}
		return false;
	}

	private static controlIndex = new Map<Function,number>()
		.set(PanCluster, 0)
		.set(CustomZoomToExtent, 1)
		.set(ol.control.Zoom, 2)
		.set(ol.control.ZoomSlider, 3)
		.set(InteractionModeCluster, 4);

	// TODO: Figure out why setting extent on the projections themselves breaks subsequent renders.
	static estimatedExtentMap = new Map<string,ol.Extent>();
	static getEstimatedExtent(proj:ol.proj.Projection):ol.Extent
	{
		let extentBounds:Bounds2D = new Bounds2D();
		let IOTA = Number("1e-10");
		if (!proj.getExtent())
		{
			let code = proj.getCode();
			if (OpenLayersMapTool.estimatedExtentMap.get(code))
				return OpenLayersMapTool.estimatedExtentMap.get(code);
			for (let lat = -180; lat < 180; lat++)
			{
				for (let long = -90; long < 180; long++)
				{
					let coord:ol.Coordinate = [long, lat];
					if (coord[0] == -180)
						coord[0] += IOTA;
					if (coord[0] == 180)
						coord[0] -= IOTA;
					if (coord[1] == -90)
						coord[1] += IOTA;
					if (coord[1] == 90)
						coord[1] -= IOTA;

					let projectedPoint = ol.proj.fromLonLat(coord, proj);
					extentBounds.includeCoords(projectedPoint[0], projectedPoint[1]);
				}
			}
			return OpenLayersMapTool.estimatedExtentMap.set(code, extentBounds.getCoords()).get(code);
		}
		return proj.getExtent();
	}

	setOverrideExtent = () => {
		let bounds = new Bounds2D();
		this.zoomBounds.getDataBounds(bounds);
		Weave.setState(this.extentOverride,
			{
				xMin: bounds.xMin,
				xMax: bounds.xMax,
				yMin: bounds.yMin,
				yMax: bounds.yMax
			});
	};

	clearOverrideExtent = () => {
		Weave.setState(this.extentOverride,
			{
				xMin: NaN, xMax: NaN, yMin: NaN, yMax: NaN
			});
	};

	overrideExtentDefined = ():boolean => {
		let bounds = Weave.getState(this.extentOverride) as any;
		for (let key of Object.keys(bounds))
		{
			let value = bounds[key];
			if (isNaN(value)) return false;
		}
		return true;
	}


	overrideSet():boolean
	{
		let state: { [coord: string]: number } = Weave.getState(this.extentOverride) as { [coord: string]: number };
		for (let coord of Object.keys(state))
		{
			if (!_.isFinite(state[coord])) return false;
		}
		return true;
	}


	map:ol.Map;

	centerCallbackHandle:any;
	resolutionCallbackHandle:any;
	private element:Element;

	zoomBounds = Weave.linkableChild(this, ZoomBounds);
	extentOverride = Weave.linkableChild(this, OverrideBounds);
	projectionSRS = Weave.linkableChild(this, new LinkableString("EPSG:3857", OpenLayersMapTool.projectionVerifier));
	interactionMode = Weave.linkableChild(this, LinkableString);

	layers = Weave.linkableChild(this, new LinkableHashMap(AbstractLayer));

	panelTitle = Weave.linkableChild(this, LinkableString);

	snapZoomToBaseMap = Weave.linkableChild(this, new LinkableBoolean(true));

	maxZoomLevel = Weave.linkableChild(this, new LinkableNumber(18));
	minZoomLevel = Weave.linkableChild(this, new LinkableNumber(0));

	/* Control elements */
	zoomExtent = new CustomZoomToExtent({ label: $("<span>").addClass("fa fa-arrows-alt").css({ "font-weight": "normal" })[0] });
	zoomButtons = new ol.control.Zoom({ zoomInLabel: $("<span>").addClass("fa fa-plus")[0], zoomOutLabel: $("<span>").addClass("fa fa-minus")[0] });
	zoomSlider = new ol.control.ZoomSlider();
	panButtons = new PanCluster();
	mouseModeButtons = new InteractionModeCluster({});

	/* Control element config properties */
	showZoomButtons = Weave.linkableChild(this, new LinkableBoolean(true));
	showZoomSlider = Weave.linkableChild(this, LinkableBoolean);
	showPanButtons = Weave.linkableChild(this, new LinkableBoolean(false));
	showZoomExtentButton = Weave.linkableChild(this, new LinkableBoolean(true));
	showMouseModeControls = Weave.linkableChild(this, new LinkableBoolean(true));
	toolPadding = Weave.linkableChild(this, new LinkableNumber(10));

	controlLocation = Weave.linkableChild(this, new LinkableVariable(null, isAlignment, {vertical: "top", horizontal: "left"}));

	get title():string
	{
		return MiscUtils.evalTemplateString(this.panelTitle.value, this) || this.defaultPanelTitle;
	}

	constructor(props:IVisToolProps)
	{
		super(props);

		/* Force the inclusion of the layers. */
		GeometryLayer; TileLayer; ImageGlyphLayer; ScatterPlotLayer; LabelLayer;

		weavejs.WeaveAPI.Scheduler.callLater(this, this.initLater);
	}
	
	private initLater():void
	{
		if (this.interactionMode.triggerCounter == weavejs.core.CallbackCollection.DEFAULT_TRIGGER_COUNT)
		{
			/* use global interaction mode as default local mode */
			var defaultDragMode = Weave.getWeave(this).getObject("WeaveProperties", "toolInteractions", "defaultDragMode") as LinkableString;
			if (defaultDragMode instanceof LinkableString)
				this.interactionMode.value = defaultDragMode.value || "select";
			else
				this.interactionMode.value = "select";
		}
	}



	initSelectableAttributes(input: (weavejs.api.data.IAttributeColumn | weavejs.api.data.IColumnReference)[]): void
	{	
		this.layers.requestObject('', TileLayer);
		let geoColumns = input.filter(OpenLayersMapTool.isGeomColumnOrRef);
		let nonGeoColumns = input.filter(_.negate(OpenLayersMapTool.isGeomColumnOrRef));

		if (geoColumns.length)
		{
			let geoColumn = geoColumns[0];
			let geoLayer = this.layers.requestObject('', GeometryLayer) as GeometryLayer;
			if (geoLayer) ColumnUtils.initSelectableAttribute(geoLayer.geometryColumn, geoColumns[0]);
			let selectableAttributes = geoLayer.selectableAttributes;
			let colorDataColumn = (Weave.getWeave(this).getObject(["defaultColorDataColumn"]) as weavejs.data.column.DynamicColumn);
			if (!colorDataColumn.getInternalColumn() && nonGeoColumns[0])
			{
				ColumnUtils.initSelectableAttribute(colorDataColumn, nonGeoColumns[0]);
			}
		}
	}

	get deprecatedStateMapping():Object
	{
		return {
			zoomControlsLocation: (zcl:string) => {
				let vertical:string;
				let horizontal:string;

				if (zcl.startsWith("Bottom"))
				{
					vertical = "bottom";
				}
				else
				{
					vertical = "top";
				}

				if (zcl.endsWith("right"))
				{
					horizontal = "right";
				}
				else
				{
					horizontal = "left";
				}

				this.controlLocation.state = { vertical, horizontal };
			},
			zoomToBaseMap: this.snapZoomToBaseMap,
			showZoomControls: this.showZoomSlider,
			children: {
				visualization: {
					plotManager: [
						(pm:any, removeMissingDynamicObjects:boolean) => {
							if (!pm)
								return;
							
							Weave.setState(this.layers, pm.plotters, removeMissingDynamicObjects);
							Weave.setState(this.layers, DynamicState.removeTypeFromState(pm.layerSettings), removeMissingDynamicObjects);
						},
						{
							zoomBounds: this.zoomBounds,
							overrideXMin: this.extentOverride.xMin,
							overrideYMin: this.extentOverride.yMin,
							overrideXMax: this.extentOverride.xMax,
							overrideYMax: this.extentOverride.yMax,
							minZoomLevel: this.minZoomLevel,
							maxZoomLevel: this.maxZoomLevel
						}
					]
				}
			}
		};
	}

	updateCursor():void
	{
		let modesToCursors: {[value:string]: string[]} = {
			"select": ["default"],
			"pan": ["grabbing", "-webkit-grabbing", "move"],
			"zoom": ["zoom-in"]
		};
		let interactionMode = this.interactionMode.value || "select";
		let cursorValues = modesToCursors[interactionMode];
		if (!this.map) return;
		let mapElement = this.map.getTargetElement();
		if (mapElement)
		{
			for (let cursor of cursorValues)
			{
				$(mapElement).css({cursor});
				if ($(mapElement).css("cursor") == cursor) return;
			}
		}
	}

	initializeMap():void
	{
		Menu.registerMenuSource(this);

		this.map = new ol.Map({
			interactions: ol.interaction.defaults({ dragPan: false }),
			controls: [],
			target: this.element
		});

		this.map.set("mapTool", this);

		/* Setup custom interactions */

		let dragPan = new ol.interaction.DragPan();
		let dragSelect = new DragSelection();
		let probeInteraction = new ProbeInteraction(this);
		let dragZoom = new CustomDragZoom();

		this.map.addInteraction(dragPan);
		this.map.addInteraction(dragSelect);
		this.map.addInteraction(probeInteraction);
		this.map.addInteraction(dragZoom);

		this.interactionMode.addGroupedCallback(this, () => {
			let interactionMode = this.interactionMode.value || "select";
			dragPan.setActive(interactionMode === "pan");
			dragSelect.setActive(interactionMode === "select");
			dragZoom.setActive(interactionMode === "zoom");
			this.updateCursor();
		}, true);

		/* Setup custom controls */

		$(this.element).find("canvas.ol-unselectable").attr("tabIndex", 1024); /* Hack to make the canvas focusable. */

		this.controlLocation.addGroupedCallback(this, this.updateControlPositions);
		for (let lb of [
			this.showZoomSlider,
			this.showMouseModeControls,
			this.showPanButtons,
			this.showZoomExtentButton,
			this.showZoomButtons
		]) {
			lb.addGroupedCallback(this, this.updateControls_weaveToOl);
		}
		this.updateControls_weaveToOl();

		this.snapZoomToBaseMap.addGroupedCallback(this, this.updateResolutionSnapping);

		/* Todo replace override[X,Y][Min,Max] with a single overrideZoomBounds element; alternatively,
		 * make a set of parameters on zoombounds itself. */

		Weave.getCallbacks(this.extentOverride).addGroupedCallback(this, this.updateViewParameters_weaveToOl);
		this.maxZoomLevel.addGroupedCallback(this, this.updateViewParameters_weaveToOl);
		this.minZoomLevel.addGroupedCallback(this, this.updateViewParameters_weaveToOl);

		this.projectionSRS.addGroupedCallback(this, this.updateViewParameters_weaveToOl, true);

		this.layers.addGroupedCallback(this, this.requestDetail, true);

		this.layers.childListCallbacks.addImmediateCallback(this, this.updatePlotters_weaveToOl, true);
		Weave.getCallbacks(this.zoomBounds).addGroupedCallback(this, this.updateZoomAndCenter_weaveToOl, true);

		weavejs.WeaveAPI.Scheduler.frameCallbacks.addImmediateCallback(this, this.handleFrame);
	}


	updateViewParameters_weaveToOl():void
	{
		let extent:ol.Extent = [
			this.extentOverride.xMin.value,
			this.extentOverride.yMin.value,
			this.extentOverride.xMax.value,
			this.extentOverride.yMax.value
		];
		if (!_.every(extent, Number.isFinite))
			extent = undefined;

		/* If this is a valid projection, use it. otherwise use default. */
		let projection = OpenLayersMapTool.getProjection(this.projectionSRS.value) || this.getDefaultProjection();
		let view = new CustomView({minZoom: this.minZoomLevel.value, maxZoom: this.maxZoomLevel.value, projection, extent});
		view.set("extent", extent);

		this.centerCallbackHandle = view.on("change:center", this.updateCenter_olToWeave, this);
		this.resolutionCallbackHandle = view.on("change:resolution", this.updateZoom_olToWeave, this);
		this.map.setView(view);

		this.updateResolutionSnapping();

		this.updateZoomAndCenter_weaveToOl();
	}

	private _lastSize: ol.Size;

	handleFrame():void
	{
		var element = this.map.getTargetElement() as HTMLElement;
		var newSize = [element.offsetWidth, element.offsetHeight];

		if (_.isEqual(this._lastSize, newSize)) return;
		this._lastSize = newSize;

		var screenBounds = new Bounds2D(0, 0, newSize[0], newSize[1]);
		this.zoomBounds.setScreenBounds(screenBounds, true);
		this.map.updateSize();
		this.updateControlPositions();
	}

	private updateControl(lbool:LinkableBoolean, control:ol.control.Control):void
	{
		if (lbool.value)
		{
			if (!_.contains(this.map.getControls().getArray(), control))
				this.map.addControl(control);
		}
		else
		{
			this.map.removeControl(control);
		}
	}

	private updateControls_weaveToOl():void
	{
		this.updateControl(this.showPanButtons, this.panButtons);
		this.updateControl(this.showZoomButtons, this.zoomButtons);
		this.updateControl(this.showMouseModeControls, this.mouseModeButtons);
		this.updateControl(this.showZoomSlider, this.zoomSlider);
		this.updateControl(this.showZoomExtentButton, this.zoomExtent);
		this.updateControlPositions();
	}



	private updateControlPositions():void
	{
		let controls = _.sortBy(this.map.getControls().getArray(), item => OpenLayersMapTool.controlIndex.get(item.constructor));
		let maxWidth: number = 0;
		if (controls.length > 0)
		{
			maxWidth = _.max(controls, (control) => control.element.scrollWidth).element.scrollWidth;
		}

		let mapWidth = this.map.getSize()[0];
		let mapHeight = this.map.getSize()[1];
		let padding = 5;
		let controlLocation:Alignment = this.controlLocation.state as Alignment;

		let verticalDirection: number, verticalStart: number, verticalOffsetMultiplier: number;
		let horizontalDirection: number, horizontalStart: number, horizontalOffsetMultiplier: number;

		[verticalDirection, verticalOffsetMultiplier, verticalStart] =
			controlLocation.vertical == "top" ? [+1, 0, 0] : [-1, +1, mapHeight];
		[horizontalDirection, horizontalOffsetMultiplier, horizontalStart] =
			controlLocation.horizontal == "left" ? [+1, 0, 0] : [-1, +1, mapWidth];

		if (controlLocation.vertical == "bottom")
			controls.reverse();

		for (let control of controls)
		{
			let height = control.element.scrollHeight;
			let width = control.element.scrollWidth;
			let centerOffset = (maxWidth - width) / 2;

			$(control.element).css({top: (verticalDirection * height * verticalOffsetMultiplier) + verticalStart + (padding * verticalDirection)});
			$(control.element).css({left: (horizontalDirection * width * horizontalOffsetMultiplier) + horizontalStart + ((centerOffset + padding) * horizontalDirection)});

			verticalStart += verticalDirection * (height + padding);
		}
	}

	updateCenter_olToWeave():void
	{
		var [xCenter, yCenter] = this.map.getView().getCenter();

		var dataBounds = new weavejs.geom.Bounds2D();
		this.zoomBounds.getDataBounds(dataBounds);
		dataBounds.setXCenter(xCenter);
		dataBounds.setYCenter(yCenter);
		this.zoomBounds.setDataBounds(dataBounds);
	}

	updateResolutionDependentStyles(event:ol.MapEvent):void
	{
		if (event.frameState.animate)
			return;

		this.map.un("postrender", this.updateResolutionDependentStyles, this);

		for (let layer of this.layers.getObjects(AbstractFeatureLayer as any))
		{
			if (layer && layer.styleResolutionDependent)
			{
				layer.updateStyleData();
			}
		}
	}


	updateZoom_olToWeave():void
	{
		let view = this.map.getView();
		var resolution = view.getResolution();

		var dataBounds = new weavejs.geom.Bounds2D();
		var screenBounds = new weavejs.geom.Bounds2D();
		this.zoomBounds.getDataBounds(dataBounds);
		this.zoomBounds.getScreenBounds(screenBounds);
		dataBounds.setWidth(screenBounds.getWidth() * resolution);
		dataBounds.setHeight(screenBounds.getHeight() * resolution);
		dataBounds.makeSizePositive();
		this.zoomBounds.setDataBounds(dataBounds);

		this.map.on("postrender", this.updateResolutionDependentStyles, this);
	}

	updateZoomAndCenter_weaveToOl():void
	{
		var dataBounds = new weavejs.geom.Bounds2D();
		this.zoomBounds.getDataBounds(dataBounds);

		if (dataBounds.isEmpty())
		{
			let proj = OpenLayersMapTool.getProjection(this.projectionSRS.value)
			if (proj)
			{
				dataBounds.setCoords(OpenLayersMapTool.getEstimatedExtent(proj));
				this.zoomBounds.setDataBounds(dataBounds);
				return;	
			}
		}
		var center = [dataBounds.getXCenter(), dataBounds.getYCenter()];
		var scale = this.zoomBounds.getXScale() || 1;
		let view = this.map.getView();

		view.un("change:center", this.updateCenter_olToWeave, this);
		view.un("change:resolution", this.updateZoom_olToWeave, this);

		view.setCenter(center);
		let resolution = 1 / scale;
		if (!MouseUtils.mouseButtonDown)
			resolution = view.constrainResolution(resolution);

		view.setResolution(resolution);

		_.defer(() => {
			view.on("change:center", this.updateCenter_olToWeave, this);
			view.on("change:resolution", this.updateZoom_olToWeave, this);
		});
	}

	getDefaultProjection():string
	{
		for (let layerName of this.layers.getNames())
		{
			let layer = this.layers.getObject(layerName) as AbstractLayer;
			if (layer instanceof TileLayer)
				return "EPSG:3857";
		}
		return OpenLayersMapTool.DEFAULT_PROJECTION;
	}

	requestDetail():void
	{
		for (var name of this.layers.getNames())
		{
			var layer:AbstractFeatureLayer = this.layers.getObject(name) as AbstractFeatureLayer;
			if (!(layer instanceof AbstractFeatureLayer))
				continue;
			for (var sgc of Weave.getDescendants(this.layers.getObject(name), weavejs.data.column.StreamedGeometryColumn))
			{
				if (layer.inputProjection == layer.outputProjection)
				{
					weavejs.data.column.StreamedGeometryColumn.metadataRequestMode = 'xyz';
					sgc.requestGeometryDetailForZoomBounds(this.zoomBounds);
				}
				else
				{
					//TODO - don't request everything when reprojecting
					weavejs.data.column.StreamedGeometryColumn.metadataRequestMode = 'all';
					sgc.requestGeometryDetail(sgc.collectiveBounds, 0);
				}
			}
		}
	}

	updateResolutionSnapping():void
	{
		let view = this.map.getView() as CustomView;
		if (!view)
			return;
		if (this.layers.getObjects(TileLayer).length && this.snapZoomToBaseMap.value)
			view.enableResolutionConstraint = true;
		else
			view.enableResolutionConstraint = false;
	}

	updatePlotters_weaveToOl():void
	{
		var newNames:string[] = this.layers.getNames();

		for (let idx in newNames)
		{
			let layer = this.layers.getObject(newNames[idx]) as AbstractLayer;

			layer.parent = this;

			if (!layer || !layer.olLayer)
				continue;

			layer.olLayer.setZIndex(Number(idx) + 2);
		}
		this.updateResolutionSnapping();
		/* This may impact the default projection, so trigger callbacks on it. */
		this.projectionSRS.triggerCallbacks();
	}

	hasNonEmptySelection():boolean
	{
		for (let layer of this.layers.getObjects(AbstractFeatureLayer as any) as Array<AbstractFeatureLayer>)
		{
			if (layer.selectionKeySet && layer.selectionKeySet.keys.length)
				return true;
		}
		return false;
	}

	getMenuItems():MenuItemProps[]
	{
		let menuItems:MenuItemProps[] = [];

		if (this.hasNonEmptySelection())
		{
			menuItems.push({
				label: Weave.lang("Zoom to selected records"),
				click: () => this.zoomToSelection()
			});
		}
		for (let layer of this.layers.getObjects(AbstractFeatureLayer as any) as Array<AbstractFeatureLayer>)
		{
			/* TODO: Instead of only using first visible and selectable layer, coalesce based on vistoolgroup/keyset configs 
				and present menu items that are grouped by vistoolgroup. */
			if (layer instanceof AbstractFeatureLayer && layer.visible.value && layer.selectable.value)
			{
				menuItems = menuItems.concat(AbstractVisTool.getMenuItems(layer));
				break;
			}
		}

		if (Weave.beta)
			menuItems.push({
				label: Weave.lang("Print Tool (Beta)"),
				click: PrintUtils.printCanvasTool.bind(null, this.element)
			});

		return menuItems;
	}

	get defaultPanelTitle():string
	{
		let columns = Weave.getDescendants(this, weavejs.data.column.ColorColumn) as weavejs.data.column.ColorColumn[];

		if (!columns.length)
		{
			return Weave.lang("Map");
		}

		return Weave.lang("Map of {0}", weavejs.data.ColumnUtils.getTitle(columns[0]));
	}




	getExtent():weavejs.geom.Bounds2D
	{
		let bounds = new weavejs.geom.Bounds2D();
		let viewExtent:ol.Extent = this.map.getView().get("extent");
		if (viewExtent)
		{
			bounds.setCoords(viewExtent);
		}
		else
		{
			let layers = this.layers.getObjects() as AbstractLayer[];
			for (let layer of layers) {
				/* The layer must be visible. If there is only one layer, we will consider non-FeatureLayers (ie, the default base layer,) */
				if (layer.visible.value && ((layer instanceof AbstractFeatureLayer) || layers.length == 1))
					bounds.includeBounds(layer.getExtent());
			}
		}
		return bounds;
	}

	zoomToSelection(inputKeys:Array<IQualifiedKey> = null, zoomMarginPercent:number = 0.2):void
	{
		let setOfKeys = new Set<IQualifiedKey>();
		let keyBounds = new Bounds2D();
		let tmpBounds = new Bounds2D();
		let useProbe = false;
		let extent:ol.Extent = [NaN, NaN, NaN, NaN];

		for (let layer of this.layers.getObjects(AbstractFeatureLayer as any) as Array<AbstractFeatureLayer>)
		{
			let keys = inputKeys;
			if (!keys)
				keys = layer.selectionKeySet ? layer.selectionKeySet.keys : [];

			for (let key of keys)
			{
				let feature = layer.source.getFeatureById(key);
				if (!feature)
					continue;
				let geometry = feature.getGeometry();
				if (!geometry)
					continue;
				geometry.getExtent(extent);
				tmpBounds.setCoords(extent);
				keyBounds.includeBounds(tmpBounds);
			}
		}

		let scale = 1 / (1 - zoomMarginPercent);

		keyBounds.setWidth(keyBounds.getWidth() * scale);
		keyBounds.setHeight(keyBounds.getHeight() * scale);

		if (!keyBounds.isEmpty())
		{
			this.map.getView().fit(keyBounds.getCoords(), this.map.getSize());
		}
		else
		{
			this.map.getView().setCenter([keyBounds.getXCenter(), keyBounds.getYCenter()]);
		}
	}



	//todo:(pushCrumb)find a better way to link to sidebar UI for selectbleAttributes
	renderEditor(pushCrumb:Function): JSX.Element
	{
		return <OpenLayersMapToolEditor tool={this} pushCrumb={pushCrumb}/>
	}

	componentDidMount():void
	{
		if (!OpenLayersMapTool.projectionDbReadyOrFailed)
		{
			console.log("Projection database not ready; delaying initialization of map");
			weavejs.WeaveAPI.Scheduler.callLater(this, this.componentDidMount);
			return;
		}
		this.initializeMap();
	}

	render():JSX.Element
	{
		return (
			<ResizingDiv>
				<div ref={(c:HTMLElement) => {this.element = c;}} style={{height:"100%", width: "100%"}}/>
			</ResizingDiv>
		);
	}


}



Weave.registerClass(
	OpenLayersMapTool,
	["weavejs.tool.Map", "weave.visualization.tools::MapTool"],
	[weavejs.api.ui.IVisTool_Basic, weavejs.api.core.ILinkableObjectWithNewProperties],
	"Map"
);


export interface IOpenLayersMapToolEditorState {
	selectedLayer:AbstractLayer
}

export interface IOpenLayersMapToolEditorProps {
	tool:OpenLayersMapTool,
	pushCrumb:Function
}

class OpenLayersMapToolEditor extends SmartComponent<IOpenLayersMapToolEditorProps,IOpenLayersMapToolEditorState>{

	// state object is stored in Editor mapped with crumb title
	// so then when it mounted back , state object can re applied and maintained.
	// todo: makes a Base class for all Editor Class with componentWillUnmount implemented
	componentWillUnmount(){
		let displayName = weavejs.WeaveAPI.ClassRegistry.getDisplayName(this.props.tool.constructor as new (..._: any[]) => any)
		this.props.pushCrumb(displayName,null,this.state);
	}

	// called from layerManager on MouseDown Event of listItem
	updateSelectedLayer=(layer:AbstractLayer)=>
	{
		this.setState({
			selectedLayer:layer
		});
	}

	//todo:(pushCrumb)find a better way to link to sidebar UI for selectbleAttributes
	render(){
		let controlLocationOpts = [
			{ vertical: "top", horizontal: "left" },
			{ vertical: "top", horizontal: "right" },
			{ vertical: "bottom", horizontal: "left" },
			{ vertical: "bottom", horizontal: "right" }
		].map(
			(value) => { return { label: Weave.lang(_.startCase(value.vertical) + " " + _.startCase(value.horizontal)), value} }
		);

		let renderNumberEditor = (linkableNumber:LinkableNumber, flex:number)=>
		{
			var style: React.CSSProperties = { textAlign: "center", flex, minWidth: 60 };
			return <StatefulTextField type="number" style={style} ref={linkReactStateRef(this, { value: linkableNumber }) }/>;
		}

		return Accordion.render(
			[
				Weave.lang("Layers"),
				<LayerManager layers={this.props.tool.layers}
				              pushCrumb={ this.props.pushCrumb }
				              selectedLayer={this.state.selectedLayer}
				              onLayerSelection={this.updateSelectedLayer}/>
			],
			[
				Weave.lang("Display"),
				[
					[
						Weave.lang("Chart title"),
						<HBox>
							<StatefulTextField style={{ width: "100%" }} ref= { linkReactStateRef(this, {value: this.props.tool.panelTitle }) } placeholder={this.props.tool.defaultPanelTitle}/>
						</HBox>
					],
					[
						Weave.lang("Projection SRS"),
						<HBox>
							<StatefulTextField spellCheck={false} style={{ width: "100%" }} ref={linkReactStateRef(this, { value: this.props.tool.projectionSRS }) }/>
						</HBox>
					]
				],
			],
			[
				Weave.lang("Controls"),
				[
					[
						Weave.lang("Control location"),
						<HBox>
							<ComboBox ref={linkReactStateRef(this, { value: this.props.tool.controlLocation }) } options={controlLocationOpts}/>
						</HBox>
					],
					[
						Weave.lang("Show zoom to extent button"),
						<Checkbox ref={linkReactStateRef(this, {value: this.props.tool.showZoomExtentButton}) } label={" "}/>
					],
					[
						Weave.lang("Show zoom buttons"),
						<Checkbox ref={linkReactStateRef(this, { value: this.props.tool.showZoomButtons }) } label={" "}/>
					],
					[
						Weave.lang("Show zoom slider"),
						<Checkbox ref={linkReactStateRef(this, { value: this.props.tool.showZoomSlider }) } label={" "}/>
					],
					[
						Weave.lang("Show mouse mode selector"),
						<Checkbox ref={linkReactStateRef(this, { value: this.props.tool.showMouseModeControls }) } label={" "}/>
					],
				]
			],
			[
				Weave.lang("Zoom and pan behavior"),
				[
					[
						Weave.lang("Zoom range"),
						<HBox className="weave-padded-hbox" style={{ alignItems: "center" }}>
							<StatefulTextField style={{ flex: 1 }} ref={linkReactStateRef(this, { value: this.props.tool.minZoomLevel }) }/>
							{"-"}
							<StatefulTextField style={{ flex: 1 }} ref={linkReactStateRef(this, { value: this.props.tool.maxZoomLevel }) }/>
						</HBox>
					],
					[
						<span style={ {whiteSpace:"normal"} }> {Weave.lang("Pan Boundary")}</span>,
						<VBox>
							<span style={{display: this.props.tool.overrideExtentDefined() ? null : "none" }}>
								<HBox className="weave-padded-hbox" style={{ alignItems: 'center' }}>
									{ renderNumberEditor(this.props.tool.extentOverride.xMin, 1) }
									<VBox className="weave-padded-vbox" style={{ flex: 1 }}>
										{ renderNumberEditor(this.props.tool.extentOverride.yMax, null) }
										{ renderNumberEditor(this.props.tool.extentOverride.yMin, null) }
									</VBox>
									{ renderNumberEditor(this.props.tool.extentOverride.yMin, 1) }
								</HBox>
							</span>
							<HBox>
								<Button	onClick={this.props.tool.setOverrideExtent} style={ {borderTopRightRadius:0 , borderBottomRightRadius:0} }>
									{Weave.lang("Use current zoom") }
								</Button>
								<Button	onClick={this.props.tool.clearOverrideExtent} style={ {borderTopLeftRadius:0 , borderBottomLeftRadius:0} }>
									{Weave.lang("Use data bounds")}
								</Button>
							</HBox>
						</VBox>
					],
					[
						Weave.lang("Snap zoom to base map"),
						<Checkbox
							ref={linkReactStateRef(this, {value: this.props.tool.snapZoomToBaseMap})}
							label={" "}
							title={ Weave.lang("Constrain zoom to match tile resolution and avoid 'blurry' appearance.") }
						/>
					]
				]
			]
		);
	}
}
