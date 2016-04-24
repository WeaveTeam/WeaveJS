import * as React from "react";
import * as lodash from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import SelectableAttributeComponent from "../ui/SelectableAttributeComponent";
import SelectableAttributesList from "../ui/SelectableAttributesList";
import DataSourceEditor from "./DataSourceEditor";
import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";
import HelpIcon from "../react-ui/HelpIcon";

import ForeignDataMappingTransform = weavejs.data.source.ForeignDataMappingTransform;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import URLRequestUtils = weavejs.api.data.IWeaveTreeNode;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;

export default class ForeignDataMappingTransformEditor extends DataSourceEditor
{
	get editorFields():[React.ReactChild, React.ReactChild][]
	{
		let ds = (this.props.dataSource as ForeignDataMappingTransform);

		let keyMap = new Map<string, (IColumnWrapper|LinkableHashMap)>();
		keyMap.set("Foreign key mapping", ds.keyColumn as IColumnWrapper);
		keyMap.set("Data to transform", ds.keyColumn as IColumnWrapper)

		let editorFields:[React.ReactChild, React.ReactChild][] = [
			[
				<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
					{Weave.lang("Foreign key mapping")}
					<HelpIcon>
						{Weave.lang("Each value in this column will be used as the key to look up records in the data columns")}
					</HelpIcon>
				</HBox>, 
				<SelectableAttributeComponent attributeName="Foreign key mapping" attributes={ keyMap }/>
			],
			[
				Weave.lang("Data to transform"),
				<SelectableAttributesList label="" showAsList={false} columns={ds.dataColumns as LinkableHashMap}/>
			]
		];
		return super.editorFields.concat(editorFields)
	}
}
