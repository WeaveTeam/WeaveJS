import {IVisToolProps} from "./IVisTool";
import AbstractC3Tool from "./AbstractC3Tool";
import * as _ from "lodash";
import * as d3 from "d3";
import FormatUtils from "../utils/FormatUtils";
import * as React from "react";
import * as c3 from "c3";
import {HBox, VBox} from "../react-ui/FlexBox";

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
			var xLabel:string = Weave.lang(this.xAxisName.value) || this.defaultXAxisLabel;
			var yLabel:string = Weave.lang(this.yAxisName.value) || this.defaultYAxisLabel;

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

		//call weave layering function
		this.weaveLayering();

		return false;
	}

	protected weaveLayering():void {
		var selectionKeySetChanged:boolean = Weave.detectChange(this, this.selectionKeySet) || (this.selectionKeySet.keys.length != d3.select(this.element).select("g.selection_style_layer").selectAll("circle").size());
		var probeKeySetChanged:boolean = Weave.detectChange(this, this.probeKeySet) || (this.probeKeySet.keys.length != d3.select(this.element).select("g.probe_style_layer").selectAll("circle").size());
		super.weaveLayering(selectionKeySetChanged,probeKeySetChanged);

		var scatterplot = this;
		//copy items to selection_layer and probe_layer
		if(selectionKeySetChanged || probeKeySetChanged) {
			d3.select(scatterplot.element).selectAll("g.c3-shapes.c3-circles").selectAll("circle.c3-shape").each(function (d:any, i:number, oi:number) {
				let key = scatterplot.records[i].id;
				let selected = scatterplot.isSelected(key);
				let probed = scatterplot.isProbed(key);
				if (selected && selectionKeySetChanged) {
					d3.select(scatterplot.element)
						.select("g.selection_layer")
						.node()
						.appendChild(this.cloneNode(true));
				}
				if (probed && probeKeySetChanged) {
					d3.select(scatterplot.element)
						.select("g.probe_layer")
						.node()
						.appendChild(this.cloneNode(true));
				}
			});
		}

		//draw selection_style_layer
		if(selectionKeySetChanged) {
			d3.select(scatterplot.element)
				.selectAll("g.c3-shapes.c3-circles")
				.selectAll("circle.c3-shape").each(function (d:any, i:number, oi:number) {
				if (d.hasOwnProperty("index")) {
					let key = scatterplot.records[d.index].id;
					let selected = scatterplot.isSelected(key);
					if (selected) {
						d3.select(scatterplot.element)
							.selectAll("g.selection_style_layer")
							.append("circle")
							.classed("_selection_circle", true)
							.attr("cx", this.getAttribute("cx"))
							.attr("cy", this.getAttribute("cy"))
							.attr("r", this.getAttribute("r"))
							.style("stroke", "black")
							.style("stroke-width", 1)
							.style("stroke-opacity", 0.5)
					}
				}
			});

			//style selection_layer (need to set opacity to null, group opacity will then determine opacity of all points)
			d3.select(scatterplot.element)
				.select("g.selection_layer")
				.selectAll("circle")
				.attr("class", "weave_selection_layer_circle")
				.style("opacity", null)
				.style("stroke", "black")
				.style("stroke-width", 1);
		}

		//draw probe_style_layer
		if(probeKeySetChanged) {
			d3.select(scatterplot.element)
				.selectAll("g.c3-shapes.c3-circles")
				.selectAll("circle.c3-shape").each(function (d:any, i:number, oi:number) {
				if (d.hasOwnProperty("index")) {
					let key = scatterplot.records[d.index].id;
					let probed = scatterplot.isProbed(key);
					if (probed) {
						let groupElement = d3.select(scatterplot.element)
							.selectAll("g.probe_style_layer")
							.append("g")
							.classed("_probe_style_group", true);
						groupElement.append("circle")
							.classed("_probe_outer_circle", true)
							.attr("cx", this.getAttribute("cx"))
							.attr("cy", this.getAttribute("cy"))
							.attr("r", String(Number(this.getAttribute("r")) + 3))
							.style("stroke", "black")
							.style("stroke-width", 1)
							.style("fill", "white");
					}
				}
			});

			//style probe_layer (need to set opacity to null, group opacity will then determine opacity of all points)
			d3.select(scatterplot.element)
				.select("g.probe_layer")
				.selectAll("circle")
				.attr("class", "weave_probe_layer_circle")
				.style("opacity", null)
				.style("stroke", "black")
				.style("stroke-width", 1);
		}
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
		return Weave.lang("Scatter plot {0} -vs- {1}", weavejs.data.ColumnUtils.getTitle(this.dataX), weavejs.data.ColumnUtils.getTitle(this.dataY));
	}

	get defaultXAxisLabel():string
	{
		return Weave.lang(this.dataX.getMetadata('title'));
	}

	get defaultYAxisLabel():string
	{
		return Weave.lang(this.dataY.getMetadata('title'));
	}

	//todo:(linkFunction)find a better way to link to sidebar UI for selectbleAttributes
	renderEditor(linkFunction:Function):JSX.Element
	{
		return (
			<VBox>
				{
					super.renderEditor(linkFunction)
				}
			</VBox>
		)
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
	[weavejs.api.ui.IVisTool_Basic, weavejs.api.core.ILinkableObjectWithNewProperties],
	"Scatterplot"
);
