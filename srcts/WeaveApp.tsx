import * as React from "react";
import * as _ from "lodash";

import prefixer from "./react-ui/VendorPrefixer";
import {MenuItemProps} from "./react-ui/Menu";
import SideBarContainer from "./react-ui/SideBarContainer";
import {HBox, VBox} from "./react-ui/FlexBox";
import PopupWindow from "./react-ui/PopupWindow";
import WeaveMenuBar from "./WeaveMenuBar";
import WeaveComponentRenderer from "./WeaveComponentRenderer";
import FlexibleLayout from "./FlexibleLayout";
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
let is = Weave.IS;

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
	}

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

	handleGearClick=(tool:IVisTool, content:JSX.Element):void=>
	{
		this.toolEditor = content;
		this.forceUpdate();
	}

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
			/>
		);
	}

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
