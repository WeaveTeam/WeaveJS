import * as React from "react";
import * as _ from "lodash";
import Menu from "./react-ui/Menu";
import {IVisTool} from "./tools/IVisTool";
import {MenuItemProps} from "./react-ui/Menu";
import SideBar from "./react-ui/SideBar";
import {HBox, VBox} from "./react-ui/FlexBox";
import PopupWindow from "./react-ui/PopupWindow";
import WeaveMenuBar from "./WeaveMenuBar";
import WeaveComponentRenderer from "./WeaveComponentRenderer";
import FlexibleLayout from "./FlexibleLayout";
import MiscUtils from "./utils/MiscUtils";
import ResizingDiv from "./react-ui/ResizingDiv";
import SessionHistorySlider from "./editors/SessionHistorySlider";
import WeaveTool from "./WeaveTool";
import {WeavePathArray, PanelProps} from "./FlexibleLayout";
import DataSourceManager from "./ui/DataSourceManager";

import IDataSource = weavejs.api.data.IDataSource;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import WeavePath = weavejs.path.WeavePath;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import AbstractVisTool from "./tools/AbstractVisTool";

const WEAVE_EXTERNAL_TOOLS = "WeaveExternalTools";

export interface WeaveAppProps extends React.HTMLProps<WeaveApp>
{
	weave:Weave;
	renderPath?:string[];
	readUrlParams?:boolean;
}

export interface WeaveAppState
{
	showContextMenu?: boolean;
	showSideBar?: boolean;
	contextMenuXPos?: number;
	contextMenuYPos?: number;
	contextMenuItems?: MenuItemProps[];
}

export default class WeaveApp extends React.Component<WeaveAppProps, WeaveAppState>
{
	contextMenu:HTMLElement;
	menuBar:WeaveMenuBar;
	toolEditor:JSX.Element;
	toolName:string;

	static defaultProps:WeaveAppProps = {
		weave: null,
		renderPath: ['Layout'],
		readUrlParams: false
	}

	constructor(props:WeaveAppProps)
	{
		super(props);
		this.state = {
			showContextMenu: false,
			showSideBar: false,
			contextMenuXPos: 0,
			contextMenuYPos: 0,
			contextMenuItems: []
		};
	}
	
	getRenderPath():string[]
	{
		return this.props.renderPath || WeaveApp.defaultProps.renderPath;
	}
	
	componentDidMount()
	{
		if (this.props.readUrlParams)
		{
			var urlParams = MiscUtils.getUrlParams();
			var weaveExternalTools:any = window.opener && (window.opener as any)[WEAVE_EXTERNAL_TOOLS];
			
			if (urlParams.file)
			{
				// read content from url
				this.menuBar.fileMenu.loadUrl(urlParams.file);
			}
			else if (weaveExternalTools && weaveExternalTools[window.name])
			{
				// read content from flash
				var ownerPath:WeavePath = weaveExternalTools[window.name].path;
				var content:Uint8Array = atob(ownerPath.getValue('btoa(Weave.createWeaveFileContent())') as string) as any;
				weavejs.core.WeaveArchive.loadFileContent(this.props.weave, content);
				this.forceUpdate();
			}
		}
	}
	
