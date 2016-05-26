import * as React from "react";

export interface ButtonProps extends React.HTMLProps<HTMLButtonElement>
{
	colorClass?: string;
}

export interface ButtonState
{	
}

export default class Button extends React.Component<ButtonProps, ButtonState>
{
	constructor(props:ButtonProps)
	{
		super(props);
	}
	
	static defaultProps:ButtonProps = {
		colorClass: ""
	}
	
	render()
	{
		return (
			<button {...this.props} className={"ui " + this.props.colorClass + " button " + (this.props.className || "")}>
				{
					this.props.children
				}
			</button>
		);
	}
}
