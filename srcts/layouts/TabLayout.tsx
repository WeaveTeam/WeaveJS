import * as React from "react";
import * as _ from "lodash";
import WeaveComponentRenderer from "../WeaveComponentRenderer";
import {AbstractLayout, LayoutProps} from "./AbstractLayout";
import Tabs from "../react-ui/Tabs";
import {HBox} from "../react-ui/FlexBox";
import InteractiveTour from "../react-ui/InteractiveTour";
import ReactUtils from "../utils/ReactUtils";
import MiscUtils, {Structure} from "../utils/MiscUtils";
import CenteredIcon from "../react-ui/CenteredIcon";
import classNames from "../modules/classnames";
import {MenuItemProps} from "../react-ui/Menu";
import Dropdown from "../semantic-ui/Dropdown";
import {WeavePathArray} from "../utils/WeaveReactUtils";

import LinkableVariable = weavejs.core.LinkableVariable;
import LinkablePlaceholder = weavejs.core.LinkablePlaceholder;

export interface TabState
{
	id: WeavePathArray,
	label: string
}

export interface TabLayoutProps extends LayoutProps
{
	leadingTabs?: {
		label: React.ReactChild,
		content: JSX.Element
	}[];
	onAdd: MenuItemProps|React.MouseEventHandler;
	onRemove: (panelId:WeavePathArray) => void;
	onTabClick: (panelId:WeavePathArray, event?:React.MouseEvent) => void;
	onTabDoubleClick: (panelId:WeavePathArray, event?:React.MouseEvent) => void;
}

export interface LayoutState
{
	tabs: TabState[];
	activeTabIndex:number;
	title: string;
}

const stateStructure:Structure = {
	tabs: [
		{
			id: MiscUtils.nullableStructure(["string"]),
			label: "string"
		}
	],
	activeTabIndex: "number",
	title: "string"
};

export default class TabLayout extends AbstractLayout<TabLayoutProps, {}> implements weavejs.api.core.ILinkableVariable
{
	static get DEFAULT_TAB_PREFIX():string
	{
		return Weave.lang("Sheet ");
	}
	
	private linkableState = Weave.linkableChild(this, new LinkableVariable(null, null, MiscUtils.normalizeStructure({}, stateStructure)), this.forceUpdate, true);
	private resetTimer:boolean;

	constructor(props:TabLayoutProps)
	{
		super(props);
	}

	/**
	 * This static function takes a layout session state and combines it
	 * with another layout session state
	 * @param into the layout to be merged into
	 * @param from the layout to be merged from
	 */
	static mergeLayout(into:TabLayout|LinkablePlaceholder<TabLayout>, from:TabLayout|LinkablePlaceholder<TabLayout>)
	{
		if (LinkablePlaceholder.getClass(into) != TabLayout || LinkablePlaceholder.getClass(from) != TabLayout)
		{
			console.error("Unexpected parameters to mergeLayout: ", into, from);
			return;
		}
		var intoState = MiscUtils.normalizeStructure(Weave.getState(into), stateStructure) as LayoutState;
		var fromState = MiscUtils.normalizeStructure(Weave.getState(from), stateStructure) as LayoutState;

		intoState.tabs = intoState.tabs.concat(fromState.tabs);

		Weave.setState(intoState, fromState);
	}

	getSessionState():LayoutState
	{
		return this.linkableState.state as LayoutState;
	}

	setSessionState(state:LayoutState):void
	{
		this.linkableState.state = MiscUtils.normalizeStructure(state, stateStructure);
	}
	
	get activeTabIndex():number
	{
		var state = this.getSessionState();
		return state.activeTabIndex == null ? -this.leadingTabsLength : state.activeTabIndex;
	}
	
	set activeTabIndex(index:number)
	{
		var state = this.getSessionState();
		state.activeTabIndex = MiscUtils.normalizeStructure(index, "number");
		this.linkableState.state = state;
	}

	maximizePanel()
	{
		// do nothing because each panel is always maximized
	}

	get title()
	{
		return this.getSessionState().title;
	}

	get leadingTabsLength()
	{
		return this.props.leadingTabs ? this.props.leadingTabs.length : 0;
	}

