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
import StandardLib from "../utils/StandardLib";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import ColorRamp = weavejs.util.ColorRamp;
import LinkableString = weavejs.core.LinkableString;
import LinkableBoolean = weavejs.core.LinkableBoolean;

declare type Record = {
    id: IQualifiedKey,
    sort: number,
    heights: { xLabel: string } & {[columnName:string]: number},
	xLabel: number,
    yLabel: number
};

declare type RecordHeightsFormat<T> = { xLabel: T } & {[columnName:string]: T};

const GROUP:string = 'group';
const STACK:string = 'stack';
const PERCENT_STACK:string = 'percentStack';

export default class WeaveC3Barchart extends AbstractC3Tool
{


    heightColumns:LinkableHashMap = Weave.linkableChild(this, LinkableHashMap);
    labelColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
    sortColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
    colorColumn:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn("#C0CDD1"));
    chartColors:ColorRamp = Weave.linkableChild(this, new ColorRamp(ColorRamp.getColorRampByName("Paired")));
    groupingMode:LinkableString = Weave.linkableChild(this, new LinkableString(STACK, this.verifyGroupingMode))
    horizontalMode:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
    showValueLabels:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));

    private showXAxisLabel:LinkableBoolean = new LinkableBoolean(false);

    private verifyGroupingMode(mode:string):boolean
	{
		return [GROUP, STACK, PERCENT_STACK].indexOf(mode) >= 0;
	}

    get yLabelColumn():IAttributeColumn {
        return this.heightColumns.getObjects()[0] || this.sortColumn;
    }
	
    private RECORD_FORMAT = {
		id: IQualifiedKey,
		sort: this.sortColumn,
        color: this.colorColumn.getInternalColumn(),
        yLabel: this.yLabelColumn,
		xLabel: this.labelColumn,
        heights: {} as RecordHeightsFormat<IAttributeColumn>
	};

    private RECORD_DATATYPE = {
        sort: Number,
        color: String,
        yLabel: Number,
		xLabel: Number,
        heights: {} as RecordHeightsFormat<new ()=>(String|Number)>
	};

    private keyToIndex: Map<IQualifiedKey, number>;
    private indexToKey: Map<number, IQualifiedKey>;
    private xAxisValueToLabel:{[value:number]: string};
    private yAxisValueToLabel:{[value:number]: string};

    private yLabelColumnDataType:string;
    private heightColumnNames:string[];
    private heightColumnsLabels:string[];
    protected c3Config:ChartConfiguration;
    protected c3ConfigYAxis:c3.YAxisConfiguration;
    private records:Record[];
    protected chart:ChartAPI;

    private busy:boolean;
    private dirty:boolean;

    constructor(props:IVisToolProps)
    {
        super(props);

        Weave.getCallbacks(this.selectionFilter).addGroupedCallback(this, this.updateStyle);
        Weave.getCallbacks(this.probeFilter).addGroupedCallback(this, this.updateStyle);

        Weave.getCallbacks(this).addGroupedCallback(this, this.validate, true);

        this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
		this.probeFilter.targetPath = ['defaultProbeKeySet'];

        this.keyToIndex = new Map<IQualifiedKey, number>();
        this.indexToKey = new Map<number, IQualifiedKey>();
        this.yAxisValueToLabel = {};
        this.xAxisValueToLabel = {};
        this.validate = _.debounce(this.validate.bind(this), 30);

        this.c3Config = {
            size: {
                width: this.props.style.width,
                height: this.props.style.height
            },
            padding: {
                top: this.margin.top.value,
                bottom: 0, // use axis.x.height instead
                left: this.margin.left.value,
                right: this.margin.right.value
            },
            data: {
                json: [],
                type: "bar",
                xSort: false,
                names: {},
                selection: {
                    enabled: true,
                    multiple: true,
                    draggable: true

                },
                labels: {
                    format: (v, id, i, j) => {
                        if(this.showValueLabels.value) {
                            return v;
                        } else {
                            return "";
                        }
                    }
                },
                order: null,
                color: (color:string, d:any):string => {
                    if(this.heightColumnNames.length === 1 && d && d.hasOwnProperty("index")) {
						var qKey:IQualifiedKey = this.indexToKey.get(d.index);
						return this.colorColumn.getValueFromKey(qKey, String);
                    } else {
                        return color;
                    }
                },
                onclick: (d:any) => {
                },
                onselected: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
						if(this.selectionKeySet)
							this.selectionKeySet.addKeys([this.indexToKey.get(d.index)]);
                    }
                },
                onunselected: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        if(this.selectionKeySet)
							this.selectionKeySet.removeKeys([this.indexToKey.get(d.index)]);
                    }
                },
                onmouseover: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
						if(this.probeKeySet)
                        	this.probeKeySet.replaceKeys([]);;
                        
						var columnNamesToValue:{[columnName:string] : string|number } = {};
                        var columnNamesToColor:{[columnName:string] : string} = {};
                        
						var qKey:IQualifiedKey = this.indexToKey.get(d.index);
						
						var columns = this.heightColumns.getObjects();
						for(var column of columns) {
							var columnName:string = column.getMetadata("title");
							var color = this.chartColors.getColorFromNorm(d.index / (columns.length - 1));
							columnNamesToValue[columnName] = column.getValueFromKey(qKey, Number);
							columnNamesToColor[columnName] = "#" + weavejs.util.StandardLib.numberToBase(color, 16, 6);
						}

                        var title:string = this.labelColumn.getValueFromKey(qKey, String);
						
						if(this.probeKeySet)
							this.probeKeySet.replaceKeys([this.indexToKey.get(d.index)]);
						
						if(this.props.toolTip)
	                        this.props.toolTip.setState({
	                            x: this.chart.internal.d3.event.pageX,
	                            y: this.chart.internal.d3.event.pageY,
	                            showToolTip: true,
	                            title: title,
	                            columnNamesToValue: columnNamesToValue,
	                            columnNamesToColor: columnNamesToColor
	                        });
                    }
                },
                onmouseout: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
						if(this.probeKeySet)
							this.probeKeySet.replaceKeys([]);
						if(this.props.toolTip)
	                        this.props.toolTip.setState({
	                           showToolTip: false
	                        });
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
					height: this.margin.bottom.value,
                    tick: {
                        rotate: -45,
                        culling: {
                            max: null
                        },
                        multiline: false,
                        format: (num:number):string => {
							var qKey:IQualifiedKey = this.indexToKey.get(num);
							if(qKey) {
								if(this.element && this.props.style.height > 0 && this.margin.bottom) {
									var labelHeight:number = this.margin.bottom.value/Math.cos(45*(Math.PI/180));
									var labelString:string = this.labelColumn.getValueFromKey(qKey, String);
									if(labelString) {
										var stringSize:number = StandardLib.getTextWidth(labelString, this.getFontString());
										var adjustmentCharacters:number = labelString.length - Math.floor(labelString.length * (labelHeight / stringSize));
										return adjustmentCharacters > 0 ? labelString.substring(0, labelString.length - adjustmentCharacters - 3) + "..." : labelString;
									}else{
										return "";
									}
								}else {
									return this.labelColumn.getValueFromKey(qKey, String);
								}
                            } else {
                                return "";
                            }
                        }
                    }
                },
                rotated: false
            },
			tooltip: {show: false },
            transition: { duration: 0 },
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
                show: false,
                position: "bottom"
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
                text:"",
                position: "outer-middle"
            },
            tick: {
                fit: false,
                multiline: false,
                format: (num:number):string => {
                    if(this.yLabelColumnDataType !== "number") {
                        return this.yAxisValueToLabel[num] || "";
                    } else if (this.groupingMode.value === PERCENT_STACK) {
                        return d3.format(".0%")(num);
                    } else {
                        return String(FormatUtils.defaultNumberFormatting(num));
                    }
                }
            }
        };
    }

	public get deprecatedStateMapping():Object
	{
		return [super.deprecatedStateMapping, {
			"children": {
				"visualization": {
					"plotManager": {
						"plotters": {
							"plot": {
								"filteredKeySet": this.filteredKeySet,
								"heightColumns": this.heightColumns,
								"labelColumn": this.labelColumn,
								"sortColumn": this.sortColumn,
								"colorColumn": this.colorColumn,
								"chartColors": this.chartColors,
								"horizontalMode": this.horizontalMode,
								"showValueLabels": this.showValueLabels,
								"groupingMode": this.groupingMode
							}
						}
					}
				}
			}
		}];
	}

    handlePointClick(event:MouseEvent):void {

        if(!this.selectionKeySet)
            return;

        var probeKeys:IQualifiedKey[] = this.probeKeySet ? this.probeKeySet.keys : [];;
        var selectionKeys:IQualifiedKey[] = this.selectionKeySet.keys;
        if (_.isEqual(probeKeys, selectionKeys))
            this.selectionKeySet.replaceKeys([]);
        else
            this.selectionKeySet.replaceKeys(probeKeys);
    }

    private dataChanged():void
	{
		var columns = this.heightColumns.getObjects();
		this.RECORD_FORMAT.heights = _.zipObject(this.heightColumns.getNames(), columns) as any;
		this.RECORD_FORMAT.heights.xLabel = this.labelColumn;
		this.RECORD_DATATYPE.heights = _.zipObject(this.heightColumns.getNames(), columns.map(() => Number)) as any;
		this.RECORD_DATATYPE.heights.xLabel = String;
		
        this.heightColumnNames = this.heightColumns.getNames();
        this.heightColumnsLabels = columns.map((column:IAttributeColumn) => {
            return column.getMetadata("title");
        });

        this.yLabelColumnDataType = this.yLabelColumn.getMetadata("dataType");

        this.records = weavejs.data.ColumnUtils.getRecords(this.RECORD_FORMAT, this.filteredKeySet.keys, this.RECORD_DATATYPE);
        this.records = _.sortByOrder(this.records, ["sort"], ["asc"]);

        if(weavejs.WeaveAPI.Locale.reverseLayout) {
            this.records = this.records.reverse();
        }

        this.yAxisValueToLabel = {};
        this.xAxisValueToLabel = {};
        this.keyToIndex.clear();
        this.indexToKey.clear();

        this.records.forEach((record:Record, index:number) => {
            this.keyToIndex.set(record.id, index);
            this.indexToKey.set(index, record.id);
            this.xAxisValueToLabel[record.xLabel] = this.labelColumn.getValueFromKey(record.id, String);
            this.yAxisValueToLabel[record.yLabel] = this.yLabelColumn.getValueFromKey(record.id, String);
        });

        if (this.groupingMode.value === STACK || this.groupingMode.value === PERCENT_STACK)
            this.c3Config.data.groups = [this.heightColumnNames];
        else //if(this.groupingMode === "group")
            this.c3Config.data.groups = [];

        if (this.groupingMode.value === PERCENT_STACK && this.heightColumnNames.length > 1) {
            // normalize the height columns to be percentages.
			for(var record of this.records) {
				var heights = record.heights;
				var sum:number = 0;
				for (let key in heights)
					if (typeof heights[key] == "number")
						sum += heights[key];
				for (let key in heights)
					if (typeof heights[key] == "number")
						heights[key] /= sum;
			}
        }

        var keys = {
			x: "", 
			value: new Array<string>()
		};
        
		// if label column is specified
        if(this.labelColumn.target) {
            keys.x = "xLabel";
            this.c3Config.legend.show = false;
        }else{
            this.c3Config.legend.show = true;
        }

        keys.value = this.heightColumnNames;
        var columnColors:{[name:string]: string} = {};
        var columnTitles:{[name:string]: string} = {};

        if(this.heightColumnNames.length > 1) {
            this.heightColumnNames.forEach((name, index) => {
                var color = this.chartColors.getColorFromNorm(index / (this.heightColumnNames.length - 1));
                columnColors[name] = "#" + weavejs.util.StandardLib.numberToBase(color, 16, 6);;
                columnTitles[name] = this.heightColumnsLabels[index];
            });
            if(this.labelColumn.target) {
                this.c3Config.legend.show = true;
            }
        }else{
            this.c3Config.legend.show = false;
        }

		// any reason to cloneDeep here?
        var data:c3.Data = _.cloneDeep(this.c3Config.data);
		
        data.json = _.pluck(this.records, 'heights');
        
		//need other stuff for data.json to work
		//this can potentially override column names
		//c3 limitation

        data.colors = columnColors;
        data.keys = keys;
        data.names = columnTitles;
        data.unload = true;
        this.c3Config.data = data;
    }

    updateStyle() {
    	if(!this.chart || !this.heightColumnNames)
    		return;

        d3.select(this.element)
        	.selectAll("path")
        	.style("opacity", 1)
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("stroke-opacity", 0.5);

        var selectedKeys:IQualifiedKey[] = this.selectionKeySet.keys;
        var probedKeys:IQualifiedKey[] = this.probeKeySet.keys;
        var selectedIndices:number[] = selectedKeys.map((key:IQualifiedKey) => {
            return this.keyToIndex.get(key);
        });
        var probedIndices:number[] = probedKeys.map((key:IQualifiedKey) => {
           return this.keyToIndex.get(key);
        });

        var indices:number[] = weavejs.util.JS.mapValues(this.keyToIndex) as number[];
		var unselectedIndices:number[] = _.difference(indices, selectedIndices);
        unselectedIndices = _.difference(unselectedIndices,probedIndices);
        this.heightColumnNames.forEach((item:string) => {
        	var paths = d3.selectAll("g").filter(".c3-shapes-"+item+".c3-bars").selectAll("path");
        	var texts = d3.selectAll("g").filter(".c3-texts-"+item).selectAll("text");
            if(selectedIndices.length)
            {
                this.customSelectorStyle(unselectedIndices, paths, {opacity: 0.3, "stroke-opacity": 0.0});
                this.customSelectorStyle(selectedIndices, paths, {opacity: 1.0, "stroke-opacity": 1.0});
                this.customSelectorStyle(unselectedIndices, texts, {"fill-opacity":0.3});
                this.customSelectorStyle(selectedIndices, texts, {"fill-opacity":1.0});
            }
            else if(!probedIndices.length)
            {
                this.customSelectorStyle(indices, paths, {opacity: 1.0, "stroke-opacity": 0.5});
                this.customSelectorStyle(indices, texts, {"fill-opacity":1.0});
            }
        });
        if (selectedIndices.length)
            this.chart.select(this.heightColumnNames, selectedIndices, true);
        else if(!probedIndices.length)
            this.chart.select(this.heightColumnNames, [], true);
    }

    componentDidUpdate() {
        if(this.c3Config.size.width != this.props.style.width || this.c3Config.size.height != this.props.style.height) {
            this.c3Config.size = {width: this.props.style.width, height: this.props.style.height};
            this.validate(true);
        }
    }

    componentDidMount() {
        StandardLib.addPointClickListener(this.element, this.handlePointClick.bind(this));
        this.showXAxisLabel.value = false;
		this.filteredKeySet.setColumnKeySources([this.sortColumn]);
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
        var axisChange:boolean = Weave.detectChange(this, this.heightColumns,
														  this.labelColumn,
														  this.sortColumn,
														  this.margin.bottom,
														  this.margin.top,
														  this.margin.left,
														  this.margin.right,
														  this.overrideYMax,
														  this.overrideYMin);
        var axisSettingsChange:boolean = Weave.detectChange(this, this.xAxisName, this.yAxisName);
        if (axisChange || Weave.detectChange(this, this.colorColumn, this.chartColors, this.groupingMode, this.filteredKeySet))
        {
            changeDetected = true;
            this.dataChanged();
        }
        
		if (axisChange)
        {
            changeDetected = true;
			
            var xLabel:string = this.xAxisName.value || "Sorted by " + this.sortColumn.getMetadata('title');
            var yLabel:string = this.yAxisName.value || (this.heightColumnsLabels ? this.heightColumnsLabels.join(", ") : "");

            if(!this.showXAxisLabel){
                xLabel = " ";
            }

            if (this.heightColumnNames && this.heightColumnNames.length)
            {
                var temp:any =  {};
                if (weavejs.WeaveAPI.Locale.reverseLayout)
                {
                    this.heightColumnNames.forEach( (name) => {
                        temp[name] = 'y2';
                    });
                    this.c3Config.data.axes = temp;
                    this.c3Config.axis.y2 = this.c3ConfigYAxis;
                    this.c3Config.axis.y = {show: false};
                    this.c3Config.axis.x.tick.rotate = 45;
                }
                else
                {
                    this.heightColumnNames.forEach( (name) => {
                        temp[name] = 'y';
                    });
                    this.c3Config.data.axes = temp;
                    this.c3Config.axis.y = this.c3ConfigYAxis;
                    delete this.c3Config.axis.y2;
                    this.c3Config.axis.x.tick.rotate = -45;
                }
            }

            this.c3Config.axis.x.label = {text:xLabel, position:"outer-center"};
            this.c3ConfigYAxis.label = {text:yLabel, position:"outer-middle"};

            this.c3Config.padding.top = this.margin.top.value;
            this.c3Config.axis.x.height = this.margin.bottom.value;

            if(weavejs.WeaveAPI.Locale.reverseLayout){
                this.c3Config.padding.left = this.margin.right.value;
                this.c3Config.padding.right = this.margin.left.value;
            } else {
                this.c3Config.padding.left = this.margin.left.value;
                this.c3Config.padding.right = this.margin.right.value;
            }

            if(!isNaN(this.overrideYMax.value)) {
                this.c3Config.axis.y.max = this.overrideYMax.value;
            }else{
                this.c3Config.axis.y.max = null;
            }

            if(!isNaN(this.overrideYMin.value)) {
                this.c3Config.axis.y.min = this.overrideYMin.value;
            } else {
                this.c3Config.axis.y.min = null;
            }

        }
        if (Weave.detectChange(this, this.horizontalMode))
        {
            changeDetected = true;
            this.c3Config.axis.rotated = this.horizontalMode.value;
        }

        if (changeDetected || forced)
        {
            this.busy = true;
            this.chart = c3.generate(this.c3Config);
            this.cullAxes();
        }
    }
}

Weave.registerClass("weavejs.tool.C3BarChart", WeaveC3Barchart, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::CompoundBarChartTool", WeaveC3Barchart);
