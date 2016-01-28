///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/WeavePath.d.ts"/>

import {IVisToolProps} from "./IVisTool";
import {IToolPaths} from "./AbstractC3Tool";
import AbstractC3Tool from "./AbstractC3Tool";
import {registerToolImplementation} from "../WeaveTool";
import * as d3 from "d3";
import * as _ from "lodash";
import FormatUtils from "../utils/FormatUtils";
import * as React from "react";
import * as c3 from "c3";
import {ChartConfiguration, ChartAPI} from "c3";
import {MouseEvent} from "react";
import {getTooltipContent} from "./tooltip";
import Tooltip from "./tooltip";
import StandardLib from "../utils/StandardLib";

interface ILineChartPaths extends IToolPaths {
    plotter: WeavePath;
    columns: WeavePath;
    lineStyle: WeavePath;
    curveType: WeavePath;
    marginTop: WeavePath;
    marginBottom: WeavePath;
    marginLeft: WeavePath;
    marginRight: WeavePath;
    filteredKeySet: WeavePath;
    selectionKeySet: WeavePath;
    probeKeySet: WeavePath;
}

class WeaveC3LineChart extends AbstractC3Tool {
    private keyToIndex:{[key:string]: number};
    private indexToKey:{[index:number]: string};
    private yAxisValueToLabel:{[value:number]: string};
    private colors:{[id:string]: string};
    private yLabelColumnPath:WeavePath;
    private numericRecords:Record[];
    private stringRecords:Record[];
    private records:Record[][];
    private columnLabels:string[];
    private columnNames:string[];
    private columns:any;
    private chartType:string;

    private flag:boolean;
    private busy:boolean;
    private dirty:boolean;

    protected chart:ChartAPI;
    protected c3Config:ChartConfiguration;
    protected c3ConfigYAxis:c3.YAxisConfiguration;

    protected paths:ILineChartPaths;

    constructor(props:IVisToolProps) {
        super(props);
        this.busy = false;
        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};
        this.columns = [];
        this.validate = _.debounce(this.validate.bind(this), 30);

