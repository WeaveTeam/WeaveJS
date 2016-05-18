import * as React from "react";
import * as ReactDOM from "react-dom";


export interface GuidanceToolTipProps extends React.HTMLProps<GuidanceToolTip>
{
	location:string;
}

export interface GuidanceToolTipState
{

}

export default class GuidanceToolTip extends React.Component<GuidanceToolTipProps,GuidanceToolTipState>
{

	constructor(props:GuidanceToolTipProps)
	{
		super(props);
		this.state = {
			visible:true
		}
	}

	componentWillReceiveProps(nextProps:GuidanceToolTipProps)
	{

	}


	render() {

		let containerStyle:React.CSSProperties = {
			position:"absolute",
		}

		let arrowStyle:React.CSSProperties = {
			position:"absolute",
			content:''
		}

		if(this.props.location == "bottom")
		{
			containerStyle.top = "8px";

			arrowStyle.top =  "-12px";
			arrowStyle.borderTopColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
			arrowStyle["borderBottomColor"] = "black";
			arrowStyle.borderLeftColor = "transparent";
		}
		else if(this.props.location == "right")
		{
			containerStyle.left = "8px";

			arrowStyle.top =  "8px";
			arrowStyle.left =  "-12px";
			arrowStyle.borderTopColor = "transparent";
			arrowStyle.borderRightColor = "black";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderLeftColor = "transparent";
		}



		return (
			<div style={ {position:"relative"} }>
				<div style={containerStyle} className="weave-guidance-toolTip">
					{this.props.children}
					<div style={arrowStyle} className="weave-guidance-toolTip-arrow"/>
				</div>
			</div>
			);
	}
}
