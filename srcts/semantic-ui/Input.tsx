import * as React from "react";
import ToolTip from "../react-ui/ToolTip";

export interface InputProps extends React.HTMLProps<Input>
{
	children?: React.ReactNode;
	fluid?:boolean;
}

export interface InputState
{	
}

export default class Input extends React.Component<InputProps, InputState>
{
	inputElement:HTMLInputElement;

	static defaultProps:InputProps = {
		fluid:true
	};

	constructor(props:InputProps)
	{
		super(props);
	}

	render()
	{
		var inputProps:React.HTMLProps<HTMLInputElement> = {};

		// since typescript doesn't support destructuring yet
		// we manually remove children from props
		for(var key in this.props)
		{
			if(key != "children")
			{
				(inputProps as any)[key] = (this.props as any)[key];
			}
		}
		delete inputProps.title;
		delete inputProps.className;
		delete inputProps.style;

		if(inputProps.disabled)
		{
			if(inputProps.style)
			{
				inputProps.style["cursor"] = "not-allowed";
			}
			else
			{
				inputProps.style = {
					cursor: "not-allowed"
				}
			}
		}
		
		return (
			<div className={"ui input " + (this.props.fluid ? " fluid":"") + (this.props.className || "")}
				 style={this.props.style}
				 onMouseEnter={(event) => this.props.title && ToolTip.open(this.props.title, event)}
				 onMouseLeave={this.props.title && ToolTip.close}>
				<input {...inputProps} ref={(c) => this.inputElement = c}/>
				{
					this.props.children
				}
			</div>
		);
	}
}
