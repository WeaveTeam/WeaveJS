import * as React from "react";
import * as ReactDOM from "react-dom";
import MiscUtils from "../utils/MiscUtils";


export interface GuidanceToolTipProps extends React.HTMLProps<GuidanceToolTip>
{
	location:string;
	type: string;
}

export interface GuidanceToolTipState
{

}

export default class GuidanceToolTip extends React.Component<GuidanceToolTipProps,GuidanceToolTipState>
{
	static START:string = "Start";
	static NEXT:string = "Next";
	static DONE:string = "Done";

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

		let urlParams:any = MiscUtils.getUrlParams();
		if(Boolean(urlParams.skipGuidance)){
			return <div/>;
		}


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

		let typeUI:JSX.Element = <span style={{color:"orange"}}>{this.props.type} : </span>;


		return (

			<div style={ {position:"relative"} }>
				<div style={containerStyle} className="weave-guidance-toolTip">
					{typeUI}
					{this.props.children}
					<div style={arrowStyle} className="weave-guidance-toolTip-arrow"/>
				</div>
			</div>
			);
	}
}