	get activePanelId()
	{
		var state = this.getSessionState();
		var activePanelState = state.tabs[state.activeTabIndex];
		if (activePanelState)
			return activePanelState.id;
	}

	onDragOverTab=(panel:TabState)=>
	{
		/*
		// delay before switching tab
		this.resetTimer = false;
		var state = this.getSessionState();
		if (!_.isEqual(this.activePanelId, panel.id))
		{
			setTimeout(() => {
				if (!this.resetTimer)
				{
					state.activeTabIndex = this.getPanelIndex(panel.id);
					this.setSessionState(state);
				}
			}, 500);
		}
		*/
	};

	onDrop=(event:React.DragEvent)=>
	{
		console.log("drop layout", event.dataTransfer.getData("text/plain"));
	};

	onDragLeaveTab=()=>
	{
		this.resetTimer = true;
	};
	
	getTabLabel(id:WeavePathArray):string
	{
		var state = this.getSessionState();
		for (var tab of state.tabs)
			if (_.isEqual(id, tab.id))
				return tab.label;
		return null;
	}

	setTabLabel(id:WeavePathArray, newLabel:string)
	{
		var state = this.getSessionState();
		var tabToRename:TabState = null;
		state.tabs.forEach((tab) => {
			if (_.isEqual(id, tab.id))
				tabToRename = tab;
		});
		tabToRename.label = newLabel;
		this.setSessionState(state);
	}

	private switchPanelToActive=(indexFromTabsComponent:number):void=>
	{
		var state = this.getSessionState();
		state.activeTabIndex = indexFromTabsComponent - this.leadingTabsLength;
		this.setSessionState(state);
		
		var tab = state.tabs[state.activeTabIndex];
		if (tab)
			InteractiveTour.targetComponentOnClick(tab.label);
	};

	private getPanelIndex(id:WeavePathArray):number
	{
		var panels = this.getSessionState().tabs;
		return _.findIndex(panels, (panel) => {
			return _.isEqual(panel.id, id);
		});
	}
	
	getPanelIds():WeavePathArray[]
	{
		return this.getSessionState().tabs.map(tab => tab.id);
	}

	addPanel(id:WeavePathArray):void
	{
		var state = this.getSessionState();
		state.tabs.push({
			id,
			label: this.generateNextTabLabel()
		});
		state.activeTabIndex = this.getPanelIndex(id);
		this.setSessionState(state);
	}
	
	private generateNextTabLabel():string
	{
		var prefix = TabLayout.DEFAULT_TAB_PREFIX;
		var next:number = 1;
		for (var tabLayout of Weave.getDescendants(Weave.getRoot(this), TabLayout))
		{
			for (var tabState of tabLayout.getSessionState().tabs)
			{
				if (tabState.label.indexOf(prefix) == 0)
				{
					var num = weavejs.util.StandardLib.asNumber(tabState.label.substr(prefix.length));
					if (num >= next)
						next = Math.floor(num) + 1;
				}
			}
		}
		return prefix + next;
	}

	removePanel(id:WeavePathArray):void
	{
		var state = this.getSessionState();
		var index = this.getPanelIndex(id);
		state.tabs = state.tabs.filter((panel) => {
			return !_.isEqual(id, panel.id);
		});

		// if the removed panel is before the active panel
		// we decrement the index
		if (index < state.activeTabIndex)
			state.activeTabIndex -= 1;

		// if the removed panel was the active panel
		// set the active panel to the one before it
		else if (index == state.activeTabIndex)
			state.activeTabIndex = Math.min(index, state.tabs.length - 1);
		this.setSessionState(state);
	}

	replacePanel(id:WeavePathArray, newId:WeavePathArray):void
	{
		var tabState:TabState = null;
		var state = this.getSessionState();
		state.tabs.forEach(item => {
			if (_.isEqual(id, item.id))
				tabState = item;
		});
		if (tabState)
			tabState.id = newId;
		else
			console.error("Could not find id in this layout", id);
		this.setSessionState(state);
	}

