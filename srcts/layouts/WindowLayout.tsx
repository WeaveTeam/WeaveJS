import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import classNames from "../modules/classnames";
import SmartComponent from "../ui/SmartComponent";
import prefixer from "../react-ui/VendorPrefixer";
import MiscUtils from "../utils/MiscUtils";
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
		var element = ReactDOM.findDOMNode(this) as HTMLDivElement;
		
		this.getSessionState().forEach(state => {
			var ddiv = this.refs[JSON.stringify(state.id)] as DraggableDiv;
			var pos = state.position;
			if (!ddiv)
				return;
			
			if (state.maximized)
			{
				ddiv.setState({
					left: 0,
					top: 0,
					width: element.offsetWidth,
					height: element.offsetHeight
				});
			}
			else
			{
				ddiv.setState({
					left: pos ? pos.left : 0,
					top: pos ? pos.top : 0,
					width: pos ? pos.width : "100%",
					height: pos ? pos.height : "100%"
				});
			}
		});
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
						var style = _.merge({minWidth: "5%", minHeight: "5%"}, state.position);
						return (
							<DraggableDiv
								key={key}
								ref={key}
								liveMoving={true}
								liveResizing={false}
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
								?	this.props.panelRenderer(state.id, {maximized: state.maximized})
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
