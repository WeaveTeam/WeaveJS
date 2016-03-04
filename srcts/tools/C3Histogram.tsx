import {IVisToolProps} from "./IVisTool";
import AbstractC3Tool from "./AbstractC3Tool";
import {VBox, HBox} from "../react-ui/FlexBox";
import ColorPicker from "../react-ui/ColorPicker";
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
import Accordion from "../semantic-ui/Accordion";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ColorController from "../editors/ColorController";
import ColorRampEditor from "../editors/ColorRampEditor";
import BinningDefinitionEditor from "../editors/BinningDefinitionEditor";
import Button from "../semantic-ui/Button";
import DynamicComponent from "../ui/DynamicComponent";
import SelectableAttributeComponent from "../ui/SelectableAttributeComponent";
import ChartUtils from "../utils/ChartUtils";

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
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ILinkableHashmap = weavejs.api.core.ILinkableHashMap;

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
	binnedColumn = Weave.linkableChild(this, BinnedColumn, this.setColorColumn, true);
	columnToAggregate = Weave.linkableChild(this, DynamicColumn);
	aggregationMethod = Weave.linkableChild(this, new LinkableString("count"));
	fill = Weave.linkableChild(this, SolidFillStyle);
	line = Weave.linkableChild(this, SolidLineStyle);
    barWidthRatio = Weave.linkableChild(this, new LinkableNumber(0.95));
	horizontalMode = Weave.linkableChild(this, new LinkableBoolean(false));
	showValueLabels = Weave.linkableChild(this, new LinkableBoolean(false));
	xAxisLabelAngle = Weave.linkableChild(this, new LinkableNumber(-45));
	
	get colorColumn()
	{
		return Weave.AS(this.fill.color.getInternalColumn(), ColorColumn);
	}
	private _callbackRecursion:boolean = false;
	private setColorColumn():void
	{
		if(this._callbackRecursion)
			return;
		this._callbackRecursion = true; // helps prevents both call backs from calling each other
		var colorBinCol:BinnedColumn = this.internalColorColumn ? Weave.AS(this.internalColorColumn.getInternalColumn(), BinnedColumn) : null;
		if (colorBinCol) {
			if (colorBinCol.binningDefinition.internalObject)
				Weave.copyState(this.binnedColumn, colorBinCol);
			else
				Weave.copyState(this.binnedColumn.internalDynamicColumn, colorBinCol.internalDynamicColumn);
		}
		this._callbackRecursion = false;
	}

	private setBinnedColumn():void
	{
		if(this._callbackRecursion)
			return;
		this._callbackRecursion = true;
		var colorBinCol:BinnedColumn = this.internalColorColumn ? Weave.AS(this.internalColorColumn.getInternalColumn(), BinnedColumn) : null;
		if (colorBinCol)
		{
			// if there is a binning definition, copy it - otherwise, only copy the internal column
			if (colorBinCol.binningDefinition.internalObject)
				Weave.copyState(colorBinCol, this.binnedColumn);
			else
				Weave.copyState(colorBinCol.internalDynamicColumn, this.binnedColumn.internalDynamicColumn);
			
			var filteredColumn = Weave.AS(this.binnedColumn.getInternalColumn(), FilteredColumn);
			if (filteredColumn)
				Weave.linkState(this.filteredKeySet.keyFilter, filteredColumn.filter);
		}
		this._callbackRecursion = false;
	}

	private get RECORD_FORMAT() {
		return {
			id: IQualifiedKey,
			binnedColumn: this.binnedColumn,
			columnToAggregate: this.columnToAggregate
		}
	};

	private RECORD_DATATYPE = {
		binnedColumn: Number,
		columnToAggregate: Number
	};

    private idToRecord:{[id:string]: Record};
    private keyToIndex:{[key:string]: number};
    private heightColumnNames:string[];
    private histData:{[key:string]: number}[];
    private keys:{x?:string, value:string[]};
	private records:Record[];
    protected c3ConfigYAxis:c3.YAxisConfiguration;

	get internalColorColumn():ColorColumn {
		return Weave.AS(this.fill.color.getInternalColumn(), ColorColumn);
	}
	
    constructor(props:IVisToolProps)
    {
        super(props);
		
		this.filteredKeySet.setSingleKeySource(this.fill.color);

		this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
		this.probeFilter.targetPath = ['defaultProbeKeySet'];

	    Weave.getCallbacks(this.fill.color.internalDynamicColumn).addGroupedCallback(this, this.setBinnedColumn);
		
		// don't lock the ColorColumn, so linking to global ColorColumn is possible
		var _colorColumn:ColorColumn = this.fill.color.internalDynamicColumn.requestLocalObject(ColorColumn, false);
		_colorColumn.ramp.setSessionState([0x808080]);
		var _binnedColumn:BinnedColumn = _colorColumn.internalDynamicColumn.requestLocalObject(BinnedColumn, true);
		var filteredColumn:FilteredColumn = _binnedColumn.internalDynamicColumn.requestLocalObject(FilteredColumn, true);

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
						var cc = this.internalColorColumn;
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
                        rotate: this.xAxisLabelAngle.value,
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

	get defaultXAxisLabel():string
	{
		return Weave.lang(this.binnedColumn.getMetadata('title'));
	}

	get defaultYAxisLabel():string
	{
		if (this.columnToAggregate.getInternalColumn())
		{
			switch (this.aggregationMethod.value)
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

    private getYAxisLabel():string
    {
        var overrideAxisName = this.yAxisName.value;
        if (overrideAxisName)
        {
            return overrideAxisName;
        }
        else
        {
            return this.defaultYAxisLabel;
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

    private dataChanged()
    {
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
        var axisChange:boolean = Weave.detectChange(this, this.binnedColumn, this.aggregationMethod, this.xAxisName, this.yAxisName, this.margin, this.xAxisLabelAngle);
        if (axisChange || Weave.detectChange(this, this.columnToAggregate, this.fill, this.line, this.filteredKeySet, this.showValueLabels))
        {
            changeDetected = true;
            this.dataChanged();
        }
        if (axisChange)
        {
            changeDetected = true;
            var xLabel:string = Weave.lang(this.xAxisName.value) || this.defaultXAxisLabel;
            var yLabel:string = Weave.lang(this.getYAxisLabel.bind(this)());

            if (this.records)
            {
                var temp:string = "height";
                if (weavejs.WeaveAPI.Locale.reverseLayout)
                {
                    this.c3Config.data.axes = {[temp]:'y2'};
                    this.c3Config.axis.y2 = this.c3ConfigYAxis;
                    this.c3Config.axis.y = {show: false};
                    this.c3Config.axis.x.tick.rotate = -1*this.xAxisLabelAngle.value;
                }
                else
                {
                    this.c3Config.data.axes = {[temp]:'y'};
                    this.c3Config.axis.y = this.c3ConfigYAxis;
                    delete this.c3Config.axis.y2;
                    this.c3Config.axis.x.tick.rotate = this.xAxisLabelAngle.value;
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

        if (Weave.detectChange(this, this.barWidthRatio))
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

        //call weave layering function
        this.weaveLayering();
		
		return false;
    }
	
    get selectableAttributes()
    {
        return super.selectableAttributes
            .set("Group by", this.binnedColumn)
            .set("Height values (optional)", this.columnToAggregate);
        //TODO handle remaining attributes
    }

    get defaultPanelTitle():string
    {
	    if (this.binnedColumn.numberOfBins)
		    return Weave.lang("Histogram of {0}", weavejs.data.ColumnUtils.getTitle(this.binnedColumn));

	    return Weave.lang("Histogram");
    }
	
	updateColor( color:string)
	{
		if (this.colorColumn && this.colorColumn.ramp)
		{
			this.colorColumn.ramp.setSessionState([color])
		}
	}

    //todo:(pushCrumb)find a better way to link to sidebar UI for selectbleAttributes
	renderEditor =(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any )=>void):JSX.Element =>
	{
		var linkedColor:Boolean = !!this.fill.color.internalDynamicColumn.targetPath;
		var hexColor:string  = this.colorColumn && this.colorColumn.ramp ? (this.colorColumn.ramp.state as string[])[0] : "#808080"
		return Accordion.render(
			[
				Weave.lang("Binning"),
				<BinningDefinitionEditor
					showNoneOption={false}
					binnedColumn={this.binnedColumn}
					pushCrumb={ pushCrumb }
				/>
			],
			linkedColor && [
				Weave.lang("Coloring"),
				[
					[
						Weave.lang("Color theme"),
						<DynamicComponent
							dependencies={[this.fill.color]}
							render={() =>
								<ColorRampEditor
									compact={true}
									pushCrumb={ pushCrumb }
									colorRamp={this.colorColumn && this.colorColumn.ramp}
								/>
							}
						/>
					]
				]
			],
			[
				Weave.lang("Aggregation"),
				[
					[
						Weave.lang('Height values (optional)'),
						<SelectableAttributeComponent
							attributeName={"Height values (optional)"}
							attributes={this.selectableAttributes}
			  				pushCrumb={ pushCrumb }
						/>
					],
					[
						Weave.lang("Aggregation method"),
						<DynamicComponent 
							dependencies={[this.columnToAggregate]} 
							render={() => 
								<ComboBox options={[COUNT, SUM, MEAN]} type={this.columnToAggregate.getInternalColumn() ? null:"disabled"} ref={linkReactStateRef(this, {value : this.aggregationMethod })}/>
							}
	                    />
					],
				]
			],
			[
				Weave.lang("Display"),
				[
					Weave.beta && [
						Weave.lang("Horizontal bars (beta)"),
						<Checkbox ref={linkReactStateRef(this, { value: this.horizontalMode })} label={" "}/>
					],
					[
						Weave.lang("Show value labels"),
						<Checkbox ref={linkReactStateRef(this, { value: this.showValueLabels })} label={" "}/>
					],
					[
						Weave.lang("X axis label angle"),
						<ComboBox style={{width:"100%"}} ref={linkReactStateRef(this, { value: this.xAxisLabelAngle })} options={ChartUtils.getAxisLabelAngleChoices()}/>
					],
					!linkedColor && [
						Weave.lang("Color"),
						<ColorPicker style={ {height:"32px"} } hexColor={hexColor} onChange={(newColor:string) => this.updateColor( newColor)}/>
					]
				]
			],
			[Weave.lang("Titles"), this.getTitlesEditor()],
			[Weave.lang("Margins"), this.getMarginEditor()]
		);
	}

    protected weaveLayering():void {
        var selectionKeySetChanged:boolean = Weave.detectChange(this, this.selectionKeySet);
        var probeKeySetChanged:boolean = Weave.detectChange(this, this.probeKeySet);
        super.weaveLayering(selectionKeySetChanged,probeKeySetChanged);

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

        var histogram = this;
        //copy items to selection_layer and probe_layer
        if(selectionKeySetChanged || probeKeySetChanged) {
            d3.select(this.element).selectAll("g").filter(".c3-shapes.c3-bars-height").selectAll("path").each(function (d:any, i:number, oi:number) {
                let selected = _.intersection(selectedBinIndices, [i]).length;
                let probed = _.intersection(probedBinIndices, [i]).length;
                if (selected && selectionKeySetChanged) {
                    let recordsInBin:Record[] = _.filter(selectedRecords, {binnedColumn: i});
                    let columnToAggregateNameIsDefined:boolean = !!histogram.columnToAggregate.getInternalColumn();
                    let height:number = 0;
                    if (columnToAggregateNameIsDefined) {
                        height = histogram.getAggregateValue(recordsInBin, "columnToAggregate", histogram.aggregationMethod.value);
                    }
                    else {
                        height = histogram.getAggregateValue(recordsInBin, "binnedColumn", "count");
                    }
                    let heightRatio = height / histogram.histData[i]["height"];
                    var pathBBox = this.getBBox();
                    pathBBox.y = pathBBox.y + pathBBox.height - pathBBox.height * heightRatio;
                    pathBBox.height = pathBBox.height * heightRatio;
                    d3.select(histogram.element)
                        .select("g.selection_layer")
                        .append("rect")
                        .classed("_selection_rect", true)
                        .attr("x", pathBBox.x)
                        .attr("y", pathBBox.y)
                        .attr("width", pathBBox.width)
                        .attr("height", pathBBox.height)
                        .attr("style", this.getAttribute("style"))
                        .style("stroke", "black")
                        .style("stroke-width", 1)
                        .style("stroke-opacity", 0.5);
                }
                if (probed && probeKeySetChanged) {
                    let recordsInBin:Record[] = _.filter(probedRecords, {binnedColumn: i});
                    let columnToAggregateNameIsDefined:boolean = !!histogram.columnToAggregate.getInternalColumn();
                    let height:number = 0;
                    if (columnToAggregateNameIsDefined) {
                        height = histogram.getAggregateValue(recordsInBin, "columnToAggregate", histogram.aggregationMethod.value);
                    }
                    else {
                        height = histogram.getAggregateValue(recordsInBin, "binnedColumn", "count");
                    }
                    let heightRatio = height / histogram.histData[i]["height"];
                    var pathBBox = this.getBBox();
                    pathBBox.y = pathBBox.y + pathBBox.height - pathBBox.height * heightRatio;
                    pathBBox.height = pathBBox.height * heightRatio;
                    d3.select(histogram.element)
                        .select("g.probe_layer")
                        .append("rect")
                        .classed("_probe_rect", true)
                        .attr("x", pathBBox.x)
                        .attr("y", pathBBox.y)
                        .attr("width", pathBBox.width)
                        .attr("height", pathBBox.height)
                        .attr("style", this.getAttribute("style"))
                        .style("stroke", "black")
                        .style("stroke-width", 1)
                        .style("stroke-opacity", 1);
                }
            });
        }

        //redraw selection_style_layer if changed
        if(selectionKeySetChanged) {
            d3.select(histogram.element)
                .selectAll("g.selection_layer")
                .selectAll("rect").each(function (d:any, i:number, oi:number) {
                d3.select(histogram.element)
                    .selectAll("g.selection_style_layer")
                    .append("rect")
                    .classed("_selection_path", true)
                    .attr("x", this.getAttribute("x"))
                    .attr("y", this.getAttribute("y"))
                    .attr("width", this.getAttribute("width"))
                    .attr("height", this.getAttribute("height"))
                    .attr("style", this.getAttribute("style"))
                    .style("stroke", "black")
                    .style("stroke-width", 1)
                    .style("stroke-opacity", 0.5);
            });

            //style selection_layer (need to set opacity to null, group opacity will then determine opacity of all points)
            d3.select(histogram.element)
                .select("g.selection_layer")
                .selectAll("path")
                .attr("class","weave_point_layer_path")
                .style("opacity",null);
        }

        if(probeKeySetChanged) {
            //draw probe_style_layer
            d3.select(histogram.element)
                .selectAll("g.probe_layer")
                .selectAll("rect").each(function (d:any, i:number, oi:number) {
                var pathBBox = this.getBBox();
                var borderThickness = 3;
                d3.select(histogram.element)
                    .selectAll("g.probe_style_layer")
                    .append("rect")
                    .classed("_probe_rect", true)
                    .attr("x", pathBBox.x - borderThickness)
                    .attr("y", pathBBox.y - borderThickness)
                    .attr("width", pathBBox.width + 2 * borderThickness)
                    .attr("height", pathBBox.height + 2 * borderThickness)
                    .style("stroke", "black")
                    .style("stroke-width", 1)
                    .style("fill", "white");
            });

            //style probe_layer (need to set opacity to null, group opacity will then determine opacity of all points)
            d3.select(histogram.element)
                .select("g.probe_layer")
                .selectAll("path")
                .attr("class", "weave_point_layer_path")
                .style("opacity", null);
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
}

Weave.registerClass(
	C3Histogram,
	["weavejs.tool.C3Histogram", "weave.visualization.tools::HistogramTool"],
	[weavejs.api.ui.IVisTool_Basic, weavejs.api.core.ILinkableObjectWithNewProperties, weavejs.api.data.ISelectableAttributes],
	"Histogram"
);
