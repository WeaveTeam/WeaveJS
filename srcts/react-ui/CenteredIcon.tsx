import * as React from "react";
import * as _ from "lodash";
import classNames from "../modules/classnames";

export interface CenteredIconProps extends React.HTMLProps<CenteredIcon>
{
	iconProps?:React.HTMLProps<HTMLImageElement>
}

export interface CenteredIconState
{
}

export default class CenteredIcon extends React.Component<CenteredIconProps, CenteredIconState>
{
	constructor(props:CenteredIconProps)
	{
		super(props)
	}

	render() 
	{
		return (
			<button
				{...this.props as any}
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
