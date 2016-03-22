import * as React from "react";
import * as lodash from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import SelectableAttributeComponent from "../ui/SelectableAttribute";
import DataSourceEditor from "./DataSourceEditor";
import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";

import ForeignDataMappingTransform = weavejs.data.source.ForeignDataMappingTransform;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import URLRequestUtils = weavejs.api.data.IWeaveTreeNode;

export default class ForeignDataMappingTransformEditor extends DataSourceEditor
{
	get editorFields():[string, JSX.Element][]
	{
		let ds = (this.props.dataSource as ForeignDataMappingTransform);
		let keyTypeSuggestions = weavejs.WeaveAPI.QKeyManager.getAllKeyTypes();
		let editorFields:[string, JSX.Element][] = [
			[
				Weave.lang("Foreign Key Mapping"), 
				<SelectableAttributeComponent label="" attribute={ds.keyColumn}/>
			]
		];
		return super.editorFields.concat(editorFields)
	}
}
