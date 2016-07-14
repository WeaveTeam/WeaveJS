namespace weavejs.tool.oltool
{
	import LinkableString = weavejs.core.LinkableString;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import Bounds2D = weavejs.geom.Bounds2D;
	/**
	 *
	 */
	export interface IOpenLayersMap
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

	export class IOpenLayersMap
	{
	}
	weavejs.WeaveAPI.ClassRegistry.registerClass(IOpenLayersMap, 'weavejs.api.ui.IOpenLayersMap');
}
