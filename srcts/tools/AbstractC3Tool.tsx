///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/react/react-dom.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
/// <reference path="../../typings/c3/c3.d.ts"/>

import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import {ChartAPI, ChartConfiguration} from "c3";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";
import StandardLib from "../utils/StandardLib";

export interface IToolPaths {
    [name:string] : WeavePath;
    plotter: WeavePath;
    marginTop: WeavePath;
    marginBottom: WeavePath;
    marginLeft: WeavePath;
    marginRight: WeavePath;
    xAxis: WeavePath;
    yAxis: WeavePath;
    filteredKeySet: WeavePath;
    selectionKeySet: WeavePath;
    probeKeySet: WeavePath;
}


interface PathConfig {
    name: string;
    path: WeavePath;
    callbacks?: Function|Function[];
}

export default class AbstractC3Tool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool {

    protected toolPath:WeavePath;
    protected plotManagerPath:WeavePath;
    protected element:HTMLElement;
    protected paths:IToolPaths;
    protected chart:ChartAPI;
    protected c3Config:ChartConfiguration;
    private xAxisClass:string;
    private yAxisClass:string;
    private y2AxisClass:string;

    private previousWidth:number;
    private previousHeight:number;

    constructor(props:IVisToolProps) {
        super(props);
        this.toolPath = props.toolPath;
        this.plotManagerPath = this.toolPath.push(["children","visualization","plotManager"]);
        this.xAxisClass = "c3-axis-x";
        this.yAxisClass = "c3-axis-y";
        this.y2AxisClass = "c3-axis-y2";
        this.paths = {
            plotter: {},
            marginTop: {},
            marginBottom: {},
            marginLeft: {},
            marginRight: {},
            xAxis: {},
            yAxis: {},
            filteredKeySet: {},
            selectionKeySet: {},
            probeKeySet: {}
        };
    }

    get title():string {
       return (this.toolPath.getType('panelTitle') ? this.toolPath.getState('panelTitle') : '') || this.toolPath.getPath().pop();
    }

    get internalWidth():number {
        return this.props.style.width - this.c3Config.padding.left - this.c3Config.padding.right;
    }

    get internalHeight():number {
        return this.props.style.height - this.c3Config.padding.top - Number(this.paths.marginBottom.getState());
    }

    private cullAxis(axisSize:number, axisClass:string):void {
        var intervalForCulling:number = this.getCullingInterval(axisSize,axisClass);
        d3.select(this.element).selectAll('.' + axisClass + ' .tick text').each(function (e, index) {
            if (index >= 0) {
                d3.select(this).style('display', index % intervalForCulling ? 'none' : 'block');
            }
        });
    }

    protected cullAxes() {
        //cull axes
        var width:number = this.internalWidth;
        var height:number = this.internalHeight;
        this.cullAxis(width, this.xAxisClass);
        if(weavejs.WeaveAPI.Locale.reverseLayout) {
            this.cullAxis(height, this.y2AxisClass);
        }else{
            this.cullAxis(height, this.yAxisClass);
        }
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

    detectChange(...pathNames):boolean {
        return Weave.detectChange.apply(Weave, [this].concat(pathNames.map(name => this.paths[name].getObject())));
    }

    getCullingInterval(size:number,axisClass:string):number {
        var textHeight:number = StandardLib.getTextHeight("test", this.getFontString());
        var labelsToShow:number = Math.floor(size / textHeight);
        labelsToShow = Math.max(2,labelsToShow);

        var tickValues:number = d3.select(this.element).selectAll('.' + axisClass + ' .tick text').size();
        var intervalForCulling:number;
        for (var i:number = 1; i < tickValues; i++) {
            if (tickValues / i < labelsToShow) {
                intervalForCulling = i;
                break;
            }
        }
        return intervalForCulling;
    }

    getFontString():string {
        return this.props.fontSize + "pt " + this.props.font;
    }
}
