///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>

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
import StandardLib from "../utils/StandardLib";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import WeavePath = weavejs.path.WeavePath;
import WeavePathData = weavejs.path.WeavePathData;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableNumber = weavejs.core.LinkableNumber;
import SimpleBinningDefinition = weavejs.data.bin.SimpleBinningDefinition;
import ColorRamp = weavejs.util.ColorRamp;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;

export interface IGaugePaths extends IToolPaths {
    binningDefinition:WeavePath;
    meterColumn:WeavePath;
    colorRamp:WeavePath;
}

class WeaveC3Gauge extends AbstractC3Tool {
    private keyToIndex:{[key:string]: number};
    private indexToKey:{[index:number]: IQualifiedKey};
    private stringRecords:Record[];
    private numericRecords:Record[];
    private records:Record[][];
    private colorRamp:string[];
    private numberOfBins:number;
    private colStats:any;
    protected c3Config:ChartConfiguration;
    protected chart:ChartAPI;
    protected paths:IGaugePaths;
    private busy:boolean;
    private dirty:boolean;

    constructor(props:IVisToolProps) {
        super(props);
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
                left: 100,
                right: 20
            },
            data: {
                columns: [],
                type: "gauge",
                xSort: false,
                names: {},
                selection: {
                    enabled: true,
                    multiple: true,
                    draggable: true

                },
                onclick: (d:any) => {
                },
                onselected: (d:any) => {
                },
                onunselected: (d:any) => {
                },
                onmouseover: (d:any) => {
                },
                onmouseout: (d:any) => {
                }
            },
            gauge: {
                label: {
                    format: function(value, ratio) {
                        return value;
                    },
                    show: false
                },
                //min: 0,
                //max: 200, // get max from column statistics
                //units: ' ',
                width: 39 // arc width
            },
            color: {
                threshold: {
                    //unit: ' ', // percentage is default
                    //max: 200, // should be set by data max using column stats
                    //values: [30, 60, 90, 100] //should be set in even range using the color ramp
                }
            },
            tooltip: {
                show: false
            },
            transition: { duration: 0 },
            bindto: null,
            onrendered: () => {
                this.busy = false;
                this.updateStyle();
                if (this.dirty)
                    this.validate();
            }
        };
    }

    private dataChanged():void {
        var column = this.paths.meterColumn.getObject() as IAttributeColumn;
        var name = column.getMetadata('title');

        var numericMapping:any = {
            meterColumn: this.paths.meterColumn
        };

        var stringMapping:any = {
            meterColumn: this.paths.meterColumn
        };


        this.numericRecords = (this.paths.plotter as WeavePathData).retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        if (!this.numericRecords.length)
            return;
        this.stringRecords = (this.paths.plotter as WeavePathData).retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.records = _.zip(this.numericRecords, this.stringRecords);

        this.keyToIndex = {};
        this.indexToKey = {};

        this.numericRecords.forEach((record:Record, index:number) => {
            this.keyToIndex[record.id as any] = index;
            this.indexToKey[index] = record.id;
        });

        this.numberOfBins = (this.paths.binningDefinition.push(null).getObject() as SimpleBinningDefinition).numberOfBins.value;
        this.c3Config.color.pattern = [];
        var ramp:any[] = this.paths.colorRamp.getState() as any[];
        ramp.forEach( (color:string,index:number) => {
            this.c3Config.color.pattern.push("#" + StandardLib.decimalToHex(StandardLib.interpolateColor(StandardLib.normalize(index, 0, this.numberOfBins - 1),color)));
        });

        this.c3Config.gauge.min = this.colStats.getMin();
        this.c3Config.gauge.max = this.colStats.getMax();

        var range = this.c3Config.gauge.max - this.c3Config.gauge.min;
        this.c3Config.color.threshold.values = [];
        for (var i=1; i<=this.numberOfBins; i++){
            this.c3Config.color.threshold.values.push(this.c3Config.gauge.min+i*(range/this.numberOfBins));
        }


        var data = _.cloneDeep(this.c3Config.data);
        if(this.paths.probeKeySet.getState()){
            //sometime probe keyset is not reset when mouse leaves another tool, so for now only take
            //the first numeric record, but probe keyset not being set to empty should be addressed,
            //then the [0] below and surrounding [] can be removed
            data.columns = [_.union([[name]], [_.pluck(this.numericRecords, 'meterColumn')[0]])];
        } else {
            data.columns = [];
        }
        data.unload = true;
        this.c3Config.data = data;
    }

    updateStyle() {
        if(!this.chart || !this.paths.meterColumn)
            return;

        //d3.select(this.element)
        //    .selectAll("path")
        //    .style("opacity", 1)
        //    .style("stroke", "black")
        //    .style("stroke-width", "1px")
        //    .style("stroke-opacity", 0.5);
        //
        //var selectedKeys:string[] = this.toolPath.selection_keyset.getKeys();
        //var probedKeys:string[] = this.toolPath.probe_keyset.getKeys();
        //var selectedIndices:number[] = selectedKeys.map((key:string) => {
        //    return Number(this.keyToIndex[key]);
        //});
        //var probedIndices:number[] = probedKeys.map((key:string) => {
        //    return Number(this.keyToIndex[key]);
        //});
        //var keys:string[] = Object.keys(this.keyToIndex);
        //var indices:number[] = keys.map((key:string) => {
        //    return Number(this.keyToIndex[key]);
        //});
        //var unselectedIndices:number[] = _.difference(indices,selectedIndices);
        //unselectedIndices = _.difference(unselectedIndices,probedIndices);

    }

    componentDidUpdate() {
        if(this.c3Config.size.width != this.props.style.width || this.c3Config.size.height != this.props.style.height) {
            this.c3Config.size = {width: this.props.style.width, height: this.props.style.height};
            this.validate(true);
        }
    }

    componentDidMount() {
        var plotterPath = this.toolPath.pushPlotter("plot");
        var mapping = [
            { name: "plotter", path: plotterPath, callbacks: this.validate },
            { name: "binningDefinition", path: plotterPath.push("binningDefinition") },
            { name: "meterColumn", path: plotterPath.push("meterColumn") },
            { name: "colorRamp", path: plotterPath.push("colorRamp") },
            { name: "marginBottom", path: this.plotManagerPath.push("marginBottom") },
            { name: "marginLeft", path: this.plotManagerPath.push("marginLeft") },
            { name: "marginTop", path: this.plotManagerPath.push("marginTop") },
            { name: "marginRight", path: this.plotManagerPath.push("marginRight") },
            { name: "filteredKeySet", path: plotterPath.push("filteredKeySet") },
            { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: this.updateStyle },
            { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: this.validate }
        ];

        this.initializePaths(mapping);

        (this.paths.filteredKeySet.getObject() as FilteredKeySet).setColumnKeySources([this.paths.meterColumn.getObject()]);

        var column = this.paths.meterColumn.getObject() as IAttributeColumn;
        //use ColumnStatistics to set gauge min/max appropriately
        this.colStats = new weavejs.data.ColumnStatistics(column);
        this.colStats.validateCache();

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

        var marginChange:boolean = this.detectChange('marginBottom', 'marginTop', 'marginLeft', 'marginRight');

        //TODO: Need a debounced call when 'meterColumn' changes to wait for validateCache to return
        //      with column statistics and then call this.dataChanged() to set config appropriately
        var changeDetected:boolean = false;
        if (this.detectChange('meterColumn', 'colorRamp', 'filteredKeySet', 'probeKeySet'))
        {
            changeDetected = true;
            this.dataChanged();
        }
        if(marginChange) {
            changeDetected = true;
            this.c3Config.padding.top = Number(this.paths.marginTop.getState());
            this.c3Config.padding.bottom = Number(this.paths.marginBottom.getState());
            this.c3Config.padding.left = Number(this.paths.marginLeft.getState());
            this.c3Config.padding.right = Number(this.paths.marginRight.getState());
        }

        if (changeDetected || forced)
        {
            this.busy = true;
            this.chart = c3.generate(this.c3Config);
        }
    }
}

export default WeaveC3Gauge;
registerToolImplementation("weave.visualization.tools::GaugeTool", WeaveC3Gauge);
//Weave.registerClass("weavejs.tools.GaugeTool", WeaveC3Gauge, [weavejs.api.core.ILinkableObjectWithNewProperties]);