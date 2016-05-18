import * as React from "react";
import Tabs from "../react-ui/tabs";
import DataSourceManager from "../ui/DataSourceManager";
import DataMenu from "../menus/DataMenu";
import {WeavePathArray} from "./AbstractLayout";
import {AbstractLayout, LayoutPanelProps} from "./AbstractLayout";
import {ILayoutProps} from "./AbstractLayout";
import WindowLayout from "./WindowLayout";
import FlexibleLayout from "./FlexibleLayout";
import ILinkableObject = weavejs.api.core.ILinkableObject;
import WeaveComponentRenderer from "../WeaveComponentRenderer";
import {VBox} from "../react-ui/FlexBox";

export interface WeaveLayoutManagerProps extends React.HTMLProps<VBox> {
	panelRenderer: (id:WeavePathArray, panelProps?:LayoutPanelProps) => JSX.Element;
	weave:Weave;
	dataMenu:DataMenu;
}

export interface WeaveLayoutManagerState {
	activeLayout:AbstractLayout
}

export default class WeaveLayoutManager extends React.Component<WeaveLayoutManagerProps, WeaveLayoutManagerState>
{
	layouts:AbstractLayout[] = [];
	tabs:Tabs;

	constructor(props:WeaveLayoutManagerProps)
	{
		super(props);
		this.props.weave.root.childListCallbacks.addGroupedCallback(this, this.forceUpdate);
	}

	get activeLayout():AbstractLayout
	{
		return this.layouts[this.tabs.state.activeTabIndex - 1]; // substract 1 because DataSourceManager is always the first tab
	}

	addLayout=(event:React.MouseEvent)=>
	{
		this.props.weave.root.requestObject(this.props.weave.root.generateUniqueName("Layout"), WindowLayout);
		// focus the last tab on add.
		this.tabs.setState({
			activeTabIndex: this.layouts.length + 1 // add 1 because DataSourceManager is always the first tab
		});
	}

	removeLayout=(index:number, event:React.MouseEvent)=>
	{
		this.props.weave.root.removeObject(this.props.weave.root.getName(this.layouts[index - 1]));
	}

	render()
	{
		this.layouts = this.props.weave.root.getObjects(AbstractLayout as any, true) as AbstractLayout[];
		return (
			<VBox {...this.props}>
				<Tabs
					ref={(c:Tabs) => this.tabs = c}
					location="bottom"
					labels={["Data Sources"].concat(this.layouts.map((layout, index) => this.props.weave.root.getName(layout)))}
					onTabAdd={this.addLayout}
					onTabClose={this.removeLayout}
					tabs={[<DataSourceManager dataMenu={this.props.dataMenu}/>].concat(this.layouts.map(layout => (
				        <WeaveComponentRenderer
				            weave={this.props.weave}
							path={Weave.getPath(layout).getPath()}
							props={{panelRenderer: this.props.panelRenderer}}
							defaultType={WindowLayout}
				        />
		            )))}
				/>
			</VBox>
		)
	}
}