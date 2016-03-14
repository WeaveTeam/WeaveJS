import * as React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";
import * as _ from "lodash";
import {IVisToolProps, IVisToolState} from "./IVisTool";
import AbstractVisTool from "./AbstractVisTool";
import {XAxis, YAxis} from "./Axis";
import {VBox} from "../react-ui/FlexBox";
import ResizingDiv from "../react-ui/ResizingDiv";
import ReactUtils from "../utils/ReactUtils";
import FormatUtils from "../utils/FormatUtils";

import LinkableHashMap = weavejs.core.LinkableHashMap;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import ColumnUtils = weavejs.data.ColumnUtils;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import Bounds2D = weavejs.geom.Bounds2D;
import StandardLib = weavejs.util.StandardLib;

export declare type ScatterPlotRecord = {
	id: IQualifiedKey,
	x: number,
	y: number,
	r: number,
	color: string
};

export declare type BoxWhiskerRecord = {
	id: IQualifiedKey,
	x: number,
	y: number
}

export declare type LinePlotRecord = {
	id: IQualifiedKey,
	x: number,
	y: number,
	grouBy: number
	// color: string
}

export interface BoxWhiskerPlotProps extends IVisToolProps, React.Props<BoxWhiskerPlot>
{

}


export interface BoxWhiskerPlotState extends IVisToolState
{
	width?:number;
	height?:number;
}

export default class BoxWhiskerPlot extends AbstractVisTool<BoxWhiskerPlotProps, BoxWhiskerPlotState>
{
	boxwhiskerX = Weave.linkableChild(this, DynamicColumn);
    boxwhiskerY = Weave.linkableChild(this, DynamicColumn);

	scatterX = Weave.linkableChild(this, DynamicColumn);
	scatterY = Weave.linkableChild(this, DynamicColumn);
	scatterRadius = Weave.linkableChild(this, new AlwaysDefinedColumn(5));
	scatterColor = Weave.linkableChild(this, new AlwaysDefinedColumn("#000000"));


	lineX = Weave.linkableChild(this, DynamicColumn);
	lineY = Weave.linkableChild(this, DynamicColumn);
	lineGrouBy = Weave.linkableChild(this, DynamicColumn);

	private boxWhiskerXStats = Weave.linkableChild(this, weavejs.WeaveAPI.StatisticsCache.getColumnStatistics(this.boxwhiskerX));
	private boxWhiskerYStats = Weave.linkableChild(this, weavejs.WeaveAPI.StatisticsCache.getColumnStatistics(this.boxwhiskerY));

	private scatterXStats = Weave.linkableChild(this, weavejs.WeaveAPI.StatisticsCache.getColumnStatistics(this.scatterX));
	private scatterYStats = Weave.linkableChild(this, weavejs.WeaveAPI.StatisticsCache.getColumnStatistics(this.scatterY));

	private lineXStats = Weave.linkableChild(this, weavejs.WeaveAPI.StatisticsCache.getColumnStatistics(this.lineX));
	private lineYStats = Weave.linkableChild(this, weavejs.WeaveAPI.StatisticsCache.getColumnStatistics(this.lineY));
    // selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
    // probeFilter = Weave.linkableChild(this, DynamicKeyFilter);
    // filteredKeySet = Weave.linkableChild(this, FilteredKeySet);

	dataBounds:Bounds2D = new Bounds2D(0, 0, 0, 0);
	screenBounds:Bounds2D = new Bounds2D(0, 0, 0, 0);
	xScale:Function;
	yScale:Function;

	private xAxisDataType:string;
	private yAxisDataType:string;

	get title()
	{
		return "Box and Whisker Plot"
	}

	private BOXWHISKER_RECORD_FORMAT = {
		id: IQualifiedKey,
		x: this.boxwhiskerX,
		y: this.boxwhiskerY,
	};

	private LINE_RECORD_FORMAT = {
		id: IQualifiedKey,
		x: this.lineX,
		y: this.lineY,
		grouBy: this.lineGrouBy
	};

