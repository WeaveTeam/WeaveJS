import * as React from "react";
import * as weavejs from "weavejs";
import * as _ from "lodash";
import {Weave} from "weavejs";
import prefixer = weavejs.css.prefixer;
import SideBarContainer = weavejs.ui.SideBarContainer;
import VBox = weavejs.ui.flexbox.VBox;
import WeaveComponentRenderer = weavejs.ui.WeaveComponentRenderer;
import MiscUtils = weavejs.util.MiscUtils;
import ContextMenu = weavejs.ui.menu.ContextMenu;
import ReactUtils = weavejs.util.ReactUtils;
import WeaveReactUtils = weavejs.util.WeaveReactUtils;
import WeavePathArray = weavejs.util.WeavePathArray;

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
import WeaveProperties from "./WeaveProperties";
import WeaveMenus from "../menu/WeaveMenus";
import {WeaveAPI} from "weavejs";
import WeaveToolEditor from "../editor/WeaveToolEditor";
import WeaveTool from "../layout/WeaveTool";
import SessionStateEditor from "../editor/SessionStateEditor";
import TabLayout from "../layout/TabLayout";
import {LayoutPanelProps, PanelRenderer, AnyAbstractLayout, AbstractLayout} from "../layout/AbstractLayout";
import FlexibleLayout from "../layout/FlexibleLayout";
import {TabLayoutProps} from "../layout/TabLayout";
import IVisTool from "../api/ui/IVisTool";
import WindowLayout from "../layout/WindowLayout";
import WeaveProgressBar from "../ui/WeaveProgressBar";
import InteractiveTour from "../dialog/InteractiveTour";
import DataSourceManager from "../editor/manager/DataSourceManager";
import WeaveMenuBar from "../menu/WeaveMenuBar";
import NotificationSystem from "../modules/NotifcationSystem";

export interface WeaveAppProps extends React.HTMLProps<WeaveApp>
{
	rootApp?:WeaveApp;
	weave:Weave;
	renderPath?:WeavePathArray;
	readUrlParams?:boolean;
	showFileDialog?:boolean;
	forceMenuBar?:boolean;
	initializeTabs?:boolean;
	enableTour?:boolean;
	onClose?:()=>void;
}

export interface WeaveAppState
{
	toolPathToEdit?:WeavePathArray;
	enableTour?:boolean;
}

export default class WeaveApp extends React.Component<WeaveAppProps, WeaveAppState>
{
	enableMenuBarWatcher:LinkableWatcher = WeaveReactUtils.forceUpdateWatcher(this, LinkableBoolean, ['WeaveProperties', 'enableMenuBar']);
	menus:WeaveMenus;
	_popout_windows = new Set<Window>();

	get popout_windows()
	{
		return (this.props.rootApp || this)._popout_windows;
	}

	static defaultProps:WeaveAppProps = {
		weave: null,
		showFileDialog: false,
		renderPath: ['Tabs'],
		readUrlParams: false,
		initializeTabs: true
	};

	constructor(props:WeaveAppProps)
	{
		super(props);
		this.state = {
			toolPathToEdit: null
		};

		WeaveProperties.getProperties(this.props.weave);
		this.enableMenuBarWatcher.root = this.props.weave && this.props.weave.root;
		if (this.props.rootApp)
		{
			this.urlParams = this.props.rootApp.urlParams;
		}
		else
		{
			this.urlParams = MiscUtils.getUrlParams();
		}
		this.menus = new WeaveMenus(this, this.props.weave, this.createObject, this.onSessionLoaded, this.openDataManager, this.enableDataManagerItem);
		this.menus.showFileMenu = this.urlParams.hasOwnProperty('fileMenu');
	}

	componentWillReceiveProps(props:WeaveAppProps)
	{
		WeaveProperties.getProperties(this.props.weave);
		this.enableMenuBarWatcher.root = this.props.weave && this.props.weave.root;
	}

	getRenderPath():WeavePathArray
	{
		var renderPath:WeavePathArray = null;
		if (this.props.readUrlParams)
			renderPath = WeaveAPI.CSVParser.parseCSVRow(this.urlParams.layout);
		return renderPath || this.props.renderPath || WeaveApp.defaultProps.renderPath;
	}

	getRootLayoutPath():WeavePathArray
	{
		return ["Tabs"];
	}

	getDefaultLayoutPath():WeavePathArray
	{
		return ["Layout"];
	}

	getRenderedComponent():React.Component<any, any>
	{
		if (!this.props.weave)
			return null;
		return this.props.weave.getObject(this.getRenderPath()) as React.Component<any, any>;
	}

