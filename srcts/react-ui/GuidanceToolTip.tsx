import * as React from "react";
import * as ReactDOM from "react-dom";
import MiscUtils from "../utils/MiscUtils";


export interface GuidanceToolTipProps extends React.HTMLProps<GuidanceToolTip>
{
	location:string;
	type: string;
	onClose?:Function
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

	closeHandler=()=>{
		if(this.props.onClose){
			this.props.onClose();
		}
	}


	render() {

		let urlParams:any = MiscUtils.getUrlParams();
		if(Boolean(urlParams.skipGuidance))
		{
			return <div/>;
		}


		let typeUI:JSX.Element = <span style={{color:"#FFBE00"}}>{this.props.type} : </span>;

		// needs to be realtive as we want absolute children to behave respective to this relative parent position
		let relativeParentStyle:React.CSSProperties = {
			position:"relative",
			zIndex:1,
			margin:0
		};

		// wrapper has to be absolute to move the tooltip from parent position left | right | middle
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
			arrowStyle.borderTopColor = "transparent"; // 3 out 4 being transparent - creates a triangle
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}
		else if(this.props.location == GuidanceToolTip.BOTTOM_RIGHT)
		{
			wrapperStyle.top = "8px";
			wrapperStyle.right = "8px";

			arrowStyle.top = "-16px";
			arrowStyle.right = "8px";
			arrowStyle.borderTopColor = "transparent"; // 3 out 4 being transparent - creates a triangle
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}
		else if(this.props.location == GuidanceToolTip.BOTTOM_LEFT)
		{
			wrapperStyle.top = "8px";
			wrapperStyle.left = "8px";

			arrowStyle.top = "-16px";// negative value ensures arrow is ahead of tooltip
			arrowStyle.left = "8px";
			arrowStyle.borderTopColor = "transparent";// 3 out 4 being transparent - creates a triangle
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}
		else if(this.props.location == GuidanceToolTip.TOP)
		{
			relativeParentStyle.width = "100%"; // gets parent width

			wrapperStyle.width = "100%"; //
			wrapperStyle.display = "flex"; //important so that children takes size of its contents

			containerStyle.bottom = "8px";
			containerStyle.margin = "0 auto"; // container after getting its width from child will margin left and right equal space, thereby centers it

			arrowStyle.bottom = "-16px";
			arrowStyle.left = "50%"; // brings to center
			arrowStyle["borderBottomColor"] = "transparent";// 3 out 4 being transparent - creates a triangle
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

			arrowStyle.bottom = "-16px"; // negative value ensures arrow is ahead of tooltip
			arrowStyle.left = "8px";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderLeftColor = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}
		else if(this.props.location == GuidanceToolTip.RIGHT)
		{
			wrapperStyle.left = "8px";

			arrowStyle.top =  "8px";
			arrowStyle.left =  "-16px"; // negative value ensures arrow is ahead of tooltip
			arrowStyle.borderTopColor = "transparent";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderLeftColor = "transparent";
			
		}
		else if(this.props.location == GuidanceToolTip.LEFT)
		{
			wrapperStyle.right = "8px";

			arrowStyle.top =  "8px";
			arrowStyle.right =  "-16px";// negative value ensures arrow is ahead of tooltip
			arrowStyle.borderTopColor = "transparent";
			arrowStyle["borderBottomColor"] = "transparent";
			arrowStyle.borderRightColor = "transparent";
		}

		let closeButtonUI:JSX.Element = null;
		if(this.props.type === GuidanceToolTip.DONE)
		{
			let closeButtonStyle:React.CSSProperties = {
				position:"absolute",
				left:"50%",
				padding:"2px",
				paddingLeft:"6px",
				paddingRight:"6px",
				borderRadius:"50%",
				background:"red",
				border:"1px solid white",
				color:"white",
				cursor:"pointer"
			};

			closeButtonUI = <div style={{position:"relative"}}>
								<div style={closeButtonStyle} onClick={this.closeHandler}>X</div>
							</div>
		}



		return (<div style={ relativeParentStyle }>

					<div style={ wrapperStyle }>
						<div style={containerStyle} className="weave-guidance-toolTip">
							{typeUI}
							{this.props.children}
							<div style={arrowStyle} className="weave-guidance-toolTip-arrow"/>
							{closeButtonUI}
						</div>
					</div>

				</div>);
	}
}


