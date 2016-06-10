import * as React from "react";
import classnames from "../modules/classnames";
import * as _ from "lodash";

export interface ProgressBarProps extends React.HTMLProps<HTMLDivElement>
{
	progressValue?:number;
	total?:number;
	className?:string;
	style?:React.CSSProperties;
	visible:boolean;
}

export default function progressBar(props:ProgressBarProps)
{
	return (
		<div {...props as any}
			className={classnames("weave-progress-bar-background", props.className)}
			style={_.merge({width: "100%", position:"relative"}, props.style)}
		>
			{
				props.visible
				?   <div className="weave-progress-bar" style={ {width: ((props.progressValue || 0) / (props.total ||  1) * 100) + "%", position:"absolute"} }/>
				:   null
			}
		</div>
	);
}
