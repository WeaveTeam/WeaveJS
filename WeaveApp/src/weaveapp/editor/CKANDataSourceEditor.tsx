import * as React from "react";
import * as weavejs from "weavejs";
import {Weave} from "weavejs";

import StatefulTextField = weavejs.ui.StatefulTextField;
import Checkbox = weavejs.ui.Checkbox;
import WeaveReactUtils = weavejs.util.WeaveReactUtils
import HBox = weavejs.ui.flexbox.HBox;
import VBox = weavejs.ui.flexbox.VBox;
import CKANDataSource = weavejs.data.source.CKANDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import ColumnUtils = weavejs.data.ColumnUtils;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;
import DataSourceEditor from "weaveapp/editor/DataSourceEditor";
import {IDataSourceEditorProps} from "weaveapp/editor/DataSourceEditor";

export default class CKANDataSourceEditor extends DataSourceEditor
{
	private _dataSourceNode:ColumnTreeNode
	constructor(props:IDataSourceEditorProps)
	{
		super(props);
	}

	get editorFields():[React.ReactChild, React.ReactChild][]
	{
		let ds = (this.props.dataSource as CKANDataSource);

		let editorFields:[React.ReactChild, React.ReactChild][] = [
			this.getLabelEditor(ds.label),
			[
				Weave.lang("Source URL *"),
				<StatefulTextField selectOnFocus={true} style={{width: "100%"}} ref={WeaveReactUtils.linkReactStateRef(this, { value: ds.url})}/>
			],
			[
				Weave.lang("Items to show in hierarchy"),
				<HBox className="weave-padded-hbox">
					<Checkbox ref={WeaveReactUtils.linkReactStateRef(this, {value: ds.showPackages})} label={Weave.lang("Packages")}/>
					<Checkbox ref={WeaveReactUtils.linkReactStateRef(this, {value: ds.showGroups})} label={Weave.lang("Groups")}/>
					<Checkbox ref={WeaveReactUtils.linkReactStateRef(this, {value: ds.showTags})} label={Weave.lang("Tags")}/>
				</HBox>
			],
			[
				Weave.lang("API Version"),
				<StatefulTextField style={{flex: 1}} ref={WeaveReactUtils.linkReactStateRef(this, {value: ds.apiVersion})} type="number" min="1" max="3" step="1"/>
			],
			[
				null,
				<Checkbox ref={WeaveReactUtils.linkReactStateRef(this, { value: ds.useHttpPost})} label={Weave.lang("Use HTTP POST")}/>
			],
			[
				null,
				<Checkbox ref={WeaveReactUtils.linkReactStateRef(this, { value: ds.useDataStore})} label={Weave.lang("Use Data Store if available")}/>
			]
		];
		return super.editorFields.concat(editorFields);
	}
}
