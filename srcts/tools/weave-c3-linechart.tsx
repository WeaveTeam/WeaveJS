///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/WeavePath.d.ts"/>

import {IVisToolProps} from "./IVisTool";
import {IToolPaths} from "./AbstractC3Tool";
import AbstractC3Tool from "./AbstractC3Tool";

import {registerToolImplementation} from "../WeaveTool";
import * as d3 from "d3";
import * as _ from "lodash";
import FormatUtils from "../utils/FormatUtils";
import * as React from "react";
import {ChartConfiguration, ChartAPI, generate} from "c3";
import {MouseEvent} from "react";
import {getTooltipContent} from "./tooltip";
import Tooltip from "./tooltip";

interface ILineChartPaths extends IToolPaths {
    plotter: WeavePath;
    columns: WeavePath;
    lineStyle: WeavePath;
    curveType: WeavePath;
    filteredKeySet: WeavePath;
    selectionKeySet: WeavePath;
    probeKeySet: WeavePath;
}

class WeaveC3LineChart extends AbstractC3Tool {
    private keyToIndex:{[key:string]: number};
    private indexToKey:{[index:number]: string};
    private yAxisValueToLabel:{[value:number]: string};
    private colors:{[id:string]: string};
    private yLabelColumnPath:WeavePath;
    private numericRecords:Record[];
    private stringRecords:Record[];
    private records:Record[][];
    private columnLabels:string[];
    private columnNames:string[];
    private flag:boolean;

    protected chart:ChartAPI;
    protected c3Config:ChartConfiguration;
    protected paths:ILineChartPaths;

