import * as React from "react";
import * as _ from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import Checkbox from "../semantic-ui/Checkbox";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import DataSourceEditor from "./DataSourceEditor";
import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";
import CKANDataSource = weavejs.data.source.CKANDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import URLRequestUtils = weavejs.api.data.IWeaveTreeNode;
import ColumnUtils = weavejs.data.ColumnUtils;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;

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
				<StatefulTextField selectOnFocus={true} style={{width: "100%"}} ref={linkReactStateRef(this, { value: ds.url})}/>
			],
			[
				Weave.lang("Items to show in hierarchy"),
				<HBox className="weave-padded-hbox">
					<Checkbox ref={linkReactStateRef(this, {value: ds.showPackages})} label={Weave.lang("Packages")}/>
					<Checkbox ref={linkReactStateRef(this, {value: ds.showGroups})} label={Weave.lang("Groups")}/>
					<Checkbox ref={linkReactStateRef(this, {value: ds.showTags})} label={Weave.lang("Tags")}/>
				</HBox>
			],
			[
				Weave.lang("API Version"),
				<StatefulTextField style={{flex: 1}} ref={linkReactStateRef(this, {value: ds.apiVersion})} type="number" min="1" max="3" step="1"/>
			],
			[
				null,
				<Checkbox ref={linkReactStateRef(this, { value: ds.useHttpPost})} label={Weave.lang("Use HTTP POST")}/>
			],
			[
				null,
				<Checkbox ref={linkReactStateRef(this, { value: ds.useDataStore})} label={Weave.lang("Use Data Store if available")}/>
			]
		];
		return super.editorFields.concat(editorFields);
	}
}
