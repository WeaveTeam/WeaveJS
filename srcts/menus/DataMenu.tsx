import * as React from "react";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import DataSourceManager from "../ui/DataSourceManager";
import IDataSource = weavejs.api.data.IDataSource;

export default class DataMenu implements MenuBarItemProps
{
	constructor(weave:Weave, createObject:(type:new(..._:any[])=>any)=>void)
	{
		this.weave = weave;
		this.createObject = createObject;

		var registry = weavejs.WeaveAPI.ClassRegistry;
		var impls = registry.getImplementations(IDataSource);
		
		// filter out those data sources without editors
		impls = impls.filter(impl => DataSourceManager.editorRegistry.has(impl));
		
		this.menu = [
			{
				label: Weave.lang('Manage or browse data'),
				click: DataSourceManager.openInstance.bind(null, weave)
			},
			{}
		].concat(impls.map(impl => {
			return {
				label: Weave.lang('+ {0}', registry.getDisplayName(impl)),
				click: this.createObject.bind(this, impl)
			};
		}));
	}

	label:string = "Data";
	weave:Weave;
	menu:MenuItemProps[];
	createObject:(type:new(..._:any[])=>any)=>void;
}
