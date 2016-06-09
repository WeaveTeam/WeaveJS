import * as React from "react";
import * as _ from "lodash";

import WeaveComponentRenderer from "../WeaveComponentRenderer";
import {AbstractLayout, LayoutProps} from "./AbstractLayout";
import Tabs from "../react-ui/Tabs";
import {VBox, HBox} from "../react-ui/FlexBox";
import ReactUtils from "../utils/ReactUtils";
import MiscUtils, {Structure} from "../utils/MiscUtils";
import CenteredIcon from "../react-ui/CenteredIcon";
import classNames from "../modules/classnames";

import LinkableVariable = weavejs.core.LinkableVariable;
import {MenuItemProps} from "../react-ui/Menu";
import MenuButton from "../react-ui/MenuButton";
import Dropdown from "../semantic-ui/Dropdown";
import EditableTextCell from "../react-ui/EditableTextCell";
import {WeavePathArray} from "../utils/WeaveReactUtils";

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
	onClick: any; //(panelId:WeavePathArray, event?:React.MouseEvent) => void;
	onTabDoubleClick: (panelId:WeavePathArray) => void;
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
	private linkableState = Weave.linkableChild(this, new LinkableVariable(null, null, MiscUtils.normalizeStructure({}, stateStructure)), this.forceUpdate, true);
	private resetTimer:boolean;

	constructor(props:TabLayoutProps)
	{
		super(props);
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

	renamePanel(id:WeavePathArray, newLabel:string)
	{
		var state = this.getSessionState();
		var panelToRename:TabState = null;
		state.tabs.forEach((panel) => {
			if (_.isEqual(id, panel.id))
				panelToRename = panel;
		});
		panelToRename.label = newLabel;
		this.setSessionState(state);
	}

	switchPanelToActive=(indexFromTabsComponent:number):void=>
	{
		var state = this.getSessionState();
		state.activeTabIndex = indexFromTabsComponent - this.leadingTabsLength;
		this.setSessionState(state);
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

	addPanel(id:WeavePathArray, label?:string):void
	{
		var state = this.getSessionState();
		state.tabs.push({
			id,
			label: label || id[id.length - 1] || "New Tab"
		});
		state.activeTabIndex = this.getPanelIndex(id);
		this.setSessionState(state);
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
		if(tabState)
			tabState.id = newId;
		else
			console.error("Could not find id in this layout", id);
		this.setSessionState(state);
	}

	render():JSX.Element
	{
		var weave = Weave.getWeave(this);
		var state = this.getSessionState();
		var tabBarChildren:JSX.Element = null;
		var leadingTabs = this.props.leadingTabs || [];
		if (this.props.onAdd)
		{
			if (Array.isArray(this.props.onAdd))
			{
				tabBarChildren = (
					<Dropdown style={{display: "flex"}} menu={this.props.onAdd as MenuItemProps[]} direction="upward" action="hide" keepOnScreen={false}>
						<HBox className={classNames("weave-layout-tabs-label", "bottom")} style={{flex: 1}}>
							<CenteredIcon className="weave-tab-icon" title={Weave.lang("Add New...")} iconProps={{ className: "fa fa-plus" }}/>
						</HBox>
					</Dropdown>
				);
			}
			else
			{
				tabBarChildren = (
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

		return (
			<VBox
				ref={ReactUtils.registerComponentRef(this)}
				style={_.merge({}, this.props.style, {flex: 1})}
			>
				<Tabs
					{...this.props as any}
					location="bottom"
					tabContentClassName="weave-layout-tabs-content"
					tabBarClassName="weave-layout-tabs-bar"
					tabLabelClassName="weave-layout-tabs-label"
					className=" "
					labels={
						leadingTabs.map(tab => tab.label)
						.concat(state.tabs.map((panel) => (
							<HBox
								className="weave-padded-hbox"
								onDragOver={(event) => this.onDragOverTab(panel)}
								onDragLeave={this.onDragLeaveTab}
								onClick={(event) => this.props.onClick(panel.id, event)}
								onDoubleClick={() => this.props.onTabDoubleClick && this.props.onTabDoubleClick(panel.id)}
							>
								{/*<EditableTextCell onChange={(newName) => this.renamePanel(panel.id, newName)} textContent={panel.label}/>*/}
								{panel.label}
								{
									this.props.onRemove
									?	<CenteredIcon
											onClick={(event) => {event.stopPropagation(); this.props.onRemove(panel.id)}}
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
					onTabDoubleClick={(index:number) => {
						if(this.props.onTabDoubleClick)
						{
							let tabIndex = index - leadingTabs.length;
							if(state.tabs && state.tabs[tabIndex])
								this.props.onTabDoubleClick && this.props.onTabDoubleClick(state.tabs[tabIndex].id)
						}
					}}
					activeTabIndex={leadingTabs.length + this.activeTabIndex}
					tabs={
						leadingTabs.map(tab => tab.content)
						.concat(state.tabs.map(panel => (
							this.props.panelRenderer
							?	this.props.panelRenderer(panel.id, {}, this.props.panelRenderer)
							:	<WeaveComponentRenderer
									weave={weave}
									path={panel.id}
									style={{flex: 1}}
								/>
						)))
					}
					tabBarChildren={tabBarChildren}
				/>
			</VBox>
		);
	}
}

Weave.registerClass(
	TabLayout,
	'weavejs.layout.TabLayout',
	[weavejs.api.core.ILinkableVariable],
	'Tab Layout'
);
