import * as React from "react";
import C3Histogram from "./C3Histogram";
import {IVisToolProps} from "./IVisTool";
export default class C3ColorHistogram extends C3Histogram {
	
	constructor(props:IVisToolProps)
	{
		super(props);
		this.fill.color.internalDynamicColumn.targetPath = ["defaultColorColumn"];
	}
}

Weave.registerClass(
	C3ColorHistogram,
	["weavejs.tool.C3ColorHistogram", "weave.visualization.tools::ColormapHistogramTool"],
	[weavejs.api.ui.IVisTool_Basic, weavejs.api.core.ILinkableObjectWithNewProperties],
	"Color Histogram"
);
