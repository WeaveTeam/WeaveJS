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
import ComboBox from "../semantic-ui/ComboBox";
import KeyTypeInput from "../ui/KeyTypeInput";
import HelpIcon from "../react-ui/HelpIcon";

import DBFDataSource = weavejs.data.source.DBFDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import LinkableFile = weavejs.core.LinkableFile;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import URLRequestUtils = weavejs.api.data.IWeaveTreeNode;
import WeaveAPI = weavejs.WeaveAPI;

export default class DBFDataSourceEditor extends DataSourceEditor
{
	get editorFields():[React.ReactChild, React.ReactChild][]
	{
		let dataSource = this.props.dataSource as DBFDataSource;
		let editorFields:[React.ReactChild, React.ReactChild][] = [
			this.getLabelEditor(dataSource.label),
			[
				Weave.lang("DBF URL"),
				<FileSelector style={{width: "100%"}}
							  targetUrl={dataSource.dbfUrl}
						  	  placeholder={Weave.lang("http://www.example.com/example.dbf")} 
						  	  accept=".dbf"/>
			],
			[
				Weave.lang("SHP URL"),
				<FileSelector style={{width: "100%"}}
							  targetUrl={dataSource.shpUrl} 
						  	  placeholder={Weave.lang("http://www.example.com/example.shp")} 
						  	  accept=".shp"/>
			],
			[
				Weave.lang("Projection"),
				<StatefulTextField style={{width: "100%"}}
								   selectOnFocus={true} 
							   	   placeholder={Weave.lang("Example: EPSG:4326")} 
							       ref={linkReactStateRef(this, { value: dataSource.projection })}/>
			],
			[
				<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
					{Weave.lang("Key column")}
					<HelpIcon>{Weave.lang("A Column that can uniquely identify each row in the data. If there are no such columns, choose \"Auto-generated keys\"")}</HelpIcon>
				</HBox>,
				<ComboBox style={{width: "100%"}}
				          ref={linkReactStateRef(this, { value: dataSource.keyColName })} /* searchable field */
				          placeholder={Weave.lang("Auto-generated keys") }
				          options={dataSource.getColumnNames()}/>
			],
			[
				<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
					{Weave.lang("Key namespace")}
					<HelpIcon>{Weave.lang("Key namespaces are used to link tables using matching key columns.")}</HelpIcon>
				</HBox>,
				<KeyTypeInput style={{width: "100%"}}
							  keyTypeProperty={dataSource.keyType}/>
			]
		];
		return super.editorFields.concat(editorFields)
	}
}
