import * as React from "react";
import * as _ from "lodash";
import WeaveComponentRenderer from "../WeaveComponentRenderer";
import {AbstractLayout, LayoutProps, WeavePathArray} from "./AbstractLayout";
import Tabs from "../react-ui/Tabs";
import {VBox} from "../react-ui/FlexBox";
import ReactUtils from "../utils/ReactUtils";
import MiscUtils, {Structure} from "../utils/MiscUtils";

import LinkableVariable = weavejs.core.LinkableVariable;

export interface PanelState
{
	id: WeavePathArray,
	label: string
}
export interface LayoutState
{
	panels: PanelState[];
	activePanelId: WeavePathArray;
	title: string;
}

const stateStructure:Structure = {
	panels: [
		{
			id: MiscUtils.nullableStructure(["string"]),
			label: "string"
		}
	],
	activePanelId: MiscUtils.nullableStructure(["string"]),
	title: "string"
};

export default class TabLayout extends AbstractLayout implements weavejs.api.core.ILinkableVariable
{
	private linkableState = Weave.linkableChild(this, new LinkableVariable(null, null, MiscUtils.normalizeStructure({}, stateStructure)), this.forceUpdate, true);

	constructor(props:LayoutProps)
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

	switchPanelToActive=(index:number):void=>
	{
		var state = this.getSessionState();
		state.activePanelId = state.panels[index].id;
		this.setSessionState(state);
	}

	private getPanelIndex(id:WeavePathArray):number
	{
		var panels = this.getSessionState().panels;
		return _.findIndex(panels, (panel) => {
			return _.isEqual(panel.id, id);
		});
	}

	addPanel(id:WeavePathArray):void
	{
		var state = this.getSessionState();
		state.panels.push({
			id,
			label: Weave.lang("New tab")
		});
		state.activePanelId = id;
		this.setSessionState(state);
	}

	removePanel(id:WeavePathArray):void
	{
		var state = this.getSessionState();
		var index = this.getPanelIndex(id);
		state.panels = state.panels.filter((panel) => {
			return !_.isEqual(id, panel.id);
		});
		// if the removed panel was the active panel
		// set the active panel to the one before it
		if(_.isEqual(id, state.activePanelId))
			state.activePanelId = state.panels[Math.min(index, state.panels.length - 1)].id;
		this.setSessionState(state);
	}

	render():JSX.Element
	{
		var weave = Weave.getWeave(this);
		var state = this.getSessionState();
		var activeTabIndex = this.getPanelIndex(state.activePanelId);

		return (
			<VBox
				ref={ReactUtils.registerComponentRef(this)}
				{...this.props}
				style={_.merge({}, this.props.style, {flex: 1})}
			>
				<Tabs
					location="bottom"
					labels={state.panels.map(panel => panel.label)}
					onViewChange={this.switchPanelToActive}
					activeTabIndex={activeTabIndex}
					tabs={state.panels.map(panel => (
						this.props.panelRenderer
						?	this.props.panelRenderer(panel.id, {}, this.props.panelRenderer)
						:	<WeaveComponentRenderer
								weave={weave}
								path={panel.id}
								style={{flex: 1}}
							/>
					))}
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