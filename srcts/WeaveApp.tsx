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
import {LayoutState} from "./react-flexible-layout/Layout";
import MiscUtils from "./utils/MiscUtils";
import WeaveTool from "./WeaveTool";
import {WeavePathArray, PanelProps} from "./FlexibleLayout";
import DataSourceManager from "./ui/DataSourceManager";
import ContextMenu from "./menus/ContextMenu";
import {IVisTool} from "./tools/IVisTool";
import ReactUtils from "./utils/ReactUtils";

import IDataSource = weavejs.api.data.IDataSource;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkablePlaceholder = weavejs.core.LinkablePlaceholder;
import ColumnUtils = weavejs.data.ColumnUtils;
import WeavePath = weavejs.path.WeavePath;
import ICallbackCollection = weavejs.api.core.ICallbackCollection;
import ILinkableObject = weavejs.api.core.ILinkableObject;
import WeaveToolEditor from "./ui/WeaveToolEditor";

const WEAVE_EXTERNAL_TOOLS = "WeaveExternalTools";

export interface WeaveAppProps extends React.HTMLProps<WeaveApp>
{
	weave:Weave;
	renderPath?:string[];
	readUrlParams?:boolean;
}

export interface WeaveAppState
{
	toolPathToEdit?:WeavePathArray;
}

export default class WeaveApp extends React.Component<WeaveAppProps, WeaveAppState>
{
	menuBar:WeaveMenuBar;

	static defaultProps:WeaveAppProps = {
		weave: null,
		renderPath: ['Layout'],
		readUrlParams: false
	};

