/// <reference path="../../typings/c3/c3.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/d3/d3.d.ts"/>
/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/weave/WeavePath.d.ts"/>


import {IVisToolProps} from "./IVisTool";
import {IToolPaths} from "./AbstractC3Tool";
import AbstractC3Tool from "./AbstractC3Tool";

import {registerToolImplementation} from "../WeaveTool";
import * as d3 from "d3";
import * as _ from "lodash";
import * as React from "react";
import {ChartAPI, ChartConfiguration, generate} from "c3";

interface IPieChartPaths extends IToolPaths {
    plotter: WeavePath;
    data: WeavePath;
    label: WeavePath;
    fillStyle:WeavePath;
    lineStyle:WeavePath;
    innerRadius:WeavePath;
    filteredKeySet:WeavePath;
    selectionKeySet:WeavePath;
    probeKeySet:WeavePath;
};

export default class WeaveC3PieChart extends AbstractC3Tool {

    private keyToIndex:{[key:string]: number};
    private indexToKey:{[index:number]: string};
    protected chart:ChartAPI;
    protected c3Config:ChartConfiguration;
    protected paths:IPieChartPaths;
    private flag:boolean;
    private numericRecords:Record[];
    private stringRecords:Record[];
    private colors:{[key:string] : string};

    constructor(props:IVisToolProps) {
        super(props);
    }

    protected handleMissingSessionStateProperties(newState:any)
	{

	}

    private selectionKeysChanged():void {
        if(!this.chart)
            return;

        var keys:string[] = this.toolPath.selection_keyset.getKeys();
        if(keys.length) {
            this.chart.focus(keys);
        } else {
            this.chart.focus();
        }
    }

    private probedKeysChanged():void {
        var keys:string[] = this.toolPath.probe_keyset.getKeys();

        if(keys.length) {
            this.chart.focus(keys);
        } else {
            this.selectionKeysChanged();
        }
    }

    private updateStyle():void {

    }

    handleClick(event:React.MouseEvent):void {
        if(!this.flag) {
            this.toolPath.selection_keyset.setKeys([])
        }
        this.flag = false;
    }

    private dataChanged():void {

        if(!this.chart)
            return;

        let numericMapping:any = {
            data: this.paths.data
        };

        let stringMapping:any = {
            fill: {
                color: this.paths.fillStyle.push("color")
            },
            line: {

            },
            label: this.paths.label
        }

        this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.keyToIndex = {};
        this.indexToKey = {};

        this.numericRecords.forEach( (record:Record, index:number) => {
            this.indexToKey[index] = record["id"] as string;
            this.keyToIndex[record["id"] as string] = index;
        });

        var columns:[string, number][] = [];

        columns = this.numericRecords.map(function(record:Record) {
            var tempArr:[string, number] = [record["id"] as string, record["data"] as number];
            return tempArr;
        });

        var chartType:string = "pie";

        if(this.paths.plotter.getState("innerRadius") > 0) {
            chartType = "donut"
        }

        this.colors = {}
        this.stringRecords.forEach((record:Record) => {
            this.colors[record["id"] as string] = (record["fill"] as Record)["color"] as string || "#C0CDD1";
        });

        this.chart.load({
            columns: columns,
            type: chartType,
            colors: this.colors,
            unload: true
        });
    }

    componentWillUnmount():void {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
        this.chart.destroy();
    }

    componentDidMount() {
        this.element.addEventListener("click", this.handleClick.bind(this));
        var dataChanged:Function = _.debounce(this.dataChanged.bind(this), 100);
        var selectionKeySetChanged:Function = this.selectionKeysChanged.bind(this);
        var probeKeySetChanged:Function = _.debounce(this.probedKeysChanged.bind(this), 100);
        var plotterPath:WeavePath = this.toolPath.pushPlotter("plot");
        var manifest = [
          { name: "plotter", path: plotterPath, callbacks: null},
          { name: "data", path: plotterPath.push("data"), callbacks: dataChanged },
          { name: "label", path: plotterPath.push("label"), callbacks: dataChanged },
          { name: "fillStyle", path: plotterPath.push("fill"), callbacks: dataChanged },
          { name: "lineStyle", path: plotterPath.push("line"), callbacks: dataChanged },
          { name: "innerRadius", path: plotterPath.push("innerRadius"), callbacks: dataChanged },
          { name: "filteredKeySet", path: plotterPath.push("filteredKeySet"), callbacks: dataChanged },
          { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: selectionKeySetChanged},
          { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: probeKeySetChanged}
        ];

        this.initializePaths(manifest);

       	this.paths.filteredKeySet.getObject().setSingleKeySource(this.paths.data.getObject());

        this.c3Config = {
            size: {
                width: this.props.style.width,
                height: this.props.style.height
            },
            bindto: this.element,
            padding: {
              top: 20,
              bottom: 20,
              right: 30
            },
            tooltip: {
                show: false
            },
            data: {
                columns: [],
                selection: {
                   enabled: true,
                   multiple: true,
                   draggable: true
               },
               type: "pie",
               onclick: (d:any) => {
                 var event:MouseEvent = this.chart.internal.d3.event as MouseEvent;
                 if(!(event.ctrlKey || event.metaKey) && d && d.hasOwnProperty("index")) {
                     this.toolPath.selection_keyset.setKeys([this.indexToKey[d.index]]);
                 }
               },
                onselected: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.addKeys([this.indexToKey[d.index]]);
                    }
                },
                onunselected: (d:any) => {
                    if(d && d.hasOwnProperty("data")) {
                        // d has a different structure than "onselected" argument
                        this.toolPath.selection_keyset.setKeys([]);
                    }
                },
                onmouseover: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        var columnNamesToValue:{[columnName:string] : string|number } = {};
                        columnNamesToValue[this.paths.data.getObject().getMetadata("title")] = d.value;
                        this.toolPath.probe_keyset.setKeys([this.indexToKey[d.index]]);
                        this.props.toolTip.setState({
                            showToolTip: true,
                            x: this.chart.internal.d3.event.pageX,
                            y: this.chart.internal.d3.event.pageY,
                            columnNamesToValue: columnNamesToValue
                        });
                    }
                },
                onmouseout: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([]);
                        this.props.toolTip.setState({
                            showToolTip: false
                        });
                    }
                }
            },
            pie: {
                label: {
                    show: true,
                    format: (value:number, ratio:number, id:string):string => {
                        if(this.stringRecords && this.stringRecords.length) {
                            var record:Record = this.stringRecords[this.keyToIndex[id]];
                            if(record && record["label"]) {
                                return record["label"] as string;
                            }
                            return String(value);
                        }
                    }
                }
            },
            donut: {
                label: {
                    show: true,
                    format: (value:number, ratio:number, id:string):string => {
                        if(this.stringRecords && this.stringRecords.length) {
                            var record = this.stringRecords[this.keyToIndex[id]];
                            if(record && record["label"]) {
                                return record["label"] as string;
                            }
                            return String(value);
                        }
                    }
                }
            },
            legend: {
                show: false
            },
            onrendered: this.updateStyle.bind(this)
        };
        this.chart = generate(this.c3Config);
    }
}

registerToolImplementation("weave.visualization.tools::PieChartTool", WeaveC3PieChart);
//Weave.registerClass("weavejs.tools.PieChartTool", WeaveC3PieChart, [weavejs.api.core.ILinkableObjectWithNewProperties]);
