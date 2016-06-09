import StandardLib = weavejs.util.StandardLib;
import LinkableVariable = weavejs.core.LinkableVariable;

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import Layout, {HORIZONTAL, VERTICAL, LayoutState} from "../react-ui/flexible-layout/Layout";
import Div from "../react-ui/Div";
import WeaveComponentRenderer from "../WeaveComponentRenderer";
import {AbstractLayout, LayoutProps, AnyAbstractLayout, PanelDragEvent} from "./AbstractLayout";
import PanelOverlay from "../PanelOverlay";
import MiscUtils, {Structure} from "../utils/MiscUtils";
import MouseUtils from "../utils/MouseUtils";
import ReactUtils from "../utils/ReactUtils";
import DOMUtils from "../utils/DOMUtils";
import {WeavePathArray} from "../utils/WeaveReactUtils";

export enum DropZone {
	NONE,
	LEFT,
	TOP,
	RIGHT,
	BOTTOM,
	CENTER
};

const OUTER_PANEL_ID:WeavePathArray = []; // special value to indicate dragging over outer drop zone

var stateStructure:any = {
	id: MiscUtils.nullableStructure(["string"]),
	children: null,
	flex: "number",
	direction: "string",
	maximized: "boolean"
};
stateStructure.children = MiscUtils.nullableStructure([stateStructure]);

export default class FlexibleLayout extends AbstractLayout<LayoutProps, {}> implements weavejs.api.core.ILinkableVariable
{
	private linkableState = Weave.linkableChild(this, new LinkableVariable(null, null, MiscUtils.normalizeStructure({flex: 1}, stateStructure)), this.forceUpdate, true);
	private nextState:Object;
	private rootLayout:Layout;
	private layoutRect:ClientRect;
	private overlay:PanelOverlay;
	private panelDragged:WeavePathArray; // required because we can't read drag data in dragover event
	private panelOver:WeavePathArray;
	private dropZone:DropZone = DropZone.NONE;
	private prevClientWidth:number;
	private prevClientHeight:number;
	private outerZoneThickness:number = 8;
	
	constructor(props:LayoutProps)
	{
		super(props);
		weavejs.WeaveAPI.Scheduler.frameCallbacks.addGroupedCallback(this, this.frameHandler, true);
	}
	
	getSessionState():LayoutState
	{
		return this.linkableState.state as LayoutState;
	}
	
	setSessionState=(state:LayoutState):void=>
	{
		state = this.simplifyState(MiscUtils.normalizeStructure(state, stateStructure));
		state.flex = 1; // root layout should always have flex 1
		this.linkableState.state = state;
	}

	componentDidMount():void
	{
		this.repositionPanels();
	}

	componentDidUpdate():void
	{
		this.repositionPanels();
	}

	addPanel(id:WeavePathArray):void
	{
		var state = this.getSessionState();
		// check if the current layout is empty
		if (!state.id && (state.children && !state.children.length))
		{
			state = {id};
		}
		else
		{
			let newFlex = (state.children && state.children.length) ? 1/state.children.length:null;
			state = {
				children: [state, {id, flex: newFlex}],
				direction: state.direction == 'horizontal' ? 'horizontal' : 'vertical'
			};
		}
		this.setSessionState(state);
	}

	removePanel(id:WeavePathArray):void
	{
		var state = _.cloneDeep(this.getSessionState());
		var node = FlexibleLayout.findStateNode(state, id);
		if (node)
		{
			delete node.id;
			node.children = [];
			this.setSessionState(state);
		}
	}

	replacePanel(id:WeavePathArray, newId:WeavePathArray)
	{
		var state = _.cloneDeep(this.getSessionState());
		var node:LayoutState = FlexibleLayout.findStateNode(state, id);
		if(node)
			node.id = newId;
		else
			console.error("Could not find id in this layout", id);
		this.setSessionState(state);
	}

	maximizePanel(id:WeavePathArray, maximized:boolean):void
	{
		var state = _.cloneDeep(this.getSessionState());
		var node = FlexibleLayout.findStateNode(state, id);
		if (node)
		{
			node.maximized = maximized;
			this.setSessionState(state);
		}
	}

	frameHandler():void
	{
		// reposition on resize
		var rect:ClientRect = Object(this.getLayoutPosition(this.rootLayout)) as ClientRect;
		if (this.layoutRect.width != rect.width || this.layoutRect.height != rect.height)
			this.repositionPanels();
	}

	onDragStart(panelDragged:WeavePathArray, event:React.DragEvent):void
	{
		var layout = this.rootLayout.getComponentFromId(panelDragged);
		if (!layout || layout === this.rootLayout || layout.state.maximized)
			return;

		this.panelDragged = panelDragged;

		PanelDragEvent.setPanelId(event, panelDragged, this.rootLayout.getElementFromId(panelDragged));
	}

