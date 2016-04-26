import * as ol from "openlayers";
import * as _ from "lodash";
import AbstractLayer from "./AbstractLayer";
import * as React from "react";
import ComboBox from "../../../semantic-ui/ComboBox";
import StatefulTextField from "../../../ui/StatefulTextField";
import {linkReactStateRef} from "../../../utils/WeaveReactUtils";
import {VBox, HBox} from "../../../react-ui/FlexBox";
import OpenLayersMapTool from "../../OpenLayersMapTool";
import ReactUtils from "../../../utils/ReactUtils";

import LinkableString = weavejs.core.LinkableString;
import LinkableVariable = weavejs.core.LinkableVariable;

interface ITileLayerEditorProps {
	layer: TileLayer;
	editableFields: React.ReactChild[][]
}

interface ITileLayerEditorState {
}

class TileLayerEditor extends React.Component<ITileLayerEditorProps,ITileLayerEditorState>
{
	constructor(props:ITileLayerEditorProps)
	{
		super(props);

		this.tempLayer.addGroupedCallback(this, this.toProviderOptions);
		this.tempAttributions.addGroupedCallback(this, this.toProviderOptions);
		this.tempProjection.addGroupedCallback(this, this.toProviderOptions);
		this.tempUrl.addGroupedCallback(this, this.toProviderOptions)
		this.componentWillReceiveProps(props);
	}

	tempLayer = Weave.disposableChild(this, LinkableString);
	tempAttributions = Weave.disposableChild(this, LinkableString);
	tempProjection = Weave.disposableChild(this, LinkableString);
	tempUrl = Weave.disposableChild(this, LinkableString);

	toProviderOptions()
	{
		if (!this.props.layer) return;

		if (this.props.layer.provider.value === "custom")
		{
			this.props.layer.providerOptions.state =
				{
					attributions: this.tempAttributions.value,
					url: this.tempUrl.value,
					projection: this.tempProjection.value
				};
		}
		else
		{
			this.props.layer.providerOptions.state =
				{
					layer: this.tempLayer.value
				};
		}
	}

	fromProviderOptions()
	{
		let opts:any = this.props.layer.providerOptions.state || {};
		this.tempLayer.value = opts.layer;
		this.tempAttributions.value = opts.attributions;
		this.tempUrl.value = opts.url;
		this.tempProjection.value = opts.projection;
	}

	componentWillReceiveProps(nextProps: ITileLayerEditorProps)
	{
		if (this.props && this.props.layer)
		{
			this.props.layer.providerOptions.removeCallback(this, this.fromProviderOptions);
			Weave.getCallbacks(this.props.layer).removeCallback(this, this.forceUpdate);
		}
		Weave.getCallbacks(nextProps.layer).addGroupedCallback(this, this.forceUpdate);
		nextProps.layer.providerOptions.addGroupedCallback(this, this.fromProviderOptions);
	}

	render(): JSX.Element
	{
		let layers: string[];
		switch (this.props.layer.provider.value)
		{
			case "stamen":
				layers = ["watercolor", "toner"];
				break;
			case "mapquest":
				layers = ["sat", "osm"];
				break;
			default:
				layers = null;
		}

		let providerOptions = [{ value: "osm", label: "OpenStreetMap" }, { value: "stamen", label: "Stamen" }, { value: "mapquest", label: "MapQuest" }, {value: "custom", label: Weave.lang("Custom")}];

		let layerSelection: JSX.Element;
		let editorFields:React.ReactChild[][];
		if (this.props.layer.provider.value === "osm")
		{
			editorFields = [
				[
					Weave.lang("Provider"),
					<ComboBox ref={linkReactStateRef(this, { value: this.props.layer.provider }) } options={providerOptions}/>
				]
			]
		}
		else if (this.props.layer.provider.value === "custom")
		{
			editorFields = [
				[
					Weave.lang("Provider"),
					<ComboBox ref={linkReactStateRef(this, { value: this.props.layer.provider }) } options={providerOptions}/>
				],
				[
					Weave.lang("URL"),
					<StatefulTextField ref={linkReactStateRef(this, { value: this.tempUrl }) }/>
				],
				[
					Weave.lang("Attribution"),
					<StatefulTextField ref={linkReactStateRef(this, { value: this.tempAttributions }) }/>
				],
				[
					Weave.lang("Projection"),
					<StatefulTextField ref={linkReactStateRef(this, { value: this.tempProjection }) }/>
				]
			]
		}
		else
		{
			editorFields = [
				[
					Weave.lang("Provider"),
					<ComboBox ref={linkReactStateRef(this, { value: this.props.layer.provider }) } options={providerOptions}/>
				],
				[
					Weave.lang("Layer"),
					<ComboBox ref={linkReactStateRef(this, { value: this.tempLayer }) }
					                                     options={layers ? layers.map((name) => { return { label: _.startCase(name), value: name }; }) : [] }/>
				]
				
			]
		}


		var tableCellClassNames = {
			td: [
				"weave-left-cell",
				"weave-right-cell"
			]
		};
		
		return ReactUtils.generateTable(
			null,
			editorFields.concat(this.props.editableFields),
			{},tableCellClassNames
		);
	}
}

