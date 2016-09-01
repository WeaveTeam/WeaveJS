namespace weavejs.tool.c3tool
{
	import IAltText = weavejs.api.ui.IAltText;
	import IVisToolProps = weavejs.api.ui.IVisToolProps;
	import C3Histogram = weavejs.tool.c3tool.C3Histogram;
	import IVisTool = weavejs.api.ui.IVisTool;
	import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import ColumnUtils = weavejs.data.ColumnUtils;

	export class C3ColorHistogram extends C3Histogram
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
		}) ;

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
}