	private SCATTER_RECORD_FORMAT = {
		id: IQualifiedKey,
		x: this.scatterX,
		y: this.scatterY,
		r: this.scatterRadius,
		color: this.scatterColor
	};

	constructor(props:BoxWhiskerPlotProps)
	{
		super(props);
		Weave.getCallbacks(this).addGroupedCallback(this, this.forceUpdate);
		this.state = {
			width: 0,
			height: 0
		};
	}

	updateSVGSize=(resizingDiv:ResizingDiv, props:any, state:any, context:any)=>
	{
		ReactUtils.updateState(this, state);
	}

	renderScatterPlot(records:ScatterPlotRecord[]):JSX.Element
	{
		return (
			<g>
				{
					records.map((record, index) => {
						var hexColor = StandardLib.getHexColor(Number(record.color));

						if(isNaN(record.x + record.y + record.r))
							return <g key={index}/>;

						return <circle key={index}
									className="circle"
									cx={this.xScale(record.x)}
									cy={this.yScale(record.y)} r={record.r}
									fill={hexColor}
									stroke={hexColor}
									strokeOpacity={0.5}/>
					})
				}
			</g>
		);
	}

	renderLinePlot(records:LinePlotRecord[]):JSX.Element
	{
		
		var lineStyle:React.SVGAttributes = {
			fill: "#FFFFFF",
			stroke: "#000000",
			strokeOpacity: 0.5,
			fillOpacity: 0
		}

		var path:string = "";
		var points = records.map(record => {x: this.xScale(record.x), y: this.yScale(record.y)});
		return <path d={getPathStr(points)} {...lineStyle}/>;
	}
	
	getPathStr(points:{x:number, y:number}[]):String
	{
		if (!points.length)
			return null;
		return 'M ' + points.filter(p => isFinite(p.x + p.y)).map(p => p.x + ' ' + p.x).join(' L ');
	}

	getQ(values:number[], q:number):number
	{
		var n = q / 4 * (values.length - 1);
		return values[Math.round(n)];
	}

	getYValues(key:IQualifiedKey):number[]
	{
		return _.sortBy((this.boxwhiskerY.getValueFromKey(key, Array)||[]).concat()) as number[];
	}

	renderBoxWhiskerPlot(records:BoxWhiskerRecord[]):JSX.Element
	{

		// box properties
		var lineColor = 0x000000;
		var lineAlpha = 0.5;
		var fillColor = 0xe0e0e0;
		var fillAlpha = 1.0;
		var radius = 5;

		var glyphStyle:React.CSSProperties = {
			stroke: "#000000",
			strokeOpacity: lineAlpha,
			fill: fillColor,
			fillOpacity: fillAlpha
		}

		return (
			<g>
				{
					records.map((record, index) => {
						var x = this.xScale(record.x);
						var yValues = this.getYValues(record.id);

						if (!isFinite(x) || yValues.some(v => !isFinite(v)))
							return [];
						var [min, q1, median, q3, max] = [0,1,2,3,4].map(q => this.yScale(this.getQ(yValues, q)));

						// draw whiskers
						var whisker:JSX.Element = (
							<g key="whisker" style={glyphStyle}>
								<line x1={x} y1={min} x2={x} y2={q1}/>
								<line x1={x-radius} y1={min} x2={x+radius} y2={min}/>
								<line x1={x} y1={q3} x2={x} y2={max}/>
								<line x1={x-radius} y1={max} x2={x+radius} y2={max}/>
							</g>
						)

						// draw box
						var box:JSX.Element = (
							<g key="box" style={glyphStyle}>
								<rect style={{fill: "#FFFFFF", stroke: "#000000", fillOpacity: 1.0}} x={x-radius} y={q3} width={2*radius} height={q1-q3}/>
								{/*median line*/}
								<line x1={x-radius} y1={median} x2={x+radius} y2={median}/>
							</g>
						)
						return [box, whisker];
					})
				}
			</g>
		);
	}
	
