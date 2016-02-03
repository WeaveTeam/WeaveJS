///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>

import {IVisToolProps} from "./IVisTool";
import {IToolPaths} from "./AbstractC3Tool";
import AbstractC3Tool from "./AbstractC3Tool";
import {registerToolImplementation} from "../WeaveTool";
import * as _ from "lodash";
import * as d3 from "d3";
import FormatUtils from "../utils/FormatUtils";
import * as React from "react";
import * as c3 from "c3";
import {ChartConfiguration, ChartAPI} from "c3";
import StandardLib from "../utils/StandardLib";

import IQualifiedKey = weavejs.api.data.IQualifiedKey;

interface IBarchartPaths extends IToolPaths {
    heightColumns: WeavePath;
    labelColumn: WeavePath;
    sortColumn: WeavePath;
    colorColumn: WeavePath;
    chartColors: WeavePath;
    groupingMode: WeavePath;
    horizontalMode: WeavePath;
    showValueLabels: WeavePath;
}

class WeaveC3Barchart extends AbstractC3Tool {

    private keyToIndex:{[key:string]: number};
    private indexToKey:{[index:number]: IQualifiedKey};
    private xAxisValueToLabel:{[value:number]: string};
    private yAxisValueToLabel:{[value:number]: string};
    private yLabelColumnDataType:string;
    private groupingMode:string;
    private heightColumnNames:string[];
    private heightColumnsLabels:string[];
    private stringRecords:Record[];
    private numericRecords:Record[];
    private records:Record[][];
    private colorRamp:string[];
    private showValueLabels:boolean;
    private showXAxisLabel:boolean;
    private yLabelColumnPath:WeavePath;
    protected c3Config:ChartConfiguration;
    protected c3ConfigYAxis:c3.YAxisConfiguration;
    protected chart:ChartAPI;

    protected paths:IBarchartPaths;

    private busy:boolean;
    private dirty:boolean;

    constructor(props:IVisToolProps) {
        super(props);
        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};
        this.xAxisValueToLabel = {};
        this.validate = _.debounce(this.validate.bind(this), 30);

