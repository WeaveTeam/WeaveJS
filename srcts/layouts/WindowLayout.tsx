import * as React from "react";
import * as _ from "lodash";
import classNames from "../modules/classnames";
import SmartComponent from "../ui/SmartComponent";
import prefixer from "../react-ui/VendorPrefixer";
import DraggableDiv from "../react-ui/DraggableDiv";
import {DraggableDivState} from "../react-ui/DraggableDiv";
import WeaveComponentRenderer from "../WeaveComponentRenderer";
import {AbstractLayout, ILayoutProps, WeavePathArray} from "./AbstractLayout";
import Div from "../react-ui/Div";

import LinkableVariable = weavejs.core.LinkableVariable;

export interface WindowState
{
	/* id for the window */
	id: WeavePathArray;
	style: React.CSSProperties // technically only needs left, top, width and height but we may want to experiment with other things
} 

export default class WindowLayout extends AbstractLayout implements weavejs.api.core.ILinkableVariable
{
	private linkableState = Weave.linkableChild(this, new LinkableVariable(Array), this.forceUpdate, true);
	private overlay:Div;

	constructor(props:ILayoutProps)
	{
		super(props);
	}
	
	setSessionState(state:WindowState[]):void
	{
		state = Weave.AS(state, Array) || [];
		this.linkableState.state = state.map(item => _.pick(item, 'id', 'style'));
	}
	
	getSessionState():WindowState[]
	{
		return (this.linkableState.state || []) as WindowState[];
	}
	
	reorderPanels(index:number):void
	{
		var state = this.getSessionState()
		var topPanelState = state.splice(index, 1)[0];
		state.push(topPanelState)
		this.setSessionState(state);
	}

	onReposition(path:WeavePathArray, position:DraggableDivState)
	{
		this.setSessionState(this.getSessionState().map(item => (
			_.isEqual(item.id, path)
			?	{
					id: item.id,
					style: _.merge({}, item.style, position)
				}
			:	item
		)));
	}
	
	addItem(id:WeavePathArray):void
	{
		this.setSessionState(this.getSessionState().concat({id, style: {
			width: 300,
			height: 200
		}}));
	}
	
	removeItem(id:WeavePathArray):void
	{
		this.setSessionState(this.getSessionState().filter(item => !_.isEqual(id, item.id)));
	}
	
	componentDidMount():void
	{
		this.repositionPanels();
	}

	componentDidUpdate():void
	{
		this.repositionPanels();
	}
	
	frameHandler():void
	{
		// reposition on resize
		// var rect:ClientRect = Object(this.getLayoutPosition(this.rootLayout));
		// if (this.layoutRect.width != rect.width || this.layoutRect.height != rect.height)
		this.repositionPanels();
	}
	
	repositionPanels():void
	{
		this.getSessionState().map(state => {
			var ddiv = this.refs[JSON.stringify(state.id)] as DraggableDiv;
			var style = state.style || {};
			// only set the state for ddiv that have changed
			// saves render
			if(ddiv)
				ddiv.setState({
					top: style.top,
					left: style.left,
					width: style.width,
					height: style.height
				});
		})
	}
	
	render()
	{
		var weave = Weave.getWeave(this);
		var style = _.merge({flex: 1}, this.props.style, {
			position: "relative",
			overflow: "hidden"
		});

		return (
			<div {...this.props as React.HTMLAttributes} style={style}>
				{
					this.getSessionState().map((state, index) => {
						var key = JSON.stringify(state.id);
						return (
							<DraggableDiv
								key={key}
								ref={key}
								liveMoving={true}
								liveResizing={false}
								getExternalOverlay={() => this.overlay}
								className={classNames("weave-app", "weave-window")}
								style={_.merge({minWidth: 150, minHeight: 100}, state.style)}
								onMouseDown={(event) => this.reorderPanels(index)}
								draggable={!this.props.itemRenderer}
								onReposition={this.onReposition.bind(this, state.id)}
							>
							{
								this.props.itemRenderer
								?	this.props.itemRenderer(state.id)
								:	<WeaveComponentRenderer
										key={index}
										weave={weave}
										path={state.id}
										style={state.style}
									/>
								
							}
							</DraggableDiv>
						);
					})
				}
				<Div ref={(c:Div) => { this.overlay = c; }} style={{position: "absolute", visibility: "hidden"}}/>
			</div>
		);
	}	
}

Weave.registerClass(
	WindowLayout,
	'weave.ui.WindowLayout',
	[weavejs.api.core.ILinkableVariable]
);
