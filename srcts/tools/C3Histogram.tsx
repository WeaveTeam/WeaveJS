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
import MiscUtils from "../utils/MiscUtils"
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
import StandardLib = weavejs.util.StandardLib;

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
    private showXAxisLabel:boolean = false;
    private histData:{[key:string]: number}[];
    private keys:{x?:string, value:string[]};
	private records:Record[];
    protected c3ConfigYAxis:c3.YAxisConfiguration;

    constructor(props:IVisToolProps)
    {
        super(props);
		
		this.filteredKeySet.setSingleKeySource(this.fill.color);

		this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
		this.probeFilter.targetPath = ['defaultProbeKeySet'];

        this.idToRecord = {};
        this.keyToIndex = {};

        this.mergeConfig({
            data: {
                columns: [],
                type: "bar",
                color: (color:string, d:any):string => {
                    if (d && d.hasOwnProperty("index"))
					{
                        var decColor:number;
                        if (weavejs.WeaveAPI.Locale.reverseLayout)
						{
                            //handle case where labels need to be reversed for chart flip
                            var temp:number = this.histData.length - 1;
                            decColor = (this.fill.color.internalDynamicColumn.getInternalColumn() as ColorColumn).getColorFromDataValue(temp - d.index);
                        }
                        else
                        {
                            decColor = (this.fill.color.internalDynamicColumn.getInternalColumn() as ColorColumn).getColorFromDataValue(d.index);
                        }
                        return "#" + StandardLib.numberToBase(decColor, 16, 6);
                    }
                    return "#808080";
                },
                onmouseover: (d:any) => {
                    if (d && d.hasOwnProperty("index"))
                    {
                        var keys = this.binnedColumn.getKeysFromBinIndex(d.index);
                        if (!keys)
                            return;
                        var columnNamesToValue:{[columnName:string] : string} = {};
                        var toolTipData:{[columnName:string]: string} = ToolTip.getToolTipData(this, keys);
                        let binTitle:string = this.getLabelString(d.index);
                        let binValue:string = FormatUtils.defaultNumberFormatting(this.histData[d.index]["height"]) as string;
                        if(Object.keys(toolTipData).length) {
                            columnNamesToValue[binTitle] = binValue;
                            columnNamesToValue = _.merge(columnNamesToValue, toolTipData) as {[columnName:string]: string};
                        } else {
                            columnNamesToValue[String(keys.length) + " Records"] = this.aggregationMethod.value;
                            columnNamesToValue[binTitle] = binValue;
                        }
                        this.probeKeySet.replaceKeys(keys);
                        if (this.props.toolTip)
                        this.props.toolTip.setState({
                            x: this.chart.internal.d3.event.pageX,
                            y: this.chart.internal.d3.event.pageY,
                            showToolTip: true,
                            title: this.columnToAggregate.getMetadata('title'),
                            columnNamesToValue: columnNamesToValue
                        });
                    }
                }
            },
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
                                var labelString:string = Weave.lang(this.getLabelString(num));
                                if (labelString)
                                {
                                    var stringSize:number = MiscUtils.getTextWidth(labelString, this.getFontString());
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
                                return Weave.lang(this.binnedColumn.deriveStringFromNumber(num));
                            }
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
            }
        });
        this.c3ConfigYAxis = {
            show: true,
            label: {
                text: "",
                position: "outer-middle"
            },
            tick: {
                fit: false,
                format: (num:number):string => {
                    return Weave.lang(String(FormatUtils.defaultNumberFormatting(num)));
                }
            }
        }
    }

    private getLabelString(num:number):string
    {
        if (weavejs.WeaveAPI.Locale.reverseLayout)
        {
            //handle case where labels need to be reversed
            var temp:number = this.histData.length-1;
            return Weave.lang(this.binnedColumn.deriveStringFromNumber(temp-num));
        }
        else
            return Weave.lang(this.binnedColumn.deriveStringFromNumber(num));
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
                        return Weave.lang("Number of records");
                    case "sum":
                        return Weave.lang("Sum of {0}", Weave.lang(this.columnToAggregate.getMetadata('title')));
                    case "mean":
                        return Weave.lang("Mean of {0}", Weave.lang(this.columnToAggregate.getMetadata('title')));
                }
            }
            else
            {
                return Weave.lang("Number of records");
            }
        }
    }

	protected handleC3Selection():void
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
	
    updateStyle()
    {
        let selectionEmpty: boolean = !this.selectionKeySet || this.selectionKeySet.keys.length === 0;

        var selectedKeys:IQualifiedKey[] = this.selectionKeySet ? this.selectionKeySet.keys : [];
        var probedKeys:IQualifiedKey[] = this.probeKeySet ? this.probeKeySet.keys : [];
        var selectedRecords:Record[] = _.filter(this.records, function(record:Record) {
            return _.includes(selectedKeys, record.id);
        });
        var probedRecords:Record[] = _.filter(this.records, function(record:Record) {
            return _.includes(probedKeys, record.id);
        });
        var selectedBinIndices:number[] = _.map(_.uniq(selectedRecords, 'binnedColumn'), 'binnedColumn') as number[];
        var probedBinIndices:number[] = _.map(_.uniq(probedRecords, 'binnedColumn'), 'binnedColumn') as number[];

        d3.select(this.element).selectAll("path.c3-shape")
            .style("stroke",
                (d: any, i:number, oi:number): string => {
                    let selected = _.intersection(selectedBinIndices,[i]).length;
                    let probed = _.intersection(probedBinIndices,[i]).length;
                    if(probed && selected)
                        return "white";
                    else
                        return "black";
                })
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
                    if (probed)
                        return 1.0;
                    if (selected)
                        return 0.5;
                    return 0.3;
                })
            .style("stroke-width",
                (d: any, i: number, oi: number): number => {
                    let selected = _.intersection(selectedBinIndices,[i]).length;
                    let probed = _.intersection(probedBinIndices,[i]).length;
                    if (probed && selected)
                        return 2.5;
                    return probed ? 1.7 : 1.0;
                });

        //handle selected paths
        d3.select(this.element)
            .selectAll("path._selection_surround").remove();
        d3.select(this.element)
            .selectAll("g.c3-shapes")
            .selectAll("path._selected_").each( function(d: any, i:number, oi:number) {
                d3.select(this.parentNode)
                    .append("path")
                    .classed("_selection_surround",true)
                    .attr("d",this.getAttribute("d"))
                    .style("stroke", "black")
                    .style("stroke-width", 1.5)
                ;
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

        this.histData = [];

        // this._columnToAggregatePath.getObject().getInternalColumn();
        var columnToAggregateNameIsDefined:boolean = !!this.columnToAggregate.getInternalColumn();

        var numberOfBins = this.binnedColumn.numberOfBins;
        for (let iBin:number = 0; iBin < numberOfBins; iBin++)
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

        records.forEach((record:any) => {
            count++;
            sum += record[columnToAggregateName as string] as number;
        });

        if (aggregationMethod === "mean")
            return sum / count; // convert sum to mean

        if (aggregationMethod === "count")
            return count; // use count of finite values

        // sum
        return sum;
    }

    protected validate(forced:boolean = false):boolean
    {
        var changeDetected:boolean = false;
        var axisChange:boolean = Weave.detectChange(this, this.binnedColumn, this.aggregationMethod, this.xAxisName, this.yAxisName, this.margin);
        if (axisChange || Weave.detectChange(this, this.columnToAggregate, this.fill, this.line, this.filteredKeySet))
        {
            changeDetected = true;
            this.dataChanged();
        }
        if (axisChange)
        {
            changeDetected = true;
            var xLabel:string = Weave.lang(this.xAxisName.value || this.binnedColumn.getMetadata('title'));
            if (!this.showXAxisLabel)
                xLabel = " ";
            var yLabel:string = Weave.lang(this.getYAxisLabel.bind(this)());

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

            this.c3Config.axis.x.label = {text: xLabel, position:"outer-center"};
            this.c3ConfigYAxis.label = {text: yLabel, position:"outer-middle"};
			
			this.updateConfigMargin();
    	}

    	if (changeDetected || forced)
			return true;
		
		// update c3 selection
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
		
		this.updateStyle();
		
		return false;
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
}

Weave.registerClass("weavejs.tool.C3Histogram", C3Histogram, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::HistogramTool", C3Histogram);
Weave.registerClass("weave.visualization.tools::ColormapHistogramTool", C3Histogram);
