import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import prefixer from "./react-ui/VendorPrefixer";
import SideBarContainer from "./react-ui/SideBarContainer";
import {VBox, HBox} from "./react-ui/FlexBox";
import WeaveMenuBar from "./WeaveMenuBar";
import DynamicComponent from "./ui/DynamicComponent";
import GetStartedComponent from "./ui/GetStartedComponent";
import WeaveComponentRenderer from "./WeaveComponentRenderer";
import MiscUtils from "./utils/MiscUtils";
import WeaveTool from "./WeaveTool";
import {
	LayoutPanelProps, PanelRenderer, AbstractLayout, WeavePathArray,
	AnyAbstractLayout
} from "./layouts/AbstractLayout";
import DataSourceManager from "./ui/DataSourceManager";
import ContextMenu from "./menus/ContextMenu";
import {IVisTool} from "./tools/IVisTool";
import ReactUtils from "./utils/ReactUtils";
import {forceUpdateWatcher} from "./utils/WeaveReactUtils";
import WeaveProgressBar from "./ui/WeaveProgressBar";
import WeaveToolEditor from "./ui/WeaveToolEditor";
import WeaveArchive from "./WeaveArchive";
import TabLayout, {LayoutState} from "./layouts/TabLayout";
import DataMenu from "./menus/DataMenu";
import FileMenu from "./menus/FileMenu";

