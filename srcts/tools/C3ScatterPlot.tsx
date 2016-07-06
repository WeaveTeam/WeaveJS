import {IVisToolProps} from "./IVisTool";
import AbstractC3Tool from "./AbstractC3Tool";
import * as _ from "lodash";
import * as d3 from "d3";
import FormatUtils from "../utils/FormatUtils";
import * as React from "react";
import * as c3 from "c3";
import {HBox, VBox} from "../react-ui/FlexBox";
import ChartUtils from "../utils/ChartUtils";
import ComboBox from "../semantic-ui/ComboBox";
import Accordion from "../semantic-ui/Accordion";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import IAltText from "../accessibility/IAltText";
import {CullingMetric} from "./AbstractC3Tool";
import Checkbox from "../semantic-ui/Checkbox";

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
import EntityNode = weavejs.data.hierarchy.EntityNode;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;

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
	xAxisLabelAngle = Weave.linkableChild(this, new LinkableNumber(-45));

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

		this.fill.color.internalDynamicColumn.globalName = "defaultColorColumn";

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
							color = StandardLib.getHexColor(Number(color));
					}
					return color || "#000000";
				}
			},
			legend: {
				show: false
			},
	        subchart: {
		        show: this.showSubChart.value
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
								return this.formatXAxisLabel(Weave.lang(this.xAxisValueToLabel[num]), this.xAxisLabelAngle.value) || "";
							}
							else
							{
								return this.formatXAxisLabel(String(FormatUtils.defaultNumberFormatting(num)),this.xAxisLabelAngle.value);
							}
						},
						rotate: this.xAxisLabelAngle.value,
						culling: {
							max: null
						},
						fit: false
					}
				}
			},
			grid: {
				x: {
					show: this.showGrid.value
				},
				y: {
					show: this.showGrid.value
				}
			},
			point: {
				r: (d:any):number => {
					if (d.hasOwnProperty("index"))
					{
						return Math.round(this.records[d.index].size);
					}
				},
				focus: {
					expand: {
						enabled: false
					}
				},
				select: {
					r: (d:any):number => {
						if (d.hasOwnProperty("index"))
							return Math.round(this.records[d.index].size);
						return 0;
					}
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
						return this.formatYAxisLabel(Weave.lang(this.yAxisValueToLabel[num]),null) || "";
					}
					else
					{
						return this.formatYAxisLabel(String(FormatUtils.defaultNumberFormatting(num)),null);
					}
				}
			}
		};
	}

	protected cullAxes()
	{
		if (this.canCull)
		{
			let cullingMetric:CullingMetric = this.getCullingMetrics({height:this.chart.internal.height, width:this.chart.internal.width});

			//set tick marks for Axes
			let xDisplayed:number = cullingMetric.horizontalLabels;
			let yDisplayed:number = cullingMetric.verticalLabels;

			this.xAxisTicks.value = xDisplayed > cullingMetric.xAxisTotal ? cullingMetric.xAxisTotal:xDisplayed;
			this.yAxisTicks.value = yDisplayed > cullingMetric.yAxisTotal ? cullingMetric.yAxisTotal:yDisplayed;
			this.y2AxisTicks.value = yDisplayed > cullingMetric.y2AxisTotal ? cullingMetric.y2AxisTotal:yDisplayed;
		}
	}
	
	protected handleC3MouseOver(d:any):void
	{
		var key:IQualifiedKey = this.records[d.index].id;
		if (this.probeKeySet)
			this.probeKeySet.replaceKeys([key]);
		this.toolTip.show(this, this.chart.internal.d3.event, [key], [this.dataX, this.dataY, this.radiusData]);
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
		var changeDetected:boolean = false;
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
		var axisChanged = xyChanged || Weave.detectChange(this,
				this.xAxisName,
				this.yAxisName,
				this.margin,
				this.xAxisLabelAngle,
				this.xAxisTicks,
				this.yAxisTicks,
				this.y2AxisTicks
			);
		if (axisChanged)
		{
			var xLabel:string = Weave.lang(this.xAxisName.value) || this.defaultXAxisLabel;
			var yLabel:string = Weave.lang(this.yAxisName.value) || this.defaultYAxisLabel;

			if (weavejs.WeaveAPI.Locale.reverseLayout)
			{
				this.c3Config.data.axes = {'y': 'y2'};
				this.c3Config.axis.y2 = this.c3ConfigYAxis;
				this.c3Config.axis.y = {show: false};
				this.c3Config.axis.x.tick.rotate = -1*this.xAxisLabelAngle.value;
			}
			else
			{
				this.c3Config.data.axes = {'y': 'y'};
				this.c3Config.axis.y = this.c3ConfigYAxis;
				delete this.c3Config.axis.y2;
				this.c3Config.axis.x.tick.rotate = this.xAxisLabelAngle.value;
			}

			this.c3Config.axis.x.label = {text:xLabel, position:"outer-center"};
			this.c3ConfigYAxis.label = {text:yLabel, position:"outer-middle"};

			if (this.canCull)
			{
				this.c3Config.axis.x.tick.count = this.xAxisTicks.value;
				if (weavejs.WeaveAPI.Locale.reverseLayout) {
					this.c3Config.axis.y2.tick.count = this.y2AxisTicks.value;
				} else {
					this.c3Config.axis.y.tick.count = this.yAxisTicks.value;
				}
			}

			this.updateConfigMargin();
		}

		if (Weave.detectChange(this, this.showGrid))
		{
			changeDetected = true;
			this.c3Config.grid.x.show = this.showGrid.value;
			this.c3Config.grid.y.show = this.showGrid.value;
		}

		if(Weave.detectChange(this, this.showSubChart))
		{
			changeDetected = true;
			this.c3Config.subchart.show = this.showSubChart.value;
		}

		if (forced || dataChanged || axisChanged || changeDetected)
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
					return 0.5;
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

	get selectableAttributes()
	{
		return super.selectableAttributes
			.set("X", this.dataX)
			.set("Y", this.dataY)
			.set("Color", this.fill.color)
			.set("Size", this.radius);
			// TODO handle remaining attributes
	}

	get defaultPanelTitle():string
	{
		return Weave.lang("Scatter Plot of {0} -vs- {1}", weavejs.data.ColumnUtils.getTitle(this.dataX), weavejs.data.ColumnUtils.getTitle(this.dataY));
	}

	get defaultXAxisLabel():string
	{
		return Weave.lang(this.dataX.getMetadata('title'));
	}

	get defaultYAxisLabel():string
	{
		return Weave.lang(this.dataY.getMetadata('title'));
	}

	getAutomaticDescription():string
	{
		return Weave.lang("Scatter plot of {0} vs {1}", this.xAxisName.value, this.yAxisName.value);
	}

	//todo:(pushCrumb)find a better way to link to sidebar UI for selectbleAttributes
	renderEditor =(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any)=>void):JSX.Element =>
	{
		return Accordion.render(
			[Weave.lang("Data"), this.getSelectableAttributesEditor(pushCrumb)],
			[
				Weave.lang("Display"),
				[
					[
						Weave.lang("X axis label angle"),
						<ComboBox style={{width:"100%"}} ref={linkReactStateRef(this, { value: this.xAxisLabelAngle })} options={ChartUtils.getAxisLabelAngleChoices()}/>
					],
					[
						Weave.lang("Show grid"),
						<Checkbox ref={linkReactStateRef(this, { value: this.showGrid })} label={" "}/>
					],
					Weave.beta && [
						Weave.lang("Show sub chart (beta)"),
						<Checkbox ref={linkReactStateRef(this, { value: this.showSubChart })} label={" "}/>
					]
				]
			],
			[Weave.lang("Titles"), this.getTitlesEditor()],
			[Weave.lang("Margins"), this.getMarginEditor()],
			[Weave.lang("Accessibility"), this.getAltTextEditor()]
		);
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

Weave.registerClass(
	C3ScatterPlot,
	["weavejs.tool.C3ScatterPlot", "weave.visualization.tools::ScatterPlotTool"],
	[
		weavejs.api.ui.IVisTool_Basic,
		weavejs.api.core.ILinkableObjectWithNewProperties,
		weavejs.api.data.ISelectableAttributes,
		IAltText
	],
	"Scatter Plot"
);
