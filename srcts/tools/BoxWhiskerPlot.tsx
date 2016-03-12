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

import LinkableHashMap = weavejs.core.LinkableHashMap;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import ColumnUtils = weavejs.data.ColumnUtils;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import Bounds2D = weavejs.geom.Bounds2D;

declare type Record = {
	id: IQualifiedKey,
	x: number,
	y: number
};

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
	dataX = Weave.linkableChild(this, DynamicColumn);
    dataY = Weave.linkableChild(this, DynamicColumn);
	radius = Weave.linkableChild(this, DynamicColumn);

	private dataXStats = Weave.linkableChild(this, weavejs.WeaveAPI.StatisticsCache.getColumnStatistics(this.dataX));
	private dataYStats = Weave.linkableChild(this, weavejs.WeaveAPI.StatisticsCache.getColumnStatistics(this.dataY));
    // selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
    // probeFilter = Weave.linkableChild(this, DynamicKeyFilter);
    // filteredKeySet = Weave.linkableChild(this, FilteredKeySet);
	
	dataBounds:Bounds2D = new Bounds2D(0, 0, 0, 0);
	screenBounds:Bounds2D = new Bounds2D(0, 0, 0, 0);
	xScale:Function;
	yScale:Function;

	get title()
	{
		return "Box and Whisker Plot"
	}
	
	private RECORD_FORMAT = {
		id: IQualifiedKey,
		x: this.dataX,
		y: this.dataY,
		r: this.radius
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
	
	componentWillUpdate(props:BoxWhiskerPlotProps, state:BoxWhiskerPlotState)
	{
		this.screenBounds.setBounds(
			this.margin.left.value,
			this.state.height - this.margin.bottom.value,
			this.state.width - this.margin.right.value,
			this.margin.top.value
		);
		this.dataBounds.setBounds(
			this.dataXStats.getMin(),
			this.dataYStats.getMin(),
			this.dataXStats.getMax(),
			this.dataYStats.getMax()
		);
	}

	renderScatterPlot():JSX.Element
	{
		var records = ColumnUtils.getRecords(this.RECORD_FORMAT, null, Number);
		return (
			<g>
				{
					records.map((record, index) => {
						if(isNaN(record.x + record.y))
							return <g key={index}/>;
						return <circle key={index} 
									className="circle" 
									cx={this.xScale(record.x) || 0} 
									cy={this.yScale(record.y) || 0} r={5}
									fill="black"
									stroke="black"
									strokeOpacity={0.5}/>
					})
				}
			</g>
		);
	}
	
	renderLinechart():JSX.Element
	{
		return null;
	}

	renderBoxWhiskers():JSX.Element
	{
		var getQ = (values: number[], q: number) => {
			var n = q/4 * (values.length);
			return values[Math.round(n)];
			// var lower = values[Math.floor(n)],
			// 	upper = values[Math.ceil(n)];
			// return (1-n%1) * lower + (n%1) * upper;
		};
		
		var getValues = (key:IQualifiedKey):number[] => {
			return _.sortBy((this.dataY.getValueFromKey(key, Array)||[]).concat()) as number[] //.sort(Array.NUMERIC);
		}
		
		var getYColumnMin = () => {
			return _.min(_.flatten(ColumnUtils.getRecords(this.dataY, null, Array)));
		}
		
		var getYColumnMax = () => {
			return _.max(_.flatten(ColumnUtils.getRecords(this.dataY, null, Array)));
		}
		
		var records = ColumnUtils.getRecords(this.RECORD_FORMAT, null, Number);
		// box properties
		var lineColor = 0x000000;
		var lineAlpha = 0.5;
		var fillColor = 0xe0e0e0;
		var fillAlpha = 1.0;
		var radius = 10;
		
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
						var key = record.id;
						var x = this.xScale(record.x);
						var yValues = getValues(key);

						if (!isFinite(x) || yValues.some(v => !isFinite(v)))
							return [];
						var min = this.yScale(getQ(yValues, 0));
						var q1 = this.yScale(getQ(yValues, 1));
						var median = this.yScale(getQ(yValues, 2));
						var q3 = this.yScale(getQ(yValues, 3));
						var max = this.yScale(getQ(yValues, 4));
						
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
								<rect style={{fill: "#FFFFFF", stroke: "#000000"}} x={x-radius} y={q3} width={2*radius} height={q1-q3}/>
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
	
	render():JSX.Element
	{
		var recordsY = _.flatten(_.pluck(ColumnUtils.getRecords({y:this.dataY}, null, Array), "y"));
		var dataYRange = [_.min(recordsY), _.max(recordsY)];

		this.xScale = d3.scale.linear().domain(this.dataBounds.getXRange()).range(this.screenBounds.getXRange());
		this.yScale = d3.scale.linear().domain(dataYRange).range(this.screenBounds.getYRange());

		return (
			<ResizingDiv ref={ReactUtils.onWillUpdateRef(this.updateSVGSize)}>
				<svg width={this.state.width} height={this.state.height}>
					<XAxis x={0} y={this.screenBounds.yMin} scale={this.xScale}/>
					<YAxis x={this.screenBounds.xMin} y={0} scale={this.yScale}/>
					{
						this.renderBoxWhiskers()
					}
				</svg>
			</ResizingDiv>
		);
	}
}
Weave.registerClass("weavejs.tool.BoxWhiskerPlot", BoxWhiskerPlot, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