	hideOverlay():void
	{
		var overlayStyle = _.clone(this.overlay.state.style);
		overlayStyle.visibility = "hidden";
		overlayStyle.left = overlayStyle.top = overlayStyle.width = overlayStyle.height = 0;
		this.overlay.setState({
			style: overlayStyle
		});
	}

	onDragOver(panelOver:WeavePathArray, event:React.DragEvent):void
	{
		event.preventDefault(); // allows the drop event to be triggered
		
		if (!PanelDragEvent.hasPanelId(event))
			return;
		
		event.dataTransfer.dropEffect = "move"; // hides the + icon browsers display
		
		var dropZone:DropZone;
		[dropZone, panelOver] = this.getDropZone(panelOver);
		
		// hide the overlay if hovering over the panel being dragged
		if (_.isEqual(this.panelDragged, panelOver))
		{
			this.panelOver = null;
			this.dropZone = DropZone.NONE;
			this.hideOverlay();
			return;
		}
		
		// stop if nothing changed
		if (this.panelOver === panelOver && this.dropZone === dropZone)
			return;

		this.panelOver = panelOver;
		this.dropZone = dropZone;
		
		var rect = this.getLayoutPosition(panelOver);
		var overlayStyle = _.clone(this.overlay.state.style);
		overlayStyle.visibility = rect ? "visible" : "hidden";
		if (rect)
		{
			overlayStyle.left = rect.left;
			overlayStyle.top = rect.top;
			overlayStyle.width = rect.width;
			overlayStyle.height = rect.height;
		}

		if (dropZone === DropZone.LEFT)
		{
			overlayStyle.width = rect.width / 2;
		}
		else if (dropZone === DropZone.RIGHT)
		{
			overlayStyle.left = rect.left + rect.width / 2;
			overlayStyle.width = rect.width / 2;
		}
		else if (dropZone === DropZone.BOTTOM)
		{
			overlayStyle.top = rect.top + rect.height / 2;
			overlayStyle.height = rect.height / 2;
		}
		else if (dropZone === DropZone.TOP)
		{
			overlayStyle.height = rect.height / 2;
		}

		this.overlay.setState({
			style: overlayStyle
		});
	}

	getDropZone(panelOver:WeavePathArray):[DropZone, WeavePathArray]
	{
		// check for outer drop zones
		var rootNode = ReactDOM.findDOMNode(this.rootLayout);
		var rootRect = rootNode.getBoundingClientRect();
		var panelNode:Element = null;
		var event = MouseUtils.forComponent(this).mouseEvent;
		
		if (
			event.clientX <= rootRect.left + this.outerZoneThickness
			|| event.clientX >= rootRect.left + rootRect.width - this.outerZoneThickness 
			|| event.clientY <= rootRect.top + this.outerZoneThickness
			|| event.clientY >= rootRect.top + rootRect.height - this.outerZoneThickness
		) {
			panelOver = OUTER_PANEL_ID;
			panelNode = rootNode;
		}
		else
		{
			panelNode = this.rootLayout.getElementFromId(panelOver);
		}
		
		if (this.panelDragged === panelOver)
			return [DropZone.NONE, panelOver];
		
		var rect = panelNode.getBoundingClientRect();

		var center = {
			x: (rect.right - rect.left) / 2,
			y: (rect.bottom - rect.top) / 2
		};

		var delta = {
			x: event.clientX - (rect.left + center.x),
			y: event.clientY - (rect.top + center.y)
		};

		var deltaNorm = {
			x: (delta.x) / (rect.width / 2),
			y: (delta.y) / (rect.height / 2)
		};

		var polarNorm = {
			r: Math.sqrt(deltaNorm.x * deltaNorm.x + deltaNorm.y * deltaNorm.y),
			theta: Math.atan2(deltaNorm.y, deltaNorm.x)
		};

		if (Math.abs(deltaNorm.x) <= .4 && Math.abs(deltaNorm.y) <= .4)
			return [DropZone.CENTER, panelOver];
		
		var zoneIndex:number = Math.round((polarNorm.theta / (2 * Math.PI) * 4) + 4) % 4;

		var dropZone = [DropZone.RIGHT, DropZone.BOTTOM, DropZone.LEFT, DropZone.TOP][zoneIndex];
		return [dropZone, panelOver];
	}

