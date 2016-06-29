import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import ReactUtils from "../utils/ReactUtils";
import SmartComponent from "../ui/SmartComponent";

export declare type Size = {width:number, height:number};

export interface FloatingDivProps extends React.HTMLProps<FloatingDiv>
{
	useContentHeight?:boolean;
	useContentWidth?:boolean;
	innerStyle?:React.CSSProperties;
}

export interface FloatingDivState
{
	outerWidth?:number;
	outerHeight?:number;
	innerWidth?:number;
	innerHeight?:number;
}

/**
 * Provides a way to make elements using percentage coordinates resize properly within a div that uses flex layout.
 */
export default class FloatingDiv extends SmartComponent<FloatingDivProps, FloatingDivState>
{
	constructor(props:FloatingDivProps)
	{
		super(props);
		weavejs.WeaveAPI.Scheduler.frameCallbacks.addImmediateCallback(this, this.handleFrame);
	}	
	
	outerDiv:HTMLDivElement;
	innerDiv:HTMLDivElement;
	
	static getOffsetSize(element:HTMLElement):Size
	{
		// get floor of fractional width/height values if possible
		var rect = element.getBoundingClientRect();
		var width = element.offsetWidth == element.clientWidth ? Math.floor(rect.width) : element.offsetWidth;
		var height = element.offsetHeight == element.clientHeight ? Math.floor(rect.height) : element.offsetHeight;
		return {width, height}
	}

	handleFrame()
	{
		var outer:Size = FloatingDiv.getOffsetSize(this.outerDiv);
		var inner:Size = FloatingDiv.getOffsetSize(this.innerDiv);
		
		var state:FloatingDivState = {outerWidth: null, outerHeight: null, innerWidth:null, innerHeight: null};
		
		if (this.props.useContentWidth)
			state.outerWidth = inner.width;
		else
			state.innerWidth = outer.width;
		
		if (this.props.useContentHeight)
			state.outerHeight = inner.height;
		else
			state.innerHeight = outer.height;
		
		this.setState(state);
	}
	
	componentWillUnmount()
	{
		weavejs.WeaveAPI.Scheduler.frameCallbacks.removeCallback(this, this.handleFrame);
	}
	
	render()
	{
		var outerProps:React.HTMLAttributes = _.omit(this.props, "useContentHeight", "useContentWidth", "innerStyle");
		outerProps.style = _.merge(
			{
				position: 'static',
				width: this.state.outerWidth,
				height: this.state.outerHeight
			},
			outerProps.style,
			{overflow: 'hidden'}
		);
		var innerStyle:React.CSSProperties = _.merge(
			{
				position: 'absolute',
				width: this.state.innerWidth,
				height: this.state.innerHeight
			},
			this.state,
			this.props.innerStyle
		);
		
		return (
			<div ref={e => this.outerDiv = e} {...outerProps}>
				<div ref={e => this.innerDiv = e} style={innerStyle}>
					{ this.props.children }
				</div>
			</div>
		);
	}
}
