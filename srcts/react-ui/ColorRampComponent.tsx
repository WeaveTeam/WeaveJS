import * as React from "react";
import * as _ from "lodash";

export interface ColorRampComponentProps extends React.HTMLProps<HTMLDivElement>
{
	ramp: string[];
	direction?:"left"|"right"|"top"|"bottom";
}

export interface ColorRampComponentState
{
}

export default class ColorRampComponent extends React.Component<ColorRampComponentProps, ColorRampComponentState>
{
	constructor(props:ColorRampComponentProps)
	{
		super(props);
	}

	render():JSX.Element
	{
		var hexColors:string[] = this.props.ramp || [];
		var direction:string = this.props.direction || "right";
		var style:React.CSSProperties = {
			border: '1px solid #ddd'
		};
		if (hexColors.length > 1)
			style['background'] = "linear-gradient(to " + direction + "," + hexColors.join(", ") + ")";
		else
			style['background'] = hexColors[0];

		return (<div {...this.props} style={_.merge(this.props.style, style)}/>);
	}
}
