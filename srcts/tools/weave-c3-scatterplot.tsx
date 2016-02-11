///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>

import {IVisToolProps} from "./IVisTool";
import AbstractC3Tool from "./AbstractC3Tool";
import * as _ from "lodash";
import * as d3 from "d3";
import FormatUtils from "../utils/FormatUtils";
import * as React from "react";
import * as c3 from "c3";
import {ChartConfiguration, ChartAPI} from "c3";
import {MouseEvent} from "react";
import {getTooltipContent} from "./tooltip";
import Tooltip from "./tooltip";
import * as ReactDOM from "react-dom";
import StandardLib from "../utils/StandardLib";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import KeySet = weavejs.data.key.KeySet;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
import NormalizedColumn = weavejs.data.column.NormalizedColumn;
import SolidFillStyle = weavejs.geom.SolidFillStyle;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import LinkableNumber = weavejs.core.LinkableNumber;
import LinkableString = weavejs.core.LinkableString;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;

declare type Record = {
	id: IQualifiedKey,
	point: { x: number, y: number },
	size: number,
	fill: { color: string },
	line: { color: string }
};

export default class WeaveC3ScatterPlot extends AbstractC3Tool
{
	dataX: DynamicColumn = Weave.linkableChild(this, DynamicColumn);
	dataY: DynamicColumn = Weave.linkableChild(this, DynamicColumn);
	radius: AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(5));
	fill: SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);
	line: SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
	
	private get radiusNorm() { return this.radius.getInternalColumn() as NormalizedColumn; }
	private get radiusData() { return this.radiusNorm.internalDynamicColumn; }
	
	private RECORD_FORMAT = {
		id: IQualifiedKey,
		point: { x: this.dataX, y: this.dataY },
		size: this.radius,
		fill: { color: this.fill.color },
		line: { color: this.line.color }
	};
	private RECORD_DATATYPE = {
		point: { x: Number, y: Number },
		size: Number,
		fill: { color: String },
		line: { color: String }
	};
	
	private keyToIndex:{[key:string]: number};
	private indexToKey:{[index:number]: IQualifiedKey};
	private xAxisValueToLabel:{[value:number]: string};
	private yAxisValueToLabel:{[value:number]: string};
	protected chart:ChartAPI;
	private dataXType:string;
	private dataYType:string;
	private records:Record[];

	private flag:boolean;
	private busy:boolean;
	private dirty:boolean;

	protected c3Config:ChartConfiguration;
	protected c3ConfigYAxis:c3.YAxisConfiguration;

	constructor(props:IVisToolProps)
	{
		super(props);
		
		this.radius.internalDynamicColumn.requestLocalObject(NormalizedColumn, true);
		Weave.getCallbacks(this.selectionFilter).addGroupedCallback(this, this.updateStyle);
		Weave.getCallbacks(this.probeFilter).addGroupedCallback(this, this.updateStyle);
		
		Weave.getCallbacks(this).addGroupedCallback(this, this.validate, true);
	
		this.filteredKeySet.setColumnKeySources([this.dataX, this.dataY]);

		this.radiusNorm.min.value = 3;
		this.radiusNorm.max.value = 25;
		
		this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
		this.probeFilter.targetPath = ['defaultProbeKeySet'];

		this.keyToIndex = {};
		this.indexToKey = {};
		this.yAxisValueToLabel = {};
		this.xAxisValueToLabel = {};
		this.validate = _.debounce(this.validate.bind(this), 30);

		this.c3Config = {
			size: {
				height: this.props.style.height,
				width: this.props.style.width
			},
			bindto: null,
			padding: {
				top: 20,
				bottom: 0,
				left:100,
				right:20
			},
			data: {
				rows: [],
				x: "x",
				xSort: false,
				type: "scatter",
				selection: {
					enabled: true,
					multiple: true,
					draggable: true
				},
				color: (color:string, d:any):string => {
					var color:string;
					if(d.hasOwnProperty("index")) {
						var record:Record = this.records[d.index];
						color = record ? record.fill.color : null;
						if (color && color.charAt(0) != '#')
							color = '#' + weavejs.util.StandardLib.numberToBase(Number(color), 16, 6);
					}
					return color || "#000000";
				},
				onclick: (d:any) => {
					var event:MouseEvent = (this.chart.internal.d3).event as MouseEvent;
					if(!(event.ctrlKey||event.metaKey) && d && d.hasOwnProperty("index")) {
						if (this.selectionKeySet)
							this.selectionKeySet.replaceKeys([this.indexToKey[d.index]]);
					}
				},
				onselected: (d:any) => {
					this.flag = true;
					if(d && d.hasOwnProperty("index")) {
						if (this.selectionKeySet)
							this.selectionKeySet.addKeys([this.indexToKey[d.index]]);
					}
				},
				onunselected: (d) => {
					this.flag = true;
					if(d && d.hasOwnProperty("index")) {
						if (this.selectionKeySet)
							this.selectionKeySet.removeKeys([this.indexToKey[d.index]]);
					}
				},
				onmouseover: (d) => {
					if(d && d.hasOwnProperty("index")) {
						if (this.probeKeySet)
							this.probeKeySet.replaceKeys([]);
						var columnNamesToValue:{[columnName:string] : string|number } = {};
						var xValue:number = this.records[d.index].point.x;
						if(xValue) {
							columnNamesToValue[this.dataX.getMetadata('title')] = xValue;
						}

						var yValue:number = this.records[d.index].point.y;
						if(yValue) {
							columnNamesToValue[this.dataY.getMetadata('title')] = yValue;
						}

						var size:number = this.records[d.index].size;
						if (size) {
							columnNamesToValue[this.radius.getMetadata('title')] = size;
						}
						if (this.probeKeySet)
							this.probeKeySet.replaceKeys([this.indexToKey[d.index]]);
						this.props.toolTip.setState({
							x: this.chart.internal.d3.event.pageX,
							y: this.chart.internal.d3.event.pageY,
							showToolTip: true,
							columnNamesToValue: columnNamesToValue
						});
					}
				},
				onmouseout: (d) => {
					if(d && d.hasOwnProperty("index")) {
						if (this.probeKeySet)
							this.probeKeySet.replaceKeys([]);
						this.props.toolTip.setState({
							showToolTip: false
						});
					}
				}
			},
			legend: {
				show: false
			},
			axis: {
				x: {
					label: {
						text: "",
						position: "outer-center"
					},
					tick: {
						format: (num:number):string => {
							if (this.xAxisValueToLabel && this.dataXType !== "number") {
								return this.xAxisValueToLabel[num] || "";
							} else {
								return String(FormatUtils.defaultNumberFormatting(num));
							}
						},
						rotate: -45,
						culling: {
							max: null
						},
						fit: false
					}
				}
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
			tooltip: {
				format: {
					title: (num:number):string => {
						return this.xAxisName.value || this.dataX.getMetadata('title');
					},
					name: (name:string, ratio:number, id:string, index:number):string => {
						return this.yAxisName.value || this.dataY.getMetadata('title');
					}
				},
				show: false
			},
			point: {
				r: (d:any):number => {
					if(d.hasOwnProperty("index")) {
						return this.records[d.index].size;
					}
				},
				focus: {
					expand: {
						enabled: false
					}
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
				format: (num:number):string => {
					if(this.yAxisValueToLabel && this.dataYType !== "number") {
						return this.yAxisValueToLabel[num] || "";
					} else {
						return String(FormatUtils.defaultNumberFormatting(num));
					}
				}
			}
		};
	}

	public get deprecatedStateMapping():Object
	{
		return [this.super_deprecatedStateMapping, {
			"children": {
				"visualization": {
					"plotManager": {
						"plotters": {
							"plot": {
								"filteredKeySet": this.filteredKeySet,
								"dataX": this.dataX,
								"dataY": this.dataY,
								"sizeBy": this.radiusData,
								"minScreenRadius": this.radiusNorm.min,
								"maxScreenRadius": this.radiusNorm.max,
								"defaultScreenRadius": this.radius.defaultValue,
								
								"fill": this.fill,
								"line": this.line,
								
								"showSquaresForMissingSize": false,
								"colorBySize": false,
								"colorPositive": 0x00FF00,
								"colorNegative": 0xFF0000
							}
						}
					}
				}
			}
		}];
	}

	handleClick(event:MouseEvent):void
	{
		if(!this.flag) {
			if (this.selectionKeySet)
				this.selectionKeySet.replaceKeys([]);
		}
		this.flag = false;
	}

	updateStyle()
	{
		if (!this.chart || !this.dataXType)
			return;

		d3.select(this.element)
			.selectAll("circle")
			.style("opacity", 1)
			.style("stroke", "black")
			.style("stroke-opacity", 0.0)
			.style("stroke-width",1.0);

		var selectedKeys:string[] = this.selectionKeySet ? this.selectionKeySet.keys : [];
		var probedKeys:string[] = this.probeKeySet ? this.probeKeySet.keys : [];
		var selectedIndices:number[] = selectedKeys.map((key:string) => {
			return Number(this.keyToIndex[key]);
		});
		var probedIndices:number[] = probedKeys.map((key:string) => {
			return Number(this.keyToIndex[key]);
		});
		var keys:string[] = Object.keys(this.keyToIndex);
		var indices:number[] = keys.map((key:string) => {
			return Number(this.keyToIndex[key]);
		});

		var unselectedIndices:number[] = _.difference(indices, selectedIndices);
		unselectedIndices = _.difference(unselectedIndices,probedIndices);
		if (probedIndices.length)
		{
			this.customStyle(probedIndices, "circle", ".c3-shape", {opacity:1.0, "stroke-opacity": 0.5, "stroke-width": 1.5});
		}
		if (selectedIndices.length)
		{
			this.customStyle(unselectedIndices, "circle", ".c3-shape", {opacity: 0.3, "stroke-opacity": 0.0});
			this.customStyle(selectedIndices, "circle", ".c3-shape", {opacity: 1.0, "stroke-opacity": 1.0});
			this.chart.select(["y"], selectedIndices, true);
		}
		else if (!probedIndices.length)
		{
			this.customStyle(indices, "circle", ".c3-shape", {opacity: 1.0, "stroke-opacity": 0.0});
			this.chart.select(["y"], [], true);
		}
	}

	componentDidUpdate()
	{
		var sizeChanged = this.c3Config.size.width != this.props.style.width || this.c3Config.size.height != this.props.style.height;
		super.componentDidUpdate();
		if (sizeChanged)
			this.validate(true);
	}

	componentWillUnmount()
	{
		//super.componentWillUnmount();
		this.chart.destroy();
	}

	componentDidMount()
	{
		//super.componentDidMount();
		this.element.addEventListener("click", this.handleClick.bind(this));

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
		
		var xyChanged = Weave.detectChange(this, this.dataX, this.dataY);
		var dataChanged = xyChanged || Weave.detectChange(this, this.radius, this.fill, this.line, this.filteredKeySet);
		if (dataChanged)
		{
			this.dataXType = this.dataX.getMetadata('dataType');
			this.dataYType = this.dataY.getMetadata('dataType');
			
			this.records = weavejs.data.ColumnUtils.getRecords(this.RECORD_FORMAT, this.filteredKeySet.keys, this.RECORD_DATATYPE);
			this.records = _.sortByOrder(this.records, ["size", "id"], ["desc", "asc"]);
	
			this.keyToIndex = {};
			this.indexToKey = {};
			this.yAxisValueToLabel = {};
			this.xAxisValueToLabel = {};
	
			this.records.forEach((record:Record, index:number) => {
				this.keyToIndex[record.id as any] = index;
				this.indexToKey[index] = record.id;
				this.xAxisValueToLabel[this.records[index].point.x] = this.dataX.getValueFromKey(record.id, String);
				this.yAxisValueToLabel[this.records[index].point.y] = this.dataY.getValueFromKey(record.id, String);
			});
		}
		var axisChanged = xyChanged || Weave.detectChange(this, this.xAxisName, this.yAxisName, this.marginTop, this.marginBottom, this.marginLeft, this.marginRight);
		if (axisChanged)
		{
			var xLabel:string = this.xAxisName.value || this.dataX.getMetadata('title');
			var yLabel:string = this.yAxisName.value || this.dataY.getMetadata('title');

			if (weavejs.WeaveAPI.Locale.reverseLayout)
			{
				this.c3Config.data.axes = {'y': 'y2'};
				this.c3Config.axis.y2 = this.c3ConfigYAxis;
				this.c3Config.axis.y = {show: false};
				this.c3Config.axis.x.tick.rotate = 45;
			}
			else
			{
				this.c3Config.data.axes = {'y': 'y'};
				this.c3Config.axis.y = this.c3ConfigYAxis;
				delete this.c3Config.axis.y2;
				this.c3Config.axis.x.tick.rotate = -45;
			}

			this.c3Config.axis.x.label = {text:xLabel, position:"outer-center"};
			this.c3ConfigYAxis.label = {text:yLabel, position:"outer-middle"};

			this.c3Config.padding.top = Number(this.marginTop.value);
			this.c3Config.axis.x.height = Number(this.marginBottom.value);
			
			if (weavejs.WeaveAPI.Locale.reverseLayout)
			{
				this.c3Config.padding.left = Number(this.marginRight.value);
				this.c3Config.padding.right = Number(this.marginLeft.value);
			}
			else
			{
				this.c3Config.padding.left = Number(this.marginLeft.value);
				this.c3Config.padding.right = Number(this.marginRight.value);
			}
		}
		
		if (dataChanged || axisChanged)
		{
			this.busy = true;
			this.chart = c3.generate(this.c3Config);
			this.loadData();
			this.cullAxes();
		}
	}

	loadData()
	{
		if(!this.chart || this.busy)
			return StandardLib.debounce(this, 'loadData');
		this.chart.load({data: _.pluck(this.records, "point"), unload: true});
		//after data is loaded we need to remove the clip-path so that points are not
		// clipped when rendered near edge of chart
		//TODO: determine if adding padding to axes range will further improve aesthetics of chart
		this.chart.internal.main.select('.c3-chart').attr('clip-path',null);
	}
}

Weave.registerClass("weavejs.tool.C3ScatterPlot", WeaveC3ScatterPlot, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::ScatterPlotTool", WeaveC3ScatterPlot);