        this.c3ConfigYAxis = {
            show: true,
            tick: {
                multiline: true,
                format: (num:number):string => {
                    if(this.yLabelColumnPath && this.yLabelColumnPath.getValue("this.getMetadata('dataType')") !== "number") {
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
                        this.toolPath.selection_keyset.setKeys([d.id]);
                    }
                },
                onselected: (d:any) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.addKeys([d.id]);
                    }
                },
                onunselected: (d:any) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.removeKeys([d.id]);
                    }
                },
                onmouseover: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([d.id]);
                    }

                    var columnNamesToValue:{[columnName:string] : string|number } = {};
                    var lineIndex:number = _.findIndex(this.numericRecords, (record) => {
                        return record["id"].toString() == d.id;
                    });

                    this.columnLabels.forEach( (label:string,index:number,array:any[]) => {
                        if(this.numericRecords && this.numericRecords[lineIndex]) {
                            columnNamesToValue[label] = this.numericRecords[lineIndex]["columns"][index] as number;
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
                        this.toolPath.probe_keyset.setKeys([]);
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

    protected handleMissingSessionStateProperties(newState:any)
	{

	}

    get internalWidth():number {
        return this.props.style.width - this.c3Config.padding.left - this.c3Config.padding.right;
    }

    private updateStyle() {
        if(!this.chart)
            return;

        d3.select(this.element).selectAll("circle").style("opacity", 1)
            .style("stroke", "black")
            .style("stroke-opacity", 0.0);

        var selectedKeys:string[] = this.toolPath.selection_keyset.getKeys();
        var probedKeys:string[] = this.toolPath.probe_keyset.getKeys();
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

    private dataChanged() {
        this.columnLabels = [];
        this.columnNames = [];

        var children:WeavePath[] = this.paths.columns.getChildren();

        this.yLabelColumnPath = children[0];

        let numericMapping:any = {
            columns: children,
            yLabel: this.yLabelColumnPath
        };


        let stringMapping:any = {
            columns: children,
            line: {
                //alpha: this._lineStylePath.push("alpha"),
                color: this.paths.lineStyle.push("color")
                //caps: this._lineStylePath.push("caps")
            },
            yLabel: this.yLabelColumnPath
        };

        for (let idx in children) {
            let child = children[idx];
            let title = child.getObject().getMetadata('title');
            let name = child.getPath().pop();
            this.columnLabels.push(title);
            this.columnNames.push(name);
        }

        this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.records = _.zip(this.numericRecords, this.stringRecords);
        this.records = _.sortBy(this.records, [0, "id"]);

        if(this.records.length)
            [this.numericRecords, this.stringRecords] = _.unzip(this.records);

        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};

        this.numericRecords.forEach((record:Record, index:number) => {
            this.keyToIndex[record["id"] as string] = index;
            this.indexToKey[index] = record["id"] as string;
        });

        this.stringRecords.forEach((record, index) => {
            var numericRecord = this.numericRecords[index];
            this.yAxisValueToLabel[numericRecord["yLabel"] as number] = record["yLabel"] as string;
        });

        this.columns = this.numericRecords.map(function(record:Record) {
            var tempArr:any[] = [];
            tempArr.push(record["id"]);
            _.keys(record["columns"]).forEach((key:string) => {
                tempArr.push((record["columns"] as Record)[key]);
            });
            return tempArr;
        });

        this.colors = {};
        this.stringRecords.forEach((record:Record) => {
            this.colors[record["id"] as string] = ((record["line"] as Record)["color"] as string) || "#C0CDD1";
        });

        this.chartType= "line";
        if(this.paths.plotter.push("curveType").getState() === "double") {
            this.chartType = "spline";
        }

        if(weavejs.WeaveAPI.Locale.reverseLayout){
            this.columns.forEach( (column:any[], index:number, array:any) => {
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

    componentWillUnmount() {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
        this.chart.destroy();
    }

    componentDidMount() {
        this.element.addEventListener("click", this.handleClick.bind(this));

        var plotterPath:WeavePath = this.toolPath.pushPlotter("plot");
        var mapping = [
            { name: "plotter", path: plotterPath, callbacks: this.validate},
            { name: "columns", path: plotterPath.push("columns") },
            { name: "lineStyle", path: plotterPath.push("lineStyle") },
            { name: "curveType", path: plotterPath.push("curveType") },
            { name: "marginBottom", path: this.plotManagerPath.push("marginBottom") },
            { name: "marginLeft", path: this.plotManagerPath.push("marginLeft") },
            { name: "marginTop", path: this.plotManagerPath.push("marginTop") },
            { name: "marginRight", path: this.plotManagerPath.push("marginRight") },
            { name: "filteredKeySet", path: plotterPath.push("filteredKeySet") },
            { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: this.updateStyle },
            { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: this.updateStyle }
        ];

        this.initializePaths(mapping);

       	this.paths.filteredKeySet.getObject().setColumnKeySources(this.paths.columns.getObject().getObjects());

        this.c3Config.bindto = this.element;
        this.validate(true);
    }

    handleClick(event:MouseEvent):void {
        if(!this.flag) {
            this.toolPath.selection_keyset.setKeys([]);
        }
        this.flag = false;
    }

    componentDidUpdate() {
        if(this.c3Config.size.width != this.props.style.width || this.c3Config.size.height != this.props.style.height) {
            this.c3Config.size = {width: this.props.style.width, height: this.props.style.height};
            this.validate(true);
        }
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
        var axisChange:boolean = this.detectChange('columns');
        if (axisChange || this.detectChange('plotter', 'curveType', 'lineStyle','filteredKeySet'))
        {
            changeDetected = true;
            this.dataChanged();
        }
        if (axisChange)
        {
            changeDetected = true;
            var xLabel:string = " ";//this.paths.xAxis.push("overrideAxisName").getState() || this.paths.dataX.getObject().getMetadata('title');
            var yLabel:string = " ";//this.paths.yAxis.push("overrideAxisName").getState() || this.paths.dataY.getObject().getMetadata('title');


            if (this.numericRecords)
            {
                var temp:any =  {};
                if (weavejs.WeaveAPI.Locale.reverseLayout)
                {
                    this.stringRecords.forEach( (record) => {
                        temp[record["id"].toString()] = 'y2';
                    });
                    this.c3Config.data.axes = temp;
                    this.c3Config.axis.y2 = this.c3ConfigYAxis;
                    this.c3Config.axis.y = {show: false};
                    this.c3Config.axis.x.tick.rotate = 45;
                }
                else
                {
                    this.stringRecords.forEach( (record) => {
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

            this.c3Config.padding.top = Number(this.paths.marginTop.getState());
            this.c3Config.axis.x.height = Number(this.paths.marginBottom.getState());
            if(weavejs.WeaveAPI.Locale.reverseLayout){
                this.c3Config.padding.left = Number(this.paths.marginRight.getState());
                this.c3Config.padding.right = Number(this.paths.marginLeft.getState());
            }else{
                this.c3Config.padding.left = Number(this.paths.marginLeft.getState());
                this.c3Config.padding.right = Number(this.paths.marginRight.getState());
            }
        }

        // axis label culling requires this.chart.internal.width
        if (this.chart)
        {
            var width:number = this.internalWidth;
            var textHeight:number = StandardLib.getTextHeight("test", "14pt Helvetica Neue");
            var xLabelsToShow:number = Math.floor(width / textHeight);
            xLabelsToShow = Math.max(2,xLabelsToShow);
            this.c3Config.axis.x.tick.culling = {max: xLabelsToShow};
        }

        if (changeDetected || forced)
        {
            this.busy = true;
            this.chart = c3.generate(this.c3Config);
            this.loadData();
        }
    }

    loadData() {
        if(!this.chart || this.busy)
            return StandardLib.debounce(this, 'loadData');
        this.chart.load({columns: this.columns, colors: this.colors, type: this.chartType, unload: true});
    }
}




export default WeaveC3LineChart;

registerToolImplementation("weave.visualization.tools::LineChartTool", WeaveC3LineChart);
//Weave.registerClass("weavejs.tools.LineChartTool", WeaveC3LineChart, [weavejs.api.core.ILinkableObjectWithNewProperties]);