	urlParams:{ file: string, editable: boolean, layout: string};

	get openedFromAdminConsole():boolean
	{
		try
		{
			return !!window.opener.document.getElementById("AdminConsole");
		}
		catch (e)
		{
			return false;
		}
	}

	componentDidMount()
	{
		// only add this listener if the weave app is a root weave app
		if (_.isEqual(this.getRenderPath(), this.getRootLayoutPath()))
		{
			let window = ReactUtils.getWindow(this);
			window.addEventListener("beforeunload", this.handleBeforeUnload);
			window.addEventListener("unload", this.handleUnload);
		}

		if (this.props.readUrlParams)
		{
			this.urlParams.editable = StandardLib.asBoolean(this.urlParams.editable) || this.openedFromAdminConsole;

			var weaveExternalTools:any = Weave.getDefinition('window.opener.WeaveExternalTools');
			if (this.urlParams.file)
			{
				// read content from url
				this.menus.fileMenu.load(this.urlParams.file);
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
		if (this.props.showFileDialog)
			this.menus.fileMenu.openFileDialog();
		this.setState({
			enableTour:this.props.enableTour
		});
	}

	handleSideBarClose=(editor:WeaveToolEditor)=>
	{
		if (this.props.weave.getObject(this.state.toolPathToEdit) == editor.tool)
			this.setState({ toolPathToEdit: null });
	};

	/**
	 * This function will get called when the main WeaveApp gets unloaded
	 */
	handleUnload=()=>
	{
		for (let window of this.popout_windows)
			window.close();
	};

	/**
	 * This function will get called before the window unloads
	 * and will provide a dialog giving the user a chance to cancel the unloading
	 * @param event beforeunload event
	 * @returns {string} the confirmation message
	 */
	handleBeforeUnload=(event:BeforeUnloadEvent)=>
	{
		if (this.popout_windows.size)
		{
			var confirmationMessage = Weave.lang("You are about to close multiple Weave windows.");
			event.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
			return confirmationMessage;              // Gecko, WebKit, Chrome <34
		}
	};

	handleGearClick=(tool:WeaveTool):void=>
	{
		var path = tool.props.path;
		var obj = this.props.weave.getObject(path);

		if (obj && !(obj as any).renderEditor) // hack
		{
			var toolName = path[0]; // hack
			SessionStateEditor.openInstance(this, obj);
			return;
		}

		this.setState({
			toolPathToEdit: path
		});
	};

	restoreTabs=(tabLayoutPath:WeavePathArray):void=>
	{
		var weave = this.props.weave;
		var oldTabLayout = Weave.AS(weave.getObject(tabLayoutPath), TabLayout);
		var rootTabLayout = Weave.AS(weave.getObject(this.getRootLayoutPath()), TabLayout);
		var tabIds = oldTabLayout ? oldTabLayout.getPanelIds() : [];
		tabIds.map(id => {
			rootTabLayout.addPanel(id);
			rootTabLayout.setTabLabel(id, oldTabLayout.getTabLabel(id));
		});
		weave.removeObject(tabLayoutPath);
	};

	handlePopoutClick=(layoutPath:WeavePathArray, oldTabLayoutPath:WeavePathArray):void=>
	{
		if (this.props.rootApp)
			return this.props.rootApp.handlePopoutClick(layoutPath, oldTabLayoutPath);

		var newTabLayoutPath = [this.props.weave.root.generateUniqueName("Tabs")];

		var oldTabLayout = this.props.weave.getObject(oldTabLayoutPath) as any;
		oldTabLayout.removePanel(layoutPath);

		WeaveReactUtils.requestObject(this.props.weave, newTabLayoutPath, TabLayout, (tabLayout:TabLayout) => {
			Weave.getCallbacks(tabLayout).addDisposeCallback(this, () => {
				// close the associated Tab Layout window when the Tab Layout is disposed
				let window = ReactUtils.getWindow(tabLayout);
				if (window)
				{
					try
					{
						this.popout_windows.delete(window);
						window.close();
					}
					catch(e)
					{

					}
				}
			});
			tabLayout.addPanel(layoutPath);
		});

		var content:JSX.Element = (
			<WeaveApp
				rootApp={this}
				weave={this.props.weave}
				renderPath={newTabLayoutPath}
				initializeTabs={false}
				style={{width: "100%", height: "100%"}}
			/>
		);
		var options:any = { transferStyle: true };
		this.popout_windows.add(
			ReactUtils.openPopout(content, _.noop, () => this.restoreTabs(newTabLayoutPath), options)
		);
	};

	renderTab=(path:WeavePathArray, panelProps:LayoutPanelProps, panelRenderer?:PanelRenderer)=>
	{
		// backwards compatibility hack
		var sideBarUI:JSX.Element = null;
		var toolToEdit = this.props.weave.getObject(this.state.toolPathToEdit) as IVisTool; // hack
		if (toolToEdit && toolToEdit.renderEditor) // hack
			sideBarUI = (
				<WeaveToolEditor
					tool={toolToEdit}
					onCloseHandler={this.handleSideBarClose}
					style={ {flex:1} }
					className="weave-ToolEditor"
				/>
			);
		return(
			<SideBarContainer barSize={.4} leftChildren={ sideBarUI }>
				<WeaveComponentRenderer
					weave={this.props.weave}
					path={path}
					style={{width: "100%"}}
					props={{panelRenderer: this.renderTool}}
				/>
			</SideBarContainer>
		);
	};

	renderTool=(path:WeavePathArray, panelProps:LayoutPanelProps, panelRenderer?:PanelRenderer)=>
	{
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

	enableDataManagerItem=():boolean=>
	{
		return !!this.tabLayout && this.tabLayout.activeTabIndex != -1;
	}

	openDataManager=()=>
	{
		this.tabLayout.activeTabIndex = -1;
	}

	createObject=(type:Class):void=>
	{
		var weave = this.props.weave;

		// save this immediately because DataSourceManager clears it when it unmounts
		var firstDataSet = ColumnUtils.map_root_firstDataSet.get(weave.root);

		// need to generate path here instead of letting LinkableHashMap generate a name because async types can't be instantiated immediately
		var baseName = WeaveAPI.ClassRegistry.getDisplayName(type);
		var path = [weave.root.generateUniqueName(baseName)];
		weave.requestObject(path, type);
		var possiblePlaceholder = weave.getObject(path);
		var resultType = LinkablePlaceholder.getClass(possiblePlaceholder);

		if (resultType != type)
			return;

		if (React.Component.isPrototypeOf(type))
		{
			this.setState({ toolPathToEdit: path });

			var tabLayout = this.tabLayout;
			if (tabLayout.activeTabIndex < 0)
				tabLayout.activeTabIndex = 0;

			var tabPath = tabLayout.getPanelIds()[tabLayout.activeTabIndex];

			if (!tabPath)
			{
				tabPath = this.getDefaultLayoutPath();
				weave.requestObject(tabPath, FlexibleLayout);
				tabLayout.addPanel(tabPath);
			}

			LinkablePlaceholder.whenReady(this, weave.getObject(tabLayout.activePanelId), (layout:AnyAbstractLayout) => {
				for (let id of layout.getPanelIds())
					layout.maximizePanel(id, false);
				layout.addPanel(path);
			});

			LinkablePlaceholder.whenReady(this, possiblePlaceholder, (instance:ILinkableObject) => {
				// hack
				var INIT = 'initSelectableAttributes';
				if ((instance as any)[INIT])
				{
					var refs = firstDataSet ? firstDataSet.concat() : ColumnUtils.findFirstDataSet(this.props.weave.root).concat();
					var sortedRefs = this.prioritizeNumericColumns(refs);
					(instance as any)[INIT](sortedRefs);
				}
				this.forceUpdate();
			});
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

	get tabLayout():TabLayout
	{
		return Weave.AS(this.props.weave.getObject(this.getRenderPath()), TabLayout);
	}

	private getTabLayouts()
	{
		return this.props.weave.root.getObjects(TabLayout, true);
	}

	private getNonTabLayouts()
	{
		return this.props.weave.root.getObjects(AbstractLayout as any, true).filter((obj:ILinkableObject) => {
			if (LinkablePlaceholder.getClass(obj) == TabLayout)
				return false;
			return true;
		});
	}

	private onSessionLoaded=()=>
	{
		var weave = this.props.weave;
		weave.requestObject(this.getRootLayoutPath(), TabLayout);
		var mainTabLayout = weave.getObject(this.getRootLayoutPath()) as TabLayout;
		var allTabLayouts = this.getTabLayouts();
		allTabLayouts.forEach(tabLayout => {
			TabLayout.mergeLayout(mainTabLayout, tabLayout);
			weave.removeObject(Weave.getPath(tabLayout).getPath());
		});
	};

	private initializeTabs=(tabLayout:TabLayout)=>
	{
		if (!this.props.initializeTabs)
			return;

		var tabLayoutState = tabLayout.getSessionState();
		var tabs = tabLayoutState && tabLayoutState.tabs;
		var activeTabIndex = tabLayoutState && tabLayoutState.activeTabIndex || -1;
		var title = tabLayoutState && tabLayoutState.title;

		if (!tabs || (tabs && !tabs.length))
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
				if (history && history.currentState)
				{
					// create a window layout and select its tab
					activeTabIndex = 0;
					WeaveReactUtils.requestObject(this.props.weave, this.getDefaultLayoutPath(), WindowLayout, (windowLayout:WindowLayout) => {
						var ids:WeavePathArray[] = this.props.weave.root.getNames(IVisTool, true).map(name => [name]);
						windowLayout.setSessionState({
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
							title: null
						});
					});
				}
				else
				{
					// blank session, will default to data manager
					this.props.weave.requestObject(this.getDefaultLayoutPath(), FlexibleLayout);
				}
				layouts = this.getNonTabLayouts();
			}

			for (var layout of layouts)
				tabLayout.addPanel(Weave.findPath(this.props.weave.root, layout));
		}

		tabLayout.activeTabIndex = activeTabIndex;
	};

	addNewTab=(type?:typeof AbstractLayout)=>
	{
		var weave = this.props.weave;
		var layoutName = weave.root.generateUniqueName("Layout");
		var path = [layoutName];
		weave.requestObject(path, type as any);
		this.tabLayout.addPanel(path);
	};

	removeExistingTab=(id:WeavePathArray)=>
	{
		this.tabLayout.removePanel(id);
		this.props.weave.removeObject(id);
	};

	onTabClick=(panelPath:WeavePathArray, event:React.MouseEvent)=>
	{
		if (event.button == 1) // if middle click, close the tab
		{
			event.preventDefault();
			this.removeExistingTab(panelPath);
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

	componentWillUnmount()
	{
		ReactUtils.getWindow(this).removeEventListener("beforeunload", this.handleUnload);
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
		{
			return (
				<VBox style={{flex: 1, justifyContent: "center", alignItems: "center", padding: 10}}>
					<span>{Weave.lang('Cannot render WeaveApp without an instance of Weave.')}</span>
				</VBox>
			);
		}

		let weaveTabbedComponent:JSX.Element = null;
		let menuBarUI:JSX.Element = null;
		let progressBarUI:JSX.Element = null;

		let blankPageIntroScreen:JSX.Element = null;
		let interactiveTourComponent:JSX.Element = null;
		weaveTabbedComponent =  (
			<WeaveComponentRenderer
				weave={weave}
				path={renderPath}
				defaultType={TabLayout}
				style={{width: "100%"}}
				onCreate={this.initializeTabs}
				props={ {
					panelRenderer: this.renderTab,
					leadingTabs: [
						{
							label: "Data Sources",
							content: <DataSourceManager weave={this.props.weave} fileMenu={ this.menus.fileMenu }/>
						}
					],
					onAdd: [
						{
							label: Weave.lang("Window Layout"),
							click: () => this.addNewTab(WindowLayout)
						},
						{
							label: Weave.lang("Flexible Layout"),
							click: () => this.addNewTab(FlexibleLayout)
						}
					],
					onRemove: this.removeExistingTab,
					onTabClick: this.onTabClick,
					onTabDoubleClick: (layoutPath:WeavePathArray) => this.handlePopoutClick(layoutPath, renderPath)
				} as TabLayoutProps }
			/>);

		let menuBarEnabled = !this.enableMenuBar || this.enableMenuBar.value || (this.urlParams && this.urlParams.editable);

		/* Only override the menubar configuration in the session or URL params if forceMenuBar is set to *exactly* true or false */
		if (this.props.forceMenuBar === true || this.props.forceMenuBar === false)
		{
			menuBarEnabled = this.props.forceMenuBar;
		}

		menuBarUI = menuBarEnabled
			?	<WeaveMenuBar
					style={prefixer({opacity: !this.enableMenuBar || this.enableMenuBar.value ? 1 : 0.5 })}
					weave={weave}
					menus={this.menus}
				/>
			:	null;

		progressBarUI = <WeaveProgressBar/>;

		if (this.state.enableTour)
		{
			interactiveTourComponent = <InteractiveTour onClose={this.props.onClose}/>;
		}

		return (
			<VBox
				className="weave"
				{...this.props as React.HTMLAttributes}
				style={_.merge({flex: 1}, this.props.style)}
				onContextMenu={ContextMenu.open}>
				{menuBarUI}
				{progressBarUI}
				{weaveTabbedComponent}
				{interactiveTourComponent}
				<NotificationSystem
					ref={(c:any) => {
						WeaveProperties.getProperties(this.props.weave).notificationSystem = c;
					}}
				/>
			</VBox>
		);
	}
}
