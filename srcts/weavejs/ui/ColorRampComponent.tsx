import * as React from "react";

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
		var style:React.CSSProperties = this.props.style ? this.props.style : {};
		if (hexColors.length > 1)
			style['background'] = "linear-gradient(to " + direction + "," + hexColors.join(", ") + ")";
		else
			style['background'] = hexColors[0];

		return (<div {...this.props} style={style}/>);
	}
}
