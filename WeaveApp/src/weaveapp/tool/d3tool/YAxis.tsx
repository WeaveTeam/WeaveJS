import * as React from "react";
import * as weavejs from "weavejs";
import * as d3 from "d3";
import {WeaveAPI} from "weavejs";

import AbstractAxis, {AxisProps} from "weaveapp/tool/d3tool/AbstractAxis";

export default class YAxis extends AbstractAxis
{
	constructor(props:AxisProps)
	{
		super(props);
		this.orientation = WeaveAPI.Locale.reverseLayout ? "right" : "left";
	}

	componentDidUpdate()
	{
		var axis = d3.svg.axis().scale(this.props.scale).orient(this.orientation).tickFormat(this.props.format).tickSize(-1*this.props.length);
		d3.select(this.element).call(axis);
	}

	render()
	{
		return (
			<g transform={"translate(" + this.props.x + "," + this.props.y + ")"} ref={(c) => {this.element = c}} className="axis"></g>
		);
	}
}