	simplifyState(state:LayoutState):LayoutState
	{
		if (!state)
			return {};
		
		if (state.id === undefined)
			delete state.id;
		if (state.children === undefined)
			delete state.children;
		
		if (!state.children)
		{
			if(!state.id)
				state.children = [];
			return state;
		}
		var simpleChildren:LayoutState[] = [];
		for (var i = 0; i < state.children.length; i++)
		{
			var child:LayoutState = this.simplifyState(state.children[i]);
			if (child.children && (child.direction === state.direction || !child.children.length))
			{
				var childChildren:LayoutState[] = child.children;
				for (var ii = 0; ii < childChildren.length; ii++)
				{
					var childChild:LayoutState = childChildren[ii];
					childChild.flex *= child.flex || 1;
					simpleChildren.push(childChild);
				}
			}
			else if(child.children || child.id)
			{
				simpleChildren.push(child);
			}
		}
		state.children = simpleChildren;
		
		//Scale flex values between 0 and 1 so they sum to 1, avoiding an apparent
		//flex bug where space is lost if sum of flex values is less than 1.
		var totalSizeChildren:number = _.sum(_.map(state.children, "flex"));
		for (var i = 0; i < state.children.length; i++)
			state.children[i].flex = StandardLib.normalize(state.children[i].flex || 1, 0, totalSizeChildren);

		if (state.children.length === 1)
		{
			var flex = state.flex;
			state = this.simplifyState(state.children[0]);
			state.flex = flex;
		}

		return state;
	}

	onDrop(event:React.DragEvent):void
	{
		var sourceLayout = PanelDragEvent.getLayout(event, Weave.getWeave(this));
		var srcId = PanelDragEvent.getPanelId(event);
		var destId = this.panelOver;
		
		this.handlePanelDrop(sourceLayout, srcId, destId, this.dropZone);
		
		// cleanup
		this.panelDragged = null;
		this.dropZone = DropZone.NONE;
		this.hideOverlay();
	}
	
	handlePanelDrop(sourceLayout:AnyAbstractLayout, srcId:WeavePathArray, destId:WeavePathArray, dropZone:DropZone)
	{
		if (_.isEqual(destId, OUTER_PANEL_ID))
			destId = null;
		
		if (!srcId || dropZone === DropZone.NONE || _.isEqual(srcId, destId))
			return;
		
		var sourceFlexibleLayout = Weave.AS(sourceLayout, FlexibleLayout)
		
		var newState:LayoutState = _.cloneDeep(this.getSessionState());
		var newSourceState:LayoutState;
		
		if (sourceLayout == this)
		{
			newSourceState = newState;
		}
		else if (sourceFlexibleLayout)
		{
			newSourceState = _.cloneDeep(sourceFlexibleLayout.getSessionState());
		}
		else if (sourceLayout)
		{
			sourceLayout.removePanel(srcId);
		}

		var srcNode:LayoutState = newSourceState && FlexibleLayout.findStateNode(newSourceState, srcId);
		var destNode:LayoutState = destId ? FlexibleLayout.findStateNode(newState, destId) : {};

		if (sourceFlexibleLayout && !srcNode)
		{
			console.error("Unexpected error = could not find source state node", srcId, newSourceState);
			return;
		}
		if (!destNode)
		{
			console.error("Unexpected error - could not find destination state node", destId, newState);
			return;
		}

		if (dropZone === DropZone.CENTER)
		{
			if (sourceFlexibleLayout)
			{
				srcNode.id = destId;
			}
			else if (sourceLayout)
			{
				sourceLayout.addPanel(destId);
			}
			destNode.id = srcId;
		}
		else
		{
			if (weavejs.WeaveAPI.Locale.reverseLayout)
			{
				if (dropZone === DropZone.LEFT)
					dropZone = DropZone.RIGHT;
				else if (dropZone === DropZone.RIGHT)
					dropZone = DropZone.LEFT;
			}

			if (sourceFlexibleLayout)
			{
				var srcParentArray:LayoutState[] = MiscUtils.findDeep(newSourceState, (obj:LayoutState) => {
					return Array.isArray(obj) && obj.indexOf(srcNode) >= 0;
				});
				srcParentArray.splice(srcParentArray.indexOf(srcNode), 1);
			}

			destNode.direction = (dropZone === DropZone.TOP || dropZone === DropZone.BOTTOM) ? VERTICAL : HORIZONTAL;

			if (destNode.id)
			{
				delete destNode.id;
				destNode.children = [
					{
						id: srcId,
						flex: 0.5
					},
					{
						id: destId,
						flex: 0.5
					}
				];
			}
			else
			{
				newState.flex = 0.5;
				destNode.children = [
					{
						id: srcId,
						flex: 0.5
					},
					newState
				];
				newState = destNode;
			}

			if (dropZone === DropZone.BOTTOM || dropZone === DropZone.RIGHT)
				destNode.children.reverse();
		}
		
		if (sourceFlexibleLayout && sourceFlexibleLayout != this)
			sourceFlexibleLayout.setSessionState(newSourceState);
		this.setSessionState(newState);
	}

