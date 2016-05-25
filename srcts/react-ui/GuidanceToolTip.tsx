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

	static TOP:string = "top";
	static TOP_LEFT:string = "top left";
	static TOP_RIGHT:string = "top right";


	static LEFT:string = "left";
	static LEFT_TOP:string = "left top";
	static LEFT_BOTTOM:string = "left bottom";

	static RIGHT:string = "right";
	static RIGHT_TOP:string = "right top";
	static RIGHT_BOTTOM:string = "right bottom";

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
		if(Boolean(urlParams.skipGuidance))
		{
			return <div/>;
		}


		let typeUI:JSX.Element = <span style={{color:"orange"}}>{this.props.type} : </span>;

		let relativeParentStyle:React.CSSProperties = {
			position:"relative",
			zIndex:1,
			margin:0

		};

		let wrapperStyle:React.CSSProperties = {
			position:"absolute"
		};


		let containerStyle:React.CSSProperties = {
			whiteSpace:"nowrap"
		};

		let arrowStyle:React.CSSProperties = {
			position:"absolute"
		};

		if(this.props.location == GuidanceToolTip.BOTTOM)
		{
			relativeParentStyle.width = "100%";

			wrapperStyle.width = "100%";
			wrapperStyle.display = "flex"; //important so that children takes size of its contents

			containerStyle.top = "8px";
			containerStyle.margin = "0 auto"; // container after getting its width from child will margin left and right equal space, thereby centers it
			arrowStyle.top = "-16px";
			arrowStyle.left = "50%";
			arrowStyle.borderTopColor = "transparent";
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}
		else if(this.props.location == GuidanceToolTip.BOTTOM_RIGHT)
		{
			wrapperStyle.top = "8px";
			wrapperStyle.right = "8px";

			arrowStyle.top = "-16px";
			arrowStyle.right = "8px";
			arrowStyle.borderTopColor = "transparent";
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}
		else if(this.props.location == GuidanceToolTip.BOTTOM_LEFT)
		{
			wrapperStyle.top = "8px";
			wrapperStyle.left = "8px";

			arrowStyle.top = "-16px";
			arrowStyle.left = "8px";
			arrowStyle.borderTopColor = "transparent";
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}
		else if(this.props.location == GuidanceToolTip.TOP)
		{
			relativeParentStyle.width = "100%";

			wrapperStyle.width = "100%";
			wrapperStyle.display = "flex"; //important so that children takes size of its contents

			containerStyle.bottom = "8px";
			containerStyle.margin = "0 auto"; // container after getting its width from child will margin left and right equal space, thereby centers it

			arrowStyle.bottom = "-16px";
			arrowStyle.left = "50%";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}
		else if(this.props.location == GuidanceToolTip.TOP_RIGHT)
		{
			wrapperStyle.bottom = "8px";
			wrapperStyle.right = "8px";

			arrowStyle.bottom = "-16px";
			arrowStyle.right = "8px";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}
		else if(this.props.location == GuidanceToolTip.TOP_LEFT)
		{
			wrapperStyle.bottom = "8px";
			wrapperStyle.left = "8px";

			arrowStyle.bottom = "-16px";
			arrowStyle.left = "8px";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}
		else if(this.props.location == GuidanceToolTip.RIGHT)
		{
			wrapperStyle.left = "8px";

			arrowStyle.top =  "8px";
			arrowStyle.left =  "-16px";
			arrowStyle.borderTopColor = "transparent";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderLeftColor = "transparent";
			
		}
		else if(this.props.location == GuidanceToolTip.LEFT)
		{
			wrapperStyle.right = "8px";

			arrowStyle.top =  "8px";
			arrowStyle.right =  "-16px";
			arrowStyle.borderTopColor = "transparent";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}

		return (<div style={ relativeParentStyle }>
					<div style={ wrapperStyle }>
						<div style={containerStyle} className="weave-guidance-toolTip">
							{typeUI}
							{this.props.children}
							<div style={arrowStyle} className="weave-guidance-toolTip-arrow"/>
						</div>
					</div>

				</div>);
	}
}


