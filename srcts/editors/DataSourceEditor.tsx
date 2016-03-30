import * as React from "react";
import * as ReactDOM from "react-dom";
import {VBox, HBox} from "../react-ui/FlexBox";
import ReactUtils from "../utils/ReactUtils";
import StatefulTextField from "../ui/StatefulTextField";
import WeaveTree from "../ui/WeaveTree";
import FixedDataTable from "../tools/FixedDataTable";
import {IColumnTitles} from "../tools/FixedDataTable";

import WeaveAPI = weavejs.WeaveAPI;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import IDataSource = weavejs.api.data.IDataSource;
import WeaveRootDataTreeNode = weavejs.data.hierarchy.WeaveRootDataTreeNode;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ColumnUtils = weavejs.data.ColumnUtils;

export interface IDataSourceEditorProps {
	dataSource: IDataSource;
};

export interface IDataSourceEditorState {
	selectedNode?: IWeaveTreeNode;
};

export default class DataSourceEditor extends React.Component<IDataSourceEditorProps, IDataSourceEditorState> 
{
	boundforceUpdate = () => this.forceUpdate();
	dataSourceWatcher:LinkableWatcher = Weave.disposableChild(this, new LinkableWatcher(IDataSource, null, this.boundforceUpdate));
	columnWatcher:LinkableWatcher = Weave.disposableChild(this, new LinkableWatcher(IAttributeColumn, null, this.boundforceUpdate));

	private tableContainer:VBox;
	private tableContainerElement:HTMLElement;
	protected tree:WeaveTree;

	constructor(props:IDataSourceEditorProps)
	{
		super(props);
		this.componentWillReceiveProps(props);
		this.state = {
			selectedNode: null
		}
	}
	
	componentWillReceiveProps(props:IDataSourceEditorProps)
	{
		this.dataSourceWatcher.target = props.dataSource;
	}
	
	componentDidUpdate()
	{
		this.tableContainerElement = ReactDOM.findDOMNode(this.tableContainer) as HTMLElement;
	}
	
	componentWillUnmount()
	{
		Weave.getCallbacks(this.columnWatcher.target).removeCallback(this, this.boundforceUpdate);
		Weave.getCallbacks(this.dataSourceWatcher.target).removeCallback(this, this.boundforceUpdate);
	}
	
	get column():IAttributeColumn
	{
		return this.columnWatcher.target as IAttributeColumn;
	}
	
	get editorFields():[string, JSX.Element][]
	{
		return [
			// [
			// 	Weave.lang("Source Name"),
			// 	<input type="text" style={{width: "100%"}}
			// 					   defaultValue={Weave.lang(Weave.getRoot(this.props.dataSource).getName(this.props.dataSource))}
			// 					   onChange={(e:React.FormEvent) => this.renameDataSource((e.target as any).value)}/>
			// ]
		]
	}

	renderFields():JSX.Element
	{
		let dataSource = this.props.dataSource;
		let keyTypeSuggestions = WeaveAPI.QKeyManager.getAllKeyTypes();
		
		var tableStyles = {
			table: { width: "100%", fontSize: "inherit"},
			td: [
				{ paddingBottom: 10, textAlign: "right", whiteSpace: "nowrap", paddingRight: 5},
				{ paddingBottom: 10, textAlign: "right", width: "100%"}
			]
		};

		return (
			<VBox>
				<label> {Weave.lang("Edit {0}", Weave.getRoot(dataSource).getName(dataSource))} </label>
				{
					ReactUtils.generateTable(null, this.editorFields, tableStyles)
				}
			</VBox>
		)
	}
	
	showColumns(selectedItems:IWeaveTreeNode[])
	{
		var node = selectedItems && selectedItems.length && selectedItems[0];
		this.setState({
			selectedNode: node
		});
	}

	updateColumnTarget(selectedItems:IWeaveTreeNode[])
	{
		var ref = selectedItems && selectedItems.length && Weave.AS(selectedItems[0], weavejs.api.data.IColumnReference);
		if (ref)
		{
			var meta = ref.getColumnMetadata();
			this.columnWatcher.target = ref.getDataSource().getAttributeColumn(meta);
		}
	}

	renderPreviewTable():JSX.Element
	{
		if(!this.column)
			return;

		var rows = ColumnUtils.getRecords({
			id: IQualifiedKey,
			value: this.column
		}, null, String);
		rows = rows.map((row) => {
			return {
				id: row.id.toString(),
				value: row.value
			}
		});
		var keyType = this.column.getMetadata("keyType");
		var dataType = this.column.getMetadata("dataType");
		var columnIds = ["id", "value"];
		var columnTitles:IColumnTitles = {id: Weave.lang("Key ({0})", keyType), value: Weave.lang("Value ({0})", dataType)};
		return (
			rows.length
			? <VBox style={{flex: 1}} ref={(c:VBox) => this.tableContainer = c}>
				{Weave.lang("Selected column has {0} records", rows.length)}
				{
					this.tableContainerElement
					? <FixedDataTable rows={rows} 
									  columnIds={columnIds} 
									  idProperty="id"
									  showIdColumn={true}
									  columnWidth={this.tableContainerElement.clientWidth/2} 
									  columnTitles={columnTitles}/>
					: null
				}
			</VBox>
			: null
		)
	}
	
	renderBrowseView():JSX.Element
	{
		return (
			<HBox style={{flex: 1}}>
				<VBox style={{flex: 1}}>
					<WeaveTree root={this.props.dataSource.getHierarchyRoot()} hideLeaves={true} onSelect={(selectedItems) => this.showColumns(selectedItems)}/>
				</VBox>
				<div style={{width: 4}}/>
				<VBox style={{flex: 1}}>
					{
						this.state.selectedNode
						?  <WeaveTree root={this.state.selectedNode} hideRoot={true} hideBranches={true} onSelect={(selectedItems) => this.updateColumnTarget(selectedItems)}/>
						: ""
					}
					{
						this.renderPreviewTable()
					}
				</VBox>
			</HBox>
		);
	}
	
	render():JSX.Element
	{
		return (
			<VBox style={{flex:1, margin: 10}}>
				{
					this.renderFields()
				}
				{
					this.renderBrowseView()
				}
			</VBox>
		)
	}
};
