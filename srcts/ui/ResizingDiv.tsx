import * as React from "react";
import * as _ from "lodash";

export interface ResizingDivProps extends React.HTMLProps<ResizingDiv>
{
}

export interface ResizingDivState
{
	width?:number;
	height?:number;
}

/**
 * Provides a way to make elements using percentage coordinates resize properly within a div that uses flex layout.
 */
export default class ResizingDiv extends React.Component<ResizingDivProps, ResizingDivState>
{
	state:ResizingDivState = {};
	outerDiv:HTMLDivElement;

	componentDidMount()
	{
		weavejs.WeaveAPI.Scheduler.frameCallbacks.addImmediateCallback(this, this.handleFrame);
	}

	handleFrame()
	{
		this.setState({
			width: this.outerDiv.offsetWidth,
			height: this.outerDiv.offsetHeight
		});
	}

	componentWillUnmount()
	{
		weavejs.WeaveAPI.Scheduler.frameCallbacks.removeCallback(this, this.handleFrame);
	}
	
	render()
	{
		var style:Object = _.merge({flex: 1}, this.props.style, {overflow: 'hidden'})
		return (
			<div ref={(div:HTMLDivElement) => this.outerDiv = div as any} {...this.props as any} style={style}>
				<div style={{width: this.state.width, height: this.state.height}}>
					{ this.props.children }
				</div>
			</div>
		);
	}
}
