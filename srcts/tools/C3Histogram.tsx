///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>

import {IVisToolProps} from "./IVisTool";
import AbstractC3Tool from "./AbstractC3Tool";
import * as _ from "lodash";
import * as d3 from "d3";
import * as React from "react";
import * as c3 from "c3";
import {ChartConfiguration, ChartAPI} from "c3";
import FormatUtils from "../utils/FormatUtils";
import StandardLib from "../utils/StandardLib"
import {MouseEvent} from "react";
import ToolTip from "./ToolTip";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import BinnedColumn = weavejs.data.column.BinnedColumn;
import ColorColumn = weavejs.data.column.ColorColumn;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import LinkableString = weavejs.core.LinkableString;
import SolidFillStyle = weavejs.geom.SolidFillStyle;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import SimpleBinningDefinition = weavejs.data.bin.SimpleBinningDefinition;

declare type Record = {
    id: weavejs.api.data.IQualifiedKey,
	binnedColumn: number,
	columnToAggregate: number
};

export default class C3Histogram extends AbstractC3Tool
{
	binnedColumn = Weave.linkableChild(this, BinnedColumn);
	columnToAggregate = Weave.linkableChild(this, DynamicColumn);
	aggregationMethod = Weave.linkableChild(this, LinkableString);
	fill = Weave.linkableChild(this, SolidFillStyle);
	line = Weave.linkableChild(this, SolidLineStyle);

	private RECORD_FORMAT = {
		id: IQualifiedKey,
		binnedColumn: this.binnedColumn,
		columnToAggregate: this.columnToAggregate
	};

	private RECORD_DATATYPE = {
		binnedColumn: Number,
		columnToAggregate: Number
	};

    private idToRecord:{[id:string]: Record};
    private keyToIndex:{[key:string]: number};
    private heightColumnNames:string[];
    private binnedColumnDataType:string;
    private numberOfBins:number;
    private showXAxisLabel:boolean = false;
    private histData:{}[];
    private keys:{x?:string, value:string[]};
	private records:Record[];
    protected c3Config:ChartConfiguration;
    protected c3ConfigYAxis:c3.YAxisConfiguration;
    protected chart:ChartAPI;
	private debouncedHandleC3Selection: Function;

    private busy:boolean;
    private dirty:boolean;

