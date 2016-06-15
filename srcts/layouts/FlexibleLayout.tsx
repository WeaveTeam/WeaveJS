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

var structure_LayoutState:any = {
	id: MiscUtils.nullableStructure(["string"]),
	children: null,
	flex: "number",
	direction: "string",
	maximized: "boolean"
};
structure_LayoutState.children = MiscUtils.nullableStructure([structure_LayoutState]);
var structure_FlexibleLayoutState:any = _.merge({title: "string"}, structure_LayoutState);

export type FlexibleLayoutState = {title?: string} & LayoutState;

export default class FlexibleLayout extends AbstractLayout<LayoutProps, {}> implements weavejs.api.core.ILinkableVariable
{
	private linkableState = Weave.linkableChild(this, new LinkableVariable(null, null, this.simplifyState({flex: 1, title: ""})), this.forceUpdate, true);
	private nextState:Object;
	private rootLayout:Layout;
	private layoutRect:ClientRect;
	private overlay:PanelOverlay;
	private draggedId:WeavePathArray; // required because we can't read drag data in dragover event
	private dragOverId:WeavePathArray;
	private dropZone:DropZone = DropZone.NONE;
	private prevClientWidth:number;
	private prevClientHeight:number;
	private outerZoneThickness:number = 16;
	
	constructor(props:LayoutProps)
	{
		super(props);
		weavejs.WeaveAPI.Scheduler.frameCallbacks.addGroupedCallback(this, this.frameHandler, true);
	}
	
	getSessionState():FlexibleLayoutState
	{
		return this.linkableState.state as FlexibleLayoutState;
	}
	
	setSessionState=(state:FlexibleLayoutState):void=>
	{
		state = this.simplifyState(MiscUtils.normalizeStructure(state, structure_FlexibleLayoutState));
		state.flex = 1; // root layout should always have flex 1
		this.linkableState.state = state;
	}
	
	get title():string
	{
		return this.getSessionState().title;
	}

	componentDidMount():void
	{
		this.repositionPanels();
		var document = ReactUtils.getDocument(this);
		document.addEventListener("mouseup", this.onMouseUp);
	}
	
	componentWillUnmount():void
	{
		var document = ReactUtils.getDocument(this);
		document.removeEventListener("mouseup", this.onMouseUp);
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
		var state = this.getSessionState();
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
		var state = this.getSessionState();
		var node:LayoutState = FlexibleLayout.findStateNode(state, id);
		if(node)
			node.id = newId;
		else
			console.error("Could not find id in this layout", id);
		this.setSessionState(state);
	}

