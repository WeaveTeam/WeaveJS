import * as React from "react";
import * as weavejs from "weavejs";
import {Weave} from "weavejs";

import StatefulTextField = weavejs.ui.StatefulTextField;
import WeaveReactUtils = weavejs.util.WeaveReactUtils
import ReactUtils = weavejs.util.ReactUtils;
import HBox = weavejs.ui.flexbox.HBox;
import VBox = weavejs.ui.flexbox.VBox;
import HelpIcon = weavejs.ui.HelpIcon;

import ForeignDataMappingTransform = weavejs.data.source.ForeignDataMappingTransform;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import DataSourceEditor from "weave/editor/DataSourceEditor";
import SelectableAttributeComponent from "weave/ui/SelectableAttributeComponent";

export default class ForeignDataMappingTransformEditor extends DataSourceEditor
{
	get editorFields():[React.ReactChild, React.ReactChild][]
	{
		let ds = (this.props.dataSource as ForeignDataMappingTransform);

		let attributes = new Map<string, (IColumnWrapper|LinkableHashMap)>();
		attributes.set("Foreign key mapping", ds.keyColumn as IColumnWrapper);
		attributes.set("Data to transform", ds.dataColumns as LinkableHashMap)

		let editorFields:[React.ReactChild, React.ReactChild][] = [
			this.getLabelEditor(ds.label),
			[
				<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
					{Weave.lang("Foreign key mapping")}
					<HelpIcon>
						{Weave.lang("Each value in this column will be used as the key to look up records in the data columns")}
					</HelpIcon>
				</HBox>,
				<SelectableAttributeComponent attributeName="Foreign key mapping" attributes={attributes}/>
			],
			[
				Weave.lang("Data to transform"),
				<SelectableAttributeComponent attributeName="Data to transform" attributes={attributes}/>
			]
		];
		return super.editorFields.concat(editorFields)
	}
}
