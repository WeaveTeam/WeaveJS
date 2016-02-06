///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>

import {IVisToolProps} from "./IVisTool";
import {IToolPaths} from "./AbstractC3Tool";
import AbstractC3Tool from "./AbstractC3Tool";
import {registerToolImplementation} from "../WeaveTool";
import * as _ from "lodash";
import * as d3 from "d3";
import FormatUtils from "../utils/FormatUtils";
import * as React from "react";
import * as c3 from "c3";
import {ChartConfiguration, ChartAPI} from "c3";
import {MouseEvent} from "react";
import {getTooltipContent} from "./tooltip";
import Tooltip from "./tooltip";
import * as ReactDOM from "react-dom";
import StandardLib from "../utils/StandardLib";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;

export interface IColumnStats {
    min: number;
    max: number;
}

export interface IScatterplotPaths extends IToolPaths {
    dataX: WeavePath;
    dataY: WeavePath;
    sizeBy: WeavePath;
    fill: WeavePath;
    line: WeavePath;
}

/* private
 * @param records array or records
 * @param attributes array of attributes to be normalized
 */
export default class WeaveC3ScatterPlot extends AbstractC3Tool {

    private keyToIndex:{[key:string]: number};
    private indexToKey:{[index:number]: IQualifiedKey};
    private xAxisValueToLabel:{[value:number]: string};
    private yAxisValueToLabel:{[value:number]: string};
    protected chart:ChartAPI;
    private dataXType:string;
    private dataYType:string;
    private numericRecords:Record[];
    private stringRecords:Record[];
    private normalizedRecords:Record[];
    private records:Record[][];

    protected paths:IScatterplotPaths;
    private plotterState:any;
    private normalizedPointSizes:number[];

    private flag:boolean;
    private busy:boolean;
    private dirty:boolean;

    protected c3Config:ChartConfiguration;
    protected c3ConfigYAxis:c3.YAxisConfiguration;

    constructor(props:IVisToolProps) {
        super(props);
        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};
        this.xAxisValueToLabel = {};
        this.validate = _.debounce(this.validate.bind(this), 30);