	render():JSX.Element
	{
		var weave = Weave.getWeave(this);
		var state = this.getSessionState();
		var plusIcon:JSX.Element = null;
		var tabBarChildren:JSX.Element = null;
		var leadingTabs = this.props.leadingTabs || [];
		if (this.props.onAdd)
		{
			if (Array.isArray(this.props.onAdd))
			{
				plusIcon = (
					<Dropdown
						className={classNames("weave-layout-tabs-label", "bottom")}
						style={{display: "flex"}}
						menuGetter={() => this.props.onAdd as MenuItemProps[]}
					>
						<i className={classNames("fa fa-plus", "weave-tab-icon")} title={Weave.lang("Add New...")}/>
					</Dropdown>
				);
			}
			else
			{
				plusIcon = (
					<HBox
						className={classNames("weave-layout-tabs-label", "bottom")}
						onClick={this.props.onAdd as React.MouseEventHandler}
					>
						<CenteredIcon
							className="weave-tab-icon"
							title={Weave.lang("Add New...")}
							iconProps={{ className: "fa fa-plus" }}
						/>

					</HBox>
				);
			}
		}

		tabBarChildren = (
			<HBox overflow style={{justifyContent: "space-between"}}>
				{plusIcon}
				{/*<HBox>
					<CenteredIcon iconProps={{className: "fa fa-play fa-flip-horizontal"}}/>
					<CenteredIcon iconProps={{className: "fa fa-play"}}/>
				</HBox>*/}
			</HBox>
		);

		return (
			<HBox
				ref={ReactUtils.registerComponentRef(this)}
				style={_.merge({}, this.props.style, {flex: 1})}
			>
				<Tabs
					{...this.props as any}
					location="bottom"
					tabContentClassName="weave-layout-tabs-content"
					tabBarClassName="weave-layout-tabs-bar"
					tabLabelClassName="weave-layout-tabs-label"
					tabBarStyle={{whiteSpace: "nowrap"}}
					labels={
						leadingTabs.map(tab => tab.label)
						.concat(state.tabs.map((tab) => (
							<HBox
								className="weave-padded-hbox"
								onDragOver={(event) => this.onDragOverTab(tab)}
								onDragLeave={this.onDragLeaveTab}
								style={{alignItems: "center"}}
								ref={InteractiveTour.getComponentRefCallback(tab.label)}
							>
								{/*<EditableTextCell onChange={(newName) => this.setTabLabel(tab.id, newName)} textContent={tab.label}/>*/}
								{tab.label}
								{
									this.props.onRemove
									?	<CenteredIcon
											onClick={(event) => {event.stopPropagation(); this.props.onRemove(tab.id)}}
											className="weave-tab-icon"
											title={Weave.lang("Close")}
											children="✕"
										/>
									:	null
								}
							</HBox>
						)))
					}
					onViewChange={this.switchPanelToActive}
					onTabClick={(index:number, event:React.MouseEvent) => {
						if (this.props.onTabClick)
						{
							let tabIndex = index - leadingTabs.length;
							if (state.tabs && state.tabs[tabIndex])
								this.props.onTabClick(state.tabs[tabIndex].id, event);
						}
					}}
					onTabDoubleClick={(index:number, event:React.MouseEvent) => {
						if (this.props.onTabDoubleClick)
						{
							let tabIndex = index - leadingTabs.length;
							if (state.tabs && state.tabs[tabIndex])
								this.props.onTabDoubleClick(state.tabs[tabIndex].id);
						}
					}}
					activeTabIndex={leadingTabs.length + this.activeTabIndex}
					tabs={
						leadingTabs.map(tab => tab.content)
						.concat(state.tabs.map(tab => (
							this.props.panelRenderer
							?	this.props.panelRenderer(tab.id, {}, this.props.panelRenderer)
							:	<WeaveComponentRenderer
									weave={weave}
									path={tab.id}
									style={{flex: 1}}
								/>
						)))
					}
					tabBarChildren={tabBarChildren}
				/>
			</HBox>
		);
	}
}

Weave.registerClass(
	TabLayout,
	'weavejs.layout.TabLayout',
	[weavejs.api.core.ILinkableVariable],
	'Tab Layout'
);
