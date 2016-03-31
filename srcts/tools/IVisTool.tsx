import ILinkableObject = weavejs.api.core.ILinkableObject;
import WeavePath = weavejs.path.WeavePath;
import * as React from "react";
import SelectableAttributeComponent from "../ui/SelectableAttributeComponent";

import ToolTip from "./ToolTip";
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;

export interface IVisToolProps
{
}

export interface IVisToolState
{
}

export interface IVisTool extends ILinkableObject
{
    title:string;
	renderEditor():JSX.Element;
    selectableAttributes:Map<string,(IColumnWrapper|LinkableHashMap)>;//TODO make this into an interface?
}

export function renderSelectableAttributes(tool:IVisTool)
{
	return(<SelectableAttributeComponent attributes={ tool.selectableAttributes }/>);
}
