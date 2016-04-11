import * as React from "react";

export interface InputProps extends React.HTMLProps<Input>
{
	children?: React.ReactNode[];
}

export interface InputState
{	
}

export default class Input extends React.Component<InputProps, InputState>
{
	inputElement:HTMLInputElement;
	constructor(props:InputProps)
	{
		super(props);
	}
	
	render()
	{
		var inputProps:React.HTMLProps<HTMLInputElement> = {};

		for(var key in this.props)
		{
			if(key != "children")
			{
				(inputProps as any)[key] = (this.props as any)[key];
			}
		}

		return (
			<div className={"ui input " + (this.props.className || "")}>
				<input {...inputProps} ref={(c) => this.inputElement = c}/>
				{
					this.props.children
				}
			</div>
		);
	}
}
