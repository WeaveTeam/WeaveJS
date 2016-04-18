import {IVisToolProps} from "./IVisTool";
import AbstractC3Tool from "./AbstractC3Tool";
import {VBox, HBox} from "../react-ui/FlexBox";
import ReactUtils from "../utils/ReactUtils";
import * as _ from "lodash";
import * as d3 from "d3";
import * as React from "react";
import * as c3 from "c3";
import {ChartConfiguration, ChartAPI} from "c3";
import FormatUtils from "../utils/FormatUtils";
import DOMUtils from "../utils/DOMUtils"
import {MouseEvent} from "react";
import ToolTip from "./ToolTip";
import Checkbox from "../semantic-ui/Checkbox";
import ComboBox from "../semantic-ui/ComboBox";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ColorController from "../editors/ColorController";
import ColorRampEditor from "../editors/ColorRampEditor";
import BinningDefinitionEditor from "../editors/BinningDefinitionEditor";
import Button from "../semantic-ui/Button";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import BinnedColumn = weavejs.data.column.BinnedColumn;
import FilteredColumn = weavejs.data.column.FilteredColumn;
import ColorColumn = weavejs.data.column.ColorColumn;
import ColorRamp = weavejs.util.ColorRamp;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import LinkableString = weavejs.core.LinkableString;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import SolidFillStyle = weavejs.geom.SolidFillStyle;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import SimpleBinningDefinition = weavejs.data.bin.SimpleBinningDefinition;
import StandardLib = weavejs.util.StandardLib;
import LinkableNumber = weavejs.core.LinkableNumber;

declare type Record = {
    id: weavejs.api.data.IQualifiedKey,
	binnedColumn: number,
	columnToAggregate: number
};

const COUNT = "count";
const SUM = "sum";
const MEAN = "mean"; 
declare type AggregationMethod = "count"|"sum"|"mean";

export default class C3Histogram extends AbstractC3Tool
{
	binnedColumn = Weave.linkableChild(this, BinnedColumn);
	columnToAggregate = Weave.linkableChild(this, DynamicColumn);
	aggregationMethod = Weave.linkableChild(this, LinkableString);
	fill = Weave.linkableChild(this, SolidFillStyle);
	line = Weave.linkableChild(this, SolidLineStyle);
    barWidthRatio = Weave.linkableChild(this, new LinkableNumber(0.95));
	horizontalMode = Weave.linkableChild(this, new LinkableBoolean(false));
	showValueLabels = Weave.linkableChild(this, new LinkableBoolean(false));

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
		
