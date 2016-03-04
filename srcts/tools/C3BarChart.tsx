import {IVisToolProps} from "./IVisTool";
import AbstractC3Tool from "./AbstractC3Tool";
import * as _ from "lodash";
import * as d3 from "d3";
import FormatUtils from "../utils/FormatUtils";
import * as React from "react";
import * as c3 from "c3";
import {HBox, VBox} from "../react-ui/FlexBox";
import ComboBox from "../semantic-ui/ComboBox";
import Checkbox from "../semantic-ui/Checkbox";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import {ComboBoxOption} from "../semantic-ui/ComboBox";
import Accordion from "../semantic-ui/Accordion";
import ChartUtils from "../utils/ChartUtils";

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
import LinkableNumber = weavejs.core.LinkableNumber;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import StandardLib = weavejs.util.StandardLib;
import ColumnUtils = weavejs.data.ColumnUtils;

declare type Record = {
    id: IQualifiedKey,
	heights: { xLabel: string } & {[columnName:string]: number},
	numericValues: {
		sort: number,
		yLabel: number,
		xLabel: number
	},
	stringValues: {
		yLabel: string,
		xLabel: string,
		color: string,
	}
};

declare type RecordHeightsFormat<T> = { xLabel: T } & {[columnName:string]: T};

const GROUP:string = 'group';
const STACK:string = 'stack';
const PERCENT_STACK:string = 'percentStack';
const GROUPING_MODES:ComboBoxOption[] = [
	{label: "Grouped Bars", value: GROUP},
	{label: "Stacked Bars", value: STACK},
	{label: "100% Stacked Bars", value: PERCENT_STACK}
];

export default class C3BarChart extends AbstractC3Tool
{
    heightColumns = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
    labelColumn = Weave.linkableChild(this, DynamicColumn);
    sortColumn = Weave.linkableChild(this, DynamicColumn);
    colorColumn = Weave.linkableChild(this, new AlwaysDefinedColumn("#808080"));
    chartColors = Weave.linkableChild(this, new ColorRamp(ColorRamp.getColorRampByName("Paired")));
    groupingMode = Weave.linkableChild(this, new LinkableString(STACK, this.verifyGroupingMode));
    horizontalMode = Weave.linkableChild(this, new LinkableBoolean(false));
    showValueLabels = Weave.linkableChild(this, new LinkableBoolean(false));
    showXAxisLabel = Weave.linkableChild(this, new LinkableBoolean(false));
	xAxisLabelAngle = Weave.linkableChild(this, new LinkableNumber(-45));
	barWidthRatio = Weave.linkableChild(this, new LinkableNumber(0.8));

    private verifyGroupingMode(mode:string):boolean
	{
		return [GROUP, STACK, PERCENT_STACK].indexOf(mode) >= 0;
	}

    get yLabelColumn():IAttributeColumn
    {
        return this.heightColumns.getObjects(IAttributeColumn)[0]|| this.sortColumn;
    }
	
    private RECORD_FORMAT = {
		id: IQualifiedKey,
		heights: {} as RecordHeightsFormat<IAttributeColumn>,
		numericValues: {
			sort: this.sortColumn,
			yLabel: this.yLabelColumn,
			xLabel: this.labelColumn,
		},
		stringValues: {
			yLabel: this.yLabelColumn,
			xLabel: this.labelColumn,
			color: this.colorColumn,
		}
	};

    private RECORD_DATATYPE = {
		heights: {} as RecordHeightsFormat<new ()=>(String|Number)>,
		numericValues: {
			sort: Number,
			yLabel: Number,
			xLabel: Number,
		},
		stringValues: {
			yLabel: String,
			xLabel: String,
			color: String,
		}
	};

    private yLabelColumnDataType:string;
    private heightColumnNames:string[];
    private heightColumnsLabels:string[];
    protected c3ConfigYAxis:c3.YAxisConfiguration;
    private records:Record[];

