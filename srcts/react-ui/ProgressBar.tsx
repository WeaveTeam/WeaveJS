import * as React from "react";
import classnames from "../modules/classnames";
import * as _ from "lodash";

export interface ProgressBarProps extends React.HTMLProps<ProgressBar>
{
	progressValue?:any; //number;
	className?:string;
	style?:React.CSSProperties;
}

export interface ProgressBarState
{
	visible:boolean;
}

export default class ProgressBar extends React.Component<ProgressBarProps, ProgressBarState>
{
	constructor(props:ProgressBarProps)
	{
		super(props);

		this.state ={
			visible: props.progressValue == 1 ? false : true
		}
	}


	componentWillReceiveProps(nextProps:ProgressBarProps)
	{
		if(nextProps.progressValue != 1)
		{
			this.setState({
				visible:true
			});
		}
	}

	// this ensures the render function gets progress value 1 atleast once to show full width
	componentDidUpdate(){
		if(this.props.progressValue == 1 && this.state.visible)
		{
			this.setState({
				visible:false
			});
		}
	}

	// important to keep its absolute and since its container is relative,
	// it will position in the relative parent top left
	// and since relative height is not given absolute values they will be zero as it doesn't contain any static children
	// This will ensure progress bar won't take space on the screen and it overlays on the component below the progress bar
	render()
	{
		let width:number =(this.props.progressValue || 0) /  1 * 100;
		let progressUI:JSX.Element = null;
		// width gets value 0 when all task are done
		if(width != 0 && this.state.visible)
		{
			// absolute child
			progressUI =<div className="weave-progress-bar" style={ {width: String(width) + "%", position:"absolute"} }/>;
		}
		// relative Zero Height parent for absolute child
		return (
			<div {...this.props as any}
				className={classnames("weave-progress-bar-background", this.props.className)}
				style={_.merge({width: "100%", position:"relative"}, this.props.style)}
			>
				{progressUI}
			</div>
		);
	}
}
