///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/react/react-dom.d.ts"/>
///<reference path="../../typings/weave/WeavePath.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
/// <reference path="../../typings/c3/c3.d.ts"/>

import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import {ChartAPI, ChartConfiguration} from "c3";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";

export interface IToolPaths {
    [name:string] : WeavePath
}


interface PathConfig {
    name: string;
    path: WeavePath;
    callbacks?: Function|Function[];
}

export default class AbstractC3Tool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool {

    protected toolPath:WeavePath;
    protected element:HTMLElement;
    protected paths:IToolPaths;
    protected chart:ChartAPI;
    protected c3Config:ChartConfiguration;

    private previousWidth:number;
    private previousHeight:number;

    constructor(props:IVisToolProps) {
        super(props);
        this.toolPath = props.toolPath;
        this.paths = {};
    }

    get title():string {
       return (this.toolPath.getType('panelTitle') ? this.toolPath.getState('panelTitle') : '') || this.toolPath.getPath().pop();
    }


    componentDidUpdate():void {
        if(this.c3Config.size.width != this.props.style.width || this.c3Config.size.height != this.props.style.height) {
            this.c3Config.size = {width: this.props.style.width, height: this.props.style.height};
            this.chart.resize({width:this.props.style.width, height:this.props.style.height});
        }
    }

    // this function accepts an arry of path configurations
    // a path config is an object with a path object name, the weave path and an
    // optional callback or array of callbacks
    initializePaths(properties:PathConfig[]):void {
        properties.forEach((pathConf:PathConfig) => {
            this.paths[pathConf.name] = pathConf.path;
            if(pathConf.callbacks) {
                var callbacks:Function[] = Array.isArray(pathConf.callbacks) ? pathConf.callbacks as Function[] : [pathConf.callbacks as Function];
                callbacks.forEach((callback:Function) => {
                    this.paths[pathConf.name].addCallback(this, callback, true);
                });
            }
        });
    }

    protected handleMissingSessionStateProperties(newState:any)
    {

    }

    customStyle(array:Array<number>, type:string, filter:string, style:any) {
        array.forEach( (index) => {
        	var filtered = d3.select(this.element).selectAll(type).filter(filter);
        	if (filtered.length)
        		d3.select(filtered[0][index]).style(style);
        });
    }

    customSelectorStyle(array:Array<number>, selector, style:any) {
        array.forEach( (index) => {
            if (selector.length)
                d3.select(selector[0][index]).style(style);
        });
    }

    render():JSX.Element {
        return <div ref={(c:HTMLElement) => {this.element = c;}} style={{width: "100%", height: "100%", maxHeight: "100%"}}/>;
    }
}
