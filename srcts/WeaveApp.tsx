import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import prefixer from "./react-ui/VendorPrefixer";
import SideBarContainer from "./react-ui/SideBarContainer";
import InteractiveTour from "./react-ui/InteractiveTour";
import {VBox, HBox} from "./react-ui/FlexBox";
import WeaveMenuBar from "./WeaveMenuBar";
import GetStartedComponent from "./ui/GetStartedComponent";
import WeaveComponentRenderer from "./WeaveComponentRenderer";
import MiscUtils from "./utils/MiscUtils";
import WeaveTool from "./WeaveTool";
import {LayoutPanelProps, PanelRenderer, AbstractLayout, AnyAbstractLayout} from "./layouts/AbstractLayout";
import DataSourceManager from "./ui/DataSourceManager";
import ContextMenu from "./menus/ContextMenu";
import {IVisTool} from "./tools/IVisTool";
import ReactUtils from "./utils/ReactUtils";
import {forceUpdateWatcher, requestObject, WeavePathArray} from "./utils/WeaveReactUtils";
import WeaveProgressBar from "./ui/WeaveProgressBar";
import WeaveToolEditor from "./ui/WeaveToolEditor";
import TabLayout, {TabLayoutProps} from "./layouts/TabLayout";
import WindowLayout from "./layouts/WindowLayout";
import FlexibleLayout from "./layouts/FlexibleLayout";
import WeaveMenus from "./menus/WeaveMenus";

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
import DynamicState = weavejs.api.core.DynamicState;


const WEAVE_EXTERNAL_TOOLS = "WeaveExternalTools";

export interface WeaveAppProps extends React.HTMLProps<WeaveApp>
{
	weave:Weave;
	renderPath?:WeavePathArray;
	readUrlParams?:boolean;
}

export interface WeaveAppState
{
	toolPathToEdit?:WeavePathArray;
	initialWeaveComponent?:string;
}

export default class WeaveApp extends React.Component<WeaveAppProps, WeaveAppState>
{
	enableMenuBarWatcher:LinkableWatcher = forceUpdateWatcher(this, LinkableBoolean, ['WeaveProperties', 'enableMenuBar']);
	menus:WeaveMenus;

	static defaultProps:WeaveAppProps = {
		weave: null,
		renderPath: ['Tabs'],
		readUrlParams: false
	};

	constructor(props:WeaveAppProps)
	{
		super(props);
		this.state = {
			toolPathToEdit: null,
			initialWeaveComponent:null
		};
		this.menus = new WeaveMenus(this.props.weave, this.createObject);
		this.enableMenuBarWatcher.root = this.props.weave && this.props.weave.root;
	}
	
	componentWillReceiveProps(props:WeaveAppProps)
	{
		this.enableMenuBarWatcher.root = this.props.weave && this.props.weave.root;
	}
	
