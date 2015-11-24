import ol from "openlayers";
import StandardLib from "../../../Utils/StandardLib.js";
import {registerLayerImplementation} from "./Layer.js";
import GlyphLayer from "./GlyphLayer.js";
import lodash from "lodash";

class ScatterPlotLayer extends GlyphLayer {
	constructor(parent, layerName)
	{
		super(parent, layerName);

		let boundUpdateStyleData = this.updateStyleData.bind(this);
		
		this.sizeBy = this.layerPath.push("sizeBy").addCallback(boundUpdateStyleData, true);

		
		this.fillStylePath = this.layerPath.push("fill").addCallback(boundUpdateStyleData);
		this.lineStylePath = this.layerPath.push("line").addCallback(boundUpdateStyleData);
		this.maxRadiusPath = this.layerPath.push("maxScreenRadius").addCallback(boundUpdateStyleData);
		this.minRadiusPath = this.layerPath.push("minScreenRadius").addCallback(boundUpdateStyleData, true);
	}

	updateStyleData()
	{
		var styleRecords = this.layerPath.retrieveRecords({
			fill: {
				color: this.fillStylePath.push("color"),
				alpha: this.fillStylePath.push("alpha"),
				imageURL: this.fillStylePath.push("imageURL")
			},
			stroke: {
				color: this.lineStylePath.push("color"),
				alpha: this.lineStylePath.push("alpha"),
				weight: this.lineStylePath.push("weight"),
				lineCap: this.lineStylePath.push("caps"),
				lineJoin: this.lineStylePath.push("joints"),
				miterLimit: this.lineStylePath.push("miterLimit")
			},
			sizeBy: this.sizeBy
		});
	}
}

export default ScatterPlotLayer;

registerLayerImplementation("weave.visualization.plotters::ScatterPlotPlotter", ScatterPlotLayer);
