namespace weavejs.tool.d3tool
{
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;

	export interface AxisProps extends React.Props<AbstractAxis>
	{
		y:number;
		x:number;
		scale:Function
		// will be used later for now we are going to use 'linear'
		scalingMethod?:string;
		format:(num:any) => string;
		length:number; // the length of the axis for the grid lines
	}

	export interface AxisState
	{
		scale:Function;
	}

	export class AbstractAxis extends React.Component<AxisProps, AxisState>
	{
		element:SVGElement;
		scale:Function; // TODO, get the right signature for this function
		axis:any; // TODO, get the right signature for this function
		orientation:"top"|"bottom"|"left"|"right";

		constructor(props:AxisProps)
		{
			super(props);
		}
	}
}