        this.c3Config = {
            size: {
                height: this.props.style.height,
                width: this.props.style.width
            },
            bindto: null,
            padding: {
                top: 20,
                bottom: 0,
                left:100,
                right:20
            },
            data: {
                rows: [],
                x: "x",
                xSort: false,
                type: "scatter",
                selection: {
                    enabled: true,
                    multiple: true,
                    draggable: true
                },
                color: (color:string, d:any):string => {
                    if(this.stringRecords && d.hasOwnProperty("index")) {

                        // find the corresponding index of numericRecords in stringRecords
//                        var id:IQualifiedKey = this.indexToKey[d.index as number];
//                        var index:number = _.pluck(this.stringRecords, "id").indexOf(id);

                        var record:Record = this.stringRecords[d.index];
                        return (record && record["fill"] && (record["fill"] as Record)["color"]) ? (record["fill"] as Record)["color"] as string : "#000000";
                    }
                    return "#000000";
                },
                onclick: (d:any) => {
                    var event:MouseEvent = (this.chart.internal.d3).event as MouseEvent;
                    if(!(event.ctrlKey||event.metaKey) && d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.setKeys([this.indexToKey[d.index]]);
                    }
                },
                onselected: (d:any) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.addKeys([this.indexToKey[d.index]]);
                    }
                },
                onunselected: (d) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.removeKeys([this.indexToKey[d.index]]);
                    }
                },
                onmouseover: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([]);
                        var columnNamesToValue:{[columnName:string] : string|number } = {};
                        var xValue:number = this.numericRecords[d.index]["point"]["x"];
                        if(xValue) {
                            columnNamesToValue[this.paths.dataX.getObject().getMetadata('title')] = xValue;
                        }

                        var yValue:number = this.numericRecords[d.index]["point"]["y"]
                        if(yValue) {
                            columnNamesToValue[this.paths.dataY.getObject().getMetadata('title')] = yValue;
                        }

                        var sizeByValue:number = this.numericRecords[d.index]["size"] as number;
                        if(sizeByValue) {
                            columnNamesToValue[this.paths.sizeBy.getObject().getMetadata('title')] =  sizeByValue;
                        }
                        this.toolPath.probe_keyset.setKeys([this.indexToKey[d.index]]);
                        this.props.toolTip.setState({
                            x: this.chart.internal.d3.event.pageX,
                            y: this.chart.internal.d3.event.pageY,
                            showToolTip: true,
                            columnNamesToValue: columnNamesToValue
                        });
                    }
                },
                onmouseout: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([]);
                        this.props.toolTip.setState({
                            showToolTip: false
                        });
                    }
                }
            },
            legend: {
                show: false
            },
            axis: {
                x: {
                    label: {
                        text: "",
                        position: "outer-center"
                    },
                    tick: {
                        format: (num:number):string => {
                            if(this.paths.dataX && this.xAxisValueToLabel && this.dataXType !== "number") {
                                return this.xAxisValueToLabel[num] || "";
                            } else {
                                return String(FormatUtils.defaultNumberFormatting(num));
                            }
                        },
                        rotate: -45,
                        culling: {
                            max: null
                        },
                        fit: false
                    }
                }
            },
            transition: { duration: 0 },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            tooltip: {
                format: {
                    title: (num:number):string => {
                        return this.paths.xAxis.getState("overrideAxisName") || this.paths.dataX.getObject().getMetadata('title');
                    },
                    name: (name:string, ratio:number, id:string, index:number):string => {
                        return this.paths.yAxis.getState("overrideAxisName") || this.paths.dataY.getObject().getMetadata('title');
                    }
                },
                show: false
            },
            point: {
                r: (d:any):number => {
                    if(d.hasOwnProperty("index")) {
                        return this.normalizedPointSizes[d.index];
                    }

                },
                focus: {
                    expand: {
                        enabled: false
                    }
                }
            },
            onrendered: () => {
                this.busy = false;
                this.updateStyle();
                if (this.dirty)
                    this.validate();
            }
        };
        this.c3ConfigYAxis = {
            show: true,
            label: {
                text: "",
                position: "outer-middle"
            },
            tick: {
                format: (num:number):string => {
                    if(this.paths.dataY && this.yAxisValueToLabel && this.dataYType !== "number") {
                        return this.yAxisValueToLabel[num] || "";
                    } else {
                        return String(FormatUtils.defaultNumberFormatting(num));
                    }
                }
            }
        };
    }

    protected handleMissingSessionStateProperties(newState:any)
	{

	}

    private normalizeRecords (records:Record[], attributes:string[]):any[] {

        // to avoid computing the stats at each iteration.
        var columnStatsCache:{[attribute:string]:IColumnStats} = {};
        attributes.forEach(function(attr:string) {
            columnStatsCache[attr] = {
                min: _.min(_.pluck(records, attr)),
                max: _.max(_.pluck(records, attr))
            };
        });

        return records.map(function(record:any) {

            var obj:any = {};

            attributes.forEach(function(attr:string) {
                var min:number = columnStatsCache[attr].min;
                var max:number = columnStatsCache[attr].max;

                if(!min)
                    min = 0;

                if(max - min === 0) {
                    return 0;
                }

                if(record[attr]) {
                    // console.log( (record[attr] - min) / (max - min));
                    obj[attr] = (record[attr] - min) / (max - min);
                } else {
                    // if any of the value above is null then
                    // we can't normalize
                    obj[attr] = null;
                }
            });

            return obj;
        });
    }

    private dataChanged() {

        let numericMapping:any = {
            point: {
                x: this.paths.dataX,
                y: this.paths.dataY
            },
            size: this.paths.sizeBy
        };

        let stringMapping:any = {
            point: {
                x: this.paths.dataX,
                y: this.paths.dataY
            },
            fill: {
                //alpha: this._fillStylePath.push("alpha"),
                color: this.paths.fill.push("color")
            },
            line: {
                //alpha: this._lineStylePath.push("alpha"),
                color: this.paths.line.push("color")
                //caps: this._lineStylePath.push("caps")
            }
        };

        this.dataXType = this.paths.dataX.getObject().getMetadata('dataType');
        this.dataYType = this.paths.dataY.getObject().getMetadata('dataType');

        this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        if(!this.numericRecords.length)
            return;
        this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.records = _.zip(this.numericRecords, this.stringRecords);
        this.records = _.sortByOrder(this.records, ["size", "id"], ["desc", "asc"]);

        if(weavejs.WeaveAPI.Locale.reverseLayout) {
            this.records = this.records.reverse();
        }

        if(this.records.length)
            [this.numericRecords, this.stringRecords] = _.unzip(this.records);

        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};
        this.xAxisValueToLabel = {};

        this.numericRecords.forEach((record:Record, index:number) => {
            this.keyToIndex[record.id as any] = index;
            this.indexToKey[index] = record.id;
        });

        this.stringRecords.forEach((record:any, index:number) => {
            this.xAxisValueToLabel[(this.numericRecords[index]["point"] as Record)["x"] as number] = (record["point"] as Record)["x"] as string;
            this.yAxisValueToLabel[(this.numericRecords[index]["point"] as Record)["y"] as number] = (record["point"] as Record)["y"] as string;
        });

        this.normalizedRecords = this.normalizeRecords(this.numericRecords, ["size"]);
        this.plotterState = this.paths.plotter.getUntypedState ? this.paths.plotter.getUntypedState() : this.paths.plotter.getState();
        this.normalizedPointSizes = this.normalizedRecords.map((normalizedRecord:Record) => {
            if(this.plotterState && this.plotterState.sizeBy) {
                let minScreenRadius = this.plotterState.minScreenRadius;
                let maxScreenRadius = this.plotterState.maxScreenRadius;
                return (normalizedRecord && normalizedRecord["size"] ?
                    minScreenRadius + normalizedRecord["size"] as number * (maxScreenRadius - minScreenRadius) :
                        this.plotterState.defaultScreenRadius) || 3;
            }
            else {
                return (this.plotterState.defaultScreenRadius) || 3;
            }
        });
    }

    handleClick(event:MouseEvent):void {
        if(!this.flag) {
            this.toolPath.selection_keyset.setKeys([]);
        }
        this.flag = false;
    }

    updateStyle()
    {
    	if (!this.chart || !this.dataXType)
    		return;

        d3.select(this.element)
	        .selectAll("circle")
	        .style("opacity", 1)
            .style("stroke", "black")
            .style("stroke-opacity", 0.0)
            .style("stroke-width",1.0);

        var selectedKeys:string[] = this.toolPath.selection_keyset.getKeys();
        var probedKeys:string[] = this.toolPath.probe_keyset.getKeys();
        var selectedIndices:number[] = selectedKeys.map((key:string) => {
            return Number(this.keyToIndex[key]);
        });
        var probedIndices:number[] = probedKeys.map((key:string) => {
           return Number(this.keyToIndex[key]);
        });
        var keys:string[] = Object.keys(this.keyToIndex);
        var indices:number[] = keys.map((key:string) => {
            return Number(this.keyToIndex[key]);
        });

        var unselectedIndices:number[] = _.difference(indices, selectedIndices);
        unselectedIndices = _.difference(unselectedIndices,probedIndices);
        if (probedIndices.length)
        {
            this.customStyle(probedIndices, "circle", ".c3-shape", {opacity:1.0, "stroke-opacity": 0.5, "stroke-width": 1.5});
        }
        if (selectedIndices.length)
        {
            this.customStyle(unselectedIndices, "circle", ".c3-shape", {opacity: 0.3, "stroke-opacity": 0.0});
            this.customStyle(selectedIndices, "circle", ".c3-shape", {opacity: 1.0, "stroke-opacity": 1.0});
            this.chart.select(["y"], selectedIndices, true);
        }
        else if (!probedIndices.length)
        {
            this.customStyle(indices, "circle", ".c3-shape", {opacity: 1.0, "stroke-opacity": 0.0});
            this.chart.select(["y"], [], true);
        }
    }

    componentDidUpdate() {
        if(this.c3Config.size.width != this.props.style.width || this.c3Config.size.height != this.props.style.height) {
            this.c3Config.size = {width: this.props.style.width, height: this.props.style.height};
            this.validate(true);
        }
    }

    componentWillUnmount() {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
        this.chart.destroy();
    }

    componentDidMount() {
        this.element.addEventListener("click", this.handleClick.bind(this));

        var plotterPath = this.toolPath.pushPlotter("plot");
        var mapping = [
            { name: "plotter", path: plotterPath, callbacks: this.validate},
            { name: "dataX", path: plotterPath.push("dataX") },
            { name: "dataY", path: plotterPath.push("dataY") },
            { name: "sizeBy", path: plotterPath.push("sizeBy") },
            { name: "fill", path: plotterPath.push("fill") },
            { name: "line", path: plotterPath.push("line") },
            { name: "xAxis", path: this.toolPath.pushPlotter("xAxis") },
            { name: "yAxis", path: this.toolPath.pushPlotter("yAxis") },
            { name: "marginBottom", path: this.plotManagerPath.push("marginBottom") },
            { name: "marginLeft", path: this.plotManagerPath.push("marginLeft") },
            { name: "marginTop", path: this.plotManagerPath.push("marginTop") },
            { name: "marginRight", path: this.plotManagerPath.push("marginRight") },
            { name: "filteredKeySet", path: plotterPath.push("filteredKeySet") },
            { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: this.updateStyle },
            { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: this.updateStyle }
        ];

        this.initializePaths(mapping);

        this.paths.filteredKeySet.getObject().setColumnKeySources([this.paths.dataX.getObject(), this.paths.dataY.getObject()]);

        this.c3Config.bindto = this.element;
        this.validate(true);
    }

    validate(forced:boolean = false):void
    {
        if (this.busy)
        {
            this.dirty = true;
            return;
        }
        this.dirty = false;

        var changeDetected:boolean = false;
        var axisChange:boolean = this.detectChange('dataX', 'dataY', 'marginBottom', 'marginTop', 'marginLeft', 'marginRight');
        var axisSettingsChange:boolean = this.detectChange('xAxis', 'yAxis');
        if (axisChange || this.detectChange('plotter', 'sizeBy', 'fill', 'line','filteredKeySet'))
        {
            changeDetected = true;
            this.dataChanged();
        }
        if (axisChange)
        {
            changeDetected = true;
            var xLabel:string = this.paths.xAxis.push("overrideAxisName").getState() || this.paths.dataX.getObject().getMetadata('title');
            var yLabel:string = this.paths.yAxis.push("overrideAxisName").getState() || this.paths.dataY.getObject().getMetadata('title');


            if (this.numericRecords)
            {
                var temp:string = "y";
                if (weavejs.WeaveAPI.Locale.reverseLayout)
                {

                    this.c3Config.data.axes = {[temp]:'y2'};
                    this.c3Config.axis.y2 = this.c3ConfigYAxis;
                    this.c3Config.axis.y = {show: false};
                    this.c3Config.axis.x.tick.rotate = 45;
                }
                else
                {

                    this.c3Config.data.axes = {[temp]:'y'};
                    this.c3Config.axis.y = this.c3ConfigYAxis;
                    delete this.c3Config.axis.y2;
                    this.c3Config.axis.x.tick.rotate = -45;
                }
            }

            this.c3Config.axis.x.label = {text:xLabel, position:"outer-center"};
            this.c3ConfigYAxis.label = {text:yLabel, position:"outer-middle"};

            this.c3Config.padding.top = Number(this.paths.marginTop.getState());
            this.c3Config.axis.x.height = Number(this.paths.marginBottom.getState());
            if(weavejs.WeaveAPI.Locale.reverseLayout){
                this.c3Config.padding.left = Number(this.paths.marginRight.getState());
                this.c3Config.padding.right = Number(this.paths.marginLeft.getState());
            }else{
                this.c3Config.padding.left = Number(this.paths.marginLeft.getState());
                this.c3Config.padding.right = Number(this.paths.marginRight.getState());
            }
        }

        if (changeDetected || forced)
        {
            this.busy = true;
            this.chart = c3.generate(this.c3Config);
            this.loadData();
            this.cullAxes();

        }
    }

    loadData() {
        if(!this.chart || this.busy)
            return StandardLib.debounce(this, 'loadData');
        this.chart.load({data: _.pluck(this.numericRecords, "point"), unload: true});
        //after data is loaded we need to remove the clip-path so that points are not
        // clipped when rendered near edge of chart
        //TODO: determine if adding padding to axes range will further improve aesthetics of chart
        this.chart.internal.main.select('.c3-chart').attr('clip-path',null);
    }
}
registerToolImplementation("weave.visualization.tools::ScatterPlotTool", WeaveC3ScatterPlot);
//Weave.registerClass("weavejs.tools.ScatterPlotTool", WeaveC3ScatterPlot, [weavejs.api.core.ILinkableObjectWithNewProperties]);
