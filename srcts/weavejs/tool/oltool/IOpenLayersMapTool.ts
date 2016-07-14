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
		static MAP_TOOL = "IOpenLayersMapTool";
	}
	
	weavejs.WeaveAPI.ClassRegistry.registerClass(IOpenLayersMapTool, 'weavejs.api.ui.IOpenLayersMapTool');
}
