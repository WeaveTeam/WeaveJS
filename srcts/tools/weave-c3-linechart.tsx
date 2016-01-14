///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/WeavePath.d.ts"/>


import AbstractWeaveTool from "./AbstractWeaveTool";
import * as d3 from "d3";
import * as _ from "lodash";
import {registerToolImplementation} from "../WeaveTool";
import FormatUtils from "../utils/FormatUtils";
import * as React from "react";
import {IAbstractWeaveToolProps} from "./AbstractWeaveTool";
import {IAbstractWeaveToolPaths} from "./AbstractWeaveTool";
import {ElementSize} from "./AbstractWeaveTool";
import {ChartConfiguration, ChartAPI, generate} from "c3";
import {MouseEvent} from "react";

interface ILineChartPaths extends IAbstractWeaveToolPaths {
    plotter: WeavePath;
    columns: WeavePath;
    lineStyle: WeavePath;
    curveType: WeavePath;
    filteredKeySet: WeavePath;
    selectionKeySet: WeavePath;
    probeKeySet: WeavePath;
}

class WeaveC3LineChart extends AbstractWeaveTool {
    private keyToIndex:{[key:string]: number};
    private indexToKey:{[index:number]: string};
    private yAxisValueToLabel:{[value:number]: string};
    private colors:{[id:string]: string};
    private yLabelColumnPath:WeavePath;
    private chart:ChartAPI;
    private numericRecords:Record[];
    private stringRecords:Record[];
    private records:Record[][];
    private columnLabels:string[];
    private columnNames:string[];
    private keyDown:boolean;
    private flag:boolean;

    private c3Config:ChartConfiguration;
    protected paths:ILineChartPaths;

    constructor(props:IAbstractWeaveToolProps) {
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
        var selectedIndices:number[] = selectedKeys.map((key:string) => {
            return Number(this.keyToIndex[key]);
        });
        var keys:string[] = Object.keys(this.keyToIndex);
        var indices:number[] = keys.map((key:string) => {
            return Number(this.keyToIndex[key]);
        });

        var unselectedIndices = _.difference(indices, selectedIndices);
        if(selectedIndices.length) {
            //unfocus all circles
            d3.select(this.element).selectAll("circle").filter(".c3-shape").style("opacity", "0.1");

            selectedIndices.forEach( (index:number) => {
                //custom style for circles on selected lines
                var circleCount = d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape")[index].length;
                var selectedCircles = _.range(0,circleCount);
                selectedCircles.forEach( (i:number) => {
                    (d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape")[index][i] as HTMLElement).style.opacity = "1.0";
                    (d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape")[index][i] as HTMLElement).style.strokeOpacity = "1.0";
                });
            });

            this.customStyle(unselectedIndices, "path", ".c3-shape.c3-line", {opacity: 0.1});
            this.customStyle(selectedIndices, "path", ".c3-shape.c3-line", {opacity: 1.0});
            this.chart.select(["y"], selectedIndices, true);
        }else{
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

            selectedIndices.forEach( (index:number) => {
                //custom style for circles on probed lines
                var circleCount:number = d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape")[index].length;
                var selectedCircles:number[] = _.range(0,circleCount);
                selectedCircles.forEach( (i:number) => {
                    (d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape")[index][i] as HTMLElement).style.opacity = "1.0";
                    (d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape")[index][i] as HTMLElement).style.strokeOpacity = "0.0";
                });
            });

            this.customStyle(unselectedIndices, "path", ".c3-shape.c3-line", {opacity: 0.1});
            this.customStyle(selectedIndices, "path", ".c3-shape.c3-line", {opacity: 1.0});
        } else {
            this._selectionKeysChanged()
        }
    }

    _updateStyle() {
        d3.select(this.element).selectAll("circle").style("opacity", 1)
            .style("stroke", "black")
            .style("stroke-opacity", 0.0);
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
            let title = child.getValue("this.getMetadata('title')");
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

        this.chart.load({columns: columns, colors: this.colors, type: chartType, unload: true});
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
        //console.log(end - start);
    }

    componentWillUnmount() {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
        super.componentWillUnmount();
        this.chart.destroy();
    }

    componentDidMount() {
        super.componentDidMount();
        document.addEventListener("keydown", this.toggleKey.bind(this));
        document.addEventListener("keyup", this.toggleKey.bind(this));
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

        this.c3Config = {
            //size: this.getElementSize(),
            padding: {
                top: 20,
                bottom: 20,
                right: 30
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
                    if(!this.keyDown && d && d.hasOwnProperty("index")) {
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
                },
                onmouseout: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([]);
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
                            return this.columnLabels[d];
                        }
                    }
                },
                y: {
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

    toggleKey(event:KeyboardEvent):void {
        if((event.keyCode === 17)||(event.keyCode === 91) || (event.keyCode === 224)) {
            this.keyDown = !this.keyDown;
        }
    }
}

export default WeaveC3LineChart;

registerToolImplementation("weave.visualization.tools::LineChartTool", WeaveC3LineChart);
//Weave.registerClass("weavejs.tools.LineChartTool", WeaveC3LineChart, [weavejs.api.core.ILinkableObjectWithNewProperties]);
