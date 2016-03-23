import ILinkableObject = weavejs.api.core.ILinkableObject;
import WeavePath = weavejs.path.WeavePath;

import ToolTip from "./ToolTip";
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import LinkableHashMap = weavejs.core.LinkableHashMap;

export interface IVisToolProps
{
}

export interface IVisToolState
{
}

export interface IVisTool extends ILinkableObject
{
    title:string;
	renderEditor?():JSX.Element;
    selectableAttributes?:{[label:string]:DynamicColumn|LinkableHashMap};
}
