///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/WeavePath.d.ts"/>


import AbstractWeaveTool from "./AbstractWeaveTool";
import {registerToolImplementation} from "../WeaveTool";
import * as _ from "lodash";
import * as d3 from "d3";
import FormatUtils from "../utils/FormatUtils";
import * as React from "react";
import {IAbstractWeaveToolProps} from "./AbstractWeaveTool";
import {IAbstractWeaveToolPaths} from "./AbstractWeaveTool";
import {ElementSize} from "./AbstractWeaveTool";
import {ChartConfiguration, ChartAPI, generate} from "c3";
import {MouseEvent} from "react";

interface IColumnStats {
    min: number;
    max: number;
}

interface IScatterplotPaths extends IAbstractWeaveToolPaths {
    plotter: WeavePath;
    dataX: WeavePath;
    dataY: WeavePath;
    sizeBy: WeavePath;
    fill: WeavePath;
    line: WeavePath;
    xAxis: WeavePath;
    yAxis: WeavePath;
    filteredKeySet: WeavePath;
    selectionKeySet: WeavePath;
    probeKeySet: WeavePath;
}

/* private
 * @param records array or records
 * @param attributes array of attributes to be normalized
 */
class WeaveC3ScatterPlot extends AbstractWeaveTool {

    private keyToIndex:{[key:string]: number};
    private indexToKey:{[index:number]: string};
    private xAxisValueToLabel:{[value:number]: string};
    private yAxisValueToLabel:{[value:number]: string};
    private chart:ChartAPI;
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

    private c3Config:ChartConfiguration;

    constructor(props:IAbstractWeaveToolProps) {
        super(props);
        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};
        this.xAxisValueToLabel = {};
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

    private busy:number;
    private  axisChanged():void {
        if(this.busy) {
            this.busy++;
            return;
        }

        this.chart.axis.labels({
            x: this.paths.xAxis.getState("overrideAxisName") || this.paths.dataX.getValue("this.getMetadata('title')"),
            y: this.paths.yAxis.getState("overrideAxisName") || this.paths.dataY.getValue("this.getMetadata('title')")
        })
    }

    private dataChanged() {
        if(this.busy) {
            this.busy++;
            return;
        }

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

        this.dataXType = this.paths.dataX.getValue("this.getMetadata('dataType')");
        this.dataYType = this.paths.dataY.getValue("this.getMetadata('dataType')");

        this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.records = _.zip(this.numericRecords, this.stringRecords);
        this.records = _.sortByOrder(this.records, ["size", "id"], ["desc", "asc"]);

        if(this.records.length)
            [this.numericRecords, this.stringRecords] = _.unzip(this.records);

        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};
        this.xAxisValueToLabel = {};

