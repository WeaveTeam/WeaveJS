import * as React from "react";
import classnames from "../modules/classnames";
import * as _ from "lodash";

export interface ProgressBarProps extends React.HTMLProps<ProgressBar>
{
	progressValue?:any; //number;
	total?:number;
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

	render()
	{
		return (
			<div {...this.props as any} className={classnames("weave-progress-bar-background", this.props.className)} style={_.merge({width: "100%", height: 3}, this.props.style)}>
				<div className="weave-progress-bar" style={{width: ((this.props.progressValue || 0)/(this.props.total || 1) * 100)+"%", height: "100%"}}></div>
			</div>
		)
	}
}
