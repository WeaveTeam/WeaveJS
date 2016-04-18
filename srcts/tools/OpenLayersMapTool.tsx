import * as ol from "openlayers";
import * as lodash from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ReactUtils from "../utils/ReactUtils";
import * as jquery from "jquery";

// loads jquery from the es6 default module.
var $:JQueryStatic = (jquery as any)["default"];

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

export default class OpenLayersMapTool extends React.Component<IVisToolProps, IVisToolState>
{

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

	overrideSet():boolean
	{
		let state: { [coord: string]: number } = Weave.getState(this.extentOverride) as { [coord: string]: number };
		for (let coord of Object.keys(state))
		{
			if (!lodash.isFinite(state[coord])) return false;
		}
		return true;
	}

	//todo:(linkFunction)find a better way to link to sidebar UI for selectbleAttributes
	renderEditor(linkFunction:Function): JSX.Element {
		let controlLocationOpts = [
			{ vertical: "top", horizontal: "left" },
			{ vertical: "top", horizontal: "right" },
			{ vertical: "bottom", horizontal: "left" },
			{ vertical: "bottom", horizontal: "right" }
		].map(
			(value) => { return { label: Weave.lang(lodash.startCase(value.vertical) + " " + lodash.startCase(value.horizontal)), value} }
		);

		// TODO: Make this code more generic

		var tableStyles = {
			table: { width: "100%", fontSize: "inherit" },
			td: [
				{ paddingBottom: 10, textAlign: "right", whiteSpace: "nowrap", paddingRight: 5 },
				{ paddingBottom: 10, textAlign: "right", width: "100%" }
			]
		};

		let editorFields = [
			[Weave.lang("Title"),
				<HBox>
					<StatefulTextField style={{ width: "100%" }} ref= { linkReactStateRef(this, {value: this.panelTitle }) }/>
				</HBox>
			],
			[Weave.lang("Control location"),
				<HBox>
					<ComboBox ref={linkReactStateRef(this, { value: this.controlLocation }) } options={controlLocationOpts}/>
				</HBox>
			],
			[Weave.lang("Zoom range"),
				<HBox className="weave-padded-hbox" style={{ alignItems: "center" }}>
					<StatefulTextField style={{ flex: 1 }} ref={linkReactStateRef(this, { value: this.minZoomLevel }) }/>
					{"-"}
					<StatefulTextField style={{ flex: 1 }} ref={linkReactStateRef(this, { value: this.maxZoomLevel }) }/>
				</HBox>
			],
			[Weave.lang("Show zoom slider"),
				<HBox>
					<Checkbox ref={linkReactStateRef(this, { value: this.showZoomSlider })}/>
				</HBox>
			],
			[Weave.lang("Projection SRS"),
				<HBox>
					<StatefulTextField spellCheck={false} style={{ width: "100%" }} ref={linkReactStateRef(this, {value: this.projectionSRS })}/>
				</HBox>
			],
			[Weave.lang("Override extent"), 
				<HBox>
					<Button onClick={this.setOverrideExtent}>{Weave.lang("Use current zoom")}</Button>
					<Button onClick={this.clearOverrideExtent}>{Weave.lang("Reset")}</Button>
				</HBox>
			],
			[Weave.lang("Snap zoom to base map"),
				<HBox>
					<Checkbox ref={linkReactStateRef(this, {value: this.snapZoomToBaseMap})}/>
				</HBox>
			],
		];

		return <VBox>
			{ReactUtils.generateTable(null, editorFields, tableStyles)}
			<LayerManager layers={this.layers}/>
		</VBox>;
	}



	static DEFAULT_PROJECTION:string = "EPSG:4326";

	map:ol.Map;

	centerCallbackHandle:any;
	resolutionCallbackHandle:any;
	private element:Element;

	static projectionVerifier(value:string):boolean
	{
		return !!ol.proj.get(value);
	}

	zoomBounds = Weave.linkableChild(this, ZoomBounds);
	extentOverride = Weave.linkableChild(this, OverrideBounds);
	projectionSRS = Weave.linkableChild(this, new LinkableString("EPSG:3857", OpenLayersMapTool.projectionVerifier));
	interactionMode = Weave.linkableChild(this, LinkableString);

	layers = Weave.linkableChild(this, new LinkableHashMap(AbstractLayer));

	panelTitle = Weave.linkableChild(this, LinkableString);

	snapZoomToBaseMap = Weave.linkableChild(this, LinkableBoolean);

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
		return MiscUtils.stringWithMacros(this.panelTitle.value, this);
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

	initSelectableAttributes()
	{
		this.layers.requestObject('', TileLayer);
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

	componentDidMount():void
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
			])
		{
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
		if (!lodash.every(extent, Number.isFinite))
			extent = undefined;

		/* If this is a valid projection, use it. otherwise use default. */
		let projection = ol.proj.get(this.projectionSRS.value) || this.getDefaultProjection();
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

		if (lodash.isEqual(this._lastSize, newSize)) return;
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
			if (!lodash.contains(this.map.getControls().getArray(), control))
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

	private static controlIndex = new Map<Function,number>()
		.set(PanCluster, 0)
		.set(CustomZoomToExtent, 1)
		.set(ol.control.Zoom, 2)
		.set(ol.control.ZoomSlider, 3)
		.set(InteractionModeCluster, 4);

	private updateControlPositions():void
	{
		let controls = lodash.sortBy(this.map.getControls().getArray(), item => OpenLayersMapTool.controlIndex.get(item.constructor));
		let maxWidth = lodash.max(controls, (control) => control.element.scrollWidth).element.scrollWidth;

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
			let proj = ol.proj.get(this.projectionSRS.value)
			if (proj)
			{
				dataBounds.setCoords(proj.getExtent());
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
		
		view.setResolution(view.constrainResolution(resolution));

		lodash.defer(() => {
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
			var layer:GeometryLayer = this.layers.getObject(name) as GeometryLayer;
			if (!(layer instanceof GeometryLayer))
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
			if (layer instanceof AbstractFeatureLayer)
			{
				menuItems = menuItems.concat(AbstractVisTool.getMenuItems(layer));
			}
		}
		return menuItems;
	}

	dispose():void
	{

	}

	render():JSX.Element 
	{
		return (
			<ResizingDiv>
				<div ref={(c:HTMLElement) => {this.element = c;}}/>
			</ResizingDiv>
		);
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
			for (let layer of this.layers.getObjects() as AbstractLayer[]) {
				if (layer.visible.value)
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

	public static selectableLayerFilter(layer: ol.layer.Base): boolean {
		return layer.get("selectable");
	}
}

Weave.registerClass(
	OpenLayersMapTool,
	["weavejs.tool.Map", "weave.visualization.tools::MapTool"],
	[weavejs.api.ui.IVisTool_Basic, weavejs.api.core.ILinkableObjectWithNewProperties],
	"Map"
);
