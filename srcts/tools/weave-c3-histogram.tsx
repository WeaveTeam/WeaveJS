///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/WeavePath.d.ts"/>


import AbstractWeaveTool from "./AbstractWeaveTool";
import {registerToolImplementation} from "../WeaveTool";
import * as _ from "lodash";
import * as d3 from "d3";
import * as React from "react";
import FormatUtils from "../Utils/FormatUtils";
import StandardLib from "../Utils/StandardLib"
import {IAbstractWeaveToolProps} from "./AbstractWeaveTool";
import {IAbstractWeaveToolPaths} from "./AbstractWeaveTool";
import {ElementSize} from "./AbstractWeaveTool";
import {ChartConfiguration, ChartAPI, generate} from "c3";
import {MouseEvent} from "react";

interface IHistogramPaths extends IAbstractWeaveToolPaths {
    plotter: WeavePath;
    binnedColumn: WeavePath;
    columnToAggregate: WeavePath;
    aggregationMethod: WeavePath;
    fillStyle: WeavePath;
    lineStyle: WeavePath;
    xAxis: WeavePath;
    yAxis: WeavePath;
    filteredKeySet: WeavePath;
    selectionKeySet: WeavePath;
    probeKeySet: WeavePath;
}

class WeaveC3Histogram extends AbstractWeaveTool {
    private busy:boolean;
    private idToRecord:{[id:string]: Record};
    private keyToIndex:{[key:string]: number};
    private indexToKey:{[index:number]: string};
    private stringRecords:Record[];
    private numericRecords:Record[];
    private heightColumnNames:string[];
    private binnedColumnDataType:string;
    private numberOfBins:number;
    private histData:{}[];
    private c3Config:ChartConfiguration;
    private chart:ChartAPI;

    protected paths:IHistogramPaths;

    private keyDown:boolean;
    private flag:boolean;

