	import * as React from "react";
	import Button from "../ui/Button";
	import DataSourceEditor from "./DataSourceEditor";

	import CachedDataSource = weavejs.data.source.CachedDataSource;

	export default class CachedDataSourceEditor extends DataSourceEditor
	{	
		get editorFields():[React.ReactChild, React.ReactChild][]
		{
			let ds = (this.props.dataSource as CachedDataSource);
			return [
				[
					Weave.lang("This data source is using cached data."),
					<Button onClick={() => ds.hierarchyRefresh.triggerCallbacks()}>
						{Weave.lang("Restore this data source")}
					</Button>
				]
			];
		}
	}

	Weave.registerClass(CachedDataSourceEditor, "weavejs.editors.CachedDataSourceEditor", []);
