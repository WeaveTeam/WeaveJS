import * as React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";
import {IVisToolProps} from "./IVisTool";
import AbstractVisTool from "./AbstractVisTool";
import {XAxis, YAxis} from "./Axis";
import {VBox} from "../react-ui/FlexBox";

import LinkableHashMap = weavejs.core.LinkableHashMap;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;

export interface BoxWhiskerPlotProps extends React.Props<BoxWhiskerPlot>
{
	
}

export interface BoxWhiskerPlotState
{
	
}

export default class BoxWhiskerPlot extends AbstractVisTool
{
	container:Element;

	dataX = Weave.linkableChild(this, DynamicColumn);
    dataY = Weave.linkableChild(this, DynamicColumn);
    // selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
    // probeFilter = Weave.linkableChild(this, DynamicKeyFilter);
    // filteredKeySet = Weave.linkableChild(this, FilteredKeySet);
	get title()
	{
		return "Box and Whisker Plot"
	}
	
	getXPosition():number
	{
		// TODO return position based on locale
		return this.margin.left.value;
	}
	
	getXAxisYPosition():number
	{
		// TODO return position based on locale
		return this.container.clientHeight - this.margin.bottom.value;
	}

	getYAxisYPosition():number
	{
		// TODO return position based on locale
		return this.margin.top.value;
	}

	
	constructor(props:IVisToolProps)
	{
		super(props);
		Weave.getCallbacks(this).addGroupedCallback(this, this.forceUpdate);
	}
	
	componentDidMount()
	{
		this.container = ReactDOM.findDOMNode(this);
		this.forceUpdate()
	}
	
	render()
	{

		if(this.container) {
			var xRange:[number, number] = [0, this.container.clientWidth - this.margin.left.value - this.margin.right.value];
			var yRange:[number, number] = [0, this.container.clientHeight - this.margin.top.value - this.margin.bottom.value]
			console.log(yRange);
			return (
				<VBox style={{flex: 1}}>
					<svg width={this.container.clientWidth} height={this.container.clientHeight}>
						<XAxis x={this.getXPosition()} y={this.getXAxisYPosition()} range={xRange} domain={[0, 1000]}/>
						<YAxis x={this.getXPosition()} y={this.getYAxisYPosition()} range={yRange} domain={[1000, 0]}/>
					</svg>
				</VBox>
			);
		}
			
		return <VBox style={{flex: 1}}/>
	}
}
Weave.registerClass("weavejs.tool.BoxWhiskerPlot", BoxWhiskerPlot, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
