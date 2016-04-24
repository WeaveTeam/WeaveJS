import * as React from "react";
import ToolTip from "../react-ui/ToolTip";
import classNames from "../modules/classnames";

export interface InputProps extends React.HTMLProps<Input>
{
	children?: React.ReactNode;
	fluid?:boolean;
	disabled?:boolean;
}

export interface InputState
{	
}

export default class Input extends React.Component<InputProps, InputState>
{
	inputElement:HTMLInputElement;

	static defaultProps:InputProps = {
		fluid:true,
		disabled:false
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
		for (var key in this.props)
		{
			if (key != "children")
			{
				(inputProps as any)[key] = (this.props as any)[key];
			}
		}
		delete inputProps.title;
		delete inputProps.className;
		delete inputProps.style;

		var inputClass = classNames({
			'ui input': true,
			'fluid': this.props.fluid,
			'disabled': this.props.disabled
		}, this.props.className);

		return (
			<div className={inputClass}
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
