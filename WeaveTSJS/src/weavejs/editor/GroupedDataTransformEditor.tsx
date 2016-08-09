namespace weavejs.editor
{
	import StatefulTextField = weavejs.ui.StatefulTextField;
	import WeaveReactUtils = weavejs.util.WeaveReactUtils
	import ReactUtils = weavejs.util.ReactUtils;
	import WeaveTree = weavejs.ui.WeaveTree;
	import HBox = weavejs.ui.flexbox.HBox;
	import VBox = weavejs.ui.flexbox.VBox;
	import HelpIcon = weavejs.ui.HelpIcon;
	import SelectableAttributeComponent = weavejs.ui.SelectableAttributeComponent;
	import DataSourceEditor = weavejs.editor.DataSourceEditor;
	import IDataSourceEditorProps = weavejs.editor.IDataSourceEditorProps;
	import IDataSourceEditorState = weavejs.editor.IDataSourceEditorState;
	import KeyTypeInput = weavejs.ui.KeyTypeInput;

	import GroupedDataTransform = weavejs.data.source.GroupedDataTransform;
	import FilteredColumn = weavejs.data.column.FilteredColumn;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import DynamicComponent = weavejs.ui.DynamicComponent;
	import Checkbox = weavejs.ui.Checkbox;

	export class GroupedDataTransformEditor extends DataSourceEditor
	{
		private isFiltered=():boolean=>
		{
			let ds = (this.props.dataSource as GroupedDataTransform);
			return Weave.IS(ds.groupByColumn.getInternalColumn(), FilteredColumn);
		}

		private setFiltered=(enabled:boolean)=>
		{
			let ds = (this.props.dataSource as GroupedDataTransform);
			if (this.isFiltered() === enabled)
				return; /* No change */

			if (enabled)
			{
				let groupByState = Weave.getState(ds.groupByColumn);
				let filteredColumn = ds.groupByColumn.requestLocalObject(FilteredColumn) as FilteredColumn;
				Weave.setState(filteredColumn.internalDynamicColumn, groupByState);
				filteredColumn.filter.targetPath = ['defaultSubsetKeyFilter'];
			}
			else
			{
				let filteredColumn = Weave.AS(ds.groupByColumn.getInternalColumn(), FilteredColumn);
				Weave.setState(ds.groupByColumn, Weave.getState(filteredColumn.internalDynamicColumn));
			}
		}

		get editorFields():[React.ReactChild, React.ReactChild][]
		{
			let ds = (this.props.dataSource as GroupedDataTransform);

			let attributes = new Map<string, (IColumnWrapper|LinkableHashMap)>();
			attributes.set("Group by", ds.groupByColumn as IColumnWrapper);
			attributes.set("Data to transform", ds.dataColumns as LinkableHashMap);

			let editorFields:[React.ReactChild, React.ReactChild][] = [
				this.getLabelEditor(ds.label),
				[
					<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
						{Weave.lang("Group by")}
						<HelpIcon>
							{Weave.lang('The keyType of the "Group by" column should match the keyType of each column to be transformed. The values in this column will be treated as foreign keys which map to aggregated values in the transformed columns.')}
						</HelpIcon>
					</HBox>,
					<SelectableAttributeComponent attributeName="Group by" attributes={attributes}/>
				],
				[
					<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
						{Weave.lang("Group keyType")}
						<HelpIcon>
							{Weave.lang('Specifies the keyType of the foreign keys referenced by the "Group by" column. By default, the dataType of the "Group by" column is used as the foreign keyType.')}
						</HelpIcon>
					</HBox>,
					<KeyTypeInput keyTypeProperty={ds.groupKeyType}/>
				],
				[
					Weave.lang("Data to transform"),
					<SelectableAttributeComponent attributeName="Data to transform" attributes={attributes}/>
				],
				[
					Weave.lang("Filter grouped records using subset"),
					<DynamicComponent dependencies={[ds.groupByColumn]} render={()=>
						<Checkbox label={" "} value={this.isFiltered()}
							onChange={this.setFiltered}/>}
					/>
				]
			];
			return super.editorFields.concat(editorFields)
		}
	}
}