        this.c3Config = {
            size: {
                width: this.props.style.width,
                height: this.props.style.height
            },
            padding: {
                top: 20,
                bottom: 0,
                left: 100,
                right: 20
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
                        if(this.showValueLabels) {
                            return v;
                        } else {
                            return "";
                        }
                    }
                },
                order: null,
                color: (color:string, d:any):string => {
                    if(this.heightColumnNames.length === 1 && d.hasOwnProperty("index")) {

                        // find the corresponding index of numericRecords in stringRecords
                        var id = this.indexToKey[d.index];
                        var index = _.pluck(this.stringRecords, "id").indexOf(id);
                        return this.stringRecords[index] ? this.stringRecords[index]["color"] as string : "#C0CDD1";
                    } else {
                        return color || "#C0CDD1";
                    }
                },
                onclick: (d:any) => {
                },
                onselected: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.addKeys([this.indexToKey[d.index]]);
                    }
                },
                onunselected: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.removeKeys([this.indexToKey[d.index]]);
                    }
                },
                onmouseover: (d:any) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([]);
                        var columnNamesToValue:{[columnName:string] : string|number } = {};
                        var columnNamesToColor:{[columnName:string] : string} = {};
                        this.heightColumnNames.forEach( (column:string, index:number) => {
                            columnNamesToValue[this.heightColumnsLabels[index]] = this.numericRecords[d.index]['heights'][column] as number;
                            if(this.heightColumnNames.length > 1) {
                                var color = StandardLib.interpolateColor(index / (this.heightColumnNames.length - 1), this.colorRamp);
                                columnNamesToColor[this.heightColumnsLabels[index]] = "#" + StandardLib.decimalToHex(color);
                            }
                        });
                        var title:string = this.stringRecords[d.index]["xLabel"] as string;

                        this.props.toolTip.setState({
                            x: this.chart.internal.d3.event.pageX,
                            y: this.chart.internal.d3.event.pageY,
                            showToolTip: true,
                            title: title,
                            columnNamesToValue: columnNamesToValue,
                            columnNamesToColor: columnNamesToColor
                        });
                        this.toolPath.probe_keyset.setKeys([this.indexToKey[d.index]]);
                    }
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
            axis: {
                x: {
                    type: "category",
                    label: {
                        text: "",
                        position: "outer-center"
                    },
                    tick: {
                        rotate: -45,
                        culling: {
                            max: null
                        },
                        multiline: false,
                        format: (num:number):string => {
                            if(this.stringRecords && this.stringRecords[num]) {
                                if(this.element && this.props.style.height > 0 && this.paths.marginBottom) {
                                    var labelHeight:number = Number(this.paths.marginBottom.getState())/Math.cos(45*(Math.PI/180));
                                    var labelString:string = (this.stringRecords[num]["xLabel"] as string);
                                    if(labelString) {
                                        var stringSize:number = StandardLib.getTextWidth(labelString, this.getFontString());
                                        var adjustmentCharacters:number = labelString.length - Math.floor(labelString.length * (labelHeight / stringSize));
                                        return adjustmentCharacters > 0 ? labelString.substring(0, labelString.length - adjustmentCharacters - 3) + "..." : labelString;
                                    }else{
                                        return "";
                                    }
                                }else {
                                    return this.stringRecords[num]["xLabel"] as string;
                                }
                            } else {
                                return "";
                            }
                        }
                    }
                },
                rotated: false
            },
            tooltip: {
                format: {
                    title: (num:number):string => {
                        if(this.stringRecords && this.stringRecords[num]) {
                            return this.stringRecords[num]["xLabel"] as string;
                        }else{
                            return "";
                        }
                    },
                    name: (name:string, ratio:number, id:string, index:number):string => {
                        var labelIndex:number = this.heightColumnNames.indexOf(name);
                        return (this.heightColumnsLabels ? this.heightColumnsLabels[labelIndex] : "");
                    }
                },
                show: false
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
                    if(this.yLabelColumnPath && this.yLabelColumnDataType !== "number") {
                        return this.yAxisValueToLabel[num] || "";
                    } else if (this.groupingMode === "percentStack") {
                        return d3.format(".0%")(num);
                    } else {
                        return String(FormatUtils.defaultNumberFormatting(num));
                    }
                }
            }
        };
    }

    protected handleMissingSessionStateProperties(newState:any)
	{

	}

    handlePointClick(event:MouseEvent):void {
        var probeKeys:any[] = this.toolPath.probe_keyset.getKeys();
        var selectionKeys:any[] = this.toolPath.selection_keyset.getKeys();
        if (_.isEqual(probeKeys, selectionKeys))
            this.toolPath.selection_keyset.setKeys([]);
        else
            this.toolPath.selection_keyset.setKeys(probeKeys);
    }

    handleShowValueLabels () {
        if(!this.chart)
            return;
        this.showValueLabels = this.paths.showValueLabels.getState();
        this.chart.flush();
    }

    private dataChanged():void
	{
        var lhm = this.paths.heightColumns.getObject();
        var columns = lhm.getObjects();
        var names = lhm.getNames();

		// the y label column is the first column in heightColumns
		this.yLabelColumnPath = Weave.getPath(columns[0]);

        var numericMapping:any = {
            sort: this.paths.sortColumn,
            xLabel: this.paths.labelColumn,
			heights: {},
			yLabel: this.yLabelColumnPath
        };

        var stringMapping:any = {
            sort: this.paths.sortColumn,
            color: this.paths.colorColumn,
            xLabel: this.paths.labelColumn,
			yLabel: this.yLabelColumnPath
        };

        this.heightColumnNames = [];
        this.heightColumnsLabels = [];

        for (let idx in columns)
        {
            let column = columns[idx];
            let name = names[idx];
            let title = column.getMetadata('title');

            this.heightColumnsLabels.push(title);
            this.heightColumnNames.push(name);
			numericMapping.heights[name] = column;
        }

        this.yLabelColumnDataType = this.yLabelColumnPath.getObject().getMetadata('dataType');

        this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        if(!this.numericRecords.length)
            return;
        this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.records = _.zip(this.numericRecords, this.stringRecords);
        //this.records = _.sortByOrder(this.records, ["sort", "id"], ['asc', 'asc']);
        this.records = _.sortBy(this.records, (record) =>{
            return record[0]["sort"];
        });
        if(weavejs.WeaveAPI.Locale.reverseLayout) {
            this.records = this.records.reverse();
        }

        if(this.records.length)
            [this.numericRecords, this.stringRecords] = _.unzip(this.records);

        this.yAxisValueToLabel = {};
        this.xAxisValueToLabel = {};
        this.keyToIndex = {};
        this.indexToKey = {};

        this.numericRecords.forEach((record:Record, index:number) => {
            if(record) {
                this.keyToIndex[record.id as any] = index;
                this.indexToKey[index] = record.id;
            }
        });


        this.stringRecords.forEach((record:Record, index:number) => {
            var numericRecord:Record = this.numericRecords[index];
            if(numericRecord) {
                this.yAxisValueToLabel[numericRecord["yLabel"] as number] = record["yLabel"] as string;
                this.xAxisValueToLabel[numericRecord["xLabel"] as number] = record["xLabel"] as string;
            }
        });

        this.groupingMode = this.paths.groupingMode.getState();
        //var horizontalMode = this.paths.plotter.push("horizontalMode").getState();

        // set axis rotation mode
        //this.chart.load({axes: { rotated: horizontalMode }});

        if (this.groupingMode === "stack" || this.groupingMode === "percentStack")
            this.c3Config.data.groups = [this.heightColumnNames];
        else //if(this.groupingMode === "group")
            this.c3Config.data.groups = [];

        if(this.groupingMode === "percentStack" && this.heightColumnNames.length > 1) {
            // normalize the height columns to be percentages.
            this.numericRecords.forEach((record:Record) => {
                var heights:{[key:string]: number};
                if (record) {
                    heights = record['heights'] as {[key:string]: number};
                    var sum:number = 0;
					for (let key in heights)
						sum += heights[key];
					for (let key in heights)
						heights[key] /= sum;
                }
				record['heights'] = heights;
            });
        }

        interface Keys {x:string, value:string[]};
        var keys:Keys = {x:"", value:[]};
        // if label column is specified
        if(this.paths.labelColumn.getState().length) {
            keys.x = "xLabel";
        }

        keys.value = this.heightColumnNames;
        var columnColors:{[name:string]: string} = {};
        var columnTitles:{[name:string]: string} = {};

        if(this.heightColumnNames.length > 1) {
            this.colorRamp = this.paths.chartColors.getState();
            this.heightColumnNames.map((name, index) => {
                var color = StandardLib.interpolateColor(index / (this.heightColumnNames.length - 1), this.colorRamp);
                columnColors[name] = "#" + StandardLib.decimalToHex(color);
                columnTitles[name] = this.heightColumnsLabels[index];
            });
            //this.c3Config.legend.show = true;
        }

        var data = _.cloneDeep(this.c3Config.data);
        data.json = _.pluck(this.numericRecords, 'heights');
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
        var unselectedIndices:number[] = _.difference(indices,selectedIndices);
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
        this.showXAxisLabel = false;

        var plotterPath = this.toolPath.pushPlotter("plot");
        var mapping = [
            { name: "plotter", path: plotterPath, callbacks: this.validate },
            { name: "heightColumns", path: plotterPath.push("heightColumns") },
            { name: "labelColumn", path: plotterPath.push("labelColumn") },
            { name: "sortColumn", path: plotterPath.push("sortColumn") },
            { name: "colorColumn", path: plotterPath.push("colorColumn") },
            { name: "chartColors", path: plotterPath.push("chartColors") },
            { name: "groupingMode", path: plotterPath.push("groupingMode") },
            { name: "horizontalMode", path: plotterPath.push("horizontalMode") },
            { name: "showValueLabels", path: plotterPath.push("showValueLabels") },
            { name: "xAxis", path: this.toolPath.pushPlotter("xAxis") },
            { name: "yAxis", path: this.toolPath.pushPlotter("yAxis") },
            { name: "marginBottom", path: this.plotManagerPath.push("marginBottom") },
            { name: "marginLeft", path: this.plotManagerPath.push("marginLeft") },
            { name: "marginTop", path: this.plotManagerPath.push("marginTop") },
            { name: "marginRight", path: this.plotManagerPath.push("marginRight") },
            { name: "filteredKeySet", path: plotterPath.push("filteredKeySet") },
            { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: this.updateStyle },
            { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: this.updateStyle }
        ];

        this.initializePaths(mapping);

        this.paths.filteredKeySet.getObject().setColumnKeySources([this.paths.sortColumn.getObject()]);

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
        var axisChange:boolean = this.detectChange('heightColumns', 'labelColumn', 'sortColumn', 'marginBottom', 'marginTop', 'marginLeft', 'marginRight');
        var axisSettingsChange:boolean = this.detectChange('xAxis', 'yAxis');
        if (axisChange || this.detectChange('colorColumn', 'chartColors', 'groupingMode', 'filteredKeySet'))
        {
            changeDetected = true;
            this.dataChanged();
        }
        if (axisChange)
        {
            changeDetected = true;
            var xLabel:string = this.paths.xAxis.push("overrideAxisName").getState() || "Sorted by " + this.paths.sortColumn.getObject().getMetadata('title');
            var yLabel:string = this.paths.yAxis.push("overrideAxisName").getState() || (this.heightColumnsLabels ? this.heightColumnsLabels.join(", ") : "");

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
        if (this.detectChange('horizontalMode'))
        {
            changeDetected = true;
            this.c3Config.axis.rotated = this.paths.horizontalMode.getState();
        }
        if (this.detectChange('showValueLabels'))
        {
            changeDetected = true;
            this.showValueLabels = this.paths.showValueLabels.getState();
        }

        if (changeDetected || forced)
        {
            this.busy = true;
            this.chart = c3.generate(this.c3Config);
            this.cullAxes();
        }
    }
}

export default WeaveC3Barchart;
registerToolImplementation("weave.visualization.tools::CompoundBarChartTool", WeaveC3Barchart);
//Weave.registerClass("weavejs.tools.CompoundBarChartTool", WeaveC3Barchart, [weavejs.api.core.ILinkableObjectWithNewProperties]);
