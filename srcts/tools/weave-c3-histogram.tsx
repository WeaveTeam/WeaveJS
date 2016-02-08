///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>

import {IVisToolProps} from "./IVisTool";
import {IToolPaths} from "./AbstractC3Tool";
import AbstractC3Tool from "./AbstractC3Tool";
import * as _ from "lodash";
import * as d3 from "d3";
import * as React from "react";
import * as c3 from "c3";
import {ChartConfiguration, ChartAPI} from "c3";
import FormatUtils from "../utils/FormatUtils";
import StandardLib from "../utils/StandardLib"
import {MouseEvent} from "react";
import {getTooltipContent} from "./tooltip";
import Tooltip from "./tooltip";

import WeavePath = weavejs.path.WeavePath;
import WeavePathData = weavejs.path.WeavePathData;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import BinnedColumn = weavejs.data.column.BinnedColumn;
import ColorColumn = weavejs.data.column.ColorColumn;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;

export interface IHistogramPaths extends IToolPaths {
    binnedColumn: WeavePath;
    columnToAggregate: WeavePath;
    aggregationMethod: WeavePath;
    fillStyle: WeavePath;
    lineStyle: WeavePath;
}

export default class WeaveC3Histogram extends AbstractC3Tool {
    private idToRecord:{[id:string]: Record};
    private keyToIndex:{[key:string]: number};
    private indexToKey:{[index:number]: IQualifiedKey};
    private stringRecords:Record[];
    private numericRecords:Record[];
    private heightColumnNames:string[];
    private binnedColumnDataType:string;
    private numberOfBins:number;
    private showXAxisLabel:boolean;
    private histData:{}[];
    private keys:{x?:string, value:string[]};
    protected c3Config:ChartConfiguration;
    protected c3ConfigYAxis:c3.YAxisConfiguration;
    protected chart:ChartAPI;

    protected paths:IHistogramPaths;

    private flag:boolean;
    private busy:boolean;
    private dirty:boolean;

