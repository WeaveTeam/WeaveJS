namespace weavejs.tool.d3tool
{
	import AbstractAxis = weavejs.tool.d3tool.AbstractAxis;

	export class XAxis extends AbstractAxis
	{
		constructor(props:AxisProps)
		{
			super(props);
			this.orientation = "bottom";
		}

		componentDidUpdate()
		{
			var axis = d3.svg.axis().scale(this.props.scale).orient(this.orientation).tickFormat(this.props.format).tickSize(-1*this.props.length);
			d3.select(this.element).call(axis).selectAll("text")  // select all the text elements for the xaxis
			  .attr("transform", function(d) {
				 return "translate(" + this.getBBox().height*-2 + "," + (this.getBBox().height+7) + ")rotate(-45)";
			 });
		}

		render()
		{
			return (
				<g transform={"translate(" + this.props.x + "," + this.props.y + ")"} ref={(c) => {this.element = c}} className="axis"></g>
			);
		}
	}
}
