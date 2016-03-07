/// <reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>

import ILinkableObject = weavejs.api.core.ILinkableObject;
import WeavePath = weavejs.path.WeavePath;

import ToolTip from "./ToolTip";

export interface IVisToolProps
{
    toolPath:WeavePath;
    font?:string;
    fontSize?:number;
    style: { width: number, height: number};
    toolTip: ToolTip
}

export interface IVisToolState
{
}

export interface IVisTool extends ILinkableObject
{
    title:string;
	renderEditor?():JSX.Element
}