	maximizePanel(id:WeavePathArray, maximized:boolean):void
	{
		var state = this.getSessionState();
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

	onDragStart(draggedId:WeavePathArray, event:React.DragEvent):void
	{
		var layout = this.rootLayout.getComponentFromId(draggedId);
		if (!layout)
			return;

		this.draggedId = draggedId;

		PanelDragEvent.setPanelId(event, draggedId, layout);
	}

	hideOverlay=():void=>
	{
		this.dropZone = DropZone.NONE;
		
		var overlayStyle = _.clone(this.overlay.state.style);
		overlayStyle.visibility = "hidden";
		overlayStyle.left = overlayStyle.top = overlayStyle.width = overlayStyle.height = 0;
		this.overlay.setState({
			style: overlayStyle
		});
	}

	onDragOver(dragOverId:WeavePathArray, event:React.DragEvent):void
	{
		event.preventDefault(); // allows the drop event to be triggered
		
		if (_.isEqual(dragOverId, OUTER_PANEL_ID))
		{
			// do nothing if there are panels
			var state = this.getSessionState();
			if (state.id || (state.children && state.children.length))
				return;
		}
		
		if (!PanelDragEvent.hasPanelId(event))
			return;

		try
		{
			event.dataTransfer.dropEffect = "move"; // hides the + icon browsers display
		}
		catch(e)
		{
			//Edge browser throws an error when the dropeffect property of dataTransfer is set
		}

		var dropZone:DropZone;
		[dropZone, dragOverId] = this.getDropZone(dragOverId);
		
		// hide the overlay if hovering over the panel being dragged
		if (_.isEqual(this.draggedId, dragOverId))
		{
			this.dragOverId = null;
			this.hideOverlay();
			return;
		}
		
		// stop if nothing changed
		if (this.dragOverId === dragOverId && this.dropZone === dropZone)
			return;

		this.dragOverId = dragOverId;
		this.dropZone = dropZone;
		
		var rect = this.getLayoutPosition(dragOverId);
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

	getDropZone(dragOverId:WeavePathArray):[DropZone, WeavePathArray]
	{
		if (_.isEqual(dragOverId, OUTER_PANEL_ID))
			return [DropZone.CENTER, OUTER_PANEL_ID];
		
		var state = this.getSessionState();
		var node:LayoutState = FlexibleLayout.findStateNode(state, dragOverId);
		if (node && node.maximized)
			return [DropZone.CENTER, dragOverId];
		
		// check for outer drop zones
		var rootElement = ReactDOM.findDOMNode(this.rootLayout);
		var rootRect = rootElement.getBoundingClientRect();
		var panelElement:Element = null;
		var event = MouseUtils.forComponent(this).mouseEvent;
		
		if (
			event.clientX <= rootRect.left + this.outerZoneThickness
			|| event.clientX >= rootRect.left + rootRect.width - this.outerZoneThickness 
			|| event.clientY <= rootRect.top + this.outerZoneThickness
			|| event.clientY >= rootRect.top + rootRect.height - this.outerZoneThickness
		) {
			dragOverId = OUTER_PANEL_ID;
			panelElement = rootElement;
		}
		else
		{
			panelElement = this.rootLayout.getElementFromId(dragOverId);
		}

		if (this.draggedId === dragOverId)
			return [DropZone.NONE, dragOverId];
		
		var rect = panelElement.getBoundingClientRect();

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
			return [DropZone.CENTER, dragOverId];
		
		var zoneIndex:number = Math.round((polarNorm.theta / (2 * Math.PI) * 4) + 4) % 4;

		var dropZone = [DropZone.RIGHT, DropZone.BOTTOM, DropZone.LEFT, DropZone.TOP][zoneIndex];
		return [dropZone, dragOverId];
	}

	simplifyState(state:FlexibleLayoutState, topLevel:boolean = true):FlexibleLayoutState
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
			var child:LayoutState = this.simplifyState(state.children[i], false);
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
		var totalSizeChildren:number = _.sum(_.map(state.children, child => child.flex));
		for (var i = 0; i < state.children.length; i++)
			state.children[i].flex = StandardLib.normalize(state.children[i].flex || 1, 0, totalSizeChildren);

		if (state.children.length === 1)
		{
			var flex = state.flex;
			var title = state.title;
			
			state = this.simplifyState(state.children[0], false);
			
			state.flex = flex;
			if (topLevel)
				state.title = title;
		}

		return state;
	}

	onDrop(dragOverId:WeavePathArray, event:React.DragEvent):void
	{
		var sourceLayout = PanelDragEvent.getLayout(event, Weave.getWeave(this));
		var srcId = PanelDragEvent.getPanelId(event);
		//r destId = dragOverId;
		console.log(" srcID, destId", srcId,this.dragOverId);
		
		this.handlePanelDrop(sourceLayout, srcId, this.dragOverId, this.dropZone);
		
		// cleanup
		this.draggedId = null;
		this.hideOverlay();
	}
	
	onDragLeave=(event:React.DragEvent):void=>
	{
		if (!MouseUtils.isMouseOver(ReactDOM.findDOMNode(this) as HTMLElement, event.nativeEvent as DragEvent, false))
			this.hideOverlay();
	}
	
	onDragEnd=(event:React.DragEvent):void=>
	{
		this.hideOverlay();
	}
	
	onMouseUp=(event:MouseEvent):void=>
	{
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
			if (dropZone === DropZone.CENTER && destId)
				sourceLayout.replacePanel(srcId, destId);
			else
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
				srcNode.id = destId; // may be null, but simplifyState() will take care of it
			else if (sourceLayout)
				sourceLayout.removePanel(srcId);
			
			if (destId)
				destNode.id = srcId;
			else
				newState.id = srcId;
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
			
			if (srcNode)
				srcNode.id = null; // simplifyState() will remove the node

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

	getLayoutPosition(layoutOrId:Layout | WeavePathArray):ClientRect
	{
		if (_.isEqual(layoutOrId, OUTER_PANEL_ID))
			layoutOrId = this.rootLayout;
		if (!(layoutOrId instanceof Layout))
			layoutOrId = this.rootLayout.getComponentFromId(layoutOrId);
		var layout:Layout = layoutOrId as Layout;
		if (layout.state.maximized)
			layout = this.rootLayout;
		return DOMUtils.getOffsetRect(ReactDOM.findDOMNode(this) as HTMLElement, ReactDOM.findDOMNode(layout) as HTMLElement);
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
			var rect = this.getLayoutPosition(layout);
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
					    onDrop={ this.onDrop.bind(this, path) }
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
			<div
				ref={ReactUtils.registerComponentRef(this)}
				{...this.props as React.HTMLAttributes}
				style={style}
				onDragOver={ this.onDragOver.bind(this, OUTER_PANEL_ID) }
			    onDrop={ this.onDrop.bind(this, OUTER_PANEL_ID) }
				onDragLeave={ this.onDragLeave }
				onDragEnd={ this.onDragEnd }
			>
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
