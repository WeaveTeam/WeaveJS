import * as ol from "openlayers";
import * as weavejs from "weavejs";

import LinkableString = weavejs.core.LinkableString;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import Bounds2D = weavejs.geom.Bounds2D;
import {WeaveAPI} from "weavejs";
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

export default IOpenLayersMapTool

WeaveAPI.ClassRegistry.registerClass(IOpenLayersMapTool, 'weavejs.api.ui.IOpenLayersMapTool');
