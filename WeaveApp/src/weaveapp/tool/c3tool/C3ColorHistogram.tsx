import * as React from "react";
import * as weavejs from "weavejs";
import {Weave} from "weavejs";
import {WeaveAPI} from "weavejs";


import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
import ColumnUtils = weavejs.data.ColumnUtils;
import C3Histogram from "weaveapp/tool/c3tool/C3Histogram";
import IVisTool from "weaveapp/api/ui/IVisTool";
import {IVisToolProps} from "weaveapp/api/ui/IVisTool";
import IAltText from "weaveapp/api/ui/IAltText";

export default class C3ColorHistogram extends C3Histogram
{
	static WEAVE_INFO = Weave.classInfo(C3ColorHistogram, {
		id: "weavejs.tool.c3tool.C3ColorHistogram",
		label: "Color Histogram",
		interfaces: [
			IVisTool,
			ILinkableObjectWithNewProperties,
			ISelectableAttributes,
			IAltText
		],
		deprecatedIds: ["weave.visualization.tools::ColormapHistogramTool"]
	});

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
