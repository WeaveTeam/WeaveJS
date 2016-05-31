import * as React from "react";
import * as ReactDOM from "react-dom";
import MiscUtils from "../utils/MiscUtils";
import GuidanceToolTip from "./GuidanceToolTip";


export interface GuidanceContainerProps extends React.HTMLProps<GuidanceContainer>
{
	direction?:string, //row | column
	location?:string, // column -> top | bottom (left | middle-default | right)  // row -> left | right (top | middle-default | bottom)
	type?:string, // start | next | done
	toolTip?:string,
	enableToolTip?:boolean,//todo
	enable?:boolean,
	onClose?:Function
}

export interface GuidanceContainerState
{
	close?:boolean
}

export default class GuidanceContainer extends React.Component<GuidanceContainerProps,GuidanceContainerState>
{

	static START:string = "Start";
	static NEXT:string = "Next";
	static DONE:string = "Done";


	static VERTICAL:string = "column";
	static HORIZONTAL:string = "row";

	constructor(props:GuidanceContainerProps)
	{
		super(props);
		this.state = {
			close:false
		}
	}

	componentWillReceiveProps(nextProps:GuidanceContainerProps)
	{

	}

	closeHandler=()=>{
		this.setState({close:true});
		if(this.props.onClose){
			this.props.onClose();
		}
	}

	render() {

		/*
		if(Boolean(urlParams.skipGuidance))
		{
			return <div/>;
		}*/
		let urlParams:any = MiscUtils.getUrlParams();
		let skipGuidance:boolean = Boolean(urlParams.skipGuidance);

		if(this.state.close || skipGuidance || !this.props.enable)
		{
			return <div>{this.props.children}</div>
		}


		let overlayStyle:React.CSSProperties = {
			position:"fixed",
			left:0,
			right:0,
			top:0,
			bottom:0,
			opacity:0.5,
			background:"black",
			zIndex:1
		};

		let overLayUI:JSX.Element  =  <div style={overlayStyle} />;


		let direction:string = this.props.direction ? this.props.direction : "row";

		return (<div>
					{overLayUI}
					<div style={ {position:"relative",zIndex:1} }>
						<div style={ {display:"flex",flexDirection:direction} }>
							{this.props.children}
							<GuidanceToolTip location={this.props.location} type={this.props.type} onClose={this.closeHandler}>
								{this.props.toolTip}
							</GuidanceToolTip>

						</div>
					</div>
				</div>);
	}
}


