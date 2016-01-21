///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/WeavePath.d.ts"/>
///<reference path="../utils/StandardLib.ts"/>
/// <reference path="../../typings/weave/weavejs.d.ts"/>
/// <reference path="../../typings/weave/Weave.d.ts"/>

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
import StandardLib from "../utils/StandardLib";

interface IBarchartPaths extends IAbstractWeaveToolPaths {
    plotter: WeavePath;
    heightColumns: WeavePath;
    labelColumn: WeavePath;
    sortColumn: WeavePath;
    colorColumn: WeavePath;
    chartColors: WeavePath;
    groupingMode: WeavePath;
    horizontalMode: WeavePath;
    showValueLabels: WeavePath;
    xAxis: WeavePath;
    yAxis: WeavePath;
    filteredKeySet: WeavePath;
    selectionKeySet: WeavePath;
    probeKeySet: WeavePath;
}


class WeaveC3Barchart extends AbstractWeaveTool {

    private keyToIndex:{[key:string]: number};
    private indexToKey:{[index:number]: string};
    private xAxisValueToLabel:{[value:number]: string};
    private yAxisValueToLabel:{[value:number]: string};
    private yLabelColumnDataType:string;
    private groupingMode:string;
    private heightColumnNames:string[];
    private heightColumnsLabels:string[];
    private stringRecords:Record[];
    private numericRecords:Record[];
    private records:Record[][];
    private colorRamp:string[];
    private showValueLabels:boolean;
    private showXAxisLabel:boolean;
    private yLabelColumnPath:WeavePath;
    private c3Config:ChartConfiguration;
    private chart:ChartAPI;

    protected paths:IBarchartPaths;

    private flag:boolean;
    private busy:boolean;

    constructor(props:IAbstractWeaveToolProps) {
        super(props);
        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};
        this.xAxisValueToLabel = {};

