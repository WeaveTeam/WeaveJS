import * as React from "react";
import * as _ from "lodash";
import DraggableWindow from "../react-ui/DraggableWindow";
import {PopupWindowProps} from "../react-ui/DraggableWindow";
import SmartComponent from "../ui/SmartComponent";
import prefixer from "../react-ui/VendorPrefixer";
import WeaveComponentRenderer from "../WeaveComponentRenderer";

import LinkableVariable = weavejs.core.LinkableVariable;

export type PanelProps = {
	onDragStart:React.DragEventHandler,
	onDragEnd:React.DragEventHandler,
	onDragOver:React.DragEventHandler,
	onReposition?:(top:number, left: number, width:number, height:number)=>void
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
	style: React.CSSProperties // technically only needs top, left, width and height but we may want to experiment with other things
} 

export default class WindowLayout extends React.Component<IWindowLayoutProps, {}> implements weavejs.api.core.ILinkableVariable
{
	
	private linkableState = Weave.linkableChild(this, LinkableVariable, this.forceUpdate, true);

	constructor(props:IWindowLayoutProps)
	{
		super(props);
	}
	
	setSessionState()
	{
		return this.linkableState;
	}
	
	getSessionState()
	{
		return this.linkableState;
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
	
	onReposition(path:WeavePathArray, top:number, left: number, width:number, height:number)
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
						(this.linkableState.state as WindowState[]).map(state => {
							this.props.itemRenderer
							?	this.props.itemRenderer(state.id, {
									onDragOver: this.onDragOver.bind(this, state.id),
									onDragStart: this.onDragStart.bind(this, state.id),
									onDragEnd: this.onDragEnd.bind(this),
									onReposition: this.onReposition.bind(this, state.id)
								})
							:	<WeaveComponentRenderer
									weave={weave}
									path={state.id}
									style={state.style}/>
						})
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
