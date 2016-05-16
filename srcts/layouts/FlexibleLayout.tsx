import StandardLib = weavejs.util.StandardLib;
import LinkableVariable = weavejs.core.LinkableVariable;

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import * as WeaveUI from "../WeaveUI";
import Layout from "../react-ui/flexible-layout/Layout";
import {HBox, VBox} from "../react-ui/FlexBox";
import Div from "../react-ui/Div";
import {HORIZONTAL, VERTICAL, LayoutState} from "../react-ui/flexible-layout/Layout";
import WeaveComponentRenderer from "../WeaveComponentRenderer";

import PanelOverlay from "../PanelOverlay";
import MiscUtils from "../utils/MiscUtils";
import DOMUtils from "../utils/DOMUtils";
import MouseUtils from "../utils/MouseUtils";

export enum DropZone {
	NONE,
	LEFT,
	TOP,
	RIGHT,
	BOTTOM,
	CENTER
};

const OUTER_PANEL_ID:WeavePathArray = []; // special value to indicate dragging over outer drop zone

declare type Point = {
	x?: number;
	y?: number;
	r?: number;
	theta?: number;
};

declare type PolarPoint = {
	x: number;
	y: number;
};

export declare type WeavePathArray = string[];

export type PanelProps = {
	onDragStart:React.DragEventHandler,
	onDragEnd:React.DragEventHandler,
	onDragOver:React.DragEventHandler
};

export interface IFlexibleLayoutProps extends React.HTMLProps<FlexibleLayout>
{
	panelRenderer: (id:WeavePathArray, panelProps?:PanelProps) => JSX.Element;
}

export interface IFlexibleLayoutState extends LayoutState
{
}

export default class FlexibleLayout extends React.Component<IFlexibleLayoutProps, IFlexibleLayoutState> implements weavejs.api.core.ILinkableVariable
{
	private linkableState = Weave.linkableChild(this, LinkableVariable, this.forceUpdate, true);
	private nextState:Object;
	private rootLayout:Layout;
	private layoutRect:ClientRect;
	private overlay:PanelOverlay;
	private panelDragged:WeavePathArray;
	private panelOver:WeavePathArray;
	private dropZone:DropZone = DropZone.NONE;
	private prevClientWidth:number;
	private prevClientHeight:number;
	private outerZoneThickness:number = 8;
	
	constructor(props:IFlexibleLayoutProps)
	{
		super(props);
		weavejs.WeaveAPI.Scheduler.frameCallbacks.addGroupedCallback(this, this.frameHandler, true);
	}
	
	getSessionState():LayoutState
	{
		return this.linkableState.state;
	}
	