    constructor(props:IVisToolProps) {
        super(props);
        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};
    }

    protected handleMissingSessionStateProperties(newState:any)
	{

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

        var unselectedIndices = _.difference(indices, selectedIndices);
        unselectedIndices = _.difference(unselectedIndices,probedIndices);
        if(selectedIndices.length) {
            //unfocus all circles
            d3.select(this.element).selectAll("circle").filter(".c3-shape").style("opacity", "0.1");

            var filtered = d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape");
            selectedIndices.forEach( (index:number) => {
                //custom style for circles on selected lines
                var circleCount = filtered[index] ? filtered[index].length : 0;
                var selectedCircles = _.range(0,circleCount);
                selectedCircles.forEach( (i:number) => {
                    (filtered[index][i] as HTMLElement).style.opacity = "1.0";
                    (filtered[index][i] as HTMLElement).style.strokeOpacity = "1.0";
                });
            });

            this.customStyle(unselectedIndices, "path", ".c3-shape.c3-line", {opacity: 0.1});
            this.customStyle(selectedIndices, "path", ".c3-shape.c3-line", {opacity: 1.0});
            this.chart.select(["y"], selectedIndices, true);
        }else if(!probedIndices.length){
            //focus all circles
            d3.select(this.element).selectAll("circle").filter(".c3-shape").style({opacity: 1.0, "stroke-opacity": 0.0});
            this.customStyle(indices, "path", ".c3-shape.c3-line", {opacity: 1.0});
            this.chart.select(["y"], [], true);
        }
    }

    _probedKeysChanged() {
        var selectedKeys:string[] = this.toolPath.probe_keyset.getKeys();
        var selectedIndices:number[] = selectedKeys.map((key:string) => {
            return Number(this.keyToIndex[key]);
        });
        var keys:string[] = Object.keys(this.keyToIndex);
        var indices:number[] = keys.map((key:string) => {
            return Number(this.keyToIndex[key]);
        });
        var unselectedIndices:number[] = _.difference(indices, selectedIndices);

        if (selectedIndices.length) {
            //unfocus all circles
            d3.select(this.element).selectAll("circle").filter(".c3-shape").style({opacity: 0.1, "stroke-opacity": 0.0});

            var filtered = d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape");
            selectedIndices.forEach( (index:number) => {
                //custom style for circles on probed lines
                var circleCount:number = filtered[index] ? filtered[index].length : 0;
                var selectedCircles:number[] = _.range(0,circleCount);
                selectedCircles.forEach( (i:number) => {
                    (filtered[index][i] as HTMLElement).style.opacity = "1.0";
                    (filtered[index][i] as HTMLElement).style.strokeOpacity = "0.0";
                });
            });

            this.customStyle(unselectedIndices, "path", ".c3-shape.c3-line", {opacity: 0.1});
            this.customStyle(selectedIndices, "path", ".c3-shape.c3-line", {opacity: 1.0});
            this._selectionKeysChanged();
        } else {
            this._selectionKeysChanged();
        }
    }

    _updateStyle() {
        d3.select(this.element).selectAll("circle").style("opacity", 1)
            .style("stroke", "black")
            .style("stroke-opacity", 0.0);
    }

    mirrorVertical() {
        var temp:any =  {};
        if(this.c3Config.axis.y.show == true){
            this.stringRecords.forEach( (record) => {
                temp[record["id"].toString()] = 'y2';
            });
            this.c3Config.axis.y2.show = true;
            this.c3Config.axis.y.show = false;
            this.c3Config.data.axes = temp;
            this.c3Config.axis.y2.label = this.c3Config.axis.y.label;
        }else{
            this.stringRecords.forEach( (record) => {
                temp[record["id"].toString()] = 'y';
            });
            this.c3Config.axis.y.show = true;
            this.c3Config.axis.y2.show = false;
            this.c3Config.data.axes = temp;
            this.c3Config.axis.y.label = this.c3Config.axis.y2.label;
        }
        this.chart = generate(this.c3Config);
        this._dataChanged();
    }

    _dataChanged() {
        this.columnLabels = [];
        this.columnNames = [];

        var children:WeavePath[] = this.paths.columns.getChildren();

        this.yLabelColumnPath = children[0];

        let numericMapping:any = {
            columns: children,
            yLabel: this.yLabelColumnPath
        };


        let stringMapping:any = {
            columns: children,
            line: {
                //alpha: this._lineStylePath.push("alpha"),
                color: this.paths.lineStyle.push("color")
                //caps: this._lineStylePath.push("caps")
            },
            yLabel: this.yLabelColumnPath
        };

        for (let idx in children) {
            let child = children[idx];
            let title = child.getObject().getMetadata('title');
            let name = child.getPath().pop();
            this.columnLabels.push(title);
            this.columnNames.push(name);
        }

        this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.records = _.zip(this.numericRecords, this.stringRecords);
        this.records = _.sortBy(this.records, [0, "id"]);

        if(this.records.length)
            [this.numericRecords, this.stringRecords] = _.unzip(this.records);

        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};

        this.numericRecords.forEach((record:Record, index:number) => {
            this.keyToIndex[record["id"] as string] = index;
            this.indexToKey[index] = record["id"] as string;
        });

        this.stringRecords.forEach((record, index) => {
            var numericRecord = this.numericRecords[index];
            this.yAxisValueToLabel[numericRecord["yLabel"] as number] = record["yLabel"] as string;
        });

        var columns:any = [];

        columns = this.numericRecords.map(function(record:Record) {
            var tempArr:any[] = [];
            tempArr.push(record["id"]);
            _.keys(record["columns"]).forEach((key:string) => {
                tempArr.push((record["columns"] as Record)[key]);
            });
            return tempArr;
        });

        this.colors = {};
        this.stringRecords.forEach((record:Record) => {
            this.colors[record["id"] as string] = ((record["line"] as Record)["color"] as string) || "#C0CDD1";
        });

        var chartType:string = "line";
        if(this.paths.plotter.push("curveType").getState() === "double") {
            chartType = "spline";
        }

        if(this.c3Config.axis.y2.show){
            columns.forEach( (column:any[], index:number, array:any) => {
                var temp:any[] = [];
                temp.push(column.shift());
                column = column.reverse();
                column.forEach( (item:any) => {
                    temp.push(item);
                });
                array[index] = temp;
            });
        }
        this.chart.load({columns: columns, colors: this.colors, type: chartType, unload: true});
    }

    componentWillUnmount() {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
        this.chart.destroy();
    }

    componentDidMount() {
        var dataChanged:Function = _.debounce(this._dataChanged.bind(this), 100);
        var selectionKeySetChanged:Function = this._selectionKeysChanged.bind(this);
        var probeKeySetChanged:Function = _.debounce(this._probedKeysChanged.bind(this), 100);
        var plotterPath:WeavePath = this.toolPath.pushPlotter("plot");
        var mapping = [
            { name: "plotter", path: plotterPath, callbacks: null},
            { name: "columns", path: plotterPath.push("columns"), callbacks: dataChanged },
            { name: "lineStyle", path: plotterPath.push("lineStyle"), callbacks: dataChanged },
            { name: "curveType", path: plotterPath.push("curveType"), callbacks: dataChanged },
            { name: "filteredKeySet", path: plotterPath.push("filteredKeySet"), callbacks: dataChanged },
            { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: selectionKeySetChanged},
            { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: probeKeySetChanged}
        ];

        this.initializePaths(mapping);

       	this.paths.filteredKeySet.getObject().setColumnKeySources(this.paths.columns.getObject().getObjects());

        this.c3Config = {
            size: {
                width: this.props.style.width,
                height: this.props.style.height
            },
            padding: {
                top: 20,
                bottom: 20
            },
            data: {
                columns: [],
                xSort: false,
                selection: {
                    enabled: true,
                    multiple: true,
                    draggable: true
                },
                onclick: (d:any) => {
                    var event:MouseEvent = this.chart.internal.d3.event as MouseEvent;
                    if(!(event.ctrlKey || event.metaKey) && d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.setKeys([d.id]);
                    }
                },
                onselected: (d:any) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.addKeys([d.id]);
                    }
                },
                onunselected: (d:any) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.removeKeys([d.id]);
                    }
                },
                onmouseover: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([d.id]);
                    }

                    var columnNamesToValue:{[columnName:string] : string|number } = {};
                    this.columnLabels.forEach( (label:string,index:number,array:any[]) => {
                       columnNamesToValue[label] = this.numericRecords[d.index]["columns"][index] as number;
                    });

                    this.toolTip.setState({
                        x: this.chart.internal.d3.event.pageX,
                        y: this.chart.internal.d3.event.pageY,
                        showTooltip: true,
                        columnNamesToValue: columnNamesToValue
                    });
                },
                onmouseout: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([]);
                        this.toolTip.setState({
                            showTooltip: false
                        });
                    }
                }
            },
            tooltip: {
                show: false
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            axis: {
                x: {
                    tick: {
                        multiline: false,
                        rotate: 0,
                        format: (d:number):string => {
                            if(this.c3Config.axis.y2.show){
                                //handle case where labels need to be reversed
                                var temp:number = this.columnLabels.length-1;
                                return this.columnLabels[temp-d];
                            }else{
                                return this.columnLabels[d];
                            }
                        }
                    }
                },
                y: {
                    show: true,
                    tick: {
                        multiline: true,
                        format: (num:number):string => {
                            if(this.yLabelColumnPath && this.yLabelColumnPath.getValue("this.getMetadata('dataType')") !== "number") {
                                return this.yAxisValueToLabel[num] || "";
                            } else {
                                return String(FormatUtils.defaultNumberFormatting(num));
                            }
                        }
                    }
                },
                y2: {
                    show: false,
                    min: null,
                    max: null,
                    tick: {
                        multiline: true,
                        format: (num:number):string => {
                            if(this.yLabelColumnPath && this.yLabelColumnPath.getObject().getMetadata('dataType') !== "number") {
                                return this.yAxisValueToLabel[num] || "";
                            } else {
                                return String(FormatUtils.defaultNumberFormatting(num));
                            }
                        }
                    }
                }
            },
            bindto: this.element,
            legend: {
                show: false
            },
            onrendered: this._updateStyle.bind(this)
        };

        this.chart = generate(this.c3Config);
    }

    handleClick(event:MouseEvent):void {
        if(!this.flag) {
            this.toolPath.selection_keyset.setKeys([]);
        }
        this.flag = false;
    }
}

export default WeaveC3LineChart;

registerToolImplementation("weave.visualization.tools::LineChartTool", WeaveC3LineChart);
//Weave.registerClass("weavejs.tools.LineChartTool", WeaveC3LineChart, [weavejs.api.core.ILinkableObjectWithNewProperties]);
