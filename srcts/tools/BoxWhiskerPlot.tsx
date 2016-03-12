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

	getQ(values:number[], q:number):number
	{
		var n = q / 4 * (values.length - 1);
		return values[Math.round(n)];
	}
	
	getYValues(key:IQualifiedKey):number[]
	{
		return _.sortBy((this.dataY.getValueFromKey(key, Array)||[]).concat()) as number[];
	}
	
	renderBoxWhiskers():JSX.Element
	{
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
		this.dataBounds.reset();
		this.dataBounds.includeCoords(this.dataXStats.getMin(), this.dataYStats.getMin());
		this.dataBounds.includeCoords(this.dataXStats.getMax(), this.dataYStats.getMax());
		
		var recordsY = _.flatten(ColumnUtils.getRecords(this.dataY, null, Array));
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
