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
import {HBox, VBox} from "../react-ui/FlexBox";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import LinkableString = weavejs.core.LinkableString;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;

declare type Record = {
    id: IQualifiedKey,
    columns: IAttributeColumn[],
    line: {color: string }
};

export default class C3LineChart extends AbstractC3Tool
{
    columns = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
    line = Weave.linkableChild(this, SolidLineStyle);
    curveType = Weave.linkableChild(this, LinkableString);

    private RECORD_FORMAT = {
        id: IQualifiedKey,
        columns: [] as any[],
        line: { color: this.line.color }
    };

    private RECORD_DATATYPE = {
        columns: Number,
        line: { color: String }
    };

    private keyToIndex:{[key:string]: number};
    private yAxisValueToLabel:{[value:number]: string};

    private records:Record[];
    private columnLabels:string[];
    private chartType:string;

    protected c3ConfigYAxis:c3.YAxisConfiguration;

    constructor(props:IVisToolProps)
    {
        super(props);


		this.line.color.internalDynamicColumn.globalName = "defaultColorColumn";
        this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
        this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
        this.probeFilter.targetPath = ['defaultProbeKeySet'];

        this.keyToIndex = {};
        this.yAxisValueToLabel = {};

        this.c3ConfigYAxis = {
            show: true,
			label: {
				text: "",
				position: "outer-middle"
			},
            tick: {
                multiline: true,
                format: (num:number):string => {
					var columns = this.columns.getObjects(IAttributeColumn);
                    if (columns[0] && columns[0].getMetadata('dataType') !== "number")
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

        this.mergeConfig({
            data: {
                columns: [],
                xSort: false,
                selection: {
                    enabled: true,
                    multiple: true,
                    draggable: true
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
                focus: {
                    expand: {
                        enabled: false
                    }
                },
                select: {
                    r: 3.5
                }
            },
            axis: {
                x: {
                    label: {
                        text: "",
                        position: "outer-center"
                    },
                    tick: {
                        culling: {
                            max: null
                        },
                        multiline: false,
                        rotate: -45,
                        format: (d:number):string => {
                            if (weavejs.WeaveAPI.Locale.reverseLayout)
                            {
                                //handle case where labels need to be reversed
                                var temp:number = this.columnLabels.length-1;
                                return Weave.lang(this.columnLabels[temp-d]);
                            }
                            else
                            {
                                return Weave.lang(this.columnLabels[d]);
                            }
                        }
                    }
                }
            },
            legend: {
                show: false
            }
        });
    }

	private getQKey(datum:any):IQualifiedKey
	{
		if (!datum)
			return null;
		var record = this.records[this.keyToIndex[datum.id]];
		return record ? record.id : null;
	}

	protected handleC3MouseOver(d:any):void
	{
		var key = this.getQKey(d);
        this.probeKeySet.replaceKeys([key]);
	    this.toolTip.show(this, this.chart.internal.d3.event, [key], this.columns.getObjects(IAttributeColumn));
	}
	
	protected handleC3Selection():void
	{
		if (!this.selectionKeySet)
			return;
		
		var set_selectedKeys = new Set<IQualifiedKey>();
		var selectedKeys:IQualifiedKey[] = [];
		for (var d of this.chart.selected())
		{
			var key = this.getQKey(d);
			if (key && !set_selectedKeys.has(key))
			{
				set_selectedKeys.add(key);
				selectedKeys.push(key);
			}
		}
		this.selectionKeySet.replaceKeys(selectedKeys);
	}

    protected validate(forced:boolean = false):boolean
    {
        var changeDetected:boolean = false;
        var axisChange:boolean = Weave.detectChange(this, this.columns, this.overrideBounds, this.xAxisName, this.yAxisName, this.margin);
		var dataChanged:boolean = axisChange || Weave.detectChange(this, this.curveType, this.line, this.filteredKeySet);
        if (dataChanged)
        {
            changeDetected = true;
            this.columnLabels = [];

            var columns = this.columns.getObjects(IAttributeColumn);
            this.filteredKeySet.setColumnKeySources(columns);
		
            if (weavejs.WeaveAPI.Locale.reverseLayout)
				columns.reverse();
            this.RECORD_FORMAT.columns = [IQualifiedKey as any].concat(columns);

            for (let idx in columns)
            {
                let child = columns[idx];
                let title = child.getMetadata('title');
                this.columnLabels.push(title);
            }

            this.records = weavejs.data.ColumnUtils.getRecords(this.RECORD_FORMAT, this.filteredKeySet.keys, this.RECORD_DATATYPE);
            this.records = _.sortBy(this.records, [0, "id"]);

            this.keyToIndex = {};
            this.yAxisValueToLabel = {};

            this.records.forEach((record:Record, index:number) => {
                this.keyToIndex[record.id as any] = index;
                this.yAxisValueToLabel[record.id as any] = record.id.toString();
            });

            var colors:{[key:string]: string} = {};
            this.records.forEach((record:Record) => {
                colors[record.id as any] = record.line.color || "#000000";
            });

            this.c3Config.data.type = this.curveType.value === "double" ? "spline" : "line";
            this.c3Config.data.columns = _.map(this.records, 'columns') as any;
			this.c3Config.data.colors = colors;
        }
        if (axisChange)
        {
            changeDetected = true;
            var xLabel:string = this.xAxisName.value;
            var yLabel:string = this.yAxisName.value;

            if (this.records)
            {
                var axes:any =  {};
                if (weavejs.WeaveAPI.Locale.reverseLayout)
                {
                    this.records.forEach( (record:Record) => {
                        axes[record.id as any] = 'y2';
                    });
                    this.c3Config.data.axes = axes;
                    this.c3Config.axis.y2 = this.c3ConfigYAxis;
                    this.c3Config.axis.y = {show: false};
                    this.c3Config.axis.x.tick.rotate = 45;
                }
                else
                {
                    this.records.forEach( (record:Record) => {
                        axes[record.id as any] = 'y';
                    });
                    this.c3Config.data.axes = axes;
                    this.c3Config.axis.y = this.c3ConfigYAxis;
                    delete this.c3Config.axis.y2;
                    this.c3Config.axis.x.tick.rotate = -45;
                }
            }

            this.c3Config.axis.x.label = {text:xLabel, position:"outer-center"};
            this.c3ConfigYAxis.label = {text:yLabel, position:"outer-middle"};

			this.updateConfigMargin();
			this.updateConfigAxisY();
        }

        if (changeDetected || forced)
			return true;
		
		// update c3 selection
		if (this.selectionKeySet)
			this.chart.select(this.selectionKeySet.keys.map(key => key.toString()), null, true);

        //call weave layering function
        this.weaveLayering();
		
		return false;
    }

    protected weaveLayering():void {
        var selectionKeySetChanged:boolean = Weave.detectChange(this, this.selectionKeySet);
        var probeKeySetChanged:boolean = Weave.detectChange(this, this.probeKeySet);
        super.weaveLayering(selectionKeySetChanged,probeKeySetChanged);

        var linechart = this;
        //copy items to selection_layer and probe_layer
        if(selectionKeySetChanged || probeKeySetChanged) {
            d3.select(linechart.element).selectAll("g.c3-shapes.c3-circles").selectAll("circle.c3-shape").each(function (d:any, i:number, oi:number) {
                let key = linechart.getQKey(d);
                let selected = linechart.isSelected(key);
                let probed = linechart.isProbed(key);
                if (selected && selectionKeySetChanged) {
                    d3.select(linechart.element)
                        .select("g.selection_layer")
                        .node()
                        .appendChild(this.cloneNode(true));
                }
                if (probed && probeKeySetChanged) {
                    d3.select(linechart.element)
                        .select("g.probe_layer")
                        .node()
                        .appendChild(this.cloneNode(true));
                }
            });
            d3.select(linechart.element).selectAll("g.c3-shapes.c3-lines").selectAll("path.c3-shape.c3-line").each(function (d:any, i:number, oi:number) {
                let key = linechart.getQKey(d);
                let selected = linechart.isSelected(key);
                let probed = linechart.isProbed(key);
                if (selected && selectionKeySetChanged) {
                    d3.select(linechart.element)
                        .select("g.selection_layer")
                        .node()
                        .appendChild(this.cloneNode(true));
                }
                if (probed && probeKeySetChanged) {
                    d3.select(linechart.element)
                        .select("g.probe_layer")
                        .node()
                        .appendChild(this.cloneNode(true));
                }
            });
        }

        //draw selection_style_layer
        if(selectionKeySetChanged) {
            d3.select(linechart.element)
                .selectAll("g.c3-shapes.c3-circles")
                .selectAll("circle.c3-shape").each(function (d:any, i:number, oi:number) {
                if (d.hasOwnProperty("index")) {
                    let key = linechart.getQKey(d);
                    let selected = linechart.isSelected(key);
                    if (selected) {
                        d3.select(linechart.element)
                            .selectAll("g.selection_style_layer")
                            .append("circle")
                            .classed("_selection_circle", true)
                            .attr("cx", this.getAttribute("cx"))
                            .attr("cy", this.getAttribute("cy"))
                            .attr("r", this.getAttribute("r"))
                            .style("stroke", "black")
                            .style("stroke-width", 2)
                            .style("stroke-opacity", 0.5)
                    }
                }
            });

            //style selection_layer (need to set opacity to null, group opacity will then determine opacity of all points)
            d3.select(linechart.element)
                .select("g.selection_layer")
                .selectAll("circle")
                .attr("class", "weave_selection_layer_circle")
                .style("opacity", null);
            d3.select(linechart.element)
                .selectAll("g.selection_layer")
                .selectAll("path")
                .attr("class", "weave_point_layer_line")
                .style("opacity", null);
        }

        //draw probe_style_layer
        if(probeKeySetChanged) {
            d3.select(linechart.element)
                .selectAll("g.c3-shapes.c3-circles")
                .selectAll("circle.c3-shape").each(function (d:any, i:number, oi:number) {
                if (d.hasOwnProperty("index")) {
                    let key = linechart.getQKey(d);
                    let probed = linechart.isProbed(key);
                    if (probed) {
                        d3.select(linechart.element)
                            .selectAll("g.probe_style_layer")
                            .append("circle")
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
            d3.select(linechart.element)
                .selectAll("g.c3-shapes.c3-lines")
                .selectAll("path.c3-shape.c3-line").each(function (d:any, i:number, oi:number) {
                let key = linechart.getQKey(d);
                let probed = linechart.isProbed(key);
                if (probed) {
                    var probeLayer = d3.select(linechart.element)
                        .selectAll("g.probe_style_layer");
                    probeLayer.append("path")
                        .classed("_probe_path", true)
                        .attr("d", this.getAttribute("d"))
                        .style("stroke", "black")
                        .style("stroke-width", 6)
                        .style("stroke-opacity", 1.0);
                    probeLayer.append("path")
                        .classed("_probe_path", true)
                        .attr("d", this.getAttribute("d"))
                        .style("stroke", "white")
                        .style("stroke-width", 5)
                        .style("stroke-opacity", 1.0);
                }
            });

            //style probe_layer (need to set opacity to null, group opacity will then determine opacity of all points)
            d3.select(linechart.element)
                .select("g.probe_layer")
                .selectAll("circle")
                .attr("class", "weave_probe_layer_circle")
                .style("opacity", null)
                .style("stroke", "black")
                .style("stroke-width", 1);
            d3.select(linechart.element)
                .selectAll("g.probe_layer")
                .selectAll("path")
                .attr("class", "weave_point_layer_line")
                .style("opacity", null);
        }
    }

    get selectableAttributes()
    {
        return super.selectableAttributes
            .set("Color", this.line.color)
            .set("Y columns", this.columns);
    }


    get defaultPanelTitle():string
    {
        var columns = this.columns.getObjects() as IAttributeColumn[];
        if (columns.length == 0)
            return Weave.lang('Line chart');

        return Weave.lang("Line chart of {0}", columns.map(column=>weavejs.data.ColumnUtils.getTitle(column)).join(Weave.lang(", ")));
    }

    //todo:(linkFunction)find a better way to link to sidebar UI for selectbleAttributes
    renderEditor(linkFunction:Function):JSX.Element{
        return (<VBox>
            {super.renderEditor(linkFunction)}
        </VBox>);
    };

    get deprecatedStateMapping()
	{
		return [super.deprecatedStateMapping, {
            "children": {
                "visualization": {
                    "plotManager": {
                        "plotters": {
                            "plot": {
                                "filteredKeySet": this.filteredKeySet,
                                "columns": this.columns,
                                "curveType": this.curveType,
                                "lineStyle": this.line,

                                "enableGroupBy": false,
                                "groupKeyType": "",
                                "normalize": false,
                                "shapeBorderAlpha": 0.5,
                                "shapeBorderColor": 0,
                                "shapeBorderThickness": 1,
                                "shapeSize": 5,
                                "shapeToDraw": "Solid Circle",
                                "zoomToSubset": false
                            }
                        }
                    }
                }
            }
        }];
	}
}

Weave.registerClass(
	C3LineChart,
	["weavejs.tool.C3LineChart", "weave.visualization.tools::LineChartTool"],
	[weavejs.api.ui.IVisTool_Basic, weavejs.api.core.ILinkableObjectWithNewProperties],
	"Line Chart"
);