        this.c3Config = {
            //size: this.getElementSize(),
            padding: {
                top: 20,
                bottom: 20,
                right: 30
            },
            data: {
                json: [],
                type: "bar",
                xSort: false,
                selection: {
                    enabled: true,
                    multiple: true,
                    draggable: true

                },
                labels: {
                    format: (v, id, i, j) => {
                        if(this.showValueLabels) {
                            return v;
                        } else {
                            return "";
                        }
                    }
                },
                order: null,
                color: (color:string, d:any):string => {
                    if(this.heightColumnNames.length === 1 && d.hasOwnProperty("index")) {

                        // find the corresponding index of numericRecords in stringRecords
                        var id = this.indexToKey[d.index];
                        var index = _.pluck(this.stringRecords, "id").indexOf(id);
                        return this.stringRecords[index] ? this.stringRecords[index]["color"] as string : "#C0CDD1";
                    } else {
                        return color || "#C0CDD1";
                    }
                },
                onclick: (d:any) => {
                    var event:MouseEvent = this.chart.internal.d3.event as MouseEvent;
                    if(!(event.ctrlKey || event.metaKey)&& d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.setKeys([this.indexToKey[d.index]]);
                    }
                },
                onselected: (d:any) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.addKeys([this.indexToKey[d.index]]);
                    }
                },
                onunselected: (d:any) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.removeKeys([this.indexToKey[d.index]]);
                    }
                },
                onmouseover: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([this.indexToKey[d.index]]);
                    }
                },
                onmouseout: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([]);
                    }
                }
            },
            axis: {
                x: {
                    type: "category",
                    label: {
                        text: "",
                        position: "outer-center"
                    },
                    tick: {
                        rotate: -45,
                        culling: {
                            max: null
                        },
                        multiline: false,
                        format: (num:number):string => {
                            if(this.stringRecords && this.stringRecords[num]) {
                                if(this.element && this.getElementSize().height > 0) {
                                    var labelHeight:number = (this.getElementSize().height* 0.2)/Math.cos(45*(Math.PI/180));
                                    var labelString:string = (this.stringRecords[num]["xLabel"] as string);
                                    if(labelString) {
                                        var stringSize:number = StandardLib.getTextWidth(labelString, "14pt Helvetica Neue");
                                        var adjustmentCharacters:number = labelString.length - Math.floor(labelString.length * (labelHeight / stringSize));
                                        return adjustmentCharacters > 0 ? labelString.substring(0, labelString.length - adjustmentCharacters - 3) + "..." : labelString;
                                    }else{
                                        return "";
                                    }
                                }else {
                                    return this.stringRecords[num]["xLabel"] as string;
                                }
                            } else {
                                return "";
                            }
                        }
                    }
                },
                y: {
                    show: true,
                    label: {
                        text:"",
                        position: "outer-middle"
                    },
                    tick: {
                        fit: false,
                        multiline: false,
                        format: (num:number):string => {
                            if(this.yLabelColumnPath && this.yLabelColumnDataType !== "number") {
                                return this.yAxisValueToLabel[num] || "";
                            } else if (this.groupingMode === "percentStack") {
                                return d3.format(".0%")(num);
                            } else {
                                return String(FormatUtils.defaultNumberFormatting(num));
                            }
                        }
                    }
                },
                y2: {
                    show:false,
                    label: {
                        text:"",
                        position: "outer-middle"
                    },
                    tick: {
                        fit: false,
                        multiline: false,
                        format: (num:number):string => {
                            if(this.yLabelColumnPath && this.yLabelColumnDataType !== "number") {
                                return this.yAxisValueToLabel[num] || "";
                            } else if (this.groupingMode === "percentStack") {
                                return d3.format(".0%")(num);
                            } else {
                                return String(FormatUtils.defaultNumberFormatting(num));
                            }
                        }
                    }
                },
                rotated: false
            },
            tooltip: {
                format: {
                    title: (num:number):string => {
                        if(this.stringRecords && this.stringRecords[num]) {
                            return this.stringRecords[num]["xLabel"] as string;
                        }else{
                            return "";
                        }
                    },
                    name: (name:string, ratio:number, id:string, index:number):string => {
                        var labelIndex:number = this.heightColumnNames.indexOf(name);
                        return (this.heightColumnsLabels ? this.heightColumnsLabels[labelIndex] : "");
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
            bindto: null,
            bar: {
                width: {
                    ratio: 0.8
                }
            },
            legend: {
                show: false
            },
            onrendered: () => {
                this.busy = false;
                this._updateStyle();
            }
        };
    }

    protected handleMissingSessionStateProperties(newState:any)
	{

	}

    private selectionKeysChanged ():void {
        if(!this.chart || !this.heightColumnNames)
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
        var unselectedIndices:number[] = _.difference(indices,selectedIndices);
        unselectedIndices = _.difference(unselectedIndices,probedIndices);
        this.heightColumnNames.forEach((item:string) => {
        	var paths = d3.selectAll("g").filter(".c3-shapes-"+item+".c3-bars").selectAll("path");
        	var texts = d3.selectAll("g").filter(".c3-texts-"+item).selectAll("text");
            if(selectedIndices.length) {
                this.customSelectorStyle(unselectedIndices, paths, {opacity: 0.3, "stroke-opacity": 0.0});
                this.customSelectorStyle(selectedIndices, paths, {opacity: 1.0, "stroke-opacity": 1.0});
                this.customSelectorStyle(unselectedIndices, texts, {"fill-opacity":0.3});
                this.customSelectorStyle(selectedIndices, texts, {"fill-opacity":1.0});
            }else if(!probedIndices.length){
                this.customSelectorStyle(indices, paths, {opacity: 1.0, "stroke-opacity": 0.5});
                this.customSelectorStyle(indices, texts, {"fill-opacity":1.0});
            }
        });
        if(selectedIndices.length) {
            this.chart.select(this.heightColumnNames, selectedIndices, true);
        }else if(!probedIndices.length){
            this.chart.select(this.heightColumnNames, [], true);
        }
    }

    private probedKeysChanged (): void {
        if(!this.chart || !this.heightColumnNames)
            return;

        var selectedKeys:string[] = this.toolPath.probe_keyset.getKeys();
        var selectedIndices:number[] = selectedKeys.map( (key:string) => {
            return Number(this.keyToIndex[key]);
        });
        var keys:string[] = Object.keys(this.keyToIndex);
        var indices:number[] = keys.map((key:string) => {
            return Number(this.keyToIndex[key]);
        });
        var unselectedIndices:number[] = _.difference(indices,selectedIndices);

        this.heightColumnNames.forEach((item:string) => {
        	var paths = d3.selectAll("g").filter(".c3-shapes-"+item+".c3-bars").selectAll("path");
        	var texts = d3.selectAll("g").filter(".c3-texts-"+item).selectAll("text");
            if(selectedIndices.length) {
                this.customSelectorStyle(unselectedIndices, paths, {opacity: 0.3, "stroke-opacity": 0.0});
                this.customSelectorStyle(selectedIndices, paths, {opacity: 1.0, "stroke-opacity": 0.5});
                this.customSelectorStyle(unselectedIndices, texts, {"fill-opacity":0.3});
                this.customSelectorStyle(selectedIndices, texts, {"fill-opacity":1.0});
            }
        });

        this.selectionKeysChanged();
    }

    handleClick(event:MouseEvent):void {
        if(!this.flag) {
            this.toolPath.selection_keyset.setKeys([]);
        }
        this.flag = false;
    }

    setAxes() {
        var temp:string = this.c3Config.data.keys.value[0];
        if(this.c3Config.axis.y.show == true){
            this.c3Config.axis.y2.show = true;
            this.c3Config.axis.y.show = false;
            this.c3Config.data.axes = {[temp]:'y2'};
            this.c3Config.axis.y2.label = this.c3Config.axis.y.label;
        }else{
            this.c3Config.axis.y.show = true;
            this.c3Config.axis.y2.show = false;
            this.c3Config.data.axes = {[temp]:'y'};
            this.c3Config.axis.y.label = this.c3Config.axis.y2.label;
        }
        this.generate();
    }

    rotateAxes() {
        this.c3Config.axis.rotated = this.paths.horizontalMode.getState();
        this.generate();
        // setTimeout(() => {
        //   this.busy = true;
        //   c3.generate(this.c3Config);
        // }, 10);
    }

    private axisChanged():void {
        if (!this.chart || this.busy)
        	return StandardLib.debounce(this, 'axisChanged');

        var xLabel:string = this.paths.xAxis.push("overrideAxisName").getState() || "Sorted by " + this.paths.sortColumn.getObject().getMetadata('title');
        var yLabel:string = this.paths.yAxis.push("overrideAxisName").getState() || (this.heightColumnsLabels ? this.heightColumnsLabels.join(", ") : "");

        if(!this.showXAxisLabel){
            xLabel = " ";
        }

        this.chart.axis.labels({
            x: xLabel,
            y: yLabel
        });

        this.axisLabelsChanged();

        this.c3Config.axis.x.label = {text:xLabel, position:"outer-center"};
        this.c3Config.axis.y.label = {text:yLabel, position:"outer-middle"};
        this.generate();
    }

    private axisLabelsChanged():void {
        var chartWidth:number = this.chart.internal.width;
        var textHeight:number = StandardLib.getTextHeight("test", "14pt Helvetica Neue");
        var xLabelsToShow:number = Math.floor(chartWidth / textHeight);
        xLabelsToShow = Math.max(2,xLabelsToShow);

        this.c3Config.axis.x.tick.culling = {max: xLabelsToShow};
    }

    handleShowValueLabels () {
        if(!this.chart)
            return;
        this.showValueLabels = this.paths.showValueLabels.getState();
        this.chart.flush();
    }

    private updateColumns():void {
        this.heightColumnNames = [];
        this.heightColumnsLabels = [];

        var lhm = this.paths.heightColumns.getObject();
        var columns = lhm.getObjects();
        var names = lhm.getNames();

        for (let idx in columns)
        {
            let column = columns[idx];
            let name = names[idx];
            let title = column.getMetadata('title');

            this.heightColumnsLabels.push(title);
            this.heightColumnNames.push(name);
        }
    }

    private dataChanged():void {
        if (!this.chart || this.busy)
        	return StandardLib.debounce(this, 'dataChanged');

        this.updateColumns();

        var heightColumns:WeavePath[] = this.paths.heightColumns.getChildren();

        var numericMapping:any = {
            sort: this.paths.sortColumn,
            xLabel: this.paths.labelColumn
        };

        var stringMapping:any = {
            sort: this.paths.sortColumn,
            color: this.paths.colorColumn,
            xLabel: this.paths.labelColumn
        };

        heightColumns.forEach((column:WeavePath, idx:number) => {
            let name:string = column.getPath().pop();
            numericMapping[name] = column; // all height columns as numeric value for the chart

            if(idx === 0) {
                this.yLabelColumnPath = column;
                stringMapping["yLabel"] = column; // only using the first column to label the y axis
                numericMapping["yLabel"] = column;
            }
        });

        this.yLabelColumnDataType = this.yLabelColumnPath.getObject().getMetadata('dataType');

        this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        if(!this.numericRecords.length)
            return;
        this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.records = _.zip(this.numericRecords, this.stringRecords);
        this.records = _.sortByAll(this.records, [[0, "sort"], [0, "id"]]);

        if(this.records.length)
            [this.numericRecords, this.stringRecords] = _.unzip(this.records);

        this.yAxisValueToLabel = {};
        this.xAxisValueToLabel = {};
        this.keyToIndex = {};
        this.indexToKey = {};

        this.numericRecords.forEach((record:Record, index:number) => {
            if(record) {
                this.keyToIndex[record["id"] as string] = index;
                this.indexToKey[index] = record["id"] as string;
            }
        });


        this.stringRecords.forEach((record:Record, index:number) => {
            var numericRecord:Record = this.numericRecords[index];
            if(numericRecord) {
                this.yAxisValueToLabel[numericRecord["yLabel"] as number] = record["yLabel"] as string;
                this.xAxisValueToLabel[numericRecord["xLabel"] as number] = record["xLabel"] as string;
            }
        });

        this.groupingMode = this.paths.groupingMode.getState();
        //var horizontalMode = this.paths.plotter.push("horizontalMode").getState();

        // set axis rotation mode
        //this.chart.load({axes: { rotated: horizontalMode }});

        if(this.groupingMode === "stack") {
            this.chart.groups([this.heightColumnNames]);
        } else if(this.groupingMode === "group") {
            this.chart.groups([]);
        } else if(this.groupingMode === "percentStack") {
            this.chart.groups([this.heightColumnNames]);
        }

        if(this.groupingMode === "percentStack" && this.heightColumnNames.length > 1) {
            // normalize the height columns to be percentages.
            var newValues = this.numericRecords.map((record:Record) => {
                var heights:{[key:string]: number};
                if(record) {
                    heights = _.pick(record, this.heightColumnNames) as {[key:string]: number};
                    var sum:number = 0;
                    _.keys(heights).forEach((key:string) => {
                        sum += heights[key];
                    });

                    _.keys(heights).forEach((key:string) => {
                        heights[key] = heights[key] / sum;
                    });
                }

                return heights;
            });

            this.numericRecords = newValues;
        }

        interface Keys {x:string, value:string[]};
        var keys:Keys = {x:"", value:[]};
        // if label column is specified
        if(this.paths.labelColumn.getState().length) {
            keys.x = "xLabel";
        }

        keys.value = this.heightColumnNames;
        var colors:{[name:string]: string} = {};

        if(this.heightColumnNames.length > 1) {
            this.colorRamp = this.paths.chartColors.getState();
            this.heightColumnNames.map((name, index) => {
                var color = StandardLib.interpolateColor(index / (this.heightColumnNames.length - 1), this.colorRamp);
                colors[name] = "#" + StandardLib.decimalToHex(color);
            });
        }

        var data = _.cloneDeep(this.c3Config.data);
        data.json = this.numericRecords;
        data.colors = colors;
        data.keys = keys;
        data.unload = true;
        this.c3Config.data = data;
        this.busy = true;
        this.chart.load(data);
    }

    _updateStyle() {
        d3.select(this.element).selectAll("path").style("opacity", 1)
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("stroke-opacity", 0.5);
    }

    generate() {
    	this.busy = true;
        this.chart = generate(this.c3Config);
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        var newElementSize = this.getElementSize();

        if(!_.isEqual(newElementSize, this.elementSize)) {
            if(this.paths.labelColumn.getState().length){
                this.c3Config.axis.x.height = newElementSize.height * 0.2;
            }else{
                this.c3Config.axis.x.height = null;
            }
            this.c3Config.size = newElementSize;
            this.generate();
            this.elementSize = newElementSize;
            if(this.paths.labelColumn.getState().length) {
                //TODO: For now we have no choice by to update axis for label spacing after generate,
                //so we can get new width and then update label spacing appropriately, but this
                //then requires another call to generate. We may want to try and calculate this
                //width ourselves to save the extra generate call in axisChanged()
                this.axisChanged();
            }
        }
    }

    componentWillUnmount() {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
        this.chart.destroy();
        super.componentWillUnmount();
    }

    componentDidMount() {
        super.componentDidMount();
        this.showXAxisLabel = false;

        var plotterPath = this.toolPath.pushPlotter("plot");
        var mapping = [
            { name: "plotter", path: plotterPath, callbacks: null},
            { name: "heightColumns", path: plotterPath.push("heightColumns"), callbacks: [this.dataChanged, this.axisChanged] },
            { name: "labelColumn", path: plotterPath.push("labelColumn"), callbacks: [this.dataChanged, this.axisChanged] },
            { name: "sortColumn", path: plotterPath.push("sortColumn"), callbacks: [this.dataChanged, this.axisChanged] },
            { name: "colorColumn", path: plotterPath.push("colorColumn"), callbacks: this.dataChanged },
            { name: "chartColors", path: plotterPath.push("chartColors"), callbacks: this.dataChanged },
            { name: "groupingMode", path: plotterPath.push("groupingMode"), callbacks: this.dataChanged },
            { name: "horizontalMode", path: plotterPath.push("horizontalMode"), callbacks: this.rotateAxes },
            { name: "showValueLabels", path: plotterPath.push("showValueLabels"), callbacks: this.handleShowValueLabels},
            { name: "xAxis", path: this.toolPath.pushPlotter("xAxis"), callbacks: this.axisChanged },
            { name: "yAxis", path: this.toolPath.pushPlotter("yAxis"), callbacks: this.axisChanged },
            { name: "filteredKeySet", path: plotterPath.push("filteredKeySet"), callbacks: this.dataChanged},
            { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: this.selectionKeysChanged},
            { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: this.probedKeysChanged}
        ];

        this.initializePaths(mapping);

        this.paths.filteredKeySet.getObject().setColumnKeySources([this.paths.sortColumn.getObject()]);

        this.c3Config.bindto = this.element;
        if(this.paths.labelColumn.getState().length){
            this.c3Config.axis.x.height = this.getElementSize().height * 0.2;
        }
        this.generate();
    }
}

export default WeaveC3Barchart;
registerToolImplementation("weave.visualization.tools::CompoundBarChartTool", WeaveC3Barchart);
//Weave.registerClass("weavejs.tools.CompoundBarChartTool", WeaveC3Barchart, [weavejs.api.core.ILinkableObjectWithNewProperties]);