	xAxisFormat=(num: any):string => {
		if (this.xAxisDataType !== "number")
		{
			return ColumnUtils.deriveStringFromNumber(this.scatterX, num) || "";
		}
		else
		{
			return String(FormatUtils.defaultNumberFormatting(num));
		}
	}
	
	yAxisFormat=(num:any):string => {
		if (this.yAxisDataType !== "number")
		{
			return ColumnUtils.deriveStringFromNumber(this.scatterY, num) || "";
		}
		else
		{
			return String(FormatUtils.defaultNumberFormatting(num));
		}
	}

	render():JSX.Element
	{
		// this should be in separate callbacks that call forceUpdate
		// records should also be class members
		// each layer jsx can also be stored as class members
		// then we can use Weave.detectChange to determine if we should update them

		var boxWhiskerRecords = ColumnUtils.getRecords(this.BOXWHISKER_RECORD_FORMAT, null, Number);
		var scatterPlotRecords = ColumnUtils.getRecords(this.SCATTER_RECORD_FORMAT, null, Number);
		var lineRecords = ColumnUtils.getRecords(this.LINE_RECORD_FORMAT, null, Number);

		this.xAxisDataType = this.scatterX.getMetadata('dataType');
		this.yAxisDataType = this.scatterY.getMetadata('dataType');

		// set screen bounds
		this.screenBounds.setBounds(
			this.margin.left.value,
			this.state.height - this.margin.bottom.value,
			this.state.width - this.margin.right.value,
			this.margin.top.value
		);

		if (this.screenBounds.getWidth() < 0)
			this.screenBounds.setWidth(0);
		if (this.screenBounds.getHeight() > 0)
			this.screenBounds.setHeight(0);

		// set data bounds
		this.dataBounds.reset();
		var recordsY = _.flatten(ColumnUtils.getRecords(this.boxwhiskerY, null, Array));

		this.dataBounds.includeCoords(this.boxWhiskerXStats.getMin(), _.min(recordsY));
		this.dataBounds.includeCoords(this.boxWhiskerXStats.getMax(), _.max(recordsY));

		this.dataBounds.includeCoords(this.scatterXStats.getMin(), this.scatterYStats.getMin());
		this.dataBounds.includeCoords(this.scatterXStats.getMax(), this.scatterYStats.getMax());

		this.dataBounds.includeCoords(this.lineXStats.getMin(), this.lineYStats.getMin());
		this.dataBounds.includeCoords(this.lineXStats.getMax(), this.lineYStats.getMax());
		
		if (this.dataBounds.isUndefined())
			this.dataBounds.setBounds(0, 0, 0, 0);
		// create scales from dataBounds and screenBounds
		this.xScale = d3.scale.linear().domain(this.dataBounds.getXRange()).range(this.screenBounds.getXRange());
		this.yScale = d3.scale.linear().domain(this.dataBounds.getYRange()).range(this.screenBounds.getYRange());

		return (
			<ResizingDiv ref={ReactUtils.onWillUpdateRef(this.updateSVGSize)}>
				<svg width={this.state.width} height={this.state.height}>
					<XAxis x={0} y={this.screenBounds.yMin} length={this.screenBounds.yMin - this.screenBounds.yMax} scale={this.xScale} format={this.xAxisFormat}/>
					<YAxis x={this.screenBounds.xMin} y={0} length={this.screenBounds.xMax - this.screenBounds.xMin} scale={this.yScale} format={this.yAxisFormat}/>
					{
						this.renderLinePlot(lineRecords)
					}
					{
						this.renderScatterPlot(scatterPlotRecords)
					}
					{
						this.renderBoxWhiskerPlot(boxWhiskerRecords)
					}
				</svg>
			</ResizingDiv>
		);
	}
}
Weave.registerClass("weavejs.tool.BoxWhiskerPlot", BoxWhiskerPlot, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
