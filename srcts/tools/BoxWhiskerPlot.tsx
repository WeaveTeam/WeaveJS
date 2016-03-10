import * as React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";
import * as _ from "lodash";
import {IVisToolProps, IVisToolState} from "./IVisTool";
import AbstractVisTool from "./AbstractVisTool";
import {XAxis, YAxis} from "./Axis";
import {VBox} from "../react-ui/FlexBox";
import ResizingDiv from "../ui/ResizingDiv";
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
	container:HTMLElement;
	
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

	updateSVGSize=(resizingDiv:ResizingDiv)=>
	{
		this.setState(resizingDiv.state);
	}
	
	componentDidMount()
	{
		this.container = ReactDOM.findDOMNode(this) as HTMLElement;
		this.setState({
			width: this.container.offsetWidth,
			height: this.container.offsetHeight
		});
	}
	
	componentDidUpdate()
	{
		if(!_.isEqual(this.state.width, this.container.offsetWidth) || !_.isEqual(this.state.height, this.container.offsetHeight))
		{
			
			this.setState({
				width: this.container.offsetWidth,
				height: this.container.offsetHeight
			});
		}
	}

	// shouldComponentUpdate(nextProps:BoxWhiskerPlotProps, nextState:BoxWhiskerPlotState):boolean
	// {
	// 	return !_.isEqual(this.state.width, this.container.offsetWidth) || !_.isEqual(this.state.height, this.container.offsetHeight);
	// }
	
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
			var n = q/4 * (values.length - 1);
			return values[Math.round(n)];
			// var lower = values[Math.floor(n)],
			// 	upper = values[Math.ceil(n)];
			// return (1-n%1) * lower + (n%1) * upper;
		};
		
		var getValues = (key:IQualifiedKey):number[] => _.sortBy((this.dataY.getValueFromKey(key, Array)||[]).concat()) as number[] //.sort(Array.NUMERIC);
		var records = ColumnUtils.getRecords(this.RECORD_FORMAT, null, Number);
		
		// box properties
		var lineColor = 0x000000;
		var lineAlpha = 0.5;
		var fillColor = 0xe0e0e0;
		var fillAlpha = 1.0;
		var radius = 10;
		
		var glyphStyle:React.CSSProperties = {
			stroke: lineColor,
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
						
						var min = this.yScale(getQ(yValues, 0)) || 0;
						var q1 = this.yScale(getQ(yValues, 1)) || 0;
						var median = this.yScale(getQ(yValues, 2)) || 0;
						var q3 = this.yScale(getQ(yValues, 3)) || 0;
						var max = this.yScale(getQ(yValues, 4)) || 0;
						
						// draw whiskers
						var whisker:JSX.Element = (
							<g key="whisker" style={glyphStyle}>
								<line x1={x} y1={median} x2={x} y2={min}/>
								<line x1={x-radius} y1={min} x2={x+radius} y2={min}/>
								<line x1={x} y1={median} x2={x} y2={max}/>
								<line x1={x-radius} y1={max} x2={x+radius} y2={max}/>
							</g>
						)
						
						// draw box
						var box:JSX.Element = (
							<g key="box" style={glyphStyle}>
								<line x1={x+radius} y1={q1} x2={x-radius} y2={q1}/>
								<line x1={x-radius} y1={q1} x2={x-radius} y2={q3}/>
								<line x1={x-radius} y1={q3} x2={x+radius} y2={q3}/>
								<line x1={x+radius} y1={q3} x2={x+radius} y2={q1}/>
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
		this.xScale = d3.scale.linear().domain(this.dataBounds.getXRange()).range(this.screenBounds.getXRange());
		this.yScale = d3.scale.linear().domain(this.dataBounds.getYRange()).range(this.screenBounds.getYRange());
		
		return (
			/*<ResizingDiv ref={ReactUtils.onUpdateRef(this.updateSVGSize)}>*/
			<VBox style={{flex: 1}}>
				<svg width={this.state.width} height={this.state.height}>
					<XAxis x={0} y={this.screenBounds.yMin} scale={this.xScale}/>
					<YAxis x={this.screenBounds.xMin} y={0} scale={this.yScale}/>
					{
						this.renderBoxWhiskers()
					}
				</svg>
			</VBox>
			/*</ResizingDiv>*/
		);
	}
}
Weave.registerClass("weavejs.tool.BoxWhiskerPlot", BoxWhiskerPlot, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