        this.fill.color.internalDynamicColumn.globalName = "defaultColorColumn";
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
                xSort: false,
                names: {},
	            labels: {
		            format: (v, id, i, j) => {
			            if (this.showValueLabels.value)
			            {
				            return FormatUtils.defaultNumberFormatting(v);
			            }
			            else
			            {
				            return "";
			            }
		            }
	            },
                color: (color:string, d:any):string => {
                    if (d && d.hasOwnProperty("index"))
					{
						var binIndex = d.index;
						if (weavejs.WeaveAPI.Locale.reverseLayout)
							binIndex = this.histData.length - 1 - binIndex;
						var cc = Weave.AS(this.fill.color.getInternalColumn(), ColorColumn);
						if (cc)
							return StandardLib.getHexColor(cc.getColorFromDataValue(binIndex));
                    }
                    return "#808080";
                },
                onmouseover: (d:any) => {
                    if (d && d.hasOwnProperty("index"))
                    {
                        var keys = this.binnedColumn.getKeysFromBinIndex(d.index);
                        if (!keys)
                            return;
                        this.probeKeySet.replaceKeys(keys);
                        this.toolTip.show(this, this.chart.internal.d3.event, keys, [this.binnedColumn, this.columnToAggregate]);
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
                            if (this.element)
                            {
                                var labelHeight:number = Number(this.margin.bottom)/Math.cos(45*(Math.PI/180));
                                var labelString:string = Weave.lang(this.getLabelString(num));
                                if (labelString)
                                {
									return this.formatXAxisLabel(labelString);
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
                    ratio: NaN
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
                    case COUNT:
                        return Weave.lang("Number of records");
                    case SUM:
                        return Weave.lang("Sum of {0}", Weave.lang(this.columnToAggregate.getMetadata('title')));
                    case MEAN:
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
                    obj.height = this.getAggregateValue(recordsInBin, "binnedColumn", COUNT);
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

        if (aggregationMethod === MEAN)
            return sum / count; // convert sum to mean

        if (aggregationMethod === COUNT)
            return count; // use count of finite values

        // sum
        return sum;
    }

    protected validate(forced:boolean = false):boolean
    {
        var changeDetected:boolean = false;
        var axisChange:boolean = Weave.detectChange(this, this.binnedColumn, this.aggregationMethod, this.xAxisName, this.yAxisName, this.margin);
        if (axisChange || Weave.detectChange(this, this.columnToAggregate, this.fill, this.line, this.filteredKeySet, this.showValueLabels))
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

	    if (Weave.detectChange(this, this.horizontalMode))
	    {
		    changeDetected = true;
		    this.c3Config.axis.rotated = this.horizontalMode.value;
	    }

        if(Weave.detectChange(this, this.barWidthRatio))
        {
            changeDetected = true;
            (this.c3Config.bar.width as {ratio:number}).ratio = this.barWidthRatio.value;
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
	
    get selectableAttributes()
    {
        return super.selectableAttributes
            .set("Group By", this.binnedColumn.internalDynamicColumn)
            .set("Height values (Optional)", this.columnToAggregate);
        //TODO handle remaining attributes
    }

    get defaultPanelTitle():string
    {
        return Weave.lang("Histogram of {0}", weavejs.data.ColumnUtils.getTitle(this.binnedColumn));
    }
	
	// TODO move this to BinningDefinitionEditor
	openColorController(tabIndex:number)
	{
		ColorController.activeTabIndex = tabIndex;
		ColorController.open(Weave.AS(this.fill.color.getInternalColumn(), ColorColumn), this.binnedColumn, this.binnedColumn.internalDynamicColumn.target as FilteredColumn)
	}

    //todo:(linkFunction)find a better way to link to sidebar UI for selectbleAttributes
	renderEditor(linkFunction:Function):JSX.Element
	{
		var labelStyle:React.CSSProperties = {
			textAlign: 'center',
			display:"flex",
			justifyContent: "flex-end",
		};
		
		var cc = Weave.AS(this.fill.color.getInternalColumn(), ColorColumn);

		return (
			<VBox>
				{
					super.renderEditor(linkFunction)
				}
				{
					<BinningDefinitionEditor compact={true} binnedColumn={this.binnedColumn} onButtonClick={() => this.openColorController(0)}/>
				}
				{
					<ColorRampEditor compact={true} colorRamp={cc && cc.ramp} onButtonClick={() => this.openColorController(1)}/>
				}
				{ReactUtils.generateFlexBoxLayout(
					[.3,.7],
					[
						[ <span style={labelStyle}>{Weave.lang("Aggregation method")}</span>, <ComboBox options={[COUNT, SUM, MEAN]} ref={linkReactStateRef(this, {value : this.aggregationMethod })}/>],
						[ <span style={labelStyle}><Checkbox ref={linkReactStateRef(this, { value: this.horizontalMode })}/></span>, <span style={{fontSize: 'smaller'}}>{Weave.lang("Horizontal Bars")}</span> ],
						[ <span style={labelStyle}><Checkbox ref={linkReactStateRef(this, { value: this.showValueLabels })}/></span>, <span style={{fontSize: 'smaller'}}>{Weave.lang("Show Value Labels")}</span> ]
					]
				)}
			</VBox>
		)
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

Weave.registerClass(
	C3Histogram,
	["weavejs.tool.C3Histogram", "weave.visualization.tools::HistogramTool", "weave.visualization.tools::ColormapHistogramTool"],
	[weavejs.api.ui.IVisTool_Basic, weavejs.api.core.ILinkableObjectWithNewProperties],
	"Histogram"
);
