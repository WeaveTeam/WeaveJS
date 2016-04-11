import * as React from "react";

export interface ButtonProps extends React.HTMLProps<HTMLButtonElement>
{
	color?: string;
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
		color: "primary"
	}
	
	render()
	{
		return (
			<button {...this.props} className={"ui " + this.props.color + " button " + (this.props.className || "")}>
				{
					this.props.children
				}
			</button>
		);
	}
}
