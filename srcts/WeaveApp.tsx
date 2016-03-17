import * as React from "react";
import * as _ from "lodash";
import {MenuItemProps} from "./react-ui/Menu";
import {HBox, VBox} from "./react-ui/FlexBox";
import PopupWindow from "./react-ui/PopupWindow";
import WeaveMenuBar from "./WeaveMenuBar";
import WeaveComponentRenderer from "./WeaveComponentRenderer";
import FlexibleLayout from "./FlexibleLayout";
import MiscUtils from "./utils/MiscUtils";
import SessionHistorySlider from "./editors/SessionHistorySlider";
import WeaveTool from "./WeaveTool";
import {WeavePathArray, PanelProps} from "./FlexibleLayout";
import DataSourceManager from "./ui/DataSourceManager";
import ContextMenu from "./menus/ContextMenu";

import IDataSource = weavejs.api.data.IDataSource;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import WeavePath = weavejs.path.WeavePath;

const WEAVE_EXTERNAL_TOOLS = "WeaveExternalTools";

export interface WeaveAppProps extends React.HTMLProps<WeaveApp>
{
	weave:Weave;
	renderPath?:string[];
	readUrlParams?:boolean;
}

export interface WeaveAppState
{
}

export default class WeaveApp extends React.Component<WeaveAppProps, WeaveAppState>
{
	contextMenu:HTMLElement;
	menuBar:WeaveMenuBar;

	static defaultProps:WeaveAppProps = {
		weave: null,
		renderPath: ['Layout'],
		readUrlParams: false
	}

	constructor(props:WeaveAppProps)
	{
		super(props);
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
	
	renderTool=(path:WeavePathArray, panelProps:PanelProps)=>
	{
		//onGearClick={this.blah}
		return (
			<WeaveTool
				weave={this.props.weave}
				path={path}
				style={{width: "100%", height: "100%"}}
				{...panelProps}
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

		// correct way to scale & add a side-bar
		/*
		<ResizingDiv style={{flex: 1, position: "relative"}}>
			<WeaveComponentRenderer weave={weave} path={renderPath}
				style={{position: "absolute", width: "100%", height: "100%", transform: `scale(${scaleValue})`, transformOrigin: "right"}}/>
			<div style={{position: "absolute", width: "20%", backgroundColor: "#FF00FF"}}/>
		</ResizingDiv>
		*/
		
		return (
			<VBox
				className="weave-app"
				{...this.props as React.HTMLAttributes}
				style={_.merge({flex: 1}, this.props.style)}
				onContextMenu={ContextMenu.open}
			>
				{
					!enableMenuBar || enableMenuBar.value
					?	<WeaveMenuBar weave={this.props.weave} ref={(c:WeaveMenuBar) => this.menuBar = c} createObject={this.createObject}/>
					:	null
				}
				<SessionHistorySlider stateLog={this.props.weave.history}/>
				<WeaveComponentRenderer weave={this.props.weave} path={renderPath} props={{itemRenderer: this.renderTool}}/>
			</VBox>
		);
	}
}
