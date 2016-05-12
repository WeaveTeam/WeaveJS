import * as React from "react";
import * as _ from "lodash";
// import DraggableWindow from "../react-ui/DraggableWindow";
// import {PopupWindowProps} from "../react-ui/DraggableWindow";
import SmartComponent from "../ui/SmartComponent";
import prefixer from "../react-ui/VendorPrefixer";
import WeaveComponentRenderer from "../WeaveComponentRenderer";

import LinkableVariable = weavejs.core.LinkableVariable;

export type PanelProps = {
	onDragStart:React.DragEventHandler,
	onDragEnd:React.DragEventHandler,
	onDragOver:React.DragEventHandler,
	onReposition?:(left:number, top: number, width:number, height:number)=>void
	style?:React.CSSProperties,
};

export declare type WeavePathArray = string[];

export interface IWindowLayoutProps extends React.Props<WindowLayout>
{
	itemRenderer: (id:WeavePathArray, panelProps?:PanelProps) => JSX.Element;
}

export interface WindowState
{
	/* id for the window */
	id: WeavePathArray;
	style: React.CSSProperties // technically only needs left, top, width and height but we may want to experiment with other things
} 

export default class WindowLayout extends React.Component<IWindowLayoutProps, {}> implements weavejs.api.core.ILinkableVariable
{
	
	private linkableState = Weave.linkableChild(this, LinkableVariable, this.forceUpdate, true);

	constructor(props:IWindowLayoutProps)
	{
		super(props);
	}
	
	setSessionState(state:WindowState[])
	{
		this.linkableState.state = state;
	}
	
	getSessionState()
	{
		return this.linkableState.state;
	}
	
	getLayoutIds(event:React.DragEvent)
	{
		
	}
	
	onDragOver(path:WeavePathArray, event:React.DragEvent)
	{
		
	}
	
	onDragStart(path:WeavePathArray, event:React.DragEvent)
	{
		
	}
	
	onDragEnd(path:WeavePathArray, event:React.DragEvent)
	{
		
	}
	
	onReposition(path:WeavePathArray, left:number, top: number, width:number, height:number)
	{

	}
	
	private generateStyle()
	{
		var style:any = {
			display: "flex",
			flex: 1,
			position: "relative",
			outline: "none",
			overflow: "hidden",
			userSelect: "none"
		};
		return prefixer(style);
	}
	
	render()
	{
		var weave = Weave.getWeave(this);
		return (
			<div>
				{
					this.linkableState.state &&
						(this.linkableState.state as WindowState[]).map((state, index) => (
							this.props.itemRenderer
							?	this.props.itemRenderer(state.id, {
									onDragOver: this.onDragOver.bind(this, state.id),
									onDragStart: this.onDragStart.bind(this, state.id),
									onDragEnd: this.onDragEnd.bind(this),
									onReposition: this.onReposition.bind(this, state.id),
									style: _.merge({position: "absolute"}, state.style)
								})
							:	<WeaveComponentRenderer
									key={index}
									weave={weave}
									path={state.id}
									style={state.style}/>
						))
				}
			</div>
		);
	}	
}

Weave.registerClass(
	WindowLayout,
	'weave.ui.WindowLayout',
	[weavejs.api.core.ILinkableVariable]
);
