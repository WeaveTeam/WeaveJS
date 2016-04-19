import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import ReactUtils from "../utils/ReactUtils";

export interface ResizingDivProps extends React.HTMLProps<ResizingDiv>
{
	innerStyle?:React.CSSProperties;
	onResize?:(state:ResizingDivState)=>void;
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
		this.outerDiv = ReactDOM.findDOMNode(this) as HTMLDivElement;
		weavejs.WeaveAPI.Scheduler.frameCallbacks.addImmediateCallback(this, this.handleFrame);
	}

	handleFrame()
	{
		var rect = this.outerDiv.getBoundingClientRect();
		var width = this.outerDiv.offsetWidth == this.outerDiv.clientWidth ? rect.width : this.outerDiv.offsetWidth;
		var height = this.outerDiv.offsetHeight == this.outerDiv.clientHeight ? rect.height : this.outerDiv.offsetHeight;
		
		ReactUtils.updateState(this, {
			width: Math.floor(width),
			height: Math.floor(height)
		});
	}
	
	componentDidUpdate()
	{
		if (this.props.onResize)
			this.props.onResize(this.state);
	}

	componentWillUnmount()
	{
		weavejs.WeaveAPI.Scheduler.frameCallbacks.removeCallback(this, this.handleFrame);
	}
	
	render()
	{
		var outerStyle:React.CSSProperties = _.merge({flex: 1}, this.props.style, {overflow: 'hidden'});
		var innerStyle:React.CSSProperties = _.merge({}, this.state, this.props.innerStyle);
		return (
			<div {...this.props as any} style={outerStyle}>
				<div style={innerStyle}>
					{ this.props.children }
				</div>
			</div>
		);
	}
}