	setSessionState=(state:LayoutState):void=>
	{
		state = MiscUtils._pickBy(_.pick(state, 'id', 'children', 'flex', 'direction', 'maximize'), _.negate(_.isUndefined));
		state = this.simplifyState(state);
		state.flex = 1;
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
	
	frameHandler():void
	{
		// reposition on resize
		var rect:ClientRect = Object(this.getLayoutPosition(this.rootLayout));
		if (this.layoutRect.width != rect.width || this.layoutRect.height != rect.height)
			this.repositionPanels();
	}

	onDragStart(panelDragged:WeavePathArray, event:React.MouseEvent):void
	{
		var layout = this.rootLayout.getComponentFromId(panelDragged);
		if (!layout || layout === this.rootLayout || layout.state.maximized)
			return;
		
		this.panelDragged = panelDragged;

		// hack because dataTransfer doesn't exist on type event
		(event as any).dataTransfer.setDragImage(this.rootLayout.getElementFromId(panelDragged), 0, 0);
		(event as any).dataTransfer.setData('text/html', null);
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

	onDragEnd():void
	{
		if (this.panelDragged && this.panelOver)
		{
			this.updateLayout();
			this.panelDragged = null;
			this.dropZone = DropZone.NONE;
			this.hideOverlay();
		}
	}

	onDragOver(panelOver:WeavePathArray, event:React.MouseEvent):void
	{
		if (!this.panelDragged)
			return;
		
		var dropZone:DropZone;
		[dropZone, panelOver] = this.getDropZone(panelOver, event);
		
		// hide the overlay if hovering over the panel being dragged
		if (this.panelDragged === panelOver)
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

	getDropZone(panelOver:WeavePathArray, event:React.MouseEvent):[DropZone, WeavePathArray]
	{
		if (!this.panelDragged)
			return [DropZone.NONE, panelOver];
		
		// check for outer drop zones
		var rootNode = ReactDOM.findDOMNode(this.rootLayout);
		var rootRect = rootNode.getBoundingClientRect();
		var panelNode:typeof rootNode = null;
		
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

		var center:Point = {
			x: (rect.right - rect.left) / 2,
			y: (rect.bottom - rect.top) / 2
		};

		var delta:Point = {
			x: event.clientX - (rect.left + center.x),
			y: event.clientY - (rect.top + center.y)
		};

		var deltaNorm:Point = {
			x: (delta.x) / (rect.width / 2),
			y: (delta.y) / (rect.height / 2)
		};

		var polarNorm:Point = {
			r: Math.sqrt(deltaNorm.x * deltaNorm.x + deltaNorm.y * deltaNorm.y),
			theta: Math.atan2(deltaNorm.y, deltaNorm.x)
		};

		if (polarNorm.r < 0.34)
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
			return state;

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
			else
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
	
	updateLayout():void
	{
		if (!this.panelDragged || !this.panelOver || !this.dropZone || (this.panelDragged === this.panelOver))
			return;

		var newState:LayoutState = _.cloneDeep(this.getSessionState());
		var src:LayoutState = FlexibleLayout.findStateNode(newState, this.panelDragged);
		var dest:LayoutState = this.panelOver == OUTER_PANEL_ID ? {} : FlexibleLayout.findStateNode(newState, this.panelOver);
		
		if (!src || !dest)
		{
			console.error("Unexpected error - could not find matching nodes", newState, src, dest);
			return;
		}

		if (this.dropZone === DropZone.CENTER)
		{
			var srcId = src.id;
			src.id = dest.id;
			dest.id = srcId;
		}
		else
		{
			if (weavejs.WeaveAPI.Locale.reverseLayout)
			{
				if (this.dropZone === DropZone.LEFT)
					this.dropZone = DropZone.RIGHT;
				else if (this.dropZone === DropZone.RIGHT)
					this.dropZone = DropZone.LEFT;
			}

			var srcParentArray:LayoutState[] = MiscUtils.findDeep(newState, (obj:LayoutState) => {
				return Array.isArray(obj) && obj.indexOf(src) >= 0;
			});

			srcParentArray.splice(srcParentArray.indexOf(src), 1);
			
			dest.direction = (this.dropZone === DropZone.TOP || this.dropZone === DropZone.BOTTOM) ? VERTICAL : HORIZONTAL;
			
			if (this.panelOver == OUTER_PANEL_ID)
			{
				newState.flex = 0.5;
				dest.children = [
					{
						id: this.panelDragged,
						flex: 0.5
					},
					newState
				];
				newState = dest;
			}
			else
			{
				delete dest.id;
				dest.children = [
					{
						id: this.panelDragged,
						flex: 0.5
					},
					{
						id: this.panelOver,
						flex: 0.5
					}
				];
			}
			
			if (this.dropZone === DropZone.BOTTOM || this.dropZone === DropZone.RIGHT)
				dest.children.reverse();
		}
		this.setSessionState(newState);
	}

	getLayoutIds(state:LayoutState, output?:WeavePathArray[]):WeavePathArray[]
	{
		if (!output)
			output = [];
		if (state && state.id)
			output.push(state.id as WeavePathArray);
		if (state && state.children)
			for (var child of state.children)
				this.getLayoutIds(child, output);
		return output;
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
		if (layoutOrId === OUTER_PANEL_ID)
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
			this.layoutRect = Object(this.getLayoutPosition(layout));
		
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
	
	private static _tempState:LayoutState;
	private static _tempObj:LayoutState = {};
	private static sortIds(id1:WeavePathArray, id2:WeavePathArray):number
	{
		var obj1:LayoutState = FlexibleLayout.findStateNode(FlexibleLayout._tempState, id1);
		var obj2:LayoutState = FlexibleLayout.findStateNode(FlexibleLayout._tempState, id2);
		var value1:number = obj1 && obj1.maximized ? 1 : 0;
		var value2:number = obj2 && obj2.maximized ? 1 : 0;
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
		if (weave && !newState.id && !newState.children)
		{
			var ids:WeavePathArray[] = weave.root.getNames(weavejs.api.ui.IVisTool, true).map(name => [name]);
			newState = this.generateLayoutState(ids);
			this.setSessionState(newState);
		}
		
		var components:JSX.Element[] = null;
		if (this.rootLayout)
		{
			FlexibleLayout._tempState = newState;
			components = this.getLayoutIds(newState).sort(FlexibleLayout.sortIds).map(path => {
				var key = JSON.stringify(path);
				return (
					<Div
						key={key}
						ref={key}
						children={
							this.props.panelRenderer
							?	this.props.panelRenderer(path, {
									onDragOver: this.onDragOver.bind(this, path),
									onDragStart: this.onDragStart.bind(this, path),
									onDragEnd: this.onDragEnd.bind(this),
								})
							:	<WeaveComponentRenderer
									weave={weave}
									path={path}
									style={{width: "100%", height: "100%"}}/>
						}
					/>
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
			<div {...this.props as React.HTMLAttributes} style={style}>
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
	[weavejs.api.core.ILinkableVariable]
);
