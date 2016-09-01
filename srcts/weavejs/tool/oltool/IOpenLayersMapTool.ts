namespace weavejs.tool.oltool
{
	import LinkableString = weavejs.core.LinkableString;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import Bounds2D = weavejs.geom.Bounds2D;
	/**
	 *
	 */
	export interface IOpenLayersMapTool
	{
		/**
		 *
		 */
		projectionSRS:LinkableString;
		getDefaultProjection:()=>string;
		map:ol.Map;
		layers:LinkableHashMap;
		getExtent():Bounds2D;
		interactionMode:LinkableString;
	}

	export class IOpenLayersMapTool
	{
		static WEAVE_INFO = Weave.classInfo(IOpenLayersMapTool, {id: 'weavejs.api.ui.IOpenLayersMapTool', linkable: false});
		static MAP_TOOL = "IOpenLayersMapTool";
	}
}