    constructor(props:IAbstractWeaveToolProps) {
        super(props);
        this.busy = false;
        this.idToRecord = {};
        this.keyToIndex = {};
        this.indexToKey = {};

        this.c3Config = {
            //size: this.getElementSize(),
            padding: {
                top: 20,
                bottom: 20,
                right: 30
            },
            data: {
                columns: [],
                selection: {
                    enabled: true,
                    multiple: true,
                    draggable: true
                },
                type: "bar",
                color: (color:string, d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        var decColor:number = this.paths.fillStyle.push("color").push("internalDynamicColumn", null).getValue("this.getColorFromDataValue.bind(this)")(d.index).toString(16);
                        return "#" + StandardLib.decimalToHex(decColor);
                    }
                    return "#C0CDD1";
                },
                onclick: (d:any) => {
                    if(!this.keyDown && d && d.hasOwnProperty("index")) {
                        var selectedIds:string[] = this.paths.binnedColumn.getValue("this.getKeysFromBinIndex.bind(this)")(d.index).map( (qKey:{}) => {
                            return this.toolPath.qkeyToString(qKey);
                        });
                        this.toolPath.selection_keyset.setKeys(selectedIds);
                    }
                },
                onselected: (d:any) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        var selectedIds:string[] = this.paths.binnedColumn.getValue("this.getKeysFromBinIndex.bind(this)")(d.index).map( (qKey:{}) => {
                            return this.toolPath.qkeyToString(qKey);
                        });
                        this.toolPath.selection_keyset.addKeys(selectedIds);
                    }
                },
                onunselected: (d:any) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        var unSelectedIds:string[] = this.paths.binnedColumn.getValue("this.getKeysFromBinIndex.bind(this)")(d.index).map( (qKey:{}) => {
                            return this.toolPath.qkeyToString(qKey);
                        });
                        this.toolPath.selection_keyset.removeKeys(unSelectedIds);
                    }
                },
                onmouseover: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        var selectedIds:string[] = this.paths.binnedColumn.getValue("this.getKeysFromBinIndex.bind(this)")(d.index).map( (qKey:{}) => {
                            return this.toolPath.qkeyToString(qKey);
                        });
                        this.toolPath.probe_keyset.setKeys(selectedIds);
                    }
                },
                onmouseout: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([]);
                    }
                }
            },
            bindto: this.element,
            legend: {
                show: false
            },
            axis: {
                x: {
                    type: "category",
                    label: {
                        text: "",
                        position: "outer-center"
                    },
                    tick: {
                        multiline: false,
                        format: (num:number):string => {
                            return this.paths.binnedColumn.getValue("this.deriveStringFromNumber.bind(this)")(num);
                        }
                    }
                },
                y: {
                    label: {
                        text: "",
                        position: "outer-middle"
                    },
                    tick: {
                        fit: false,
                        format: (num:number):string => {
                            return String(FormatUtils.defaultNumberFormatting(num));
                        }
                    }
                },
                rotated: false
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            bar: {
                width: {
                    ratio: 0.95
                }
            },
            onrendered: this._updateStyle.bind(this)
        };
    }

    _selectionKeysChanged () {
        if(!this.chart)
            return;

        var selectedKeys:string[] = this.toolPath.selection_keyset.getKeys();
        var selectedRecords:Record[] = _.filter(this.numericRecords, function(record:Record) {
            return _.includes(selectedKeys, record["id"]);
        });
        var selectedBinIndices:number[] = _.pluck(_.uniq(selectedRecords, 'binnedColumn'), 'binnedColumn');
        var binIndices:number[] = _.pluck(_.uniq(this.numericRecords, 'binnedColumn'), 'binnedColumn');
        var unselectedBinIndices:number[] = _.difference(binIndices,selectedBinIndices);

        if(selectedBinIndices.length) {
            this.customStyle(unselectedBinIndices, "path", ".c3-shape", {opacity: 0.3});
            this.customStyle(selectedBinIndices, "path", ".c3-shape", {opacity: 1.0});
        }else{
            this.customStyle(binIndices, "path", ".c3-shape", {opacity: 1.0});
            this.chart.select(this.heightColumnNames, [], true);
        }
    }

    _probedKeysChanged () {
        var selectedKeys:string[] = this.toolPath.probe_keyset.getKeys();
        var selectedRecords:Record[] = _.filter(this.numericRecords, function(record:Record) {
            return _.includes(selectedKeys, record["id"]);
        });
        var selectedBinIndices:number[] = _.pluck(_.uniq(selectedRecords, 'binnedColumn'), 'binnedColumn');
        var binIndices:number[] = _.pluck(_.uniq(this.numericRecords, 'binnedColumn'), 'binnedColumn');
        var unselectedBinIndices:number[] = _.difference(binIndices,selectedBinIndices);

        if(selectedBinIndices.length) {
            this.customStyle(unselectedBinIndices, "path", ".c3-shape", {opacity: 0.3});
            this.customStyle(selectedBinIndices, "path", ".c3-shape", {opacity: 1.0});
        }else{
            this._selectionKeysChanged()
        }
    }

    handleClick(event:MouseEvent) {
        if(!this.flag) {
            this.toolPath.selection_keyset.setKeys([]);
        }
        this.flag = false;
    }

    toggleKey(event:KeyboardEvent) {
        if((event.keyCode === 17)||(event.keyCode === 91) || (event.keyCode === 224)) {
            this.keyDown = !this.keyDown;
        }
    }

    rotateAxes() {
        //this.c3Config.axis.rotated = true;
        //this.forceUpdate();
    }

    _axisChanged () {
        if(!this.chart)
            return;

        if(this.busy)
            return;

        this.chart.axis.labels({
            x: this.paths.xAxis.push("overrideAxisName").getState() || this.paths.binnedColumn.getValue("this.getMetadata('title')"),
            y: function():string {
                var overrideAxisName = this.paths.yAxis.push("overrideAxisName").getState();
                if(overrideAxisName) {
                    return overrideAxisName;
                } else {
                    if(this.paths.columnToAggregate.getState().length) {
                        switch(this.paths.aggregationMethod.getState()) {
                            case "count":
                                return "Number of records";
                            case "sum":
                                return "Sum of " + this.paths.columnToAggregate.getValue("this.getMetadata('title')");
                            case "mean":
                                return "Mean of " + this.paths.columnToAggregate.getValue("this.getMetadata('title')");
                        }
                    } else {
                        return "Number of records";
                    }
                }
            }.bind(this)()
        });
    }

    _updateStyle() {

    }

    _dataChanged() {

        if(!this.chart)
            return;
        if(this.busy) {
            return;
        }

        var numericMapping:any = {
            binnedColumn: this.paths.binnedColumn,
            columnToAggregate: this.paths.columnToAggregate
        };

        var stringMapping:any = {
            binnedColumn: this.paths.binnedColumn
        };

        this.binnedColumnDataType = this.paths.binnedColumn.getValue("this.getMetadata('dataType')");

        this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.idToRecord = {};
        this.keyToIndex = {};
        this.indexToKey = {};

        this.numericRecords.forEach((record:Record, index:number) => {
            this.idToRecord[record["id"] as string] = record;
            this.keyToIndex[record["id"] as string] = index;
            this.indexToKey[index] = record["id"] as string;
        });

        this.numberOfBins = this.paths.binnedColumn.getValue("this.numberOfBins");

        this.histData = [];

        // this._columnToAggregatePath.getValue("this.getInternalColumn()");
        var columnToAggregateNameIsDefined:boolean = this.paths.columnToAggregate.getState().length > 0;

        for(let iBin:number = 0; iBin < this.numberOfBins; iBin++) {

            let recordsInBin:Record[] = _.filter(this.numericRecords, { binnedColumn: iBin });

            if(recordsInBin) {
                var obj:any = {height:0};
                if(columnToAggregateNameIsDefined) {
                    obj.height = this.getAggregateValue(recordsInBin, "columnToAggregate", this.paths.aggregationMethod.getState());
                    this.histData.push(obj);
                } else {
                    obj.height = this.getAggregateValue(recordsInBin, "binnedColumn", "count");
                    this.histData.push(obj);
                }
            }
        }

        var keys = { value: ["height"] };
        this._axisChanged();
        this.busy = true;
        this.chart.load({json: this.histData, keys, unload: true, done: () => { this.busy = false; }});
    }

    private getAggregateValue(records:Record[], columnToAggregateName:string, aggregationMethod:WeavePath):number {

        var count:number = 0;
        var sum:number = 0;

        if(!Array.isArray(records)) {
            return 0;
        }

        records.forEach((record) => {
            count++;
            sum += record[columnToAggregateName] as number;
        });

        if (aggregationMethod === "mean") {
            return sum / count; // convert sum to mean
        }

        if (aggregationMethod === "count") {

            return count; // use count of finite values
        }

        // sum
        return sum;
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        //console.log("component did update");
        //var start = Date.now();
        var newElementSize = this.getElementSize();
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
        var axisChanged:Function = _.debounce(this._axisChanged.bind(this), 100);
        var dataChanged:Function = _.debounce(this._dataChanged.bind(this), 100);
        var selectionKeySetChanged:Function = this._selectionKeysChanged.bind(this);
        var probeKeySetChanged:Function = _.debounce(this._probedKeysChanged.bind(this), 100);
        var plotterPath = this.toolPath.pushPlotter("plot");
        var mapping = [
            { name: "plotter", path: plotterPath, callbacks: null},
            { name: "binnedColumn", path: plotterPath.push("binnedColumn"), callbacks: [dataChanged, axisChanged] },
            { name: "columnToAggregate", path: plotterPath.push("columnToAggregate"), callbacks: dataChanged },
            { name: "aggregationMethod", path: plotterPath.push("aggregationMethod"), callbacks: [dataChanged, axisChanged] },
            { name: "fillStyle", path: plotterPath.push("fillStyle"), callbacks: dataChanged },
            { name: "lineStyle", path: plotterPath.push("lineStyle"), callbacks: dataChanged },
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

export default WeaveC3Histogram;

registerToolImplementation("weave.visualization.tools::HistogramTool", WeaveC3Histogram);
