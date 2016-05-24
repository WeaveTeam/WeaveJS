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

	static BOTTOM:string = "bottom";
	static BOTTOM_LEFT:string = "bottom left";
	static BOTTOM_RIGHT:string = "bottom right";
	static BOTTOM_MIDDLE:string = "bottom middle";

	static TOP:string = "top";
	static TOP_LEFT:string = "top left";
	static TOP_RIGHT:string = "top right";
	static TOP_MIDDLE:string = "top middle";


	static LEFT:string = "left";
	static LEFT_TOP:string = "left top";
	static LEFT_BOTTOM:string = "left bottom";
	static LEFT_MIDDLE:string = "left middle";

	static RIGHT:string = "right";
	static RIGHT_TOP:string = "right top";
	static RIGHT_BOTTOM:string = "right bottom";
	static RIGHT_MIDDLE:string = "right middle";

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
			content:'',
			borderColor:'transparent'
		}

		if(this.props.location.indexOf(GuidanceToolTip.BOTTOM) >= 0)
		{
			containerStyle.top = "8px";

			arrowStyle.top = "-12px";

			arrowStyle["borderBottomColor"] = "black";
		}
		 if(this.props.location.indexOf(GuidanceToolTip.TOP) >= 0)
		{
			containerStyle.bottom = "8px";

			arrowStyle.bottom = "-12px";

			arrowStyle.borderTopColor = "black";
		}
		 if(this.props.location.indexOf(GuidanceToolTip.RIGHT) >= 0)
		{
			containerStyle.left = "8px";

			arrowStyle.top =  "8px";
			arrowStyle.left =  "-12px";

			arrowStyle.borderRightColor = "black";
		}
		 if(this.props.location.indexOf(GuidanceToolTip.LEFT) >= 0)
		{
			containerStyle.right = "8px";

			arrowStyle.top =  "8px";
			arrowStyle.right =  "-12px";

			arrowStyle.borderLeftColor = "black";
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


