import * as React from "react";
import * as lodash from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import FileSelector from "../ui/FileSelector";
import KeyTypeInput from "../ui/KeyTypeInput";
import DataSourceEditor from "./DataSourceEditor";
import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";
import ComboBox from "../semantic-ui/ComboBox";
import HelpIcon from "../react-ui/HelpIcon";

import GeoJSONDataSource = weavejs.data.source.GeoJSONDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import LinkableFile = weavejs.core.LinkableFile;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import URLRequestUtils = weavejs.api.data.IWeaveTreeNode;
import WeaveAPI = weavejs.WeaveAPI;

export default class GeoJSONDataSourceEditor extends DataSourceEditor
{
	get editorFields():[React.ReactChild, React.ReactChild][]
	{
		let dataSource = (this.props.dataSource as GeoJSONDataSource);
		/* TODO: Update to use new typings. */
		let propertyIds = ((dataSource as any).getPropertyNames() as string[]).map((id:string)=>({label: id.toString(), value: id}));
		propertyIds.unshift({label:Weave.lang("Auto-generated keys"), value: null});

		let editorFields:[React.ReactChild, React.ReactChild][] = [
			[
				Weave.lang("GeoJSON URL"),
				<FileSelector style={{width: "100%"}}
							  targetUrl={dataSource.url} 
							  placeholder={Weave.lang("http://www.example.com/example.geojson")} 
							  accept=".geojson"/>
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
					{Weave.lang("Key Property")}
					<HelpIcon>{Weave.lang("A property that can uniquely identify each row in the data. If there are no such properties, choose \"Auto-generated keys\"")}</HelpIcon>
				</HBox>,
				<ComboBox style={{width: "100%"}}
				          ref={linkReactStateRef(this, { value: dataSource.keyProperty }) } /* searchable field */
				          options={propertyIds}
				/>
			],
			[
				<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
					{Weave.lang("Namespace")}
					<HelpIcon>{Weave.lang("Namespaces are used to link tables using matching key columns.")}</HelpIcon>
				</HBox>,
				<KeyTypeInput style={{width: "100%"}}
							  keyTypeProperty={dataSource.keyType}/>
			]
		];
		return super.editorFields.concat(editorFields)
	}
}
