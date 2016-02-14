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
import {getTooltipContent} from "./tooltip";
import Tooltip from "./tooltip";
import StandardLib from "../utils/StandardLib";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import LinkableString = weavejs.core.LinkableString;
import ReferencedColumn = weavejs.data.column.ReferencedColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;

declare type Record = {
    id: IQualifiedKey,
    columns: IAttributeColumn[],
    line: {color: string }
};


export default class WeaveC3LineChart extends AbstractC3Tool {

    columns:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
    line:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
    curveType:LinkableString = Weave.linkableChild(this, LinkableString);

    private RECORD_FORMAT = {
        id: IQualifiedKey,
        columns: this.columns.getObjects(),
        line: { color: this.line.color }
    };

    private RECORD_DATATYPE = {
        columns: Number,
        line: { color:String }
    };

    private keyToIndex:{[key:string]: number};
    private indexToKey:{[index:number]: IQualifiedKey};
    private yAxisValueToLabel:{[value:number]: string};

    private records:Record[];
    private columnLabels:string[];
    private columnNames:string[];
    private chartType:string;

    private flag:boolean;
    private busy:boolean;
    private dirty:boolean;

    protected chart:ChartAPI;
    protected c3Config:ChartConfiguration;
    protected c3ConfigYAxis:c3.YAxisConfiguration;

    constructor(props:IVisToolProps) {
        super(props);

        Weave.getCallbacks(this.selectionFilter).addGroupedCallback(this, this.updateStyle);
        Weave.getCallbacks(this.probeFilter).addGroupedCallback(this, this.updateStyle);

        Weave.getCallbacks(this).addGroupedCallback(this, this.validate, true);

        this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
        this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
        this.probeFilter.targetPath = ['defaultProbeKeySet'];

        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};
        this.validate = _.debounce(this.validate.bind(this), 30);

        this.c3ConfigYAxis = {
            show: true,
            tick: {
                multiline: true,
                format: (num:number):string => {
                    if(this.columns.getObjects()[0] && this.columns.getObjects()[0].getMetadata('dataType') !== "number") {
                        return this.yAxisValueToLabel[num] || "";
                    } else {
                        return String(FormatUtils.defaultNumberFormatting(num));
                    }
                }
            }
        }