	showContextMenu(event:React.MouseEvent)
	{
		// if context menu already showing do nothing
		var contextMenuItems = Menu.getMenuItems(event.target as HTMLElement);
		this.setState({
			showContextMenu: true,
			contextMenuItems,
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
		if (this.contextMenu && this.contextMenu.contains(event.target as HTMLElement))
			return;
		this.setState({
			showContextMenu:false
		});
	}

	showSideBarForTool=(tool:IVisTool, content:JSX.Element):void=>{
		this.toolEditor = content;
		this.setState({
			showSideBar: !this.state.showSideBar
		});
	}

	sideBarCloseHandler=(sideBarState:boolean):void=>{
		console.log("closeHandler " ,sideBarState);
		this.setState({
			showSideBar: sideBarState
		});
	}

	renderTool=(path:WeavePathArray, panelProps:PanelProps)=>
	{
		//onGearClick={this.blah}
		return (
			<WeaveTool
				weave={this.props.weave}
				path={path}
				style={{width: "100%", height: "100%"}}
				{...panelProps}
				onGearClick={this.showSideBarForTool}
			/>
		);
	}

	createObject=(type:new(..._:any[])=>any):void=>
	{
		var baseName = weavejs.WeaveAPI.ClassRegistry.getDisplayName(type);
		var name = this.props.weave.root.generateUniqueName(baseName);
		var instance = this.props.weave.root.requestObject(name, type);
		
		if (Weave.IS(instance, IDataSource))
		{
			DataSourceManager.openInstance(this.props.weave, instance);
		}
		
		if (instance instanceof React.Component)
		{
			var layout = this.props.weave.getObject(this.getRenderPath()) as FlexibleLayout;
			if (layout instanceof FlexibleLayout)
			{
				var state = layout.getSessionState();
				state = {
					children: [state, {id: [name]}],
					direction: state.direction == 'horizontal' ? 'vertical' : 'horizontal'
				};
				layout.setSessionState(state);
			}
		}
	}
	
	render():JSX.Element
	{
		var renderPath = this.getRenderPath();
		
		if (!this.props.weave)
			return <VBox>Cannot render WeaveApp without an instance of Weave.</VBox>;
		
		if (!this.props.weave.getObject(renderPath))
		{
			try
			{
				var parentPath = renderPath.concat();
				var childName = parentPath.pop();
				var parent = this.props.weave.getObject(parentPath);
				if (parent instanceof LinkableHashMap)
					(parent as LinkableHashMap).requestObject(childName, FlexibleLayout);
			}
			catch (e)
			{
				// ignore
			}
		}
		
		// backwards compatibility
		var enableMenuBar = this.props.weave.getObject('WeaveProperties', 'enableMenuBar') as LinkableBoolean;

		var scaleValue = this.state.showSideBar?.8:1;
		var sideBarDirection = "left"; //to-do make it configurable
		var weaveUIOrigin = "";

		if(sideBarDirection == "left"){
			weaveUIOrigin = "right"
		}else if(sideBarDirection == "right"){
			weaveUIOrigin = "left"
		}else if(sideBarDirection == "top"){
			weaveUIOrigin = "bottom"
		}else if(sideBarDirection == "bottom"){
			weaveUIOrigin = "top"
		}
		return (
			<VBox
				className="weave-app"
				{...this.props as React.HTMLAttributes}
				style={_.merge({flex: 1}, this.props.style)}
				onMouseDown={this.hideContextMenu.bind(this)}
				onClick={()=>this.setState({showContextMenu: false})}
				onContextMenu={this.showContextMenu.bind(this)}
			>
				{
					!enableMenuBar || enableMenuBar.value
					?	<WeaveMenuBar weave={this.props.weave} ref={(c:WeaveMenuBar) => this.menuBar = c} createObject={this.createObject}/>
					:	null
				}
				<SessionHistorySlider stateLog={this.props.weave.history}/>
				<ResizingDiv style={{flex: 1, position: "relative"}}>
					<WeaveComponentRenderer weave={this.props.weave} path={renderPath} props={{itemRenderer: this.renderTool}}
											style={{position: "absolute", width: "100%", height: "100%", transform: `scale(${scaleValue})`, transformOrigin:weaveUIOrigin}}/>
					<SideBar closeHandler={this.sideBarCloseHandler} style={{background:"#f8f8f8"}}
							 open={this.state.showSideBar} direction={sideBarDirection} >
						{this.toolEditor}
					</SideBar>
				</ResizingDiv>
				{
					this.state.showContextMenu
					?	<div ref={(element:HTMLElement) => this.contextMenu = element} onContextMenu={this.handleRightClickOnContextMenu.bind(this)}>
							{<Menu xPos={this.state.contextMenuXPos} yPos={this.state.contextMenuYPos} menu={this.state.contextMenuItems}/>}
						</div>
					:	null
				}
			</VBox>
		);
	}
}