import IDataSource = weavejs.api.data.IDataSource;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkablePlaceholder = weavejs.core.LinkablePlaceholder;
import ColumnUtils = weavejs.data.ColumnUtils;
import WeavePath = weavejs.path.WeavePath;
import ICallbackCollection = weavejs.api.core.ICallbackCollection;
import ILinkableObject = weavejs.api.core.ILinkableObject;
import IColumnReference = weavejs.api.data.IColumnReference;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import StandardLib = weavejs.util.StandardLib;


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
	enableMenuBarWatcher:LinkableWatcher = forceUpdateWatcher(this, LinkableBoolean, ['WeaveProperties', 'enableMenuBar']);
	
	menuBar:WeaveMenuBar;

	static defaultProps:WeaveAppProps = {
		weave: null,
		renderPath: ['Tabs'],
		readUrlParams: false
	};

	constructor(props:WeaveAppProps)
	{
		super(props);
		this.state = {
			toolPathToEdit: null
		};
		this.enableMenuBarWatcher.root = this.props.weave && this.props.weave.root;
	}
	
	componentWillReceiveProps(props:WeaveAppProps)
	{
		this.enableMenuBarWatcher.root = this.props.weave && this.props.weave.root;
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
	
	urlParams:{ file: string, editable: boolean , skipGuidance:boolean};
	
	componentDidMount()
	{
		this.createDefaultSessionElements();
		if (this.props.readUrlParams) {
			this.urlParams = MiscUtils.getUrlParams();
			this.urlParams.editable = StandardLib.asBoolean(this.urlParams.editable) || this.menuBar.systemMenu.fileMenu.pingAdminConsole();

			try {
				var weaveExternalTools:any = window.opener && (window.opener as any)[WEAVE_EXTERNAL_TOOLS];
			}
			catch (e) {
				console.error(e);
			}

			if (this.urlParams.file) {
				// read content from url
				this.menuBar.systemMenu.fileMenu.loadUrl(this.urlParams.file);
			}
			else if (weaveExternalTools && weaveExternalTools[window.name]) {
				// read content from flash
				var ownerPath:WeavePath = weaveExternalTools[window.name].path;
				var content:Uint8Array = atob(ownerPath.getValue('btoa(Weave.createWeaveFileContent())') as string) as any;
				WeaveArchive.setWeaveSessionFromContent(this.props.weave, content);
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
	
	handlePopoutClick=(tool:WeaveTool):void=>
	{
		var panelPath = tool.props.path;
		var popoutWindow:Window;
		var onBeforeUnLoad:Function = () => { };
		var onLoad:Function = () => { };
		var options:any = { transferStyle: true };
		var screenWidth:number, screenHeight:number;
		var layoutPath = Weave.getPath(ReactUtils.findComponent(tool, AbstractLayout as any)).getPath();

		this.removeFromLayout(panelPath);
		var content:JSX.Element = (
			<WeaveTool
				weave={this.props.weave}
				path={panelPath}
				style={{width: "100%", height: "100%"}}
				onGearClick={this.handleGearClick}
				onPopinClick={() => {
					this.addToLayout(layoutPath, panelPath);
					popoutWindow.close();
				}}
			/>
		);
		popoutWindow = ReactUtils.openPopout(content, onLoad, onBeforeUnLoad, options);

	};

	openDataSourceManager=()=>
	{
	};

	renderTab=(path:WeavePathArray, panelProps:LayoutPanelProps, panelRenderer?:PanelRenderer)=>
	{

		// backwards compatibility hack
		var sideBarUI:JSX.Element = null;
		var toolToEdit = this.props.weave.getObject(this.state.toolPathToEdit) as IVisTool; // hack
		if (toolToEdit && toolToEdit.renderEditor) // hack
			sideBarUI = <WeaveToolEditor tool={toolToEdit}
			                             onCloseHandler={this.handleSideBarClose}
			                             style={ {flex:1} }
			                             className="weave-ToolEditor"/>;
		return(
			<SideBarContainer barSize={.4} leftChildren={ sideBarUI }>
				<WeaveComponentRenderer
					weave={this.props.weave}
					path={path}
					style={{width: "100%", height: "100%"}}
					props={{panelRenderer: this.renderTool}}
				/>
			</SideBarContainer>
		);
	};

	renderTool=(path:WeavePathArray, panelProps:LayoutPanelProps, panelRenderer?:PanelRenderer)=>
	{
		var tool = this.props.weave.getObject(path);
		return (
			<WeaveTool
				ref={this.handleWeaveTool}
				weave={this.props.weave}
				path={path}
				props={{panelRenderer: this.renderTool}}
				style={{width: "100%", height: "100%", left: "0", top: "0"}}
				maximized={panelProps.maximized}
				onGearClick={this.handleGearClick}
				onPopoutClick={this.handlePopoutClick}
			/>
		);
	};

	private toolSet = new Set<WeaveTool>();

	handleWeaveTool=(tool:WeaveTool)=>
	{
		if (tool)
			this.toolSet.add(tool);
	};

	// enableGuidance will be given when called from GetStartedComponent
	createObject=(type:new(..._:any[])=>any,enableGuidance:boolean = false):void=>
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
			DataSourceManager.openInstance(this.menuBar.dataMenu, instance as IDataSource,enableGuidance);
		}

		if (React.Component.isPrototypeOf(type))
		{
			var placeholder = Weave.AS(instance, LinkablePlaceholder);
			if (placeholder)
				Weave.getCallbacks(placeholder).addDisposeCallback(this, this.handlePlaceholderDispose.bind(this, path, placeholder));
			this.setState({ toolPathToEdit: path });
			this.addToLayout(this.getRenderPath(), path);
		}
	};

	//sorts the array of column refs by numeric columns
	//TODO put this function elsewhere?
	prioritizeNumericColumns(columnRefs:Array<IWeaveTreeNode&IColumnReference>) : IColumnReference[]
	{
		var sortedRefs = _.sortBy(columnRefs, function(item) {
			var ref = Weave.AS(item, IColumnReference);
			let meta:{[key:string]:string} = ref && ref.getColumnMetadata();
			let dataType = meta && meta["dataType"];
			switch(dataType)
			{
				case 'number':
					return 0;
				default:
					return 1;
				case 'geometry':
					return 2;
			}
		});
		return sortedRefs.reverse();
	}

	private handlePlaceholderDispose(path:WeavePathArray, placeholder:LinkablePlaceholder<any>)
	{
		// hack
		var INIT = 'initSelectableAttributes';
		var instance = placeholder.getInstance();
		if (instance[INIT])
		{
			var refs = ColumnUtils.findFirstDataSet(this.props.weave.root).concat();
			var sortedRefs = this.prioritizeNumericColumns(refs);
			instance[INIT](sortedRefs);
		}
		this.forceUpdate();
	}

	get tabLayout():TabLayout
	{
		return this.props.weave.getObject(this.getRenderPath()) as TabLayout;
	}

	private initializeTabs=(tabLayout:TabLayout)=>
	{
		var tabLayoutState:LayoutState = tabLayout.getSessionState();
		var panels = tabLayoutState && tabLayoutState.panels;
		var activePanelId = tabLayoutState && tabLayoutState.activePanelId;
		var title = tabLayoutState && tabLayoutState.title;

		if(!panels || (panels && !panels.length))
		{
			var layouts = this.props.weave.root.getObjects(AbstractLayout as any, true).filter((obj:ILinkableObject) => {
				if(LinkablePlaceholder.getClass(obj) == TabLayout)
					return false;
				return true;
			});
			panels = layouts.map((layout) => {
				return {
					id: Weave.findPath(this.props.weave.root, layout),
					label: this.props.weave.root.getName(layout)
				}
			});
		}
		if(!activePanelId)
		{
			activePanelId = panels[0] && panels[0].id;
		};

		if(!title)
		{
			title = this.props.weave.root.getName(this.tabLayout);
		}

		tabLayout.setSessionState({
			panels,
			activePanelId,
			title
		});
	};

	addNewLayout=(type:typeof AbstractLayout, tabLayout:TabLayout)=>
	{
		
	};

	removeExisingLayout=(id:WeavePathArray, event:React.MouseEvent)=>
	{

	};

	addToLayout(layoutPath:WeavePathArray, panelPath:WeavePathArray)
	{
		var layout = Weave.AS(this.props.weave.getObject(layoutPath), AbstractLayout as any) as AnyAbstractLayout;
		if (layout)
			layout.addPanel(panelPath);
	}

	removeFromLayout(panelPath:WeavePathArray)
	{
		var panel = Weave.AS(this.props.weave.getObject(panelPath), React.Component);
		var element = panel && ReactDOM.findDOMNode(panel);
		var layout = element && ReactUtils.findComponent(element.parentElement, AbstractLayout as any) as AnyAbstractLayout;
		if (layout)
			layout.removePanel(panelPath);
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
		
	get enableMenuBar():LinkableBoolean
	{
		return this.enableMenuBarWatcher.target as LinkableBoolean;
	}
	
	render():JSX.Element
	{
		var weave = this.props.weave;
		var renderPath = this.getRenderPath();
		
		if (!weave)
			return <VBox>Cannot render WeaveApp without an instance of Weave.</VBox>;

		// backwards compatibility hack
		var sideBarUI:JSX.Element = null;
		var toolToEdit = weave.getObject(this.state.toolPathToEdit) as IVisTool; // hack
		if (toolToEdit && toolToEdit.renderEditor) // hack
			sideBarUI = <WeaveToolEditor tool={toolToEdit}
			                             onCloseHandler={this.handleSideBarClose}
			                             style={ {flex:1} }
			                             className="weave-ToolEditor"/>

		this.urlParams = MiscUtils.getUrlParams();
		// { this.urlParams.file || Boolean(this.urlParams.skipGuidance) ? null : <GetStartedComponent weave={weave} createObject={this.createObject} /> }

		return (
			<VBox
				className="weave-app"
				{...this.props as React.HTMLAttributes}
				style={_.merge({flex: 1}, this.props.style)}
				onContextMenu={ContextMenu.open}>
				<WeaveProgressBar/>
				<WeaveComponentRenderer
					weave={weave}
					path={renderPath}
					defaultType={TabLayout}
					style={{width: "100%", height: "100%"}}
					onCreate={this.initializeTabs}
					props={ {
						panelRenderer: this.renderTab,
						leadingTabs: [
							{
								label: "Data Sources",
								content: (
									<HBox>{"Data Sources"}</HBox>
								)
							}
						],
						onAdd: this.addNewLayout,
						onClose: this.removeExisingLayout
					}}
				/>
				{
					!this.enableMenuBar || this.enableMenuBar.value || (this.urlParams && this.urlParams.editable)
					?	<WeaveMenuBar
							style={prefixer({order: -1, opacity: !this.enableMenuBar || this.enableMenuBar.value ? 1 : 0.5 })}
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
