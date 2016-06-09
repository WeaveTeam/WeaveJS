import * as React from "react";
import classnames from "../modules/classnames";
import * as _ from "lodash";

export interface ProgressBarProps extends React.HTMLProps<ProgressBar>
{
	progressValue?:any; //number;
	visible?:boolean;
	className?:string;
	style?:React.CSSProperties;
}

export interface ProgressBarState
{
}

export default class ProgressBar extends React.Component<ProgressBarProps, ProgressBarState>
{
	constructor(props:ProgressBarProps)
	{
		super(props);
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
		if(width != 0 || this.props.visible)
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
