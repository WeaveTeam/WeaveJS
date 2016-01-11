///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/WeavePath.d.ts"/>
///<reference path="../utils/StandardLib.ts"/>


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
    private yLabelColumnPath:WeavePath;
    private c3Config:ChartConfiguration;
    private chart:ChartAPI;

    protected paths:IBarchartPaths;

    private flag:boolean;
    private keyDown:boolean;
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
                    if(!this.keyDown && d && d.hasOwnProperty("index")) {
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
                        fit: false,
                        multiline: true,
                        format: (num:number):string => {
                            if(this.stringRecords && this.stringRecords[num]) {
                                return this.stringRecords[num]["xLabel"] as string;
                            } else {
                                return "";
                            }
                        }
                    }
                },
                y: {
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

    private selectionKeysChanged ():void {
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
        var unselectedIndices:number[] = _.difference(indices,selectedIndices);
        if(selectedIndices.length) {
            this.customStyle(unselectedIndices, "path", ".c3-shape", {opacity: 0.3, "stroke-opacity": 0.0});
            this.customStyle(selectedIndices, "path", ".c3-shape", {opacity: 1.0, "stroke-opacity": 1.0});
            this.chart.select(this.heightColumnNames, selectedIndices, true);
        }else{
            this.customStyle(indices, "path", ".c3-shape", {opacity: 1.0, "stroke-opacity": 0.5});
            this.chart.select(this.heightColumnNames, [], true);
        }

    }

    private probedKeysChanged (): void {
        var selectedKeys:string[] = this.toolPath.probe_keyset.getKeys();
        var selectedIndices:number[] = selectedKeys.map( (key:string) => {
            return Number(this.keyToIndex[key]);
        });
        var keys:string[] = Object.keys(this.keyToIndex);
        var indices:number[] = keys.map((key:string) => {
            return Number(this.keyToIndex[key]);
        });
        var unselectedIndices:number[] = _.difference(indices,selectedIndices);

        if(selectedIndices.length) {
            this.customStyle(unselectedIndices, "path", ".c3-shape", {opacity: 0.3, "stroke-opacity": 0.0});
            this.customStyle(selectedIndices, "path", ".c3-shape", {opacity: 1.0, "stroke-opacity": 1.0});
        }else{
            this.selectionKeysChanged()
        }
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

    rotateAxes() {
        // this.c3Config.axis.rotated = this.paths.horizontalMode.getState();
        // setTimeout(() => {
        //   this.busy = true;
        //   c3.generate(this.c3Config);
        // }, 10);
    }

    _axisChanged () {
        if(!this.chart)
            return;

        if(this.busy) {
            setTimeout(this._axisChanged, 20);
            return;
        }

        var xLabel:string = this.paths.xAxis.push("overrideAxisName").getState() || "Sorted by " + this.paths.sortColumn.getObject().getMetadata('title');
        var yLabel:string = this.paths.yAxis.push("overrideAxisName").getState() || (this.heightColumnsLabels ? this.heightColumnsLabels.join(", ") : "");

        this.chart.axis.labels({
            x: xLabel,
            y: yLabel
        });

        this.c3Config.axis.x.label = {text:xLabel, position:"outer-center"};
        this.c3Config.axis.y.label = {text:yLabel, position:"outer-middle"};
    }

    handleShowValueLabels () {
        this.showValueLabels = this.paths.showValueLabels.getState();
        this.chart.flush();
    }

    _updateColumns() {
        this.heightColumnNames = [];
        this.heightColumnsLabels = [];

        var heightColumns = this.paths.heightColumns.getChildren();

        for (let idx in heightColumns)
        {
            let column = heightColumns[idx];
            let title = column.getValue("this.getMetadata('title')");
            let name = column.getPath().pop();

            this.heightColumnsLabels.push(title);
            this.heightColumnNames.push(name);
        }
    }

    _dataChanged() {
        if(!this.chart) {
            return;
        }

        if(this.busy) {
            return;
        }

        this._updateColumns();

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

        this.yLabelColumnDataType = this.yLabelColumnPath.getValue("this.getMetadata('dataType')");

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
            colors = {};
        }

        var data = _.cloneDeep(this.c3Config.data);
        data.json = this.numericRecords;
        data.colors = colors;
        data.keys = keys;
        data.unload = true;
        data.done = () => { this.busy = false; };
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

    componentDidUpdate() {
        super.componentDidUpdate();
        var newElementSize = this.getElementSize();
        if(!_.isEqual(newElementSize, this.elementSize)) {
            this.chart.resize(newElementSize);
            this.elementSize = newElementSize;
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
        document.addEventListener("keydown", this.toggleKey.bind(this));
        document.addEventListener("keyup", this.toggleKey.bind(this));
        var axisChanged:Function = _.debounce(this._axisChanged.bind(this), 100);
        var dataChanged:Function = _.debounce(this._dataChanged.bind(this), 100);
        var handleShowValueLabels:Function = _.debounce(this.handleShowValueLabels.bind(this), 10);
        var selectionKeySetChanged:Function = this.selectionKeysChanged.bind(this);
        var probeKeySetChanged:Function = _.debounce(this.probedKeysChanged.bind(this), 100);
        var rotateAxes:Function = _.debounce(this.rotateAxes.bind(this), 10);

        var plotterPath = this.toolPath.pushPlotter("plot");
        var mapping = [
            { name: "plotter", path: plotterPath, callbacks: null},
            { name: "heightColumns", path: plotterPath.push("heightColumns"), callbacks: [dataChanged, axisChanged] },
            { name: "labelColumn", path: plotterPath.push("labelColumn"), callbacks: [dataChanged, axisChanged] },
            { name: "sortColumn", path: plotterPath.push("sortColumn"), callbacks: [dataChanged, axisChanged] },
            { name: "colorColumn", path: plotterPath.push("colorColumn"), callbacks: dataChanged },
            { name: "chartColors", path: plotterPath.push("chartColors"), callbacks: dataChanged },
            { name: "groupingMode", path: plotterPath.push("groupingMode"), callbacks: dataChanged },
            { name: "horizontalMode", path: plotterPath.push("horizontalMode"), callbacks: rotateAxes },
            { name: "showValueLabels", path: plotterPath.push("showValueLabels"), callbacks: handleShowValueLabels},
            { name: "xAxis", path: this.toolPath.pushPlotter("xAxis"), callbacks: axisChanged },
            { name: "yAxis", path: this.toolPath.pushPlotter("yAxis"), callbacks: axisChanged },
            { name: "filteredKeySet", path: plotterPath.push("filteredKeySet"), callbacks: dataChanged},
            { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: selectionKeySetChanged},
            { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: probeKeySetChanged}
        ];

        this.initializePaths(mapping);
        this.c3Config.bindto = this.element;
        this.chart = generate(this.c3Config);
    }
}

export default WeaveC3Barchart;

registerToolImplementation("weave.visualization.tools::CompoundBarChartTool", WeaveC3Barchart);
