namespace weavejs.tool.oltool
{
	import LinkableString = weavejs.core.LinkableString;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
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
	}

	export class IOpenLayersMap
	{
	}
	weavejs.WeaveAPI.ClassRegistry.registerClass(IOpenLayersMap, 'weavejs.api.ui.IOpenLayersMap');
}
