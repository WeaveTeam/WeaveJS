import * as React from "react";
import * as _ from "lodash";
import SmartComponent from "../ui/SmartComponent";
import prefixer from "../react-ui/VendorPrefixer";
import DraggableDiv from "../react-ui/DraggableDiv";
import {DraggableDivState} from "../react-ui/DraggableDiv";
import WeaveComponentRenderer from "../WeaveComponentRenderer";
import {AbstractLayout, ILayoutProps, WeavePathArray} from "./AbstractLayout";

import LinkableVariable = weavejs.core.LinkableVariable;

export interface WindowState
{
	/* id for the window */
	id: WeavePathArray;
	style: React.CSSProperties // technically only needs left, top, width and height but we may want to experiment with other things
} 

export default class WindowLayout extends AbstractLayout implements weavejs.api.core.ILinkableVariable
{
	private linkableState = Weave.linkableChild(this, new LinkableVariable(Array), this.forceUpdate, true);

	constructor(props:ILayoutProps)
	{
		super(props);
	}
	
	setSessionState(state:WindowState[]):void
	{
		state = Weave.AS(state, Array) || [];
		this.linkableState.state = state.map(item => _.pick(item, 'id', 'style'));
	}
	
	getSessionState():WindowState[]
	{
		return (this.linkableState.state || []) as WindowState[];
	}
	
	onReposition(path:WeavePathArray, position:DraggableDivState)
	{
		this.setSessionState(this.getSessionState().map(item => (
			_.isEqual(item.id, path)
			?	{
					id: item.id,
					style: _.merge({}, item.style, position)
				}
			:	item
		)));
	}
	
	addItem(id:WeavePathArray):void
	{
		this.setSessionState(this.getSessionState().concat({id, style: {}}));
	}
	
	removeItem(id:WeavePathArray):void
	{
		this.setSessionState(this.getSessionState().filter(item => !_.isEqual(id, item.id)));
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
		//TODO
		this.getSessionState().map(state => {
			var ddiv = this.refs[JSON.stringify(state.id)] as DraggableDiv;
			var style = state.style || {};
			if(ddiv)
				ddiv.setState({
					top: style.top,
					left: style.left,
					width: style.width,
					height: style.height
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
							style={_.merge({ minWidth: 25, minHeight: 25}, state.style)} 
							draggable={!this.props.itemRenderer}
							onReposition={this.onReposition.bind(this, state.id)}
						>
						{
							this.props.itemRenderer
							?	this.props.itemRenderer(state.id)
							:	<WeaveComponentRenderer
									key={index}
									weave={weave}
									path={state.id}
									style={state.style}
								/>
							
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