    constructor(props:IVisToolProps)
    {
        super(props);
		
		this.debouncedHandleC3Selection = _.debounce(this.handleC3Selection.bind(this), 50);
		
		Weave.getCallbacks(this.selectionFilter).addGroupedCallback(this, this.handleKeyFilters);
		Weave.getCallbacks(this.probeFilter).addGroupedCallback(this, this.handleKeyFilters);

		this.filteredKeySet.setSingleKeySource(this.fill.color);

		this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
		this.probeFilter.targetPath = ['defaultProbeKeySet'];

        this.busy = false;
        this.idToRecord = {};
        this.keyToIndex = {};
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
                    if (d && d.hasOwnProperty("index"))
					{
                        var decColor:number;
                        if (weavejs.WeaveAPI.Locale.reverseLayout)
						{
                            //handle case where labels need to be reversed for chart flip
                            var temp:number = this.histData.length-1;
                            decColor = (this.fill.color.internalDynamicColumn.getInternalColumn() as ColorColumn).getColorFromDataValue(temp-d.index);
                        }
                        else
                        {
                            decColor = (this.fill.color.internalDynamicColumn.getInternalColumn() as ColorColumn).getColorFromDataValue(d.index);
                        }
                        return "#" + StandardLib.decimalToHex(decColor);
                    }
                    return "#C0CDD1";
                },
                onclick: (d:any) => {
                },
                onselected: (d:any) => {
					this.debouncedHandleC3Selection();
                },
                onunselected: (d:any) => {
					this.debouncedHandleC3Selection();
                },
                onmouseover: (d:any) => {
                    if (d && d.hasOwnProperty("index"))
                    {
						var keys = this.binnedColumn.getKeysFromBinIndex(d.index);
						if (!keys)
							return;
						console.log('probed', keys);
                        this.probeKeySet.replaceKeys(keys);
                    }
                },
                onmouseout: (d:any) => {
                    if (d && d.hasOwnProperty("index"))
                    {
                        this.probeKeySet.replaceKeys([]);
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
                            if (this.element && this.props.style.height > 0)
                            {
                                var labelHeight:number = Number(this.margin.bottom)/Math.cos(45*(Math.PI/180));
                                var labelString:string;
                                if (weavejs.WeaveAPI.Locale.reverseLayout)
                                {
                                    //handle case where labels need to be reversed
                                    var temp:number = this.histData.length-1;
                                    labelString = this.binnedColumn.deriveStringFromNumber(temp-num);
                                }
                                else
                                {
                                    labelString = this.binnedColumn.deriveStringFromNumber(num);
                                }
                                if (labelString)
                                {
                                    var stringSize:number = StandardLib.getTextWidth(labelString, this.getFontString());
                                    var adjustmentCharacters:number = labelString.length - Math.floor(labelString.length * (labelHeight / stringSize));
                                    return adjustmentCharacters > 0 ? labelString.substring(0, labelString.length - adjustmentCharacters - 3) + "..." : labelString;
                                }
                                else
                                {
                                    return "";
                                }
                            }
                            else
                            {
                                return this.binnedColumn.deriveStringFromNumber(num);
                            }
                        }
                    }
                },
                rotated: false
            },
            tooltip: {
                format: {
                    title: (num:number):string => {
                        return this.binnedColumn.deriveStringFromNumber(num);
                    },
                    name: (name:string, ratio:number, id:string, index:number):string => {
                        return this.getYAxisLabel();
                    }
                },
                show: false
            },
			interaction: { brighten: false },
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

    get deprecatedStateMapping()
    {
        return [super.deprecatedStateMapping, {
            "children": {
                "visualization": {
                    "plotManager": {
                        "plotters": {
                            "plot": {
                                "filteredKeySet": this.filteredKeySet,
								"binnedColumn": this.binnedColumn,
                                "columnToAggregate": this.columnToAggregate,
                                "aggregationMethod": this.aggregationMethod,
								"fillStyle": this.fill,
                                "lineStyle": this.line,

                                "drawPartialBins": true,
                                "horizontalMode": false,
								"showValueLabels": false,
                                "valueLabelColor": 0,
                                "valueLabelHorizontalAlign": "left",
                                "valueLabelMaxWidth": 200,
                                "valueLabelVerticalAlign": "middle"
                            }
                        }
                    }
                }
            }
        }];
    }

    rotateAxes()
    {
        //this.c3Config.axis.rotated = true;
        //this.forceUpdate();
    }

    private getYAxisLabel():string
    {
        var overrideAxisName = this.yAxisName.value;
        if (overrideAxisName)
        {
            return overrideAxisName;
        }
        else
        {
            if (this.columnToAggregate.getInternalColumn())
            {
                switch(this.aggregationMethod.value)
                {
                    case "count":
                        return "Number of records";
                    case "sum":
                        return "Sum of " + this.columnToAggregate.getMetadata('title');
                    case "mean":
                        return "Mean of " + this.columnToAggregate.getMetadata('title');
                }
            }
            else
            {
                return "Number of records";
            }
        }
    }

	private handleC3Selection()
	{
		if (!this.selectionKeySet)
			return;
		
		var set_selectedKeys = new Set<IQualifiedKey>();
		var selectedKeys:IQualifiedKey[] = [];
		for (var d of this.chart.selected())
		{
			var keys = this.binnedColumn.getKeysFromBinIndex(d.index);
			if (!keys)
				continue;
			for (var key of keys)
			{
				if (!set_selectedKeys.has(key))
				{
					set_selectedKeys.add(key);
					selectedKeys.push(key);
				}
			}
		}
		this.selectionKeySet.replaceKeys(selectedKeys);
	}
	
	private handleKeyFilters()
	{
		if (this.records && Weave.detectChange(this, this.selectionFilter))
		{
			if (this.selectionKeySet)
			{
				var set_indices = new Set<number>();
				for (var key of this.selectionKeySet.keys)
				{
					var index = this.binnedColumn.getValueFromKey(key, Number);
					if (isFinite(index))
						set_indices.add(index);
				}
				this.chart.select(["height"], weavejs.util.JS.toArray(set_indices), true);
			}
			else
			{
				this.chart.select(["height"], [], true);
			}
		}
		this.updateStyle();
	}

    updateStyle()
    {
    	if (!this.chart || !this.records.length)
    		return;

        let selectionEmpty: boolean = !this.selectionKeySet || this.selectionKeySet.keys.length === 0;

        var selectedKeys:IQualifiedKey[] = this.selectionKeySet.keys;
        var probedKeys:IQualifiedKey[] = this.probeKeySet.keys;
        var selectedRecords:Record[] = _.filter(this.records, function(record:Record) {
            return _.includes(selectedKeys, record.id);
        });
        var probedRecords:Record[] = _.filter(this.records, function(record:Record) {
            return _.includes(probedKeys, record.id);
        });
        var selectedBinIndices:number[] = _.pluck(_.uniq(selectedRecords, 'binnedColumn'), 'binnedColumn');
        var probedBinIndices:number[] = _.pluck(_.uniq(probedRecords, 'binnedColumn'), 'binnedColumn');


        d3.select(this.element).selectAll("path.c3-shape")
            .style("stroke", "black")
            .style("opacity",
                (d: any, i: number, oi: number): number => {
                    let selected = _.intersection(selectedBinIndices,[i]).length;
                    let probed = _.intersection(probedBinIndices,[i]).length;
                    return (selectionEmpty || selected || probed) ? 1.0 : 0.3;
                })
            .style("stroke-opacity",
                (d: any, i: number, oi: number): number => {
                    let selected = _.intersection(selectedBinIndices,[i]).length;
                    let probed = _.intersection(probedBinIndices,[i]).length;
                    if (probed || selected)
                        return 1.0;
                    if (!selectionEmpty && !selected)
                        return 0;
                    return 0.0;
                })
            .style("stroke-width",
                (d: any, i: number, oi: number): number => {
                    let probed = _.intersection(probedBinIndices,[i]).length;
                    return probed ? 2.0 : 1.0;
                });
    }

    private dataChanged()
    {

        this.binnedColumnDataType = this.binnedColumn.getMetadata('dataType');

		this.records = weavejs.data.ColumnUtils.getRecords(this.RECORD_FORMAT, this.filteredKeySet.keys, this.RECORD_DATATYPE);

        this.idToRecord = {};
        this.keyToIndex = {};

        this.records.forEach((record:Record, index:number) => {
            this.idToRecord[record.id as any] = record;
            this.keyToIndex[record.id as any] = index;
        });

        this.numberOfBins = (this.binnedColumn.binningDefinition.target as SimpleBinningDefinition).numberOfBins.value;

        this.histData = [];

        // this._columnToAggregatePath.getObject().getInternalColumn();
        var columnToAggregateNameIsDefined:boolean = !!this.columnToAggregate.getInternalColumn();

        for (let iBin:number = 0; iBin < this.numberOfBins; iBin++)
        {

            let recordsInBin:Record[] = _.filter(this.records, { binnedColumn: iBin });

            if (recordsInBin)
            {
                var obj:any = {height:0};
                if (columnToAggregateNameIsDefined)
                {
                    obj.height = this.getAggregateValue(recordsInBin, "columnToAggregate", this.aggregationMethod.value);
                    this.histData.push(obj);
                }
                else
                {
                    obj.height = this.getAggregateValue(recordsInBin, "binnedColumn", "count");
                    this.histData.push(obj);
                }
            }
        }

        this.keys = { value: ["height"] };
        if (weavejs.WeaveAPI.Locale.reverseLayout)
        {
            this.histData = this.histData.reverse();
        }

        this.c3Config.data.json = this.histData;
        this.c3Config.data.keys = this.keys;
      }

    private getAggregateValue(records:Record[], columnToAggregateName:string, aggregationMethod:string):number
    {

        var count:number = 0;
        var sum:number = 0;

        if (!Array.isArray(records))
        {
            return 0;
        }

        records.forEach( (record:any) => {
            count++;
            sum += record[columnToAggregateName as string] as number;
        });

        if (aggregationMethod === "mean")
        {
            return sum / count; // convert sum to mean
        }

        if (aggregationMethod === "count")
        {

            return count; // use count of finite values
        }

        // sum
        return sum;
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
        var axisChange:boolean = Weave.detectChange(this, this.binnedColumn, this.aggregationMethod, this.xAxisName, this.yAxisName, this.margin.bottom, this.margin.top, this.margin.left, this.margin.right);
        if (axisChange || Weave.detectChange(this, this.columnToAggregate, this.fill, this.line, this.filteredKeySet))
        {
            changeDetected = true;
            this.dataChanged();
        }
        if (axisChange)
        {
            changeDetected = true;
            var xLabel:string = this.xAxisName.value || this.binnedColumn.getMetadata('title');
            if (!this.showXAxisLabel)
                xLabel = " ";
            var yLabel:string = this.getYAxisLabel.bind(this)();


            if (this.records)
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
        }
		
		this.updateConfigMargin();

        if (changeDetected || forced)
        {
            this.busy = true;
            this.chart = c3.generate(this.c3Config);
            this.loadData();
        }
    }

    loadData()
    {
        if (!this.chart || this.busy)
            return StandardLib.debounce(this, 'loadData');
        this.chart.load({json: this.histData, keys:this.keys, unload: true, done: () => { this.busy = false; this.cullAxes();}});
    }
}

Weave.registerClass("weavejs.tool.C3Histogram", C3Histogram, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::HistogramTool", C3Histogram);
Weave.registerClass("weave.visualization.tools::ColormapHistogramTool", C3Histogram);
