import * as React from "react";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import DataSourceManager from "../ui/DataSourceManager";
import IDataSource = weavejs.api.data.IDataSource;

export interface DataMenuProps extends React.HTMLProps<DataMenu>
{
	weave:Weave,
	createObject:(type:new(..._:any[])=>any)=>void
}

export interface DataMenuState
{

}

export default class DataMenu extends React.Component<DataMenuProps,DataMenuState>
{
	private weave:Weave;
	private createObject:(type:new(..._:any[])=>any)=>void;
	private implementations:JSX.Element[];

	constructor(props:DataMenuProps)
	{
		super();
		this.weave = props.weave;
		this.createObject = props.createObject;

		var registry = weavejs.WeaveAPI.ClassRegistry;
		var impls = registry.getImplementations(IDataSource);

		// filter out those data sources without editors
		impls = impls.filter(impl => DataSourceManager.editorRegistry.has(impl));

		this.implementations = impls.map( (impl,index) => {
			return (
				<a key={index} className="item" onClick={this.createObject.bind(this, impl)}>{Weave.lang('+ {0}', registry.getDisplayName(impl))}</a>
			);
		});
	}

	render():JSX.Element {
		return (<div className="menu">
			<a className="item" onClick={DataSourceManager.openInstance.bind(null, this.weave)}>{Weave.lang('Manage or browse data')}</a>
			<div className="ui divider"></div>
			{this.implementations}
		</div>)
	}
}