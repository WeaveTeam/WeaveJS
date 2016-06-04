import * as React from "react";
import * as lodash from "lodash";
import {HBox, VBox} from "../react-ui/FlexBox";
import Button from "../semantic-ui/Button";
import DataSourceEditor from "./DataSourceEditor";
import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";

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
