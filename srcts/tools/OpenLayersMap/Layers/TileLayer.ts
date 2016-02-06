///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

import * as ol from "openlayers";
import Layer from "./Layer";

declare var Weave:any;
declare var weavejs:any;

class TileLayer extends Layer {

	servicePath:WeavePath;
	oldProviderName:string;

	constructor(parent:any, layerName:any)
	{
		super(parent, layerName);

		this.olLayer = new ol.layer.Tile();
		this.servicePath = this.layerPath.push("service", null);
		this.oldProviderName = null;

		this.servicePath.addCallback(this, this.updateTileSource, true);
		this.projectionPath.addCallback(this, this.updateValidExtents, true);
	}

	handleMissingSessionStateProperties(newState:any)
	{

	}

	updateValidExtents()
	{
		var proj = ol.proj.get(this.projectionPath.getState() || "EPSG:3857");
		if (proj)
			this.olLayer.setExtent(proj.getExtent());
		else
			console.log('invalid proj -> no extent');
	}
	getCustomWMSSource()
	{
		var customWMSPath = this.servicePath;

		if (customWMSPath.push("wmsURL").getType()) {
			let url = customWMSPath.getState("wmsURL");
			let attributions = customWMSPath.getState("creditInfo");
			let projection = customWMSPath.getState("tileProjectionSRS");

			return new ol.source.XYZ({
				url, attributions, projection
			});
		}
	}

	getModestMapsSource()
	{
		var providerNamePath = this.servicePath.push("providerName");

		if (providerNamePath.getType()) {
			let providerName = providerNamePath.getState();

			if (providerName === this.oldProviderName) {
				return undefined;
			}

			switch (providerName)
			{
				case "Stamen WaterColor":
					return new ol.source.Stamen({layer: "watercolor"});
				case "Stamen Toner":
					return new ol.source.Stamen({layer: "toner"});
				case "Open MapQuest Aerial":
					return new ol.source.MapQuest({layer: "sat"});
				case "Open MapQuest":
					return new ol.source.MapQuest({layer: "osm"});
				case "Open Street Map":
					return new ol.source.OSM({wrapX: false});
				case "Blue Marble Map":
					return new ol.source.TileWMS({url: "http://neowms.sci.gsfc.nasa.gov/wms/wms", wrapX: false});
				default:
					return null;
			}
		}
	}

	updateTileSource()
	{
		var serviceDriverName = this.servicePath.getType();
		var newLayer:any = null;
		switch (serviceDriverName)
		{
			case "weave.services.wms::ModestMapsWMS":
				newLayer = this.getModestMapsSource();
				break;
			case "weave.services.wms::CustomWMS":
				newLayer = this.getCustomWMSSource();
				break;
			default:
				newLayer = null;
		}

		if (newLayer !== undefined)
		{
			this.source = newLayer;
		}
	}
}

Layer.registerClass("weave.visualization.plotters::WMSPlotter", TileLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
export default TileLayer;