        this.c3Config = {
            size: {
                width: this.props.style.width,
                height: this.props.style.height
            },
            padding: {
                top: 20,
                bottom: 0,
                left:100,
                right:20
            },
            data: {
                columns: [],
                xSort: false,
                selection: {
                    enabled: true,
                    multiple: true,
                    draggable: true
                },
                onclick: (d:any) => {
                    var event:MouseEvent = this.chart.internal.d3.event as MouseEvent;
                    if(!(event.ctrlKey || event.metaKey) && d && d.hasOwnProperty("index")) {
                        this.selectionKeySet.replaceKeys([d.id]);
                    }
                },
                onselected: (d:any) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        this.selectionKeySet.addKeys([d.id]);
                    }
                },
                onunselected: (d:any) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        this.selectionKeySet.removeKeys([d.id]);
                    }
                },
                onmouseover: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.probeKeySet.replaceKeys([d.id]);
                    }

                    var columnNamesToValue:{[columnName:string] : string|number } = {};
                    var lineIndex:number = _.findIndex(this.records, (record:Record) => {
                        return record.id == d.id;
                    });

                    this.columnLabels.forEach( (label:string,index:number,array:any[]) => {
                        if(this.records && this.records[lineIndex]) {
                            //columnNamesToValue[label] = this.records[lineIndex].columns[index].getValueFromKey(this.records[lineIndex].id);
                            columnNamesToValue[label] = this.columns.getObjects()[index].getValueFromKey(this.records[lineIndex].id);
                        }
                    });

                    this.props.toolTip.setState({
                        x: this.chart.internal.d3.event.pageX,
                        y: this.chart.internal.d3.event.pageY,
                        showToolTip: true,
                        columnNamesToValue: columnNamesToValue
                    });
                },
                onmouseout: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.probeKeySet.replaceKeys([]);
                        this.props.toolTip.setState({
                            showToolTip: false
                        });
                    }
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
                            if(weavejs.WeaveAPI.Locale.reverseLayout){
                                //handle case where labels need to be reversed
                                var temp:number = this.columnLabels.length-1;
                                return this.columnLabels[temp-d];
                            }else{
                                return this.columnLabels[d];
                            }
                        }
                    }
                }
            },
            bindto: null,
            legend: {
                show: false
            },
            onrendered: () => {
                this.busy = false;
                this.updateStyle();
                if (this.dirty)
                    this.validate();
            }
        };
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

    handleClick(event:MouseEvent):void {
        if(!this.flag) {
            if(this.selectionKeySet)
                this.selectionKeySet.replaceKeys([]);
        }
        this.flag = false;
    }

    private updateStyle() {
        if(!this.chart)
            return;

        d3.select(this.element).selectAll("circle").style("opacity", 1)
            .style("stroke", "black")
            .style("stroke-opacity", 0.0);

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

        var unselectedIndices = _.difference(indices, selectedIndices);
        unselectedIndices = _.difference(unselectedIndices,probedIndices);
        if(probedIndices.length){
            //unfocus all circles
            //d3.select(this.element).selectAll("circle").filter(".c3-shape").style({opacity: 0.1, "stroke-opacity": 0.0});

            var filtered = d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape");
            probedIndices.forEach( (index:number) => {
                //custom style for circles on probed lines
                var circleCount:number = filtered[index] ? filtered[index].length : 0;
                var probedCircles:number[] = _.range(0,circleCount);
                probedCircles.forEach( (i:number) => {
                    (filtered[index][i] as HTMLElement).style.opacity = "1.0";
                    (filtered[index][i] as HTMLElement).style.strokeOpacity = "0.0";
                });
            });
            this.customStyle(probedIndices, "path", ".c3-shape.c3-line", {opacity: 1.0});
        }
        if(selectedIndices.length) {
            //unfocus all circles
            d3.select(this.element).selectAll("circle").filter(".c3-shape").style("opacity", "0.1");

            var filtered = d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape");
            selectedIndices.forEach( (index:number) => {
                //custom style for circles on selected lines
                var circleCount = filtered[index] ? filtered[index].length : 0;
                var selectedCircles = _.range(0,circleCount);
                selectedCircles.forEach( (i:number) => {
                    (filtered[index][i] as HTMLElement).style.opacity = "1.0";
                    (filtered[index][i] as HTMLElement).style.strokeOpacity = "1.0";
                });
            });

            this.customStyle(unselectedIndices, "path", ".c3-shape.c3-line", {opacity: 0.1});
            this.customStyle(selectedIndices, "path", ".c3-shape.c3-line", {opacity: 1.0});
            this.chart.select(["y"], selectedIndices, true);
        }else if(!probedIndices.length){
            //focus all circles
            d3.select(this.element).selectAll("circle").filter(".c3-shape").style({opacity: 1.0, "stroke-opacity": 0.0});
            this.customStyle(indices, "path", ".c3-shape.c3-line", {opacity: 1.0});
            this.chart.select(["y"], [], true);
        }
    }

    componentDidUpdate() {
        var sizeChanged = this.c3Config.size.width != this.props.style.width || this.c3Config.size.height != this.props.style.height;
        super.componentDidUpdate();
        if(sizeChanged)
            this.validate(true);
    }

    componentWillUnmount() {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
        this.chart.destroy();
    }

    componentDidMount() {
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

        var changeDetected:boolean = false;
        var axisChange:boolean = Weave.detectChange(this, this.columns, this.overrideYMax);
        if (axisChange || Weave.detectChange(this, this.curveType, this.line, this.filteredKeySet))
        {
            changeDetected = true;
            this.columnLabels = [];
            this.columnNames = [];

            var children:ReferencedColumn[] = this.columns.getObjects();
            this.RECORD_FORMAT.columns = children;
            this.filteredKeySet.setColumnKeySources(children);

            this.columnNames = this.columns.getNames();

            for (let idx in children) {
                let child = children[idx];
                let title = child.getMetadata('title');
                this.columnLabels.push(title);
            }

            this.records = weavejs.data.ColumnUtils.getRecords(this.RECORD_FORMAT, this.filteredKeySet.keys, this.RECORD_DATATYPE);
            this.records = _.sortBy(this.records, [0, "id"]);

            this.keyToIndex = {};
            this.indexToKey = {};
            this.yAxisValueToLabel = {};

            this.records.forEach((record:Record, index:number) => {
                this.keyToIndex[record.id as any] = index;
                this.indexToKey[index] = record.id;
                this.yAxisValueToLabel[record.id as any] = record.id.toString();
            });

            var columns = this.records.map(function(record:Record) {
                var tempArr:any[] = [];
                tempArr.push(record["id"]);
                _.keys(record.columns).forEach((key:string) => {
                    var value = record.columns[key as any];
                    if(value) {
                        tempArr.push(record.columns[key as any]);
                    }
                });
                return tempArr;
            });

            var colors:{[key:string]: string} = {};
            this.records.forEach((record:Record) => {
                colors[record.id as any] = record.line.color || "#C0CDD1";
            });

            this.chartType= "line";
            if(this.curveType.value === "double") {
                this.chartType = "spline";
            }

            if(weavejs.WeaveAPI.Locale.reverseLayout){
                columns.forEach( (column:any[], index:number, array:any) => {
                    var temp:any[] = [];
                    temp.push(column.shift());
                    column = column.reverse();
                    column.forEach( (item:any) => {
                        temp.push(item);
                    });
                    array[index] = temp;
                });
            }
        }
        if (axisChange)
        {
            changeDetected = true;
            var xLabel:string = " ";//this.paths.xAxis.push("overrideAxisName").getState() || this.paths.dataX.getObject().getMetadata('title');
            var yLabel:string = " ";//this.paths.yAxis.push("overrideAxisName").getState() || this.paths.dataY.getObject().getMetadata('title');


            if (this.records)
            {
                var temp:any =  {};
                if (weavejs.WeaveAPI.Locale.reverseLayout)
                {
                    this.records.forEach( (record:Record) => {
                        temp[record["id"].toString()] = 'y2';
                    });
                    this.c3Config.data.axes = temp;
                    this.c3Config.axis.y2 = this.c3ConfigYAxis;
                    this.c3Config.axis.y = {show: false};
                    this.c3Config.axis.x.tick.rotate = 45;
                }
                else
                {
                    this.records.forEach( (record:Record) => {
                        temp[record["id"].toString()] = 'y';
                    });
                    this.c3Config.data.axes = temp;
                    this.c3Config.axis.y = this.c3ConfigYAxis;
                    delete this.c3Config.axis.y2;
                    this.c3Config.axis.x.tick.rotate = -45;
                }
            }

            this.c3Config.axis.x.label = {text:xLabel, position:"outer-center"};
            this.c3ConfigYAxis.label = {text:yLabel, position:"outer-middle"};

            this.c3Config.padding.top =  this.margin.top.value;
            this.c3Config.axis.x.height =  this.margin.bottom.value;
            if(weavejs.WeaveAPI.Locale.reverseLayout){
                this.c3Config.padding.left =  this.margin.right.value;
                this.c3Config.padding.right = this.margin.left.value;
            }else{
                this.c3Config.padding.left = this.margin.left.value;
                this.c3Config.padding.right = this.margin.right.value;
            }

            if(!isNaN(this.overrideYMax.value)) {
                this.c3Config.axis.y.max = this.overrideYMax.value;
            } else {
                this.c3Config.axis.y.max = null;
            }
        }

        if (changeDetected || forced)
        {
            this.busy = true;
            if(columns) {
                this.c3Config.data.columns = columns;
            }
			if(colors) {
				this.c3Config.data.colors = colors;
			}
            this.c3Config.data.type = this.chartType;
            this.c3Config.data.unload = true;
            this.chart = c3.generate(this.c3Config);
            this.cullAxes();
        }
    }
}

Weave.registerClass("weavejs.tool.C3LineChart", WeaveC3LineChart, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::LineChartTool", WeaveC3LineChart);
