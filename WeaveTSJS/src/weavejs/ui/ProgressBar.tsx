namespace weavejs.ui
{
	export interface ProgressBarProps extends React.HTMLProps<HTMLDivElement>
	{
		progressValue?:number;
		total?:number;
		className?:string;
		style?:React.CSSProperties;
		visible:boolean;
	}

	/* stateless component */
	export function ProgressBar(props:ProgressBarProps)
	{
		return (
			<div {...props as any}
				className={classNames("weave-progress-bar-background", props.className)}
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
}