    constructor(props:IVisToolProps) {
        super(props);
        this.busy = false;
        this.idToRecord = {};
        this.keyToIndex = {};
        this.indexToKey = {};
        this.validate = _.debounce(this.validate.bind(this), 30);

        this.c3Config = {
            size: {
                width: this.props.style.width,
                height: this.props.style.height
            },
            padding: {
                top: 20,
                bottom: 0,
                left:100,
                right:20
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
                        var decColor:number;
                        if(weavejs.WeaveAPI.Locale.reverseLayout){
                            //handle case where labels need to be reversed for chart flip
                            var temp:number = this.histData.length-1;
                            decColor = (this.paths.fillStyle.push("color").getObject("internalDynamicColumn", null) as ColorColumn).getColorFromDataValue(temp-d.index);
                        }else{
                            decColor = (this.paths.fillStyle.push("color").getObject("internalDynamicColumn", null) as ColorColumn).getColorFromDataValue(d.index);
                        }
                        return "#" + StandardLib.decimalToHex(decColor);
                    }
                    return "#C0CDD1";
                },
                onclick: (d:any) => {
                    var event:MouseEvent = this.chart.internal.d3 as MouseEvent;
                    if(!(event.ctrlKey || event.metaKey) && d && d.hasOwnProperty("index")) {
                        var selectedIds:string[] = (this.paths.binnedColumn.getObject() as BinnedColumn).getKeysFromBinIndex(d.index).map( (qKey:{}) => {
                            return this.toolPath.qkeyToString(qKey);
                        });
                        this.toolPath.selection_keyset.setKeys(selectedIds);
                    }
                },
                onselected: (d:any) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        var selectedIds:string[] = (this.paths.binnedColumn.getObject() as BinnedColumn).getKeysFromBinIndex(d.index).map( (qKey:{}) => {
                            return this.toolPath.qkeyToString(qKey);
                        });
                        this.toolPath.selection_keyset.addKeys(selectedIds);
                    }
                },
                onunselected: (d:any) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        var unSelectedIds:string[] = (this.paths.binnedColumn.getObject() as BinnedColumn).getKeysFromBinIndex(d.index).map( (qKey:{}) => {
                            return this.toolPath.qkeyToString(qKey);
                        });
                        this.toolPath.selection_keyset.removeKeys(unSelectedIds);
                    }
                },
                onmouseover: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        var selectedIds:string[] = (this.paths.binnedColumn.getObject() as BinnedColumn).getKeysFromBinIndex(d.index).map( (qKey:{}) => {
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
            bindto: null,
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
                        rotate: -45,
                        culling: {
                            max: null
                        },
                        multiline: false,
                        format: (num:number):string => {
                            if(this.element && this.props.style.height > 0) {
                                var labelHeight:number = Number(this.paths.marginBottom.getState())/Math.cos(45*(Math.PI/180));
                                var labelString:string;
                                if(weavejs.WeaveAPI.Locale.reverseLayout){
                                    //handle case where labels need to be reversed
                                    var temp:number = this.histData.length-1;
                                    labelString = (this.paths.binnedColumn.getObject() as BinnedColumn).deriveStringFromNumber(temp-num);
                                }else{
                                    labelString = (this.paths.binnedColumn.getObject() as BinnedColumn).deriveStringFromNumber(num);
                                }
                                if(labelString) {
                                    var stringSize:number = StandardLib.getTextWidth(labelString, this.getFontString());
                                    var adjustmentCharacters:number = labelString.length - Math.floor(labelString.length * (labelHeight / stringSize));
                                    return adjustmentCharacters > 0 ? labelString.substring(0, labelString.length - adjustmentCharacters - 3) + "..." : labelString;
                                }else{
                                    return "";
                                }
                            }else {
                                return (this.paths.binnedColumn.getObject() as BinnedColumn).deriveStringFromNumber(num);
                            }
                        }
                    }
                },
                rotated: false
            },
            tooltip: {
                format: {
                    title: (num:number):string => {
                        return (this.paths.binnedColumn.getObject() as BinnedColumn).deriveStringFromNumber(num);
                    },
                    name: (name:string, ratio:number, id:string, index:number):string => {
                        return this.getYAxisLabel();
                    }
                },
                show: false
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
            bar: {
                width: {
                    ratio: 0.95
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
                fit: false,
                format: (num:number):string => {
                    return String(FormatUtils.defaultNumberFormatting(num));
                }
            }
        }
    }

    protected handleMissingSessionStateProperties(newState:any)
    {

    }

    handleClick(event:MouseEvent) {
        if(!this.flag) {
            this.toolPath.selection_keyset.setKeys([]);
        }
        this.flag = false;
    }

    rotateAxes() {
        //this.c3Config.axis.rotated = true;
        //this.forceUpdate();
    }

    private getYAxisLabel():string {
        var overrideAxisName = this.paths.yAxis.push("overrideAxisName").getState() as string;
        if(overrideAxisName) {
            return overrideAxisName;
        } else {
            if(this.paths.columnToAggregate.getObject(null)) {
                switch(this.paths.aggregationMethod.getState() as string) {
                    case "count":
                        return "Number of records";
                    case "sum":
                        return "Sum of " + (this.paths.columnToAggregate.getObject() as IAttributeColumn).getMetadata('title');
                    case "mean":
                        return "Mean of " + (this.paths.columnToAggregate.getObject() as IAttributeColumn).getMetadata('title');
                }
            } else {
                return "Number of records";
            }
        }
    }

    updateStyle() {
    	if (!this.chart)
    		return;

        d3.select(this.element).selectAll("path").style("opacity", 1)
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("stroke-opacity", 0.5);

        var selectedKeys:IQualifiedKey[] = this.toolPath.selection_keyset.getKeys();
        var probedKeys:IQualifiedKey[] = this.toolPath.probe_keyset.getKeys();
        var selectedRecords:Record[] = _.filter(this.numericRecords, function(record:Record) {
            return _.includes(selectedKeys, record.id);
        });
        var probedRecords:Record[] = _.filter(this.numericRecords, function(record:Record) {
            return _.includes(probedKeys, record.id);
        });
        var selectedBinIndices:number[] = _.pluck(_.uniq(selectedRecords, 'binnedColumn'), 'binnedColumn');
        var probedBinIndices:number[] = _.pluck(_.uniq(probedRecords, 'binnedColumn'), 'binnedColumn');
        var binIndices:number[] = _.pluck(_.uniq(this.numericRecords, 'binnedColumn'), 'binnedColumn');
        var unselectedBinIndices:number[] = _.difference(binIndices,selectedBinIndices);
        unselectedBinIndices = _.difference(unselectedBinIndices,probedBinIndices);

        if(selectedBinIndices.length)
        {
            this.customStyle(unselectedBinIndices, "path", ".c3-shape", {opacity: 0.3, "stroke-opacity": 0.0});
            this.customStyle(selectedBinIndices, "path", ".c3-shape", {opacity: 1.0, "stroke-opacity": 1.0});
        }
        else if(!probedBinIndices.length)
        {
            this.customStyle(binIndices, "path", ".c3-shape", {opacity: 1.0, "stroke-opacity": 0.5});
            this.chart.select(this.heightColumnNames, [], true);
        }
    }

    private dataChanged() {

        var numericMapping:any = {
            binnedColumn: this.paths.binnedColumn,
            columnToAggregate: this.paths.columnToAggregate
        };

        var stringMapping:any = {
            binnedColumn: this.paths.binnedColumn
        };

        this.binnedColumnDataType = (this.paths.binnedColumn.getObject() as BinnedColumn).getMetadata('dataType');

        this.numericRecords = (this.paths.plotter as WeavePathData).retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        this.stringRecords = (this.paths.plotter as WeavePathData).retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.idToRecord = {};
        this.keyToIndex = {};
        this.indexToKey = {};

        this.numericRecords.forEach((record:Record, index:number) => {
            this.idToRecord[record.id as any] = record;
            this.keyToIndex[record.id as any] = index;
            this.indexToKey[index] = record.id;
        });

        this.numberOfBins = (this.paths.binnedColumn.getObject() as BinnedColumn).numberOfBins;

        this.histData = [];

        // this._columnToAggregatePath.getObject().getInternalColumn();
        var columnToAggregateNameIsDefined:boolean = !!this.paths.columnToAggregate.getObject(null);

        for(let iBin:number = 0; iBin < this.numberOfBins; iBin++) {

            let recordsInBin:Record[] = _.filter(this.numericRecords, { binnedColumn: iBin });

            if(recordsInBin) {
                var obj:any = {height:0};
                if(columnToAggregateNameIsDefined) {
                    obj.height = this.getAggregateValue(recordsInBin, "columnToAggregate", this.paths.aggregationMethod.getState() as string);
                    this.histData.push(obj);
                } else {
                    obj.height = this.getAggregateValue(recordsInBin, "binnedColumn", "count");
                    this.histData.push(obj);
                }
            }
        }

        this.keys = { value: ["height"] };
        if(weavejs.WeaveAPI.Locale.reverseLayout){
            this.histData = this.histData.reverse();
        }

        this.c3Config.data.json = this.histData;
        this.c3Config.data.keys = this.keys;
      }

    private getAggregateValue(records:Record[], columnToAggregateName:string, aggregationMethod:string):number {

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
        this.showXAxisLabel = false;
        var plotterPath = this.toolPath.pushPlotter("plot");
        var mapping = [
            { name: "plotter", path: plotterPath, callbacks: this.validate},
            { name: "binnedColumn", path: plotterPath.push("binnedColumn") },
            { name: "columnToAggregate", path: plotterPath.push("columnToAggregate") },
            { name: "aggregationMethod", path: plotterPath.push("aggregationMethod") },
            { name: "fillStyle", path: plotterPath.push("fillStyle") },
            { name: "lineStyle", path: plotterPath.push("lineStyle") },
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

       	(this.paths.filteredKeySet.getObject() as FilteredKeySet).setSingleKeySource(this.paths.fillStyle.getObject('color', 'internalDynamicColumn') as IAttributeColumn);

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
        var axisChange:boolean = this.detectChange('binnedColumn', 'aggregationMethod', 'marginBottom', 'marginTop', 'marginLeft', 'marginRight');
        var axisSettingsChange:boolean = this.detectChange('xAxis', 'yAxis');
        if (axisChange || this.detectChange('plotter', 'columnToAggregate', 'fillStyle', 'lineStyle','filteredKeySet'))
        {
            changeDetected = true;
            this.dataChanged();
        }
        if (axisChange)
        {
            changeDetected = true;
            var xLabel:string = this.paths.xAxis.getState("overrideAxisName") as string || (this.paths.binnedColumn.getObject() as BinnedColumn).getMetadata('title');
            if(!this.showXAxisLabel){
                xLabel = " ";
            }var yLabel:string = this.getYAxisLabel.bind(this)();


            if (this.numericRecords)
            {
                var temp:string = "height";
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
        }
    }

    loadData() {
        if(!this.chart || this.busy)
            return StandardLib.debounce(this, 'loadData');
        this.chart.load({json: this.histData, keys:this.keys, unload: true, done: () => { this.busy = false; this.cullAxes();}});
    }
}

weavejs.util.BackwardsCompatibility.forceDeprecatedState(WeaveC3Histogram); // TEMPORARY HACK - remove when class is refactored

Weave.registerClass("weavejs.tool.C3Histogram", WeaveC3Histogram, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::HistogramTool", WeaveC3Histogram);
Weave.registerClass("weave.visualization.tools::ColormapHistogramTool", WeaveC3Histogram);
