import * as React from "react";
import * as lodash from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import HelpIcon from "../react-ui/HelpIcon";
import SelectableAttributeComponent from "../ui/SelectableAttributeComponent";
import DataSourceEditor from "./DataSourceEditor";
import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";
import KeyTypeInput from "../ui/KeyTypeInput";

import GroupedDataTransform = weavejs.data.source.GroupedDataTransform;
import SpatialJoinTransform = weavejs.data.source.SpatialJoinTransform;
import URLRequestUtils = weavejs.api.data.IWeaveTreeNode;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;

export default class SpatialJoinTransformEditor extends DataSourceEditor {
	get editorFields(): [React.ReactChild, React.ReactChild][] {
		let ds = (this.props.dataSource as SpatialJoinTransform);

		let attributes = new Map<string, (IColumnWrapper | LinkableHashMap)>();
		attributes.set("Geometry", ds.geometryColumn as IColumnWrapper);
		attributes.set("X", ds.xColumn);
		attributes.set("Y", ds.yColumn);

		let editorFields: [React.ReactChild, React.ReactChild][] = [
			this.getLabelEditor(ds.label),
			[
				<HBox className="weave-padded-hbox" style={{ alignItems: "center", justifyContent: "flex-end" }}>
					{Weave.lang("Group by") }
					<HelpIcon>
						{Weave.lang('The keyType of the "Group by" column should match the keyType of each column to be transformed. The values in this column will be treated as foreign keys which map to aggregated values in the transformed columns.') }
					</HelpIcon>
				</HBox>,
				<SelectableAttributeComponent attributeName="Geometry" attributes={attributes}/>
			],
			[
				Weave.lang("Data X"),
				<SelectableAttributeComponent attributeName="X" attributes={attributes}/>
			],
			[
				Weave.lang("Data Y"),
				<SelectableAttributeComponent attributeName="Y" attributes={attributes}/>
			]
		];
		return super.editorFields.concat(editorFields)
	}
}
