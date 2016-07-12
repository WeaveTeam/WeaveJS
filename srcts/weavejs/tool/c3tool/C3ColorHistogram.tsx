namespace weavejs.tool.c3tool
{
	import IAltText = weavejs.api.ui.IAltText;
	import IVisToolProps = weavejs.api.ui.IVisToolProps;
	import C3Histogram = weavejs.tool.c3tool.C3Histogram;

	export class C3ColorHistogram extends C3Histogram
	{
		constructor(props:IVisToolProps)
		{
			super(props);
			this.fill.color.internalDynamicColumn.targetPath = ["defaultColorColumn"];
		}
		
		get defaultPanelTitle():string
		{
			if (this.binnedColumn.numberOfBins)
				return Weave.lang("Color Histogram of {0}", weavejs.data.ColumnUtils.getTitle(this.binnedColumn));

			return Weave.lang("Color Histogram");
		}
	}

	Weave.registerClass(
		C3ColorHistogram,
		["weavejs.tool.c3tool.C3ColorHistogram", "weave.visualization.tools::ColormapHistogramTool"],
		[
			weavejs.api.ui.IVisTool,
			weavejs.api.core.ILinkableObjectWithNewProperties,
			weavejs.api.data.ISelectableAttributes,
			IAltText
		],
		"Color Histogram"
	);
}
