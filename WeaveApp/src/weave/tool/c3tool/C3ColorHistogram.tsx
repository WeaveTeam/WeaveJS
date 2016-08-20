import * as React from "react";
import * as weavejs from "weavejs";
import {Weave} from "weavejs";
import {WeaveAPI} from "weavejs";


import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
import ColumnUtils = weavejs.data.ColumnUtils;
import C3Histogram from "weave/tool/c3tool/C3Histogram";
import IVisTool from "weave/api/ui/IVisTool";
import {IVisToolProps} from "weave/api/ui/IVisTool";
import IAltText from "weave/api/ui/IAltText";

export default class C3ColorHistogram extends C3Histogram
{
	constructor(props:IVisToolProps)
	{
		super(props);
		this.fill.color.internalDynamicColumn.targetPath = ["defaultColorColumn"];
	}

	get defaultPanelTitle():string
	{
		if (this.binnedColumn.numberOfBins)
			return Weave.lang("Color Histogram of {0}", ColumnUtils.getTitle(this.binnedColumn));

		return Weave.lang("Color Histogram");
	}
}

Weave.registerClass(
	C3ColorHistogram,
	["weavejs.tool.c3tool.C3ColorHistogram", "weave.visualization.tools::ColormapHistogramTool"],
	[
		IVisTool,
		ILinkableObjectWithNewProperties,
		ISelectableAttributes,
		IAltText
	],
	"Color Histogram"
);
