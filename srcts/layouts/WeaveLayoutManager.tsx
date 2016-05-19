import * as React from "react";
import * as ReactDOM from "react-dom";

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
import IDataSource = weavejs.api.data.IDataSource;


export interface WeaveLayoutManagerProps extends React.HTMLProps<VBox> {
	panelRenderer: (id:WeavePathArray, panelProps?:LayoutPanelProps) => JSX.Element;
	weave:Weave;
	dataMenu:DataMenu;
}

export interface WeaveLayoutManagerState {
	activeLayout:AbstractLayout
}

export default class WeaveLayoutManager extends React.Component<WeaveLayoutManagerProps, WeaveLayoutManagerState> {
	layouts:AbstractLayout[] = [];
	tabs:Tabs;
	resetTimer:boolean;
	layoutTabLabelsComponent:{[tabName:string]: HTMLSpanElement} = {};
	dataSourceManager:DataSourceManager;
	constructor(props:WeaveLayoutManagerProps) {
		super(props);
		this.props.weave.root.childListCallbacks.addGroupedCallback(this, this.forceUpdate);
	}

	onDragOverLayoutTab=(index:number, event:React.DragEvent)=> {
		// wait 1 second before switching tab
		this.resetTimer = false;
		setTimeout(() => {
			if (!this.resetTimer) {
				this.tabs.setState({
					activeTabIndex: index + 1
				});
			}
		}, 500)
	}

	onDrop=(event:React.DragEvent)=>
	{
		console.log("drop layout", event.dataTransfer.getData("text/plain"));
	}

	onDragLeaveLayout=()=>
	{
		this.resetTimer = true;
	}

	public openDataSourceManager=(selectedDataSource?:IDataSource)=>
	{
		/* will set the active tab to the data source manager */
		this.tabs.setState({
			activeTabIndex: 0
		});
		if(selectedDataSource)
		{
			this.dataSourceManager.setState({
				selected: selectedDataSource
			})
		}
	}

	get activeLayout():AbstractLayout
	{
		return this.layouts[this.tabs.state.activeTabIndex - 1]; // substract 1 because DataSourceManager is always the first tab
	}

	addLayout=(layoutType?:typeof AbstractLayout)=>
	{
		// default layout added is window layout
		this.props.weave.root.requestObject(this.props.weave.root.generateUniqueName("Layout"), layoutType as any /*TODO*/ || WindowLayout);
		// focus the last tab on add.
		this.tabs.setState({
			activeTabIndex: this.layouts.length + 1 // add 1 because DataSourceManager is always the first tab
		});
	}

	removeLayout=(layoutIndexOrInstance:number|AbstractLayout, event:React.MouseEvent)=>
	{
		var weaveRoot = this.props.weave.root;
		if(typeof layoutIndexOrInstance == "number")
		{
			weaveRoot.removeObject(weaveRoot.getName(this.layouts[layoutIndexOrInstance as number - 1]));
			this.tabs.setState({
				activeTabIndex: this.layouts.length - 2
			});
		}
		else {
			let index = this.layouts.indexOf(layoutIndexOrInstance as AbstractLayout);
			weaveRoot.removeObject(weaveRoot.getName(layoutIndexOrInstance as AbstractLayout))
			this.tabs.setState({
				activeTabIndex: index - 2,
			})
		}
	}

	render()
	{
		var weaveRoot = this.props.weave.root;
		/* this array will always be the right order if retrieved here */
		this.layouts = weaveRoot.getObjects(AbstractLayout as any, true) as AbstractLayout[];

		var tabLabels = [<span>{Weave.lang("Data Sources")}</span>].concat(this.layouts.map((layout, index) => {
			return (
				<span
					ref={(c:HTMLSpanElement) => this.layoutTabLabelsComponent[weaveRoot.getName(layout)] = c}
					onDrop={this.onDrop}
					onDragOver={(event) => this.onDragOverLayoutTab(index, event)}
				    onDragLeave={this.onDragLeaveLayout}
				>
					{
						Weave.lang(this.props.weave.root.getName(layout))
					}
				</span>
			);
		}));

		return (
			<VBox {...this.props}>
				<Tabs
					ref={(c:Tabs) => this.tabs = c}
					location="bottom"
					labels={tabLabels}
					onTabAdd={(event) => this.addLayout()}
					onTabClose={this.removeLayout}
					tabs={[
							<DataSourceManager
								ref={(c:DataSourceManager) => this.dataSourceManager = c}
								dataMenu={this.props.dataMenu}
							/>
						].concat(this.layouts.map(layout => (
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