        this.numericRecords.forEach((record:Record, index:number) => {
            this.keyToIndex[record["id"] as string] = index;
            this.indexToKey[index] = record["id"] as string;
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

        this.axisChanged();
        this.busy = 1;

        this.chart.load({data: _.pluck(this.numericRecords, "point"), unload: true, done: () => {
            if (this.busy > 1) {
                this.busy = 0;
                this.dataChanged();
            }
            else {
                this.busy = 0;
            }
        }});
    }

    _selectionKeysChanged() {
        if(!this.chart)
            return;

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
        if(probedIndices.length){
            this.customStyle(probedIndices, "circle", ".c3-shape", {opacity:1.0, "stroke-opacity": 0.0});
        }
        if(selectedIndices.length) {
            this.customStyle(unselectedIndices, "circle", ".c3-shape", {opacity: 0.3, "stroke-opacity": 0.0});
            this.customStyle(selectedIndices, "circle", ".c3-shape", {opacity: 1.0, "stroke-opacity": 1.0});
            this.chart.select(["y"], selectedIndices, true);
        }else if (!probedIndices.length){
            this.customStyle(indices, "circle", ".c3-shape", {opacity: 1.0, "stroke-opacity": 0.0});
            this.chart.select(["y"], [], true);
        }
    }

    _probedKeysChanged() {

        var selectedKeys:string[] = this.toolPath.probe_keyset.getKeys();
        var selectedIndices:number[] = selectedKeys.map( (key:string) => {
            return Number(this.keyToIndex[key]);
        });
        var keys:string[] = Object.keys(this.keyToIndex);
        var indices:number[] = keys.map((key:string) => {
            return Number(this.keyToIndex[key]);
        });
        var unselectedIndices:number[] = _.difference(indices, selectedIndices);

        if(selectedIndices.length) {
            this.customStyle(unselectedIndices, "circle", ".c3-shape", {opacity: 0.3, "stroke-opacity": 0.0});
            this.customStyle(selectedIndices, "circle", ".c3-shape", {opacity: 1.0, "stroke-opacity": 0.0});
            this._selectionKeysChanged();
        }else{
            this._selectionKeysChanged();
        }

    }


    handleClick(event:MouseEvent):void {
        if(!this.flag) {
            this.toolPath.selection_keyset.setKeys([]);
        }
        this.flag = false;
    }

    _updateStyle() {
        d3.select(this.element).selectAll("circle").style("opacity", 1)
            .style("stroke", "black")
            .style("stroke-opacity", 0.0);
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        //console.log("resizing");
        //var start = Date.now();
        var newElementSize:ElementSize = this.getElementSize();
        if(!_.isEqual(newElementSize, this.elementSize)) {
            this.chart.resize(newElementSize);
            this.elementSize = newElementSize;
        }
        //var end = Date.now();
    }

    componentWillUnmount() {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
        this.chart.destroy();
        super.componentWillUnmount();
    }

    componentDidMount() {
        super.componentDidMount();

        var axisChanged = this.axisChanged.bind(this);
        var dataChanged = this.dataChanged.bind(this);
        var selectionKeySetChanged = this._selectionKeysChanged.bind(this);
        var probeKeySetChanged = this._probedKeysChanged.bind(this);

        var plotterPath = this.toolPath.pushPlotter("plot");
        var mapping = [
            { name: "plotter", path: plotterPath, callbacks: dataChanged},
            { name: "dataX", path: plotterPath.push("dataX"), callbacks: [dataChanged, axisChanged] },
            { name: "dataY", path: plotterPath.push("dataY"), callbacks: [dataChanged, axisChanged] },
            { name: "sizeBy", path: plotterPath.push("sizeBy"), callbacks: dataChanged },
            { name: "fill", path: plotterPath.push("fill"), callbacks: [dataChanged] },
            { name: "line", path: plotterPath.push("line"), callbacks: dataChanged },
            { name: "xAxis", path: this.toolPath.pushPlotter("xAxis"), callbacks: axisChanged },
            { name: "yAxis", path: this.toolPath.pushPlotter("yAxis"), callbacks: axisChanged },
            { name: "filteredKeySet", path: plotterPath.push("filteredKeySet"), callbacks: dataChanged },
            { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: selectionKeySetChanged},
            { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: probeKeySetChanged}
        ];

        this.initializePaths(mapping);

        this.paths.filteredKeySet.getObject().setColumnKeySources([this.paths.dataX.getObject(), this.paths.dataY.getObject()]);

        this.c3Config = {
            bindto: this.element,
            padding: {
                top: 20,
                bottom: 20,
                right: 30
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
                        var id:string = this.indexToKey[d.index as number];
                        var index:number = _.pluck(this.stringRecords, "id").indexOf(id);

                        var record:Record = this.stringRecords[index];
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
                        this.toolPath.probe_keyset.setKeys([this.indexToKey[d.index]]);
                    }
                },
                onmouseout: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([]);
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
                        fit: false,
                        rotate: 0,
                        format: (num:number):string => {
                            if(this.paths.dataX && this.xAxisValueToLabel && this.dataXType !== "number") {
                                return this.xAxisValueToLabel[num] || "";
                            } else {
                                return String(FormatUtils.defaultNumberFormatting(num));
                            }
                        }
                    }
                },
                y: {
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
                }
            },
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
                        return this.paths.xAxis.getState("overrideAxisName") || this.paths.dataX.getValue("this.getMetadata('title')");
                    },
                    name: (name:string, ratio:number, id:string, index:number):string => {
                        return this.paths.yAxis.getState("overrideAxisName") || this.paths.dataY.getValue("this.getMetadata('title')");
                    }
                },
                contents: (d:any, defaultTitleFormat:string, defaultValueFormat:string, color:any):string => {
                    var $$ = this.chart.internal, config = $$.config,
                        titleFormat = config.tooltip_format_title || defaultTitleFormat,
                        nameFormat = config.tooltip_format_name || function (name) { return name; },
                        valueFormat = config.tooltip_format_value || defaultValueFormat,
                        text, i, title, value, name;
                    if(d.length) {
                        text = "<table class='" + $$.CLASS.tooltip + "'>";
                        //xvalue text
                        text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[0].id + "'>";
                        text += "<td class='name'>" + titleFormat(d[0].x) + "</td>";
                        text += "<td class='value'>" + d[0].x + "</td>";
                        text += "</tr>";

                        //loop trhough all y dimensions of data (Scatter plot should only have 1)
                        for (i = 0; i < d.length; i++) {
                            if (!(d[i] && (d[i].value || d[i].value === 0))) {
                                continue;
                            }
                            if (!text) {
                                title = titleFormat ? titleFormat(d[i].x) : d[i].x;

                            }
                            name = nameFormat(d[i].name);
                            value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);

                            text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[i].id + "'>";
                            text += "<td class='name'>" + name + "</td>";
                            text += "<td class='value'>" + value + "</td>";
                            text += "</tr>";
                        }

                        //sizeBy text
                        var sizeByText = this.paths.sizeBy.getValue("this.getMetadata('title')");
                        if(sizeByText) {
                            text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[0].id + "'>";
                            text += "<td class='name'>" + sizeByText + "</td>";
                            text += "<td class='value'>" + this.numericRecords[d[0].index]["size"] + "</td>";
                            text += "</tr>";
                        }

                        return text + "</table>";
                    }
                }
            },
            point: {
                r: (d:any):number => {
                    if(d.hasOwnProperty("index")) {
                        return this.normalizedPointSizes[d.index];
                    }

                }
            },
            onrendered: this._updateStyle.bind(this)
        };
        this.chart = generate(this.c3Config);
    }
}
export default WeaveC3ScatterPlot;

registerToolImplementation("weave.visualization.tools::ScatterPlotTool", WeaveC3ScatterPlot);
//Weave.registerClass("weavejs.tools.ScatterPlotTool", WeaveC3ScatterPlot, [weavejs.api.core.ILinkableObjectWithNewProperties]);
