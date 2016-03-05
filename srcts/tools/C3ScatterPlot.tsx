///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
///<reference path="../../typings/react/react-dom.d.ts"/>

import {IVisToolProps} from "./IVisTool";
import AbstractC3Tool from "./AbstractC3Tool";
import * as _ from "lodash";
import * as d3 from "d3";
import FormatUtils from "../utils/FormatUtils";
import * as React from "react";
import * as c3 from "c3";
import {ChartConfiguration, ChartAPI} from "c3";
import {MouseEvent} from "react";
import ToolTip from "./ToolTip";
import * as ReactDOM from "react-dom";
import MiscUtils from "../utils/MiscUtils";

import HBox from "../react-ui/HBox";
import VBox from "../react-ui/VBox";

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
import StandardLib = weavejs.util.StandardLib;

declare type Record = {
	id: IQualifiedKey,
	point: { x: number, y: number },
	size: number,
	fill: { color: string },
	line: { color: string }
};

export default class C3ScatterPlot extends AbstractC3Tool
{
	dataX = Weave.linkableChild(this, DynamicColumn);
	dataY = Weave.linkableChild(this, DynamicColumn);
	radius = Weave.linkableChild(this, new AlwaysDefinedColumn(5));
	fill = Weave.linkableChild(this, SolidFillStyle);
	line = Weave.linkableChild(this, SolidLineStyle);

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

	private keyToIndex: Map<IQualifiedKey, number>;
	private xAxisValueToLabel:{[value:number]: string};
	private yAxisValueToLabel:{[value:number]: string};
	private dataXType:string;
	private dataYType:string;
	private records:Record[];

	protected c3ConfigYAxis:c3.YAxisConfiguration;

