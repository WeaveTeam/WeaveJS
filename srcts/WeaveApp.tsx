import * as React from "react";
import * as _ from "lodash";
import ContextMenu from "./ContextMenu";
//import MenuBar from "./MenuBar";
import LayoutManager from "./WeaveLayoutManager";

import LinkableVariable = weavejs.core.LinkableVariable;

export interface WeaveAppProps extends React.Props<WeaveApp>
{
	layout:LinkableVariable
}

export interface WeaveAppState
{
	showContextMenu: boolean;
	contextMenuXPos?: number;
	contextMenuYPos?: number;
}

export default class WeaveApp extends React.Component<WeaveAppProps, WeaveAppState>
{
	constructor(props:WeaveAppProps)
	{
		super(props);
		this.state = {
			showContextMenu: false,
			contextMenuXPos: 0,
			contextMenuYPos: 0
		};
	}

	showContextMenu(event:React.MouseEvent)
	{
		// if context menu already showing do nothing
		this.setState({
			showContextMenu: true,
			contextMenuXPos: event.clientX,
			contextMenuYPos: event.clientY
		});
		event.preventDefault();
	}
	
	handleRightClickOnContextMenu(event:React.MouseEvent)
	{
		event.stopPropagation();
		event.preventDefault();
	}
	
	hideContextMenu(event:React.MouseEvent)
	{
		this.setState({
			showContextMenu:false
		});
	}
	
	componentDidMount()
	{
		
	}
	
	render():JSX.Element
	{
		return (
			<div style={{width: "100%", height: "100%"}} onClick={this.hideContextMenu.bind(this)} onContextMenu={this.showContextMenu.bind(this)}>
				<LayoutManager layout={this.props.layout}/>
				{
					this.state.showContextMenu ? 
					<div onContextMenu={this.handleRightClickOnContextMenu.bind(this)}>
						<ContextMenu xPos={this.state.contextMenuXPos} yPos={this.state.contextMenuYPos}/> 
					</div>
					: null
				}
			</div>
		);
	}
	
}
