import * as React from "react";
import * as _ from "lodash";

import WeaveComponentRenderer from "../WeaveComponentRenderer";
import {AbstractLayout, LayoutProps, WeavePathArray} from "./AbstractLayout";
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

export interface PanelState
{
	id: WeavePathArray,
	label: string
}

export interface TabLayoutProps extends LayoutProps
{
	leadingTabs: {
		label: React.ReactChild,
		content: JSX.Element
	}[];
	onAdd: MenuItemProps|React.MouseEventHandler;
	onRemove: (panelId:WeavePathArray) => void;
}

export interface LayoutState
{
	panels: PanelState[];
	activeTabIndex:number;
	title: string;
}

const stateStructure:Structure = {
	panels: [
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

	constructor(props:TabLayoutProps)
	{
		super(props);
	}

	setSessionState(state:LayoutState):void
	{
		this.linkableState.state = MiscUtils.normalizeStructure(state, stateStructure);
	}

	maximizePanel() {
		// do nothing because each panel is always maximized
	}

	getSessionState():LayoutState
	{
		return this.linkableState.state as LayoutState;
	}

	get title()
	{
		return this.getSessionState().title;
	}

	get leadingTabsLength()
	{
		return this.props.leadingTabs ? this.props.leadingTabs.length : 0;
	}

	get activePanel() {
		var state = this.getSessionState();
		var activePanelState = state.panels[state.activeTabIndex];
		if(activePanelState)
			return activePanelState.id;
	}

	switchPanelToActive=(index:number):void=>
	{
		var state = this.getSessionState();
		state.activeTabIndex = index - this.leadingTabsLength;
		this.setSessionState(state);
	};

	private getPanelIndex(id:WeavePathArray):number
	{
		var panels = this.getSessionState().panels;
		return _.findIndex(panels, (panel) => {
			return _.isEqual(panel.id, id);
		});
	}

	addPanel(id:WeavePathArray, label?:string):void
	{
		var state = this.getSessionState();
		state.panels.push({
			id,
			label: label || id[id.length - 1] || "New Tab"
		});
		state.activeTabIndex = this.getPanelIndex(id);
		this.setSessionState(state);
	}

	removePanel(id:WeavePathArray):void
	{
		console.log(id);
		var state = this.getSessionState();
		var index = this.getPanelIndex(id);
		state.panels = state.panels.filter((panel) => {
			return !_.isEqual(id, panel.id);
		});
		// if the removed panel was the active panel
		// set the active panel to the one before it
		if(_.isEqual(index, state.activeTabIndex))
			state.activeTabIndex = Math.min(index, state.panels.length - 1);
		this.setSessionState(state);
	}

	render():JSX.Element
	{
		var weave = Weave.getWeave(this);
		var state = this.getSessionState();
		var activeTabIndex = state.activeTabIndex + this.leadingTabsLength;
		var tabBarChildren:JSX.Element = null;

		if(this.props.onAdd)
		{
			if(Array.isArray(this.props.onAdd))
			{
				tabBarChildren = (
					<Dropdown style={{display: "flex"}} menu={this.props.onAdd as MenuItemProps[]}>
						<HBox className={classNames("weave-tab-label", "bottom")} style={{flex: 1}}>
							<CenteredIcon className="weave-tab-icon" title={Weave.lang("Add New...")} iconProps={{ className: "fa fa-plus" }}/>
						</HBox>
					</Dropdown>
				);
			}
			else
			{
				tabBarChildren = (
					<HBox
						className={classNames("weave-tab-label", "bottom")}
						onClick={this.props.onAdd as React.MouseEventHandler}
					>
						<CenteredIcon className="weave-tab-icon" title={Weave.lang("Add New...")}
						              iconProps={{ className: "fa fa-plus" }}/>
					</HBox>
				);
			}
		}

		return (
			<VBox
				ref={ReactUtils.registerComponentRef(this)}
				{...this.props}
				style={_.merge({}, this.props.style, {flex: 1})}
			>
				<Tabs
					location="bottom"
					labels={
						this.props.leadingTabs.map(tab => tab.label)
						.concat(state.panels.map(panel => (
							<HBox className="weave-padded-hbox">
								{panel.label}
							    <CenteredIcon
							        onClick={() => this.props.onRemove(panel.id)}
							        className="weave-tab-icon"
							        title={Weave.lang("Close")}
							        iconProps={{ className:"fa fa-times-circle" }}
							    />
							</HBox>
						)))
					}
					onViewChange={this.switchPanelToActive}
					activeTabIndex={activeTabIndex}
					tabs={
						this.props.leadingTabs.map(tab => tab.content)
						.concat(state.panels.map(panel => (
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
	[weavejs.api.core.ILinkableVariable]
);
