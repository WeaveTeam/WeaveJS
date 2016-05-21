import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import classNames from "../modules/classnames";
import SmartComponent from "../ui/SmartComponent";
import prefixer from "../react-ui/VendorPrefixer";
import MiscUtils from "../utils/MiscUtils";
import ReactUtils from "../utils/ReactUtils";
import DraggableDiv from "../react-ui/DraggableDiv";
import {DraggableDivState} from "../react-ui/DraggableDiv";
import WeaveComponentRenderer from "../WeaveComponentRenderer";
import {AbstractLayout, LayoutProps, WeavePathArray} from "./AbstractLayout";
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

	constructor(props:LayoutProps)
	{
		super(props);
	}
	
	setSessionState(state:WindowState[]):void
	{
		state = Weave.AS(state, Array) || [];
		this.linkableState.state = state.map(item => MiscUtils._pickDefined(item, 'id', 'position', 'maximized'));
	}
	
	getSessionState():WindowState[]
	{
		return (this.linkableState.state || []) as WindowState[];
	}
	
	findPanelState(id:WeavePathArray):WindowState
	{
		var panelState:WindowState = null;
		this.getSessionState().forEach(item => {
			if (_.isEqual(id, item.id))
			{
				panelState = item;
			}
		});
		return panelState;
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
			left: this.fudgePercent(5, 3),
			top: this.fudgePercent(5, 3),
			width: "50%",
			height: "50%"
		}}));
	}
	
	fudgePercent(n:number, delta:number):string
	{
		return Math.round(n - delta + Math.random() * 2 * delta) + '%';
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
	
	render():JSX.Element
	{
		var weave = Weave.getWeave(this);
		return (
			<div
				ref={ReactUtils.registerComponentRef(this)}
				{...this.props as React.HTMLAttributes}
				style={
					_.merge({flex: 1}, this.props.style, {
						position: "relative",
						overflow: "hidden"
					})
				}
			>
				{
					this.getSessionState().map(state => {
						var key = JSON.stringify(state.id);
						var style = {
							left: 0,
							top: 0,
							width: "100%",
							height: "100%",
							minWidth: "5%",
							minHeight: "5%"
						};
						if (!state.maximized)
							_.merge(style, state.position);
						
						return (
							<DraggableDiv
								key={key}
								liveMoving={true}
								liveResizing={false}
								movable={!state.maximized}
								resizable={!state.maximized}
								getExternalOverlay={() => this.overlay}
								className={classNames("weave-app", "weave-window")}
								style={style}
								onClick={(event) => this.bringPanelForward(state.id)}
								draggable={!this.props.panelRenderer}
								onReposition={this.onReposition.bind(this, state.id)}
							>
								{
									this.props.panelRenderer
									?	this.props.panelRenderer(state.id, {maximized: state.maximized}, this.props.panelRenderer)
									:	<WeaveComponentRenderer weave={weave} path={state.id}/>
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
