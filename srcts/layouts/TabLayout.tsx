import * as React from "react";
import * as _ from "lodash";
import WeaveComponentRenderer from "../WeaveComponentRenderer";
import {AbstractLayout, ILayoutProps, WeavePathArray} from "./AbstractLayout";

import LinkableVariable = weavejs.core.LinkableVariable;
import Tabs from "../react-ui/Tabs";
import {VBox} from "../react-ui/FlexBox";

export interface LayoutState
{
	ids: WeavePathArray[];
	activeTab?: WeavePathArray;
}

export default class TabLayout extends AbstractLayout implements weavejs.api.core.ILinkableVariable
{
	private linkableState = Weave.linkableChild(this, LinkableVariable, this.forceUpdate, true);

	constructor(props:ILayoutProps)
	{
		super(props);
	}

	setSessionState(state:LayoutState):void
	{
		this.linkableState.state = {
			ids: state && state.ids || [],
			activeTab: state && state.activeTab || ""
		};
	}

	maximizePanel() {
		// do nothing because each panel is always maximized
	}

	getSessionState():LayoutState
	{
		return (this.linkableState.state || {
			ids: [],
			activeTab: ""
		}) as LayoutState;
	}

	switchPanelToActive=(index:number):void=>
	{
		var state = this.getSessionState();
		state.activeTab = this.getSessionState().ids[index];
		this.setSessionState(state);
	}

	addPanel(id:WeavePathArray):void
	{
		var state = this.getSessionState();
		state.ids.push(id);
		state.activeTab = id;
		this.setSessionState(state);
	}

	removePanel(id:WeavePathArray):void
	{
		var index = -1;
		var state = this.getSessionState();
		state.ids = state.ids.filter((stateId, i) => {
			if(_.isEqual(state.activeTab, stateId))
				index = i;
			return !_.isEqual(id, stateId);
		});
		// if the removed panel was the active panel
		// set the active panel to the one before it
		if(index >= 0)
			state.activeTab = state.ids[index - 1];
		this.setSessionState(state);
	}

	render()
	{
		var weave = Weave.getWeave(this);
		var state = this.getSessionState();
		var activeTabIndex = _.findIndex(state.ids, (id) => {
			return _.isEqual(id, state.activeTab);
		});
		return (
			<VBox {...this.props} style={_.merge({}, this.props.style, {flex: 1})}>
				<Tabs
					location="bottom"
					labels={state.ids.map(id => Array.isArray(id) && id[id.length - 1])}
					onViewChange={this.switchPanelToActive}
					activeTabIndex={activeTabIndex}
					tabs={state.ids.map(id => (
						this.props.panelRenderer
						?	this.props.panelRenderer(id, {})
						:	<WeaveComponentRenderer
								weave={weave}
								path={id}
								style={{flex: 1}}
							/>
		            ))}
				/>
			</VBox>
		)
	}
}

Weave.registerClass(
	TabLayout,
	'weavejs.layout.TabLayout',
	[weavejs.api.core.ILinkableVariable]
);
