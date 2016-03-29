import * as React from "react";
import * as ReactDOM from 'react-dom';
import * as _ from "lodash";
import * as jquery from "jquery";

import prefixer from "./react-ui/VendorPrefixer";
import {MenuItemProps} from "./react-ui/Menu";
import SideBarContainer from "./react-ui/SideBarContainer";
import {HBox, VBox} from "./react-ui/FlexBox";
import PopupWindow from "./react-ui/PopupWindow";
import WeaveMenuBar from "./WeaveMenuBar";
import WeaveComponentRenderer from "./WeaveComponentRenderer";
import FlexibleLayout from "./FlexibleLayout";
import {LayoutState} from "./react-flexible-layout/Layout";
import MiscUtils from "./utils/MiscUtils";
import WeaveTool from "./WeaveTool";
import {WeavePathArray, PanelProps} from "./FlexibleLayout";
import DataSourceManager from "./ui/DataSourceManager";
import ContextMenu from "./menus/ContextMenu";
import ResizingDiv from "./react-ui/ResizingDiv";
import {IVisTool} from "./tools/IVisTool";

import IDataSource = weavejs.api.data.IDataSource;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkablePlaceholder = weavejs.core.LinkablePlaceholder;
import WeavePath = weavejs.path.WeavePath;
import ICallbackCollection = weavejs.api.core.ICallbackCollection;
import ILinkableObject = weavejs.api.core.ILinkableObject;
let is = Weave.IS;

