import ILinkableObject = weavejs.api.core.ILinkableObject;
import WeavePath = weavejs.path.WeavePath;

import ToolTip from "./ToolTip";

export interface IVisToolProps
{
    font?:string;
    fontSize?:number;
    toolTip: ToolTip;
}

export interface IVisToolState
{
}

export interface IVisTool extends ILinkableObject
{
    title:string;
	renderEditor?():JSX.Element
}
