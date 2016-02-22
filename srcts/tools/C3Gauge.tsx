///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>

import {IVisToolProps} from "./IVisTool";
import AbstractC3Tool from "./AbstractC3Tool";
import * as _ from "lodash";
import * as d3 from "d3";
import FormatUtils from "../utils/FormatUtils";
import * as React from "react";
import * as c3 from "c3";
import {ChartConfiguration, ChartAPI} from "c3";
import MiscUtils from "../utils/MiscUtils";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IColumnStatistics = weavejs.api.data.IColumnStatistics;
import LinkableNumber = weavejs.core.LinkableNumber;
import SimpleBinningDefinition = weavejs.data.bin.SimpleBinningDefinition;
import ColorRamp = weavejs.util.ColorRamp;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import DynamicBinningDefinition = weavejs.data.bin.DynamicBinningDefinition;
import StandardLib = weavejs.util.StandardLib;

declare type Record = {
    id: IQualifiedKey,
    meterColumn: number
};

export default class C3Gauge extends AbstractC3Tool
{
    meterColumn = Weave.linkableChild(this, DynamicColumn);
    binningDefinition = Weave.linkableChild(this, DynamicBinningDefinition);
	colorRamp = Weave.linkableChild(this, ColorRamp);
    private colStats = Weave.linkableChild(this, weavejs.WeaveAPI.StatisticsCache.getColumnStatistics(this.meterColumn));

    private RECORD_FORMAT = {
        id: IQualifiedKey,
        meterColumn: this.meterColumn
    };

    private RECORD_DATATYPE = {
        meterColumn: Number
    };

    private keyToIndex:{[key:string]: number};
    private records:Record[];
    private numberOfBins:number;
    protected c3Config:ChartConfiguration;
    protected chart:ChartAPI;
    private busy:boolean;
    private dirty:boolean;

    constructor(props:IVisToolProps)
    {
        super(props);

        this.filteredKeySet.setSingleKeySource(this.meterColumn);

        this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
        this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
        this.probeFilter.targetPath = ['defaultProbeKeySet'];

        this.keyToIndex = {};
        this.validate = _.debounce(this.validate.bind(this), 30);

        this.c3Config = {
            size: {
                width: this.props.style.width,
                height: this.props.style.height
            },
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10
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
                    format: function(value, ratio)
                    {
                        return String(FormatUtils.defaultNumberFormatting(value));
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
			interaction: { brighten: false },
            transition: { duration: 0 },
            bindto: null,
            onrendered: () => {
                this.busy = false;
                if (this.dirty)
                    this.validate();
            }
        };
    }

    get deprecatedStateMapping()
    {
        return [super.deprecatedStateMapping, {
            "children": {
                "visualization": {
                    "plotManager": {
                        "plotters": {
                            "plot": {
                                "filteredKeySet": this.filteredKeySet,
                                "meterColumn": this.meterColumn,
                                "colorRamp": this.colorRamp,
                                "binningDefinition": this.binningDefinition
                            }
                        }
                    }
                }
            }
        }];
    }

    validate(forced:boolean = false):void
    {
        if (this.busy)
        {
            this.dirty = true;
            return;
        }
        this.dirty = false;

        //TODO: Need a debounced call when 'meterColumn' changes to wait for validateCache to return
        //      with column statistics and then call this.validate() to set config appropriately
        var changeDetected:boolean = false;
        if (Weave.detectChange(this, this.meterColumn, this.colorRamp, this.filteredKeySet, this.probeKeySet, this.selectionKeySet, this.colStats, this.binningDefinition))
        {
            changeDetected = true;
			var name = this.meterColumn.getMetadata('title');

			this.records = weavejs.data.ColumnUtils.getRecords(this.RECORD_FORMAT, this.filteredKeySet.keys, this.RECORD_DATATYPE);

			this.keyToIndex = {};

			this.records.forEach( (record:Record, index:number) => {
				this.keyToIndex[record.id as any] = index;
			});

			this.numberOfBins = (this.binningDefinition.internalObject as SimpleBinningDefinition).numberOfBins.value;
			this.c3Config.color.pattern = this.colorRamp.getColors().reverse().map(color => '#' + StandardLib.numberToBase(color, 16, 6));

			this.c3Config.gauge.min = this.colStats.getMin();
			this.c3Config.gauge.max = this.colStats.getMax();

			var range = this.c3Config.gauge.max - this.c3Config.gauge.min;
			this.c3Config.color.threshold.values = [];
			for (var i = 1; i <= this.numberOfBins; i++)
			{
				this.c3Config.color.threshold.values.push(this.c3Config.gauge.min + i * (range / this.numberOfBins));
			}
			this.c3Config.gauge.label.show = true;


			var data = _.cloneDeep(this.c3Config.data);
			var temp:any[] = [name];
			var meterCols:number[] = _.pluck(this.records, 'meterColumn');

			var selectedKeys:IQualifiedKey[] = this.selectionKeySet ? this.selectionKeySet.keys : [];
			var probedKeys:IQualifiedKey[] = this.probeKeySet ? this.probeKeySet.keys : [];
			var valid:boolean = false;
			if (probedKeys.length)
			{
				probedKeys.forEach( (key) => {
					var i:number = this.keyToIndex[key.toString()];
					if (meterCols[i])
					{
						valid = true;
						temp.push(meterCols[i]);
					}
				});
			}
			else if (selectedKeys.length)
			{
				selectedKeys.forEach( (key) => {
					var i:number = this.keyToIndex[key.toString()];
					if (meterCols[i])
					{
						valid = true;
						temp.push(meterCols[i]);
					}
				});
			}
			if (valid)
			{
				data.columns = [temp];
			}
			else
			{
				data.columns = [];
			}
			data.unload = true;
			this.c3Config.data = data;
        }
		
		this.updateConfigMargin();

        if (changeDetected || forced)
        {
            this.busy = true;
            this.chart = c3.generate(this.c3Config);
        }
    }
}


Weave.registerClass("weavejs.tool.C3Gauge", C3Gauge, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::GaugeTool", C3Gauge);
