import ILinkableObject = weavejs.api.core.ILinkableObject;
import WeavePath = weavejs.path.WeavePath;
import * as React from "react";
import SelectableAttributeComponent from "../ui/SelectableAttributeComponent";

import ToolTip from "./ToolTip";
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
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
	renderEditor(linktoToolEditorCrumbFunction:Function):JSX.Element;
    selectableAttributes:Map<string,(IColumnWrapper|ILinkableHashMap)>;//TODO make this into an interface?
}

export function renderSelectableAttributes(tool:IVisTool,linkToToolEditorCrumbFunction:Function)
{
	return <SelectableAttributeComponent attributes={ tool.selectableAttributes } linkToToolEditorCrumb={ linkToToolEditorCrumbFunction }/>;
}
