import Layer from "./Layer.js";
import ol from "openlayers";
import {registerLayerImplementation} from "./Layer.js";

class TileLayer extends Layer {

	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.layer = new ol.layer.Tile();
		this.servicePath = this.layerPath.push("service", null);
		this.oldProviderName = null;

		this.servicePath.addCallback(this, this.updateTileSource, true);
		this.projectionPath.addCallback(this, this.updateValidExtents, true);
	}

	updateValidExtents()
	{
		var proj = ol.proj.get(this.projectionPath.getState() || "EPSG:3857");
		if (proj)
			this.layer.setExtent(proj.getExtent());
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
					return new ol.source.Stamen({layer: "watercolor", wrapX: false});
				case "Stamen Toner":
					return new ol.source.Stamen({layer: "toner", wrapX: false});
				case "Open MapQuest Aerial":
					return new ol.source.MapQuest({layer: "sat", wrapX: false});
				case "Open MapQuest":
					return new ol.source.MapQuest({layer: "osm", wrapX: false});
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
		var newLayer = null;
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

export default TileLayer;

registerLayerImplementation("weave.visualization.plotters::WMSPlotter", TileLayer);