	generateLayoutState(ids:WeavePathArray[]):Object
	{
		// temporary solution - needs improvement
		return this.simplifyState({
			flex: 1,
			direction: HORIZONTAL,
			children: ids.map(id => { return {id: id, flex: 1} })
		});
	}

	getLayoutPosition(layoutOrId:Layout | WeavePathArray):ClientRect
	{
		if (_.isEqual(layoutOrId, OUTER_PANEL_ID))
			layoutOrId = this.rootLayout;
		var node = layoutOrId instanceof Layout ? ReactDOM.findDOMNode(layoutOrId) : this.rootLayout.getElementFromId(layoutOrId);
		return DOMUtils.getOffsetRect(ReactDOM.findDOMNode(this) as HTMLElement, node as HTMLElement);
	}
	
	repositionPanels=(layout:Layout = null):void=>
	{
		if (!layout)
			layout = this.rootLayout;
		if (!layout)
			return;
		
		if (layout == this.rootLayout)
			this.layoutRect = Object(this.getLayoutPosition(layout)) as ClientRect;
		
		var div:Div = this.refs[JSON.stringify(layout.state.id)] as Div;
		if (div instanceof Div)
		{
			var rect = layout.state.maximized ? this.layoutRect : this.getLayoutPosition(layout);
			if (rect)
				div.setState({
					style: {
						position: "absolute",
						display: "flex",
						top: rect.top,
						left: rect.left,
						width: rect.width,
						height: rect.height
					}
				});
			else
				div.setState({
					style: {
						display: "none"
					}
				});
		}
		for (var child of layout.children)
			if (child)
				this.repositionPanels(child);
	}
	
	public static findStateNode(state:LayoutState, id:WeavePathArray):LayoutState
	{
		return MiscUtils.findDeep(state, (node:LayoutState) => node && _.isEqual(node.id, id));
	}
	
	private static getLeafNodes(state:LayoutState, output?:LayoutState[]):LayoutState[]
	{
		if (!output)
			output = [];
		if (state && state.id)
			output.push(state);
		if (state && state.children)
			for (var child of state.children)
				FlexibleLayout.getLeafNodes(child, output);
		return output;
	}
	
	getPanelIds():WeavePathArray[]
	{
		return FlexibleLayout.getLeafNodes(this.getSessionState()).map(node => node.id as WeavePathArray);
	}
	
	private static sortLeafNodes(node1:LayoutState, node2:LayoutState):number
	{
		var value1:number = node1.maximized ? 1 : 0;
		var value2:number = node2.maximized ? 1 : 0;
		if (value1 < value2)
			return -1;
		if (value1 > value2)
			return 1;
		return 0;
	}
	
	render():JSX.Element
	{
		var weave:Weave = Weave.getWeave(this);
		var newState:LayoutState = this.getSessionState();
		var components:JSX.Element[] = null;
		if (this.rootLayout)
		{
			components = FlexibleLayout.getLeafNodes(newState).sort(FlexibleLayout.sortLeafNodes).map(node => {
				var path = node.id as WeavePathArray;
				var key = JSON.stringify(path);
				return (
					<div
						key={key}
						onDragOver={ this.onDragOver.bind(this, path) }
						onDragStart={ this.onDragStart.bind(this, path) }
					    onDrop={this.onDrop.bind(this)}
					>
						<Div
							ref={key}
							children={
								this.props.panelRenderer
								?	this.props.panelRenderer(
										path,
										{ maximized: node.maximized },
										this.props.panelRenderer
									)
								:	<WeaveComponentRenderer
										weave={weave}
										path={path}
										style={{width: "100%", height: "100%"}}/>
							}
						/>
					</div>
				);
			});
		}
		
		var layout = Layout.renderLayout({
			key: "layout",
			ref: (layout:Layout) => {
				this.rootLayout = layout;
				if (layout)
					this.repositionPanels();
			},
			state: newState,
			onStateChange: this.setSessionState
		});

		var style = _.merge({flex: 1}, this.props.style, {
			display: "flex", // layout fills the entire area
			position: "relative", // allows floating panels to position themselves properly
			overflow: "hidden" // don't let overflow expand the div size
		});
		return (
			<div ref={ReactUtils.registerComponentRef(this)} {...this.props as React.HTMLAttributes} style={style}>
				{layout}
				{components}
				<PanelOverlay ref={(overlay:PanelOverlay) => this.overlay = overlay}/>
			</div>
		);
	}
}

Weave.registerClass(
	FlexibleLayout,
	'weavejs.layout.FlexibleLayout',
	[weavejs.api.core.ILinkableVariable],
	'Flexible Layout'
);
