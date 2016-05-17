import * as React from "react";
import * as _ from "lodash";

export interface CenteredIconProps extends React.HTMLProps<HTMLSpanElement>
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
			<span className="weave-icon"  {...this.props} style={_.merge(this.props.style||{}, {alignSelf: "stretch", display: "flex", cursor: "pointer"})}>
				{this.props.children || <i {...this.props.iconProps} style={_.merge(this.props.iconProps.style||{}, {alignSelf: "center"})}/>}
			</span>
		)
	}
}
