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
	id?: WeavePathArray;
	position?: DraggableDivState;
	maximized?: boolean;
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
		this.linkableState.state = state.map(item => _.pick(item, 'id', 'position'));
	}
	
	getSessionState():WindowState[]
	{
		return (this.linkableState.state || []) as WindowState[];
	}
	
	bringPanelForward(id:WeavePathArray):void
	{
		var panelState:WindowState = null;
		var state = this.getSessionState().filter(item => {
			if (_.isEqual(id, item.id))
			{
				panelState = item;
				return false;
			}
			return true;
		});
		
		if (!panelState)
			return;
		
		state.push(panelState);
		this.setSessionState(state);
	}

	onReposition(id:WeavePathArray, position:DraggableDivState)
	{
		this.updatePanelState(id, {position});
	}
	
	addPanel(id:WeavePathArray):void
	{
		this.setSessionState(this.getSessionState().concat({id, position: {
			width: 300,
			height: 200
		}}));
	}
	
	removePanel(id:WeavePathArray):void
	{
		this.setSessionState(this.getSessionState().filter(item => !_.isEqual(id, item.id)));
	}
	
	maximizePanel(id:WeavePathArray, maximized:boolean):void
	{
		this.updatePanelState(id, {maximized});
	}
	
	updatePanelState(id:WeavePathArray, diff:WindowState):void
	{
		this.setSessionState(this.getSessionState().map(item => (
			_.isEqual(item.id, id)
			?	_.merge({}, item, diff) as WindowState
			:	item
		)));
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
			var pos = state.position || {};
			// only set the state for ddiv that have changed
			// saves render
			if(ddiv)
				ddiv.setState({
					top: pos.top,
					left: pos.left,
					width: pos.width,
					height: pos.height
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
								style={_.merge({minWidth: 150, minHeight: 100}, state.position)}
								onMouseDown={(event) => this.bringPanelForward(state.id)}
								draggable={!this.props.panelRenderer}
								onReposition={this.onReposition.bind(this, state.id)}
							>
							{
								this.props.panelRenderer
								?	this.props.panelRenderer(state.id)
								:	<WeaveComponentRenderer
										key={index}
										weave={weave}
										path={state.id}
										style={state.position}
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
	'weavejs.layout.WindowLayout',
	[weavejs.api.core.ILinkableVariable]
);
