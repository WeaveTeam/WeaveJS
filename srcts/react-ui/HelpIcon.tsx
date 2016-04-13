import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import ReactUtils from "../utils/ReactUtils";
import ToolTip from "./ToolTip";

export interface HelpIconProps extends React.Props<HelpIcon>
{
}

export interface HelpIconstate
{
	
}

export default class HelpIcon extends React.Component<HelpIconProps, HelpIconstate>
{
	constructor(props:HelpIconProps)
	{
		super(props);
	}

	render()
	{
		return (
			<i  style={{paddingLeft: 5}} 
				className="weave-help-icon fa fa-question-circle" 
				onMouseEnter={(event) => ToolTip.open(this.props.children, event, { style: { width: 400 }, className: "weave-help-tooltip"})} 
				onMouseLeave={ToolTip.close}/>
		)
	}
}
