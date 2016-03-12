import ILinkableObject = weavejs.api.core.ILinkableObject;
import WeavePath = weavejs.path.WeavePath;

import ToolTip from "./ToolTip";

export interface IVisToolProps
{
}

export interface IVisToolState
{
}

export interface IVisTool extends ILinkableObject
{
    title:string;
	renderEditor?():JSX.Element
}
