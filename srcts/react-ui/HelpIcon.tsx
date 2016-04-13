import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import ReactUtils from "../utils/ReactUtils";
import ToolTip from "./ToolTip";

export interface HelpIconProps extends React.HTMLProps<HelpIcon>
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
		var props:HelpIconProps = {};
		for(var key in this.props)
			if(key != "children" && key != "ref" && key != "key")
				(props as any)[key] = (this.props as any)[key]

		return (
			<i  {...props as any} className={"weave-help-icon fa fa-question-circle" + (this.props.className || "")}
				onMouseEnter={(event) => ToolTip.open(this.props.children, event, { style: { width: 400 }, className: "weave-help-tooltip"})} 
				onMouseLeave={ToolTip.close}/>
		)
	}
}