    constructor(props:IVisToolProps)
    {
        super(props);

		this.colorColumn.internalDynamicColumn.globalName = "defaultColorColumn";
        this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
		this.probeFilter.targetPath = ['defaultProbeKeySet'];

        this.mergeConfig({
            data: {
                json: [],
                type: "bar",
                xSort: false,
                names: {},
                labels: {
                    format: (v, id, i, j) => {
                        if (this.showValueLabels.value)
                        {
                            return FormatUtils.defaultNumberFormatting(v);
                        }
                        else
                        {
                            return "";
                        }
                    }
                },
                order: null,
                color: (color:string, d:any):string => {
                    if (this.heightColumnNames.length === 1 && d && d.hasOwnProperty("index"))
                    {
						// use the color from the color column because we only have one height
						var record = this.records[d.index];
						return record && record.stringValues ? record.stringValues.color : "";
                    }
                    else
                    {
						// use the color from the color ramp
                        return color;
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
                        rotate: this.xAxisLabelAngle.value,
                        culling: {
                            max: null
                        },
                        multiline: false,
                        format: (num:number):string => {

	                        if(this.horizontalMode.value)
	                        {
		                        return this.formatGetStringFromNumber(num);
	                        }
	                        else
	                        {
								let index = Math.round(num);
		                        let record = this.records[index];

		                        if(this.labelColumn.getInternalColumn() == null)// if the labelColumn doesn't have any data, use default label
		                            return null;

		                        return this.labelColumn.getValueFromKey(record.id);// otherwise return the value from the labelColumn
	                        }
                        }
                    }
                },
                rotated: false
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            bar: {
                width: {
                    ratio: NaN
                }
            },
            legend: {
                show: false,
                position: "bottom"
            }
        });

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
	                return this.formatGetStringFromNumber(num);
                }
            }
        };
    }

	//returns correct labels (for axes) from the data column
	private formatGetStringFromNumber = (value:number):string =>
	{
		let heightColumns = this.heightColumns.getObjects();
		if(this.groupingMode.value === PERCENT_STACK && heightColumns.length > 1)
		{
			return Weave.lang("{0%}",StandardLib.roundSignificant(heightColumns[0]));
		}
		else if(heightColumns.length > 0)
		{
			return ColumnUtils.deriveStringFromNumber(heightColumns[0], value)
		}
		return null;
	};

	protected handleC3Selection():void
	{
		if (!this.selectionKeySet)
			return;
		let selectedIndices = this.chart.selected();
		let selectedKeys = selectedIndices.map((value) => this.records[value.index].id);
		this.selectionKeySet.replaceKeys(selectedKeys);
	}

	protected handleC3MouseOver(d:any):void
	{
		var record:Record = this.records[d.index];
		var qKey:IQualifiedKey = this.records[d.index].id;

		var columnNamesToColor:{[columnName:string] : string} = {};
		var columns = this.heightColumns.getObjects(IAttributeColumn);
		for (var index in columns)
		{
			var column = columns[index]; 
			var columnName:string = column.getMetadata("title");
			columnNamesToColor[columnName] = this.chartColors.getHexColor(Number(index), 0, columns.length - 1);
		}

		if (this.probeKeySet)
			this.probeKeySet.replaceKeys([qKey]);
		
		var heightColumns = this.heightColumns.getObjects(IAttributeColumn);
        this.toolTip.show(this, this.chart.internal.d3.event, [qKey], heightColumns);
		if (heightColumns.length > 1)
			this.toolTip.setState({columnNamesToColor});
	}

    private dataChanged():void
	{
		var columns = this.heightColumns.getObjects(IAttributeColumn);
		this.filteredKeySet.setColumnKeySources(columns);
		this.RECORD_FORMAT.heights = _.zipObject(this.heightColumns.getNames(), columns) as any;
		this.RECORD_FORMAT.heights.xLabel = this.labelColumn;
		this.RECORD_DATATYPE.heights = _.zipObject(this.heightColumns.getNames(), columns.map(() => Number)) as any;
		this.RECORD_DATATYPE.heights.xLabel = String;
		
        this.heightColumnNames = this.heightColumns.getNames();
        this.heightColumnsLabels = columns.map(column => Weave.lang(column.getMetadata("title")));

        this.yLabelColumnDataType = this.yLabelColumn.getMetadata("dataType");

        this.records = weavejs.data.ColumnUtils.getRecords(this.RECORD_FORMAT, this.filteredKeySet.keys, this.RECORD_DATATYPE);
        this.records = _.sortByOrder(this.records, ["numericValues.sort"], ["asc"]);

        if (weavejs.WeaveAPI.Locale.reverseLayout)
        {
            this.records = this.records.reverse();
        }

        if (this.groupingMode.value === STACK || this.groupingMode.value === PERCENT_STACK)
            this.c3Config.data.groups = [this.heightColumnNames];
        else //if (this.groupingMode === "group")
            this.c3Config.data.groups = [];

        if (this.groupingMode.value === PERCENT_STACK && this.heightColumnNames.length > 1)
        {
            // normalize the height columns to be percentages.
			for (var record of this.records)
			{
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
        if (this.labelColumn.target)
        {
            keys.x = "xLabel";
            this.c3Config.legend.show = false;
        }
        else
        {
            this.c3Config.legend.show = true;
        }

        keys.value = this.heightColumnNames;
        var columnColors:{[name:string]: string} = {};
        var columnTitles:{[name:string]: string} = {};

        if (this.heightColumnNames.length > 1)
        {
            this.heightColumnNames.forEach((name, index) => {
                columnTitles[name] = this.heightColumnsLabels[index];
                columnColors[name] = this.chartColors.getHexColor(index, 0, this.heightColumnNames.length - 1);
            });
            if (this.labelColumn.target)
            {
                this.c3Config.legend.show = true;
            }
        }
        else
        {
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

	get defaultXAxisLabel():string
	{
		if (!this.showXAxisLabel.value)
			return "";
		return Weave.lang("Sorted by " + this.sortColumn.getMetadata('title'));
	}

	get defaultYAxisLabel():string
	{
		var columns = this.heightColumns.getObjects() as IAttributeColumn[];
		if (columns.length == 0)
			return Weave.lang('');

		return Weave.lang("{0}", columns.map(column=>weavejs.data.ColumnUtils.getTitle(column)).join(Weave.lang(", ")));
	}

    protected validate(forced:boolean = false):boolean
    {
        var changeDetected:boolean = false;
        var axisChange:boolean = Weave.detectChange(
			this,
			this.heightColumns,
			this.labelColumn,
			this.sortColumn,
			this.margin,
			this.overrideBounds,
			this.xAxisName,
			this.yAxisName,
 			this.showXAxisLabel,
	        this.xAxisLabelAngle
		);
		var dataChange = axisChange || Weave.detectChange(this, this.colorColumn, this.chartColors, this.groupingMode, this.filteredKeySet, this.showValueLabels);
		if (dataChange)
        {
            changeDetected = true;
            this.dataChanged();
        }
        
		if (axisChange)
        {
            changeDetected = true;
			
            var xLabel:string = Weave.lang(this.xAxisName.value) || this.defaultXAxisLabel;
            var yLabel:string = Weave.lang(this.yAxisName.value) || this.defaultYAxisLabel;

            if (!this.showXAxisLabel.value)
            {
                xLabel = " ";
            }

            if (this.heightColumnNames && this.heightColumnNames.length)
            {
                var axes:any = {};
                if (weavejs.WeaveAPI.Locale.reverseLayout)
                {
                    this.heightColumnNames.forEach( (name) => {
                        axes[name] = 'y2';
                    });
                    this.c3Config.data.axes = axes;
                    this.c3Config.axis.y2 = this.c3ConfigYAxis;
                    this.c3Config.axis.y = {show: false};
                    this.c3Config.axis.x.tick.rotate = -1*this.xAxisLabelAngle.value;
                }
                else
                {
                    this.heightColumnNames.forEach( (name) => {
                        axes[name] = 'y';
                    });
                    this.c3Config.data.axes = axes;
                    this.c3Config.axis.y = this.c3ConfigYAxis;
                    delete this.c3Config.axis.y2;
                    this.c3Config.axis.x.tick.rotate = this.xAxisLabelAngle.value;
                }
            }

            this.c3Config.axis.x.label = {text:xLabel, position:"outer-center"};
            this.c3ConfigYAxis.label = {text:yLabel, position:"outer-middle"};

			this.updateConfigMargin();
			this.updateConfigAxisY();
        }
		
        if (Weave.detectChange(this, this.horizontalMode))
        {
            changeDetected = true;
            this.c3Config.axis.rotated = this.horizontalMode.value;
        }

		if (Weave.detectChange(this, this.barWidthRatio))
		{
			changeDetected = true;
            (this.c3Config.bar.width as {ratio:number}).ratio = this.barWidthRatio.value;
		}

        if (changeDetected || forced)
			return true;
		
		// update C3 selection and style on already-rendered chart
        var selectedKeys:IQualifiedKey[] = this.selectionKeySet ? this.selectionKeySet.keys : [];
		var keyToIndex = weavejs.util.ArrayUtils.createLookup(this.records, "id");
        var selectedIndices:number[] = selectedKeys.map((key:IQualifiedKey) => {
			return Number(keyToIndex.get(key));
        });
		this.chart.select(this.heightColumnNames, selectedIndices, true);
		
		this.updateStyle();

		//call weave layering function
		this.weaveLayering();
		
		return false;
    }

	protected weaveLayering():void {
		var selectionKeySetChanged:boolean = Weave.detectChange(this, this.selectionKeySet);
		var probeKeySetChanged:boolean = Weave.detectChange(this, this.probeKeySet);
		super.weaveLayering(selectionKeySetChanged,probeKeySetChanged);

		let thinBars:boolean = this.chart.internal.width <= this.records.length;

		var barchart = this;//copy items to selection_layer and probe_layer
		if(selectionKeySetChanged || probeKeySetChanged) {
			this.heightColumnNames.forEach((item:string) => {
				if(selectionKeySetChanged)
					d3.select(this.element)
						.selectAll("g.selection_layer")
						.append("g")
						.classed(item + "-bars", true);
				if(probeKeySetChanged)
					d3.select(this.element)
						.selectAll("g.probe_layer")
						.append("g")
						.classed(item + "-bars", true);
				d3.select(this.element).selectAll("g").filter(".c3-shapes-" + item + ".c3-bars").selectAll("path").each(function (d:any, i:number, oi:number) {
					let key = barchart.records[i].id;
					let selected = barchart.isSelected(key);
					let probed = barchart.isProbed(key);
					if (selected && selectionKeySetChanged) {
						d3.select(barchart.element)
							.select("g.selection_layer")
							.select("g." + item + "-bars")
							.node()
							.appendChild(this.cloneNode(true));
					}
					if (probed && probeKeySetChanged) {
						d3.select(barchart.element)
							.select("g.probe_layer")
							.select("g." + item + "-bars")
							.node()
							.appendChild(this.cloneNode(true));
					}
				});

				//draw selection_style_layer
				if(selectionKeySetChanged) {
					d3.select(barchart.element)
						.selectAll("g.c3-shapes-" + item + ".c3-bars")
						.selectAll("path").each(function (d:any, i:number, oi:number) {
						if (d.hasOwnProperty("index")) {
							let key = barchart.records[d.index].id;
							let selected = barchart.isSelected(key);
							if (selected) {
								d3.select(barchart.element)
									.selectAll("g.selection_style_layer")
									.append("path")
									.classed("_selection_path", true)
									.attr("d", this.getAttribute("d"))
									.style("stroke", "black")
									.style("stroke-width", 1)
									.style("stroke-opacity", (d:any, i:number, oi:number):number => {
										if (thinBars)
											return 0;
										return 0.5;
									})
							}
						}
					});

					//style selection_layer (need to set opacity to null, group opacity will then determine opacity of all points)
					d3.select(barchart.element)
						.select("g.selection_layer")
						.selectAll("g." + item + "-bars")
						.selectAll("path")
						.attr("class", "weave_point_layer_path")
						.style("opacity", null);
				}

				//draw probe_style_layer
				if(probeKeySetChanged) {
					d3.select(barchart.element)
						.selectAll("g.c3-shapes-" + item + ".c3-bars")
						.selectAll("path").each(function (d:any, i:number, oi:number) {
						if (d.hasOwnProperty("index")) {
							let key = barchart.records[d.index].id;
							let probed = barchart.isProbed(key);
							if (probed) {
								var pathBBox = this.getBBox();
								var borderThickness = 3;
								let groupElement = d3.select(barchart.element)
									.selectAll("g.probe_style_layer")
									.append("g")
									.classed("_probe_style_group", true);
								groupElement.append("rect")
									.classed("_probe_outer_path", true)
									.attr("x", pathBBox.x - borderThickness)
									.attr("y", pathBBox.y - borderThickness)
									.attr("width", pathBBox.width + 2 * borderThickness)
									.attr("height", pathBBox.height + 2 * borderThickness)
									.style("stroke", "black")
									.style("stroke-width", 1)
									.style("fill", "white");
								groupElement.append("rect")
									.classed("_probe_inner_path", true)
									.attr("x", pathBBox.x)
									.attr("y", pathBBox.y)
									.attr("width", pathBBox.width)
									.attr("height", pathBBox.height)
									.style("stroke", "black")
									.style("stroke-width", 1)
									.style("fill", "black");
							}
						}
					});

					//style probe_layer (need to set opacity to null, group opacity will then determine opacity of all points)
					d3.select(barchart.element)
						.select("g.probe_layer")
						.selectAll("g." + item + "-bars")
						.selectAll("path")
						.attr("class", "weave_point_layer_path")
						.style("opacity", null);
				}
			});
		}
	}

	updateStyle()
	{
		if (!this.chart || !this.heightColumnNames)
			return;

		let selectionEmpty:boolean = !this.selectionKeySet || this.selectionKeySet.keys.length === 0;
		let thinBars:boolean = this.chart.internal.width <= this.records.length;

		this.heightColumnNames.forEach((item:string) => {
			d3.select(this.element)
				.selectAll("g")
				.filter(".c3-shapes-"+item+".c3-bars")
				.selectAll("path")
				.style("stroke", "black")
				.style("stroke-width", 1.0)
				.style("stroke-opacity", 0.5);

			d3.select(this.element)
				.selectAll("g")
				.filter(".c3-texts-"+item)
				.selectAll("text")
				.style("fill-opacity", (d: any, i: number, oi: number): number => {
					let key = this.records[i].id;
					let selected = this.isSelected(key);
					let probed = this.isProbed(key);
					return (selectionEmpty || selected || probed) ? 1.0 : 0.3;
				});
		});
	}

    get selectableAttributes()
    {
        return super.selectableAttributes
	        .set("Height", this.heightColumns)
	        .set("Sort", this.sortColumn)
	        .set("Color", this.colorColumn)
            .set("Label", this.labelColumn);
    }

    get defaultPanelTitle():string
    {
        var columns = this.heightColumns.getObjects() as IAttributeColumn[];
        if (columns.length == 0)
            return Weave.lang('Bar Chart');

        return Weave.lang("Bar Chart of {0}", columns.map(column=>weavejs.data.ColumnUtils.getTitle(column)).join(Weave.lang(", ")));
    }

    //todo:(pushCrumb)find a better way to link to sidebar UI for selectbleAttributes
	renderEditor =(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any )=>void = null):JSX.Element =>
	{
		return Accordion.render(
			[Weave.lang("Data"), this.getSelectableAttributesEditor(pushCrumb)],
			[
				Weave.lang("Display"),
				[
					[
						Weave.lang("Grouping mode"),
						<ComboBox style={{width:"100%"}} ref={linkReactStateRef(this, { value: this.groupingMode })} options={GROUPING_MODES}/>
					],
					Weave.beta && [
						Weave.lang("Horizontal bars (beta)"),
						<Checkbox ref={linkReactStateRef(this, { value: this.horizontalMode })} label={" "}/>
					],
					[
						Weave.lang("Show value labels"),
						<Checkbox ref={linkReactStateRef(this, { value: this.showValueLabels })} label={" "}/>
	
					],
					[
						Weave.lang("Show X axis title"),
						<Checkbox ref={linkReactStateRef(this, { value: this.showXAxisLabel })} label={" "}/>
					],
					[
						Weave.lang("X axis label angle"),
						<ComboBox style={{width:"100%"}} ref={linkReactStateRef(this, { value: this.xAxisLabelAngle })} options={ChartUtils.getAxisLabelAngleChoices()}/>
					]
				]
			],
			[Weave.lang("Titles"), this.getTitlesEditor()],
			[Weave.lang("Margins"), this.getMarginEditor()]
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
}

Weave.registerClass(
	C3BarChart,
	["weavejs.tool.C3BarChart", "weave.visualization.tools::CompoundBarChartTool"],
	[weavejs.api.ui.IVisTool_Basic, weavejs.api.core.ILinkableObjectWithNewProperties, weavejs.api.data.ISelectableAttributes],
	"Bar Chart"
);