export default class TileLayer extends AbstractLayer
{
	oldProviderName:string;

	provider = Weave.linkableChild(this, new LinkableString("osm"));
	providerOptions = Weave.linkableChild(this, new LinkableVariable(Object, null, {}));

	renderEditor():JSX.Element
	{
		return <TileLayerEditor layer={this} editableFields={this.renderEditableFields()}/>;
	}

	getExtent() {
		let bounds = super.getExtent();
		bounds.setCoords(this.olLayer.getExtent());
		return bounds;
	}

	constructor()
	{
		super();

		this.olLayer = new ol.layer.Tile();

		this.provider.addGroupedCallback(this, this.onProviderChange);
		this.provider.addGroupedCallback(this, this.updateTileSource);
		this.providerOptions.addGroupedCallback(this, this.updateTileSource, true);
	}

	onProviderChange()
	{
		if (this.provider.value == "stamen")
		{
			let layer:string = this.providerOptions.state && (this.providerOptions.state as any).layer;
			if (!layer || !_.contains(TileLayer.STAMEN_LAYERS, layer))
			{
				this.providerOptions.state = _.merge(this.providerOptions.state || {}, { layer: TileLayer.STAMEN_LAYERS[0] });
			}
		}
		else if (this.provider.value == "mapquest")
		{
			let layer: string = this.providerOptions.state && (this.providerOptions.state as any).layer;
			if (!layer || !_.contains(TileLayer.MAPQUEST_LAYERS, layer)) {
				this.providerOptions.state = _.merge(this.providerOptions.state || {}, { layer: TileLayer.MAPQUEST_LAYERS[0] });
			}
		}
	}

	updateProjection()
	{
		var proj = OpenLayersMapTool.getProjection(this.outputProjection);
		if (proj)
		{
			this.olLayer.setExtent(OpenLayersMapTool.getEstimatedExtent(proj));
		}			
	}

	static STAMEN_LAYERS = ["watercolor", "toner"];
	static MAPQUEST_LAYERS = ["sat", "osm"];

	get deprecatedStateMapping()
	{
		return _.merge(super.deprecatedStateMapping, {
			service: {
				'': (serviceState:any, removeMissingDynamicObjects:boolean) => {
					if (serviceState.providerName)
					{
						let providerName: string;
						let params: any = {};
						switch (serviceState.providerName)
						{
							case "Stamen WaterColor":
								providerName = "stamen";
								params.layer = "watercolor";
								break;
							case "Stamen Toner":
								providerName = "stamen";
								params.layer = "toner";
								break;
							case "Open MapQuest Aerial":
								providerName = "mapquest";
								params.layer = "sat";
								break;
							case "Open MapQuest":
								providerName = "mapquest";
								params.layer = "osm";
								break;
							case "Blue Marble Map":
								providerName = "custom";
								params.url = "http://neowms.sci.gsfc.nasa.gov/wms/wms";
							default:
								providerName = "osm";
								break;
						}
			
						this.provider.value = providerName;
						this.providerOptions.state = params;
					}
					else
					{
						this.provider.value = "custom";
						let params:any = {};
						var mapping:any = {wmsURL: 'url', attributions: 'attributions', projection: 'projection'};
						for (var key in mapping)
							if (serviceState[key] !== undefined)
								params[mapping[key]] = serviceState[key];
						Weave.setState(this.providerOptions, params, removeMissingDynamicObjects);
					}
				}
			}
		});
	}

	private static isXYZString(url:string):boolean
	{
		return url.indexOf("{x}") != -1 &&
			url.indexOf("{y}") != -1 &&
			url.indexOf("{z}") != -1;
	}

	private getSource():ol.source.Tile
	{
		let params:any = Weave.getState(this.providerOptions);
		switch (this.provider.value)
		{
			case "stamen":
				return new ol.source.Stamen(params);
			case "mapquest":
				return new ol.source.MapQuest(params);
			case "osm":
				return new ol.source.OSM(params);
			case "custom":
				if (params.url && TileLayer.isXYZString(params.url))
				{
					return new ol.source.XYZ(params);
				}
				else
				{
					return new ol.source.TileWMS(params);
				}
			default:
				return null;
		}
	}

	updateTileSource()
	{
		let newLayer: ol.source.Tile;
		try {
			newLayer = this.getSource();
		}
		catch(e)
		{
			console.error(e);
		}
		this.source = newLayer || null;
	}
}

Weave.registerClass(
	TileLayer,
	["weavejs.layer.TileLayer", "weave.visualization.plotters::WMSPlotter"],
	[weavejs.api.core.ILinkableObjectWithNewProperties],
	"Base map"
);
