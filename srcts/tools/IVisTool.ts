/// <reference path="../../typings/react/react.d.ts"/>

import ToolTip from "./tooltip";

export interface IVisToolProps {
    toolPath:WeavePath;
    font?:string;
    fontSize?:number;
    style: { width: number, height: number};
    toolTip: ToolTip
}

export interface IVisToolState {

}

export interface IVisTool {
    title:string;
}