	constructor(props:IVisToolProps)
	{
		super(props);

		this.radius.internalDynamicColumn.requestLocalObject(NormalizedColumn, true);

		this.filteredKeySet.setColumnKeySources([this.dataX, this.dataY]);

		this.radiusNorm.min.value = 3;
		this.radiusNorm.max.value = 25;

		this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
		this.probeFilter.targetPath = ['defaultProbeKeySet'];

		this.keyToIndex = new Map<IQualifiedKey, number>();
		this.yAxisValueToLabel = {};
		this.xAxisValueToLabel = {};

        this.mergeConfig({
			data: {
				rows: [],
				x: "x",
				xSort: false,
				type: "scatter",
				color: (color:string, d:any):string => {
					if (d.hasOwnProperty("index"))
					{
						var record:Record = this.records[d.index];
						color = record ? record.fill.color : null;
						if (color && color.charAt(0) != '#')
							color = '#' + StandardLib.numberToBase(Number(color), 16, 6);
					}
					return color || "#000000";
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
							if (this.xAxisValueToLabel && this.dataXType !== "number")
							{
								return Weave.lang(this.xAxisValueToLabel[num]) || "";
							}
							else
							{
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
			grid: {
				x: {
					show: true
				},
				y: {
					show: true
				}
			},
			point: {
				r: (d:any):number => {
					if (d.hasOwnProperty("index"))
					{
						return this.records[d.index].size;
					}
				},
				focus: {
					expand: {
						enabled: false
					}
				},
				select:
				{
					//Todo: need to extend to take a function based on point size
					r: 5
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
				format: (num:number):string => {
					if (this.yAxisValueToLabel && this.dataYType !== "number")
					{
						return Weave.lang(this.yAxisValueToLabel[num]) || "";
					}
					else
					{
						return String(FormatUtils.defaultNumberFormatting(num));
					}
				}
			}
		};
	}
	
	protected handleC3MouseOver(d:any):void
	{
		var key:IQualifiedKey = this.records[d.index].id;
		if (this.probeKeySet)
			this.probeKeySet.replaceKeys([key]);
		var data = ToolTip.getToolTipData(this, [key], [this.dataX, this.dataY, this.radiusData]);
		if (this.props.toolTip)
			this.props.toolTip.setState({
				x: this.chart.internal.d3.event.pageX,
				y: this.chart.internal.d3.event.pageY,
				showToolTip: true,
				columnNamesToValue: data
			});
	}
	
	protected handleC3Selection():void
	{
		if (!this.selectionKeySet)
			return;
		let selectedIndices = this.chart.selected();
		let selectedKeys = selectedIndices.map((value) => this.records[value.index].id);
		this.selectionKeySet.replaceKeys(selectedKeys);
	}

	protected validate(forced:boolean = false):boolean
	{
		var xyChanged = Weave.detectChange(this, this.dataX, this.dataY);
		var dataChanged = xyChanged || Weave.detectChange(this, this.radius, this.fill, this.line, this.filteredKeySet);
		if (dataChanged)
		{
			this.dataXType = this.dataX.getMetadata('dataType');
			this.dataYType = this.dataY.getMetadata('dataType');

			this.records = weavejs.data.ColumnUtils.getRecords(this.RECORD_FORMAT, this.filteredKeySet.keys, this.RECORD_DATATYPE);
			this.records = _.sortByOrder(this.records, ["size", "id"], ["desc", "asc"]);

			this.keyToIndex.clear();
			this.yAxisValueToLabel = {};
			this.xAxisValueToLabel = {};

			this.records.forEach((record:Record, index:number) => {
				this.keyToIndex.set(record.id, index);
				this.xAxisValueToLabel[this.records[index].point.x] = this.dataX.getValueFromKey(record.id, String);
				this.yAxisValueToLabel[this.records[index].point.y] = this.dataY.getValueFromKey(record.id, String);
			});
			
			this.c3Config.data.json = {x: _.map(this.records, 'point.x'), y: _.map(this.records, 'point.y')};
		}
		var axisChanged = xyChanged || Weave.detectChange(this, this.xAxisName, this.yAxisName, this.margin);
		if (axisChanged)
		{
			var xLabel:string = Weave.lang(this.xAxisName.value || this.dataX.getMetadata('title'));
			var yLabel:string = Weave.lang(this.yAxisName.value || this.dataY.getMetadata('title'));

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
			this.updateConfigMargin();
		}

		if (forced || dataChanged || axisChanged)
			return true;
		
		//after data is loaded we need to remove the clip-path so that points are not
		// clipped when rendered near edge of chart
		//TODO: determine if adding padding to axes range will further improve aesthetics of chart
		this.chart.internal.main.select('.c3-chart').attr('clip-path',null);
		
		// update c3 selection
		var keyToIndex = (key: IQualifiedKey) => this.keyToIndex.get(key);
		var selectedIndices: number[] = this.selectionKeySet ? this.selectionKeySet.keys.map(keyToIndex) : [];
		this.chart.select(["y"], selectedIndices, true);
		
		// update style
		let selectionEmpty: boolean = !this.selectionKeySet || this.selectionKeySet.keys.length === 0;
		d3.select(this.element)
			.selectAll("circle.c3-shape")
			.style("stroke",
				(d: any, i:number, oi:number): string => {
					let key = this.records[i].id;
					let selected = this.isSelected(key);
					let probed = this.isProbed(key);
					if(probed && selected)
						return "white";
					else
						return "black";
				})
			.style("opacity",
				(d: any, i: number, oi: number): number => {
					let key = this.records[i].id;
					let selected = this.isSelected(key);
					let probed = this.isProbed(key);
					return (selectionEmpty || selected || probed) ? 1.0 : 0.3;
				})
			.style("stroke-opacity",
				(d: any, i: number, oi: number): number => {
					let key = this.records[i].id;
					let selected = this.isSelected(key);
					let probed = this.isProbed(key);
					if (probed)
						return 1.0;
					if(selected)
						return 0.5;
					if (!selectionEmpty && !selected)
						return 0;
					return 0.0;
				})
			.style("stroke-width",
				(d: any, i: number, oi: number): number => {
					let key = this.records[i].id;
					let selected = this.isSelected(key);
					let probed = this.isProbed(key);
					if (probed && selected)
						return 1.0;
					return probed ? 2.0 : 1.0;
				});

		//handle selected circles
		d3.select(this.element)
			.selectAll("circle.c3-selected-circle")
			.attr("r", (d:any, i:number, oi:number): number => {
				if (d.hasOwnProperty("index"))
				{
					return this.records[d.index].size+1;
				}
			})
			.style("stroke", "black")
			.style("stroke-opacity",
				(d: any, i: number, oi: number): number => {
					if (d.hasOwnProperty("index")) {
						let key = this.records[d.index].id;
						let selected = this.isSelected(key);
						let probed = this.isProbed(key);
						if (probed && selected)
							return 1.0;
						else
							return 0.0;
					}
				})
			.style("stroke-width", "1px");

		return false;
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
}

Weave.registerClass("weavejs.tool.C3ScatterPlot", C3ScatterPlot, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::ScatterPlotTool", C3ScatterPlot);
