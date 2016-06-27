import * as React from "react";
import classNames from "../modules/classnames";

export interface CenteredIconProps extends React.HTMLProps<HTMLSpanElement>
{
	iconProps?:React.HTMLProps<HTMLImageElement>
}

export interface CenteredIconState
{
}

export default class CenteredIcon extends React.Component<CenteredIconProps, CenteredIconState>
{
	private element:HTMLElement;

	constructor(props:CenteredIconProps)
	{
		super(props);
	}

	render() 
	{
		return (
			<button
				ref={(e:HTMLButtonElement) => this.element = e}
				{...this.props}
				onMouseEnter={() => this.element.focus()}
				onMouseLeave={() => this.element.blur()}
				className={classNames("weave-transparent-button", this.props.className || "weave-icon")}
			>
				{
					this.props.children || (
						<i
							{...this.props.iconProps}
						/>
					)
				}
			</button>
		)
	}
}