// loads jquery from the es6 default module.
var $:JQueryStatic = (jquery as any)["default"];

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
	menuBar:WeaveMenuBar;
	toolEditor:JSX.Element;

	static defaultProps:WeaveAppProps = {
		weave: null,
		renderPath: ['Layout'],
		readUrlParams: false
	};

	constructor(props:WeaveAppProps)
	{
		super(props);
	}
	
	getRenderPath():string[]
	{
		return this.props.renderPath || WeaveApp.defaultProps.renderPath;
	}
	
	getRenderedComponent():React.Component<any, any>
	{
		if (!this.props.weave)
			return null;
		return this.props.weave.getObject(this.getRenderPath()) as React.Component<any, any>;
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
	
	handleMaximizeClick(path:WeavePathArray):void
	{
		var layout = this.getRenderedComponent() as FlexibleLayout;
		if (!(layout instanceof FlexibleLayout))
			return;
		var state = _.cloneDeep(layout.getSessionState());
		var obj = MiscUtils.findDeep(state, {id: path});
		if (!obj)
			return;
		obj.maximized = !obj.maximized;
		layout.setSessionState(state);
	}
	
	handleExportClick(path:WeavePathArray):void
	{
		var exportWindow:any;
		var container:HTMLElement;
		var name:string;
		var baseName:string;
		var fc:ICallbackCollection = weavejs.WeaveAPI.Scheduler.frameCallbacks;

		exportWindow = window.open("", "_blank", "width=500, height=500");
		exportWindow.onbeforeunload = () => {
			if (container) {
				ReactDOM.unmountComponentAtNode(container);
				//this.props.weave.root.removeObject(name);
			}
		};
		var onloadHandler = () => {
			if (container) {
				var existing = exportWindow.document.getElementById('popout-container');
				if (!existing){
					ReactDOM.unmountComponentAtNode(container);
					container = null;
				} else{
					return;
				}
			}

			container = exportWindow.document.createElement('div');
			container.id = 'popout-container';
			exportWindow.document.body.appendChild(container);
			baseName = this.props.weave.path(path).getSimpleType();
			//name = this.props.weave.root.generateUniqueName(baseName);
			name = 'ExportVis';
			this.props.weave.root.requestObjectCopy(name,this.props.weave.getObject(path));

			//send weave objects, and css to new window
			exportWindow.weave = this.props.weave;
			exportWindow.weavejs = weavejs;
			exportWindow.Weave = Weave;
			$("link, style").each(function() {
				//Todo: find a better way to clone this link
				var link:any = $(this).clone()[0];
				link.setAttribute("href",window.location.origin + window.location.pathname + link.getAttribute("href"));
				$(exportWindow.document.head).append(link);
			});

			ReactDOM.render(
				<WeaveComponentRenderer
					weave={this.props.weave}
					path={[name]}
					style={{width:"100%", height:"100%"}}
				/>
				, container);
		};

		exportWindow.onload = onloadHandler;
		onloadHandler();
	}

	handleGearClick=(tool:IVisTool, content:JSX.Element):void=>
	{
		this.toolEditor = content;
		this.forceUpdate();
	};

	renderTool=(path:WeavePathArray, panelProps:PanelProps)=>
	{
		return (
			<WeaveTool
				weave={this.props.weave}
				path={path}
				style={{width: "100%", height: "100%"}}
				{...panelProps}
				onGearClick={this.handleGearClick}
				onMaximizeClick={this.handleMaximizeClick.bind(this, path)}
				onExportClick={this.handleExportClick.bind(this, path)}
				onCloseClick={this.removeObject.bind(this)}
			/>
		);
	};

	createObject=(type:new(..._:any[])=>any):void=>
	{
		var weave = this.props.weave;
		var baseName = weavejs.WeaveAPI.ClassRegistry.getDisplayName(type);
		var name = weave.root.generateUniqueName(baseName);
		var instance = weave.root.requestObject(name, type);
		var resultType = LinkablePlaceholder.getClass(weave.root.getObject(name));
		
		if (resultType != type)
			return;
		
		if (is(instance, IDataSource))
		{
			DataSourceManager.openInstance(weave, instance as IDataSource);
		}
		
		if (React.Component.isPrototypeOf(type))
		{
			var layout = weave.getObject(this.getRenderPath()) as FlexibleLayout;
			if (layout instanceof FlexibleLayout)
			{
				var state = layout.getSessionState();
				// check if the current layout is empty
				if(!state.id && (state.children && !state.children.length))
				{
					state = {
						id: [name],
						direction: "horizontal",
						flex: 1
					}
				}	
				else 
				{
					state = {
						children: [state, {id: [name]}],
						direction: state.direction == 'horizontal' ? 'vertical' : 'horizontal'
					};
				}
				layout.setSessionState(state);
			}
		}
	};
	
	removeObject(object:ILinkableObject)
	{
		var weave = this.props.weave;
		var path = Weave.findPath(weave.root, object);
		
		if (object instanceof React.Component)
		{
			var layout = weave.getObject(this.getRenderPath()) as FlexibleLayout;
			if (layout instanceof FlexibleLayout)
			{
				var state = _.cloneDeep(layout.getSessionState());
				var node = MiscUtils.findDeep(state, {id: path}) as LayoutState;
				if (node)
				{
					delete node.id;
					node.children = [];
					layout.setSessionState(state);
				}
			}
		}
		
		//TODO - handle objects not at top level?
		weave.root.removeObject(weave.root.getName(object));
	}
	
	render():JSX.Element
	{
		var weave = this.props.weave;
		var renderPath = this.getRenderPath();
		
		if (!weave)
			return <VBox>Cannot render WeaveApp without an instance of Weave.</VBox>;
		
		// backwards compatibility hack
		var enableMenuBar = weave.getObject('WeaveProperties', 'enableMenuBar') as LinkableBoolean;
		
		return (
			<VBox
				className="weave-app"
				{...this.props as React.HTMLAttributes}
				style={_.merge({flex: 1}, this.props.style)}
				onContextMenu={ContextMenu.open}
			>
				<SideBarContainer barSize={.2} leftSideBarChildren={this.toolEditor}>
					<WeaveComponentRenderer
						weave={weave}
						path={renderPath}
						defaultType={FlexibleLayout}
						style={{width:"100%", height:"100%"}}
						props={{itemRenderer: this.renderTool}}
					/>
				</SideBarContainer>
				{
					!enableMenuBar || enableMenuBar.value
					?	<WeaveMenuBar
							style={prefixer({order: -1})}
							weave={weave}
							ref={(c:WeaveMenuBar) => this.menuBar = c}
							createObject={this.createObject}
						/>
					:	null
				}
			</VBox>
		);
	}
}
