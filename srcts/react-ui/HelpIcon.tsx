import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import ReactUtils from "../utils/ReactUtils";

export interface HelpIconProps extends React.HTMLProps<HelpIcon>
{
}

export interface HelpIconState
{
	
}

export default class HelpIcon extends React.Component<HelpIconProps, HelpIconState>
{
	constructor(props:HelpIconProps)
	{
		super(props);
	}
	
	popup:React.ReactInstance;
	
	removePopup()
	{
		if (this.popup)
			ReactUtils.closePopup(this.popup);
		this.popup = null;
	}

	componentWillUnmount()
	{
		this.removePopup();
	}
	
	render()
	{
		var props:HelpIconProps = {};
		for (var key in this.props)
			if (key != "children" && key != "ref" && key != "key")
				(props as any)[key] = (this.props as any)[key]

		return (
			<i
				{...props as any}
				className={"weave-help-icon fa fa-question-circle fa-fw" + (" " + this.props.className || "")}
				onMouseEnter={(event) => {
					this.popup = ReactUtils.openPopup(
						<HBox
							style={{
								position: "absolute",
								left: event.clientX + 10,
								top: event.clientY + 10,
								width: 400
							}}
							className="weave-help-tooltip"
							children={this.props.children}
						/>
					);
				}} 
				onMouseLeave={() => this.removePopup()}
			/>
		)
	}
}