	constructor(props:WeaveAppProps)
	{
		super(props);
		this.state = {
			toolPathToEdit: null
		}
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

	private createDefaultSessionElements()
	{
		let DEFAULT_COLOR_COLUMN = "defaultColorColumn";
		let DEFAULT_COLOR_BIN_COLUMN = "defaultColorBinColumn";
		let DEFAULT_COLOR_DATA_COLUMN = "defaultColorDataColumn";

		let DEFAULT_SUBSET_KEYFILTER = "defaultSubsetKeyFilter";
		let DEFAULT_SELECTION_KEYSET = "defaultSelectionKeySet";
		let DEFAULT_PROBE_KEYSET = "defaultProbeKeySet";
		let ALWAYS_HIGHLIGHT_KEYSET = "alwaysHighlightKeySet";
		let SAVED_SELECTION_KEYSETS = "savedSelections";
		let SAVED_SUBSETS_KEYFILTERS = "savedSubsets";

		let root = this.props.weave.root;
		/* default keysets */
		root.requestObject(DEFAULT_PROBE_KEYSET, weavejs.data.key.KeySet, true);
		root.requestObject(DEFAULT_SELECTION_KEYSET, weavejs.data.key.KeySet, true);
		root.requestObject(DEFAULT_SUBSET_KEYFILTER, weavejs.data.key.KeyFilter, true);
		/* default color column stuff */
		let cc = root.requestObject("defaultColorColumn", weavejs.data.column.ColorColumn, true);
		let bc = cc.internalDynamicColumn.requestGlobalObject(DEFAULT_COLOR_BIN_COLUMN, weavejs.data.column.BinnedColumn, true);
		let fc = bc.internalDynamicColumn.requestGlobalObject(DEFAULT_COLOR_DATA_COLUMN, weavejs.data.column.FilteredColumn, true);
		fc.filter.requestGlobalObject(DEFAULT_SUBSET_KEYFILTER);
	}
	
	componentDidMount()
	{
		this.createDefaultSessionElements();
		if (this.props.readUrlParams)
		{
			var urlParams = MiscUtils.getUrlParams();
			var weaveExternalTools:any = window.opener && (window.opener as any)[WEAVE_EXTERNAL_TOOLS];
			
			if (urlParams.file)
			{
				// read content from url
				this.menuBar.systemMenu.fileMenu.loadUrl(urlParams.file);
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
	
	handleSideBarClose=()=>
	{
		this.setState({ toolPathToEdit: null });
	}
	
	handleGearClick=(tool:WeaveTool):void=>
	{
		var path = tool.props.path;
		this.setState({
			toolPathToEdit: path
		});
	}

	handleMaximizeClick=(tool:WeaveTool):void=>
	{
		var path = tool.props.path;
		var layout = Weave.AS(this.getRenderedComponent(), FlexibleLayout);
		if (!layout)
			return;
		var state = _.cloneDeep(layout.getSessionState());
		var obj = MiscUtils.findDeep(state, {id: path});
		if (!obj)
			return;
		obj.maximized = !obj.maximized;
		layout.setSessionState(state);
	}
	
	handlePopoutClick=(tool:WeaveTool):void=>
	{
		var path = tool.props.path;
		var popoutWindow:Window;
		var onBeforeUnLoad:Function = () => { };
		var onLoad:Function = () => { };
		var options:any = { transferStyle: true };
		var isMaximized:boolean = false, screenWidth:number, screenHeight:number;

		this.removeFromLayout(path);
		var content:JSX.Element = (
			<WeaveTool
				weave={this.props.weave}
				path={path}
				style={{width: "100%", height: "100%"}}
				onGearClick={this.handleGearClick}
				onMaximizeClick={() => {
					if (isMaximized)
					{
						isMaximized = false;
						popoutWindow.resizeTo(screenWidth, screenHeight);
					}
					else
					{
						isMaximized = true;
						screenWidth = popoutWindow.innerWidth;
						screenHeight = popoutWindow.innerHeight;
						popoutWindow.moveTo(0,0);
						popoutWindow.resizeTo(screen.availWidth, screen.availHeight);
					}
				}}
				onPopinClick={() => {
					this.addToLayout(path);
					popoutWindow.close();
				}}
				onCloseClick={(tool:WeaveTool) => {
					this.handleCloseClick(tool);
					popoutWindow.close();
				}}
				onDragEnd={() => {}}
				onDragStart={() => {}}
				onDragOver={() => {}}
			>
				<WeaveComponentRenderer
					weave={this.props.weave}
					path={path}
					style={{ width: "100%", height: "100%" }}
					props={{itemRenderer: this.renderTool}}
				/>
			</WeaveTool>
		);
		popoutWindow = ReactUtils.openPopout(content, onLoad, onBeforeUnLoad, options);

	}
	
	handleCloseClick=(tool:WeaveTool)=>
	{
		var weave = this.props.weave;
		var path = tool.props.path;
		this.removeFromLayout(path);
		weave.removeObject(path);
	
		if (_.isEqual(path, this.state.toolPathToEdit))
		{
			this.setState({
				toolPathToEdit: null
			});
		}
	}

	renderTool=(path:WeavePathArray, panelProps:PanelProps)=>
	{
		var tool = this.props.weave.getObject(path);
		if (_.isEqual(path, this.state.toolPathToEdit))
			console.log('editing', path.join(','));
		return (
			<WeaveTool
				ref={this.handleWeaveTool}
				weave={this.props.weave}
				path={path}
				style={{width: "100%", height: "100%"}}
				{...panelProps}
				onGearClick={this.handleGearClick}
				onMaximizeClick={this.handleMaximizeClick}
				onPopoutClick={this.handlePopoutClick}
				onCloseClick={this.handleCloseClick}
			/>
		);
	}

	private toolSet = new Set<WeaveTool>();

	handleWeaveTool=(tool:WeaveTool)=>
	{
		if (tool)
			this.toolSet.add(tool);
	}

	createObject=(type:new(..._:any[])=>any):void=>
	{
		// need to generate path here instead of letting LinkableHashMap generate a name because async types can't be instantiated immediately
		var weave = this.props.weave;
		var baseName = weavejs.WeaveAPI.ClassRegistry.getDisplayName(type);
		var path = [weave.root.generateUniqueName(baseName)];
		weave.requestObject(path, type);
		var instance = weave.getObject(path);
		var resultType = LinkablePlaceholder.getClass(instance);
		
		if (resultType != type)
			return;
		
		if (Weave.IS(instance, IDataSource))
		{
			DataSourceManager.openInstance(this.menuBar.dataMenu, instance as IDataSource);
		}
		
		if (React.Component.isPrototypeOf(type))
		{
			var placeholder = Weave.AS(instance, LinkablePlaceholder);
			if (placeholder)
				Weave.getCallbacks(placeholder).addDisposeCallback(this, this.handlePlaceholderDispose.bind(this, path, placeholder));
			this.setState({ toolPathToEdit: path });
			this.addToLayout(path);
		}
	}

	private handlePlaceholderDispose(path:WeavePathArray, placeholder:LinkablePlaceholder<any>)
	{
		// hack
		var INIT = 'initSelectableAttributes';
		var instance = placeholder.getInstance();
		if (instance[INIT])
		{
			var refs = ColumnUtils.findFirstDataSet(this.props.weave.root);
			instance[INIT](refs);
		}
		this.forceUpdate();
	}

	addToLayout(path:WeavePathArray)
	{
		var layout = Weave.AS(this.props.weave.getObject(this.getRenderPath()), FlexibleLayout);
		if (layout)
		{
			var state = layout.getSessionState();
			// check if the current layout is empty
			if (!state.id && (state.children && !state.children.length))
			{
				state = {id: path};
			}
			else
			{
				state = {
					children: [state, {id: path}],
					direction: state.direction == 'horizontal' ? 'vertical' : 'horizontal'
				};
			}
			layout.setSessionState(state);
		}
	}

	removeFromLayout(path:WeavePathArray)
	{
		var layout = Weave.AS(this.props.weave.getObject(this.getRenderPath()), FlexibleLayout);
		if (layout)
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
	
	componentWillUpdate(nextProps:WeaveAppProps, nextState:WeaveAppState)
	{
		for (var tool of this.toolSet)
		{
			if (Weave.wasDisposed(tool))
				this.toolSet.delete(tool);
			else
				tool.setState({ highlightTitle: _.isEqual(nextState.toolPathToEdit, tool.props.path) });
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
		var sideBarUI:JSX.Element = null;
		var toolToEdit = weave.getObject(this.state.toolPathToEdit) as IVisTool; // hack
		if (toolToEdit && toolToEdit.renderEditor) // hack
			sideBarUI = <WeaveToolEditor tool={toolToEdit}/>
		
		return (
			<VBox
				className="weave-app"
				{...this.props as React.HTMLAttributes}
				style={_.merge({flex: 1}, this.props.style)}
				onContextMenu={ContextMenu.open}
			>
				<SideBarContainer barSize={.3} leftSideBarChildren={ sideBarUI } onSideBarClose={this.handleSideBarClose}>
					<WeaveComponentRenderer
						weave={weave}
						path={renderPath}
						defaultType={FlexibleLayout}
						style={{width: "100%", height: "100%"}}
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
