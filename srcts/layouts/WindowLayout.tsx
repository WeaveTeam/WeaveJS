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
import {AbstractLayout, LayoutProps, AnyAbstractLayout} from "./AbstractLayout";
import Div from "../react-ui/Div";

import LinkableVariable = weavejs.core.LinkableVariable;
import {Structure} from "../utils/MiscUtils";
import {WeavePathArray} from "../utils/WeaveReactUtils";

export interface PanelState
{
	id?: WeavePathArray;
	position?: DraggableDivState;
	maximized?: boolean;
}

export interface LayoutState
{
	panels:PanelState[];
	title:string;
}

const stateStructure:Structure = {
	panels: [
		{
			id: MiscUtils.nullableStructure(["string"]),
			position: {
				left: "string",
				top: "string",
				width: "string",
				height: "string"
			},
			maximized: "boolean"
		}
	],
	title: "string"
};

export default class WindowLayout extends AbstractLayout<LayoutProps, {}> implements weavejs.api.core.ILinkableVariable
{
	private linkableState = Weave.linkableChild(this, new LinkableVariable(null, null, MiscUtils.normalizeStructure({}, stateStructure)), this.forceUpdate, true);
	private overlay:Div;

	constructor(props:LayoutProps)
	{
		super(props);
	}

	setSessionState(state:LayoutState):void
	{
		if(Array.isArray(state))
		{
			state = {
				panels: state
			} as any;
		}
		this.linkableState.state = MiscUtils.normalizeStructure(state, stateStructure);
	}

	getSessionState():LayoutState
	{
		return this.linkableState.state as LayoutState;
	}

	get title()
	{
		return this.getSessionState().title;
	}

	bringPanelForward(id:WeavePathArray):void
	{
		var panelState:PanelState = null;
		var state = this.getSessionState();
		var panels = state.panels.filter(item => {
			if (_.isEqual(id, item.id))
			{
				panelState = item;
				return false;
			}
			return true;
		});

		if (!panelState)
			return;

		state.panels = panels;
		state.panels.push(panelState);
		this.setSessionState(state);
	}

	onReposition(id:WeavePathArray, position:DraggableDivState)
	{
		this.updatePanelState(id, {position});
	}

	addPanel(id:WeavePathArray):void
	{
		var state = this.getSessionState();
		state.panels = state.panels.concat({id, position: WindowLayout.generatePosition()});
		this.setSessionState(state);
	}
	
	static generatePosition():DraggableDivState
	{
		return {
			left: WindowLayout.fudgePercent(5, 3),
			top: WindowLayout.fudgePercent(5, 3),
			width: "50%",
			height: "50%"
		};
	}

	static fudgePercent(n:number, delta:number):string
	{
		return Math.round(n - delta + Math.random() * 2 * delta) + '%';
	}

	removePanel(id:WeavePathArray):void
	{
		var state = this.getSessionState();
		state.panels = state.panels.filter(item => !_.isEqual(id, item.id));
		this.setSessionState(state);
	}

	maximizePanel(id:WeavePathArray, maximized:boolean):void
	{
		this.updatePanelState(id, {maximized});
	}

	getPanelIds():WeavePathArray[]
	{
		return this.getSessionState().panels.map(panel => panel.id);
	}
	
	updatePanelState(id:WeavePathArray, diff:PanelState):void
	{
		var state = this.getSessionState();
		state.panels = state.panels.map(item => (
			_.isEqual(item.id, id)
			?	_.merge({}, item, diff) as PanelState
			:	item
		));
		this.setSessionState(state);
	}

	onDragStart(panelDragged:WeavePathArray, event:React.DragEvent)
	{
		// (event as any).dataTransfer.setDragImage(this.rootLayout.getElementFromId(panelDragged), 0, 0);
		event.dataTransfer.setData('text/plain', JSON.stringify({
			layout: Weave.findPath(Weave.getRoot(this), this),
			panelDragged
		}));
		console.log("drag start", event);
	}

	onDrag(panelDragged:WeavePathArray, event:React.DragEvent)
	{
		console.log("dragging", event);
	}

	onDrop(event:React.DragEvent)
	{
		var dragData = AbstractLayout.readDragData(event);
		var panelDragged = dragData.panelDragged;
		var otherLayout = Weave.followPath(Weave.getRoot(this), dragData.layout) as AbstractLayout;

		console.log(otherLayout);
		console.log(ReactUtils.findComponent(Weave.followPath(Weave.getRoot(this), panelDragged) as AbstractLayout), AbstractLayout);
		// remove the panel from the other layout;
		// add it to this layout;
		if(otherLayout && otherLayout != this)
		{
			otherLayout.removePanel(panelDragged);
			this.addPanel(panelDragged);
		}
	}

	render():JSX.Element
	{
		var weave = Weave.getWeave(this);
		var state = this.getSessionState();
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
			    onDrop={this.onDrop.bind(this)}
			>
				{
					state.panels.map(state => {
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
								onDragStart={this.onDragStart.bind(this, state.id)}
								onDrag={this.onDrag.bind(this, state.id)}
								movable={!state.maximized}
								resizable={!state.maximized}
								getExternalOverlay={() => this.overlay}
								className={classNames("weave-app", "weave-window")}
								style={style}
								onMouseDown={(event) => this.bringPanelForward(state.id)}
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
	[weavejs.api.core.ILinkableVariable],
	"Window Layout"
);