	getRenderPath():WeavePathArray
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
		let cc = root.requestObject(DEFAULT_COLOR_COLUMN, weavejs.data.column.ColorColumn, true);
		let bc = cc.internalDynamicColumn.requestGlobalObject(DEFAULT_COLOR_BIN_COLUMN, weavejs.data.column.BinnedColumn, true);
		let fc = bc.internalDynamicColumn.requestGlobalObject(DEFAULT_COLOR_DATA_COLUMN, weavejs.data.column.FilteredColumn, true);
		fc.filter.requestGlobalObject(DEFAULT_SUBSET_KEYFILTER);
	}
	
	urlParams:{ file: string, editable: boolean , skipBlankPageIntro:boolean};
	
	componentDidMount()
	{
		this.createDefaultSessionElements();
		if (this.props.readUrlParams)
		{
			this.urlParams = MiscUtils.getUrlParams();
			this.urlParams.editable = StandardLib.asBoolean(this.urlParams.editable) || this.menus.fileMenu.pingAdminConsole();

			try
			{
				var weaveExternalTools:any = window.opener && (window.opener as any)[WEAVE_EXTERNAL_TOOLS];
			}
			catch (e)
			{
				console.error(e);
			}

			if (this.urlParams.file)
			{
				// read content from url
				this.menus.fileMenu.loadUrl(this.urlParams.file);
			}
			else if (weaveExternalTools && weaveExternalTools[window.name])
			{
				// read content from flash
				var ownerPath:WeavePath = weaveExternalTools[window.name].path;
				var content:Uint8Array = atob(ownerPath.getValue('btoa(Weave.createWeaveFileContent())') as string) as any;
				this.menus.fileMenu.handleOpenedFileContent("export.weave", content);
				this.forceUpdate();
			}
		}
	}
	
	handleSideBarClose=()=>
	{
		this.setState({ toolPathToEdit: null });
	};
	
	handleGearClick=(tool:WeaveTool):void=>
	{
		var path = tool.props.path;
		this.setState({
			toolPathToEdit: path
		});
	};

	restoreTabs=(tabLayoutPath:WeavePathArray):void=>
	{
		console.log("restore tabs called", tabLayoutPath)
	}

	handlePopoutClick=(layoutPath:WeavePathArray, oldTabLayoutPath:WeavePathArray):void=>
	{
		var newTabLayoutPath = [this.props.weave.root.generateUniqueName("Tabs")];
		var oldTabLayout = this.props.weave.getObject(oldTabLayoutPath) as any;
		oldTabLayout.removePanel(layoutPath);

		var content:JSX.Element = (
			<WeaveComponentRenderer
				weave={this.props.weave}
				path={newTabLayoutPath}
				defaultType={TabLayout}
				style={{width: "100%", height: "100%"}}
				onCreate={(newTabLayout:TabLayout) => {
					newTabLayout.addPanel(layoutPath)
				}}
				props={ { panelRenderer: this.renderTab } }
			/>
		);

		var onLoad:Function = () => { };
		var options:any = { transferStyle: true };
		ReactUtils.openPopout(content, onLoad, this.restoreTabs, options);
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
			/>
		);
	};

	private toolSet = new Set<WeaveTool>();

	handleWeaveTool=(tool:WeaveTool)=>
	{
		if (tool)
			this.toolSet.add(tool);
	};

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

		if (React.Component.isPrototypeOf(type))
		{
			var placeholder = Weave.AS(instance, LinkablePlaceholder);
			if (placeholder)
				Weave.getCallbacks(placeholder).addDisposeCallback(this, this.handlePlaceholderDispose.bind(this, path, placeholder));
			this.setState({ toolPathToEdit: path });
			
			var tabLayout = this.tabLayout;
			if (tabLayout.activeTabIndex < 0)
				tabLayout.activeTabIndex = 0;
			
			this.addToLayout(path);
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
		if (instance && instance[INIT])
		{
			var refs = ColumnUtils.findFirstDataSet(this.props.weave.root).concat();
			var sortedRefs = this.prioritizeNumericColumns(refs);
			instance[INIT](sortedRefs);
		}
		this.forceUpdate();
	}

	get tabLayout():TabLayout
	{
		return Weave.AS(this.props.weave.getObject(this.getRenderPath()), TabLayout);
	}
	
	private getNonTabLayouts()
	{
		return this.props.weave.root.getObjects(AbstractLayout as any, true).filter((obj:ILinkableObject) => {
			if(LinkablePlaceholder.getClass(obj) == TabLayout)
				return false;
			return true;
		});
	}

	private initializeTabs=(tabLayout:TabLayout)=>
	{
		var tabLayoutState = tabLayout.getSessionState();
		var tabs = tabLayoutState && tabLayoutState.tabs;
		var activeTabIndex = tabLayoutState && tabLayoutState.activeTabIndex || -1;
		var title = tabLayoutState && tabLayoutState.title;
		var defaultPath = ["Layout"];

		if(!tabs || (tabs && !tabs.length))
		{
			var layouts = this.getNonTabLayouts();
			if (layouts.length)
			{
				// if there are existing layouts, select the first one
				activeTabIndex = 0;
			}
			else
			{
				var archive = this.menus.fileMenu.archive;
				var history = archive && archive.objects.get("history.amf") as {currentState: any};
				if(history && history.currentState)
				{
					// create a window layout and select its tab
					activeTabIndex = 0;
					requestObject(this.props.weave, defaultPath, WindowLayout, (instance:WindowLayout) => {
						var ids:WeavePathArray[] = this.props.weave.root.getNames(weavejs.api.ui.IVisTool, true).map(name => [name]);
						instance.setSessionState({
							panels: ids.map(id => {
								var state = DynamicState.traverseState(history.currentState, id);
								return {
									id: id,
									position: (
										state
										?	{
												left: state.panelX,
												top: state.panelY,
												width: state.panelWidth,
												height: state.panelHeight
											}
										:	WindowLayout.generatePosition()
									),
									maximized: state && state.maximized
								};
							}),
							title: "Layout"
						});
					});
				}
				else
				{
					// blank session, will default to data manager
					this.props.weave.requestObject(defaultPath, FlexibleLayout);
				}
				layouts = this.getNonTabLayouts();
			}

			tabs = layouts.map((layout) => {
				return {
					id: Weave.findPath(this.props.weave.root, layout),
					label: this.props.weave.root.getName(layout)
				}
			});
		}

		if(!title)
		{
			title = this.props.weave.root.getName(this.tabLayout);
		}
		if(this.state.initialWeaveComponent == GetStartedComponent.DATA || this.state.initialWeaveComponent == GetStartedComponent.INTERACTIVETOUR)
		{
			activeTabIndex = -1; // -1 used to open the leading tab , rather session tab
		}

		tabLayout.setSessionState({
			tabs,
			activeTabIndex,
			title
		});
	};

	addNewLayout=(type?:typeof AbstractLayout)=>
	{
		var weave = this.props.weave;
		var baseName = weavejs.WeaveAPI.ClassRegistry.getDisplayName(type as any);
		var layoutName = weave.root.generateUniqueName(baseName);
		var path = [layoutName];
		weave.requestObject(path, type as any);
		this.tabLayout.addPanel(path, layoutName);
	};

	removeExistingLayout=(id:WeavePathArray, event?:React.MouseEvent)=>
	{
		this.tabLayout.removePanel(id, event);
		this.props.weave.removeObject(id);
	};

	addToLayout(panelPath:WeavePathArray)
	{
		var activeLayout = Weave.AS(this.props.weave.getObject(this.tabLayout.activePanel), AbstractLayout as any) as AnyAbstractLayout;
		if (activeLayout)
			activeLayout.addPanel(panelPath);
		else
			console.error('TODO - add panel when linkable placeholder is disposed');
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

	initialLoadingForBlankSession=(initialComponentName:string):void=>{
		this.setState({
			initialWeaveComponent:initialComponentName
		});
		
	};
		
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


		// check in url params to skip BlankPageIntro
		this.urlParams = MiscUtils.getUrlParams();
		let skipBlankPageIntro:boolean = this.urlParams ? StandardLib.asBoolean(this.urlParams.skipBlankPageIntro) : false;

		// check in loaded weave session state to skip BlankPageIntro
		if(weave.root.getObjects(weavejs.data.source.AbstractDataSource).length > 0 || weave.root.getObjects(weavejs.core.LinkablePlaceholder).length > 0)
		{
			skipBlankPageIntro = true;
		}

		// check in interaction event in GetStartedcomponent to skip BlankPageIntro
		if(this.state.initialWeaveComponent)
		{
			skipBlankPageIntro = true;
		}
		// backwards compatibility hack
		var sideBarUI:JSX.Element = null;
		var toolToEdit = weave.getObject(this.state.toolPathToEdit) as IVisTool; // hack
		if (toolToEdit && toolToEdit.renderEditor) // hack
			sideBarUI = <WeaveToolEditor tool={toolToEdit}
			                             onCloseHandler={this.handleSideBarClose}
			                             style={ {flex:1} }
			                             className="weave-ToolEditor"/>;


		let weaveTabbedComponent:JSX.Element = null;
		let menuBarUI:JSX.Element = null;
		let progressBarUI:JSX.Element = null;

		let blankPageIntroScreen:JSX.Element = null;
		let interactiveTourComponent:JSX.Element = null;

		if(skipBlankPageIntro)
		{
			weaveTabbedComponent =  (
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
								content: <DataSourceManager weave={this.props.weave}/>
							}
						],
						onAdd: [
							{
								label: Weave.lang("Window Layout"),
								click: () => this.addNewLayout(WindowLayout)
							},
							{
								label: Weave.lang("Flexible Layout"),
								click: () => this.addNewLayout(FlexibleLayout)
							}
						],
						onRemove: this.removeExistingLayout,
						onTabDoubleClick: (layoutPath:WeavePathArray) => this.handlePopoutClick(layoutPath, renderPath)
					} as TabLayoutProps }
				/>);

			menuBarUI = !this.enableMenuBar || this.enableMenuBar.value || (this.urlParams && this.urlParams.editable)
				?	<WeaveMenuBar
						style={prefixer({order: -1, opacity: !this.enableMenuBar || this.enableMenuBar.value ? 1 : 0.5 })}
						weave={weave}
						menus={this.menus}
					/>
				:	null;

			progressBarUI = <WeaveProgressBar/>;
		}
		else
		{
			blankPageIntroScreen =  <GetStartedComponent style={ {flex:1} } loader={this.initialLoadingForBlankSession} /> ;
			if(this.state.initialWeaveComponent == GetStartedComponent.INTERACTIVETOUR )
			{
				interactiveTourComponent = <InteractiveTour/>
			}
		}


		return (
			<VBox
				className="weave-app"
				{...this.props as React.HTMLAttributes}
				style={_.merge({flex: 1}, this.props.style)}
				onContextMenu={ContextMenu.open}>
				{progressBarUI}
				{blankPageIntroScreen}
				{weaveTabbedComponent}
				{menuBarUI}
				{interactiveTourComponent}
			</VBox>
		);
	}
}
