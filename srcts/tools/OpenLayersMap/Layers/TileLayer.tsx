import * as ol from "openlayers";
import * as lodash from "lodash";
import AbstractLayer from "./AbstractLayer";
import * as React from "react";
import StatefulComboBox from "../../../ui/StatefulComboBox";
import {linkReactStateRef} from "../../../utils/WeaveReactUtils";
import {VBox, HBox} from "../../../react-ui/FlexBox";

import LinkableString = weavejs.core.LinkableString;
import LinkableVariable = weavejs.core.LinkableVariable;

interface ITileLayerEditorProps {
	layer: TileLayer;
}

interface ITileLayerEditorState {
	paramLayer: string;
	paramAttributions: string;
	paramProjection: string;
}

class TileLayerEditor extends React.Component<ITileLayerEditorProps,ITileLayerEditorState>
{
	constructor(props:ITileLayerEditorProps)
	{
		super(props);
		this.componentWillReceiveProps(props);
	}

	componentWillReceiveProps(nextProps: ITileLayerEditorProps)
	{
		Weave.getCallbacks(nextProps.layer).addGroupedCallback(this, this.forceUpdate);
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

		let providerOptions = [{ value: "stamen", label: "Stamen" }, { value: "mapquest", label: "MapQuest" }];

		let layerSelection: JSX.Element;
		if (layers)
		{
			layerSelection = <StatefulComboBox ref={linkReactStateRef(this, { value: this.props.layer }) }
				options={layers.map((name) => { return { label: lodash.startCase(name), value: name }; }) }/>;
		}
		else
		{
			layerSelection = <div/>;
		}


		
		return <VBox>
			<StatefulComboBox ref={linkReactStateRef(this, { value: this.props.layer.provider }) } options={providerOptions}/>
			{layerSelection}
		</VBox>;
	}
}

export default class TileLayer extends AbstractLayer
{
	oldProviderName:string;

	provider = Weave.linkableChild(this, LinkableString);
	providerOptions = Weave.linkableChild(this, LinkableVariable);

	renderEditor():JSX.Element
	{
		return <TileLayerEditor layer={this}/>;
	}

	constructor()
	{
		super();

		this.olLayer = new ol.layer.Tile();

		this.provider.addGroupedCallback(this, this.updateTileSource);
		this.providerOptions.addGroupedCallback(this, this.updateTileSource, true);
	}

	updateProjection()
	{
		var proj = ol.proj.get(this.outputProjection);
		if (proj)
			this.olLayer.setExtent(proj.getExtent());
		else
		 	console.log('invalid proj -> no extent');
	}

	get deprecatedStateMapping()
	{
		return {
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
		};
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
		let newLayer: ol.source.Tile = this.getSource();
		if (newLayer !== undefined)
		{
			this.source = newLayer;
		}
	}
}

Weave.registerClass("weave.visualization.plotters::WMSPlotter", TileLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
