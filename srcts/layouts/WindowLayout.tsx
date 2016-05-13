import * as React from "react";
import * as _ from "lodash";
import SmartComponent from "../ui/SmartComponent";
import prefixer from "../react-ui/VendorPrefixer";
import DraggableDiv from "../react-ui/DraggableDiv";
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

export interface IWindowLayoutProps extends React.HTMLProps<WindowLayout>
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
				this.linkableState.state &&
				(this.linkableState.state as WindowState[]).map((state, index) => {
					var key = JSON.stringify(state.id);
					return (
						<DraggableDiv
							key={key}
							ref={key} 
							style={_.merge({ minWidth: 25, minHeight: 25}, state.style)} 
							draggable={!this.props.itemRenderer}
						>
						{
							this.props.itemRenderer
							?	this.props.itemRenderer(state.id, {
									onDragOver: this.onDragOver.bind(this, state.id),
									onDragStart: this.onDragStart.bind(this, state.id),
									onDragEnd: this.onDragEnd.bind(this),
									onReposition: this.onReposition.bind(this, state.id)
								})
							:	<WeaveComponentRenderer
							key={index}
							weave={weave}
							path={state.id}
							style={state.style}/>
							
						}
						</DraggableDiv>
					);
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
