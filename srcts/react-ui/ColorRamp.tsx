import * as React from "react";
import * as _ from "lodash";

export interface ColorRampProps extends React.HTMLProps<HTMLDivElement>
{
	ramp: string[];
	direction?:string;
}

export interface ColorRampState
{
}

export default class ColorRamp extends React.Component<ColorRampProps, ColorRampState>
{

	constructor(props:ColorRampProps) {
		super(props);
	}

	render():JSX.Element {
		var direction:string = this.props.direction || "to right";
		var rampStyle:React.CSSProperties = {
			background: "linear-gradient("+  direction + "," + this.props.ramp.join(", ") + ")",
			border: '1px solid #ddd'
		};

		return (<div {...this.props} style={_.merge(this.props.style,rampStyle)}/>);
	}
}
