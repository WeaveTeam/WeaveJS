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
import {MouseEvent} from "react";
import ToolTip from "./ToolTip";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import LinkableString = weavejs.core.LinkableString;
import DynamicColumn = weavejs.data.column.DynamicColumn;

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

    private busy:boolean;
    private dirty:boolean;

    protected c3ConfigYAxis:c3.YAxisConfiguration;

    constructor(props:IVisToolProps)
    {
        super(props);

        Weave.getCallbacks(this.selectionFilter).addGroupedCallback(this, this.handleKeyFilters);
        Weave.getCallbacks(this.probeFilter).addGroupedCallback(this, this.handleKeyFilters);

        this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
        this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
        this.probeFilter.targetPath = ['defaultProbeKeySet'];

        this.keyToIndex = {};
        this.yAxisValueToLabel = {};
        this.validate = _.debounce(this.validate.bind(this), 30);

        this.c3ConfigYAxis = {
            show: true,
            tick: {
                multiline: true,
                format: (num:number):string => {
					var columns = this.columns.getObjects(IAttributeColumn);
                    if (columns[0] && columns[0].getMetadata('dataType') !== "number")
                    {
                        return this.yAxisValueToLabel[num] || "";
                    }
                    else
                    {
                        return String(FormatUtils.defaultNumberFormatting(num));
                    }
                }
            }
        }

        this.mergeConfig({
            data: {
                columns: [],
                xSort: false,
                selection: {
                    enabled: true,
                    multiple: true,
                    draggable: true
                },
                onmouseover: (d:any) => {
					var record = this.getRecord(d ? d.id : null);
					if (!record)
						return;
					var key = record.id;
                    this.probeKeySet.replaceKeys([key]);
                    this.props.toolTip.setState({
                        x: this.chart.internal.d3.event.pageX,
                        y: this.chart.internal.d3.event.pageY,
                        showToolTip: true,
                        columnNamesToValue: ToolTip.getToolTipData(this, [key], this.columns.getObjects(IAttributeColumn))
                    });
                },
                onmouseout: (d:any) => {
					if (!d)
						return;

                    this.probeKeySet.replaceKeys([]);
                    this.props.toolTip.setState({
                        showToolTip: false
                    });
                }
            },
            tooltip: {
                show: false
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            axis: {
                x: {
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
                                return this.columnLabels[temp-d];
                            }
                            else
                            {
                                return this.columnLabels[d];
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

	private getRecord(id:string):Record
	{
		return this.records[this.keyToIndex[id]];
	}

	protected handleC3Render():void
	{
        this.busy = false;
        this.handleKeyFilters();
        if (this.dirty)
            this.validate();
	}
								
	protected handleC3Selection():void
	{
		if (!this.selectionKeySet)
			return;
		
		var set_selectedKeys = new Set<IQualifiedKey>();
		var selectedKeys:IQualifiedKey[] = [];
		for (var d of this.chart.selected())
		{
			var record = this.getRecord(d.id);
			if (record && !set_selectedKeys.has(record.id))
			{
				set_selectedKeys.add(record.id);
				selectedKeys.push(record.id);
			}
		}
		this.selectionKeySet.replaceKeys(selectedKeys);
	}
	
	private handleKeyFilters()
	{
		if (this.chart && Weave.detectChange(this, this.selectionFilter))
		{
			if (this.selectionKeySet)
				this.chart.select(this.selectionKeySet.keys.map(key => key.toString()), null, true);
		}
		this.updateStyle();
	}

	private updateStyle()
	{
		if (!this.chart)
			return;
		
        let selectionEmpty: boolean = !this.selectionKeySet || this.selectionKeySet.keys.length === 0;

        d3.select(this.element).selectAll("circle")
            .style("opacity",
                (d: any, i: number, oi: number): number => {
					let record = this.getRecord(d.id);
					let key = record ? record.id : null;
                    let selected = this.isSelected(key);
                    let probed = this.isProbed(key);
					if (selected || probed)
						return 1;
					return selectionEmpty ? 1 : 0;
                })
            .style("stroke", "black")
            .style("stroke-opacity", 0.0);
		
        d3.select(this.element)
            .selectAll("path.c3-shape.c3-line")
            .style("opacity",
                (d: any, i: number, oi: number): number => {
                    let key = this.records[i].id;
                    let selected = this.isSelected(key);
                    let probed = this.isProbed(key);
                    return (selectionEmpty || selected || probed) ? 1.0 : 0.3;
                })
            .style("stroke-width",
                (d: any, i: number, oi: number): number => {
                    let key = this.records[i].id;
                    let selected = this.isSelected(key);
                    let probed = this.isProbed(key);
                    return probed ? 3 : (selected ? 2 : 1);
                });
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
        var axisChange:boolean = Weave.detectChange(this, this.columns, this.overrideBounds);
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

            this.chartType= "line";
            if (this.curveType.value === "double")
            {
                this.chartType = "spline";
            }
        }
        if (axisChange)
        {
            changeDetected = true;
            var xLabel:string = " ";//this.paths.xAxis.push("overrideAxisName").getState() || this.paths.dataX.getObject().getMetadata('title');
            var yLabel:string = " ";//this.paths.yAxis.push("overrideAxisName").getState() || this.paths.dataY.getObject().getMetadata('title');

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
        {
            this.busy = true;
            
			if (dataChanged)
                this.c3Config.data.columns = _.map(this.records, 'columns') as any;
			
			if (colors)
				this.c3Config.data.colors = colors;
			
            this.c3Config.data.type = this.chartType;
            this.c3Config.data.unload = true;
            c3.generate(this.c3Config);
            this.cullAxes();
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

Weave.registerClass("weavejs.tool.C3LineChart", C3LineChart, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::LineChartTool", C3LineChart);
