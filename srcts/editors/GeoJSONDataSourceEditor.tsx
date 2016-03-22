import * as React from "react";
import * as lodash from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import FileSelector from "../ui/FileSelector";
import DataSourceEditor from "./DataSourceEditor";
import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";

import GeoJSONDataSource = weavejs.data.source.GeoJSONDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import LinkableFile = weavejs.core.LinkableFile;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import URLRequestUtils = weavejs.api.data.IWeaveTreeNode;
import WeaveAPI = weavejs.WeaveAPI;

export default class GeoJSONDataSourceEditor extends DataSourceEditor
{
	get editorFields():[string, JSX.Element][]
	{
		let dataSource = (this.props.dataSource as GeoJSONDataSource);
		let keyTypeSuggestions = weavejs.WeaveAPI.QKeyManager.getAllKeyTypes();
		let editorFields:[string, JSX.Element][] = [
			[
				Weave.lang("GeoJSON URL"),
				<FileSelector 
						  target={dataSource.url} 
						  placeholder={Weave.lang("http://www.example.com/example.geojson")} 
						  accept=".geojson"
						  />
			],
			[
				Weave.lang("Projection"),
				<StatefulTextField selectOnFocus={true} 
							   placeholder={Weave.lang("Example: EPSG:4326")} 
							   ref={linkReactStateRef(this, { content: dataSource.projection })}
							   />
			],
			[
				Weave.lang("Key Property"),
				<StatefulTextField selectOnFocus={true} 
							   ref={linkReactStateRef(this, { content: dataSource.keyProperty })}
							   />
			],
			[
				Weave.lang("Key Type"),
				<StatefulTextField selectOnFocus={true} 
							   suggestions={keyTypeSuggestions}
							   ref={linkReactStateRef(this, { content: dataSource.keyType })}/>
			]
		];
		return super.editorFields.concat(editorFields)
	}
}
