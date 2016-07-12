namespace weavejs.tool.d3tool
{
	import AbstractAxis = weavejs.tool.d3tool.AbstractAxis;

	export class YAxis extends AbstractAxis
	{
		constructor(props:AxisProps)
		{
			super(props);
			this.orientation = weavejs.WeaveAPI.Locale.reverseLayout ? "right" : "left";
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
}
