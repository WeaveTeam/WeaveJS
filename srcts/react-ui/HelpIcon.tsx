import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import ReactUtils from "../utils/ReactUtils";

export interface HelpIconProps extends React.Props<HelpIcon>
{
}

export interface HelpIconstate
{
	
}

export default class HelpIcon extends React.Component<HelpIconProps, HelpIconstate>
{
	popup:React.ReactInstance
	constructor(props:HelpIconProps)
	{
		super(props);
	}
	
	onMouseEnter = (event:React.MouseEvent) =>
	{
		var style:React.CSSProperties = {
			position: "absolute",
			top: event.pageY + 10,
			left: event.pageX + 10,
			width: 400
		};

		this.popup = ReactUtils.openPopup(
			<HBox style={style} className="weave-menu weave-help-message">
			 	{this.props.children}
			</HBox>
		);
	}
	
	onMouseLeave = (event:React.MouseEvent) =>
	{
		ReactUtils.closePopup(this.popup);
	}
	
	render()
	{
		return <i style={{paddingLeft: 5, paddingRight: 5}} className="weave-help-icon fa fa-question-circle" onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}/>
	}
}
