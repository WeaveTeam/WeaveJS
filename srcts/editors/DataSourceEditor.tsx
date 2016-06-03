import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {VBox, HBox} from "../react-ui/FlexBox";
import InteractiveTour from "../react-ui/InteractiveTour";
import ResizingDiv from "../react-ui/ResizingDiv";
import ReactUtils from "../utils/ReactUtils";
import SmartComponent from "../ui/SmartComponent";
import DynamicComponent from "../ui/DynamicComponent";
import StatefulTextField from "../ui/StatefulTextField";
import WeaveTree from "../ui/WeaveTree";
import FixedDataTable from "../tools/FixedDataTable";
import {IColumnTitles} from "../tools/FixedDataTable";
import MenuButton from '../react-ui/MenuButton';
import ChartsMenu from "../menus/ChartsMenu";
import {linkReactStateRef, forceUpdateWatcher} from "../utils/WeaveReactUtils";
import HelpIcon from "../react-ui/HelpIcon";

import LinkableWatcher = weavejs.core.LinkableWatcher;
import IDataSource = weavejs.api.data.IDataSource;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IColumnReference = weavejs.api.data.IColumnReference;
import WeaveRootDataTreeNode = weavejs.data.hierarchy.WeaveRootDataTreeNode;
import ColumnUtils = weavejs.data.ColumnUtils;
import ReferencedColumn = weavejs.data.column.ReferencedColumn;
import StreamedGeometryColumn = weavejs.data.column.StreamedGeometryColumn;
import HierarchyUtils = weavejs.data.hierarchy.HierarchyUtils;

export const PREVIEW:"preview" = "preview";
export const METADATA:"metadata" = "metadata";
export const BROWSE:"browse" = "browse";
export type View = typeof PREVIEW | typeof METADATA | typeof BROWSE;

export interface IDataSourceEditorProps {
	dataSource: IDataSource;
};

export interface IDataSourceEditorState {
	selectedBranch?: IWeaveTreeNode;
	selectedLeaf?: IWeaveTreeNode;
	showPreviewView?: boolean;
	guideToTab?:string;
};

export default class DataSourceEditor extends SmartComponent<IDataSourceEditorProps, IDataSourceEditorState> 
{
	dataSourceWatcher = forceUpdateWatcher(this, IDataSource);
	private column:IAttributeColumn;
	protected enablePreview:boolean = true;
	protected tree:WeaveTree;
	protected editorButtons:Map<React.ReactChild, Function>;

	constructor(props:IDataSourceEditorProps)
	{
		super(props);
		this.handleProps(props);
		this.setState({showPreviewView: false});
	}
	
	handleProps(props:IDataSourceEditorProps)
	{
		if (this.dataSourceWatcher.target != props.dataSource)
		{
			this.dataSourceWatcher.target = props.dataSource;
			this.setSelection(props, null, null);
		}
		else
		{
			this.setSelection(props, this.state.selectedBranch, this.state.selectedLeaf);
		}
	}
	
	componentWillReceiveProps(props:IDataSourceEditorProps)
	{
		this.handleProps(props);
	}

	componentWillUnmount()
	{
		ColumnUtils.firstDataSet = null;
	}

	getLabelEditor(labelLinkableString:weavejs.core.LinkableString):[React.ReactChild, React.ReactChild]
	{
		return [
			<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
				{Weave.lang("Label")}
				<HelpIcon>{Weave.lang("A label used to identify this data source")}</HelpIcon>
			</HBox>,
			<StatefulTextField placeholder={this.props.dataSource.getLabel()} style={{ width: "100%", userSelect: false }} ref={linkReactStateRef(this, {value: labelLinkableString}, 500)}/>
		];
	}
	
	get editorFields():[React.ReactChild, React.ReactChild][]
	{
		return [
		];
	}

	renderFields():JSX.Element
	{
		let dataSource = this.props.dataSource;
		
		var tableStyles = {
			table: { width: "100%", fontSize: "inherit"},
			td: [
				{ textAlign: "right", whiteSpace: "nowrap", paddingRight: 8},
				{ paddingBottom: 8, width: "100%", paddingLeft: 8}
			]
		};

		return ReactUtils.generateTable({body: this.editorFields, styles: tableStyles});
	}
	
	renderColumnPreview=():JSX.Element=>
	{
		var rows = ColumnUtils.getRecords({
			id: IQualifiedKey,
			value: this.column
		}, null, String);

		rows = rows.map((row) => {
			return {
				id: row.id.localName,
				value: row.value
			}
		});
		var keyType = this.column && this.column.getMetadata("keyType");
		var dataType = this.column && this.column.getMetadata("dataType");
		var columnIds = ["id", "value"];
		var columnTitles:IColumnTitles = {
			id: keyType ? Weave.lang("Key ({0})", keyType) : Weave.lang("Key"),
			value: dataType ? Weave.lang("Value ({0})", dataType) : Weave.lang("Value")
		};
		return (
			<VBox style={{flex: 1}}>
				<span style={{marginBottom: 5}}>{Weave.lang(rows ? "Selected column has {0} records":"", rows ? rows.length:0)}</span>
				<FixedDataTable rows={rows}
							 	columnIds={columnIds}
							 	idProperty="id"
							 	showIdColumn={true}
							 	columnTitles={columnTitles}/>
			</VBox>
		)
	}

	private static nodeEqualityFunc(a:IWeaveTreeNode, b:IWeaveTreeNode):boolean
	{
		if (a && b)
			return a.equals(b);
		else
			return (a === b);
	}
	
	renderPreviewView():JSX.Element
	{
		let root = this.props.dataSource.getHierarchyRoot();
		return (
			<VBox className="ui segment" style={{flex: 1}}>
				<div className="ui medium dividing header" aria-labelledby={Weave.lang("Preview of") + " " + this.props.dataSource.getLabel()}>{Weave.lang("Preview")}</div>
				<HBox className={root.hasChildBranches() ? "weave-padded-hbox" : null} style={{flex: 1, border: "none"}}>
					<VBox style={{flex: root.hasChildBranches() ? 1 : 0, overflow: 'auto'}}>
						<WeaveTree
							root={root}
							hideLeaves={true}
							initialSelectedItems={this.state.selectedBranch ? [this.state.selectedBranch] : []}
							onSelect={(selectedItems) => this.setSelection(this.props, selectedItems && selectedItems[0], this.state.selectedLeaf)}
						/>
					</VBox>
					<VBox className="weave-padded-vbox" style={{flex: 1, overflow: 'auto'}}>
						<DynamicComponent dependencies={[this.column]} render={this.renderTablePreview}/>
					</VBox>
				</HBox>
			</VBox>
		);
	}
	
	renderConfigureView():JSX.Element
	{
		let root = this.props.dataSource.getHierarchyRoot();
		// <label style={ { fontWeight: "bold" } }> { Weave.lang("Edit {0}", this.props.dataSource.getLabel()) } </label>
		return (
			<VBox className="ui basic segment" style={ {border: "none"} }>
				<div className="ui medium dividing header" aria-labelledby={Weave.lang("Configure") + " " + this.props.dataSource.getLabel()}>{Weave.lang("Configure")}</div>
				{
					this.renderFields()
				}
			</VBox>
		);
	}
	
	renderTablePreview=():JSX.Element =>
	{
		var columnSiblings: IWeaveTreeNode[];
		if (this.state.selectedBranch)
		{
			columnSiblings = this.state.selectedBranch.getChildren();
		}
		else
		{
			columnSiblings = [];
		}
		
		let leaves:IWeaveTreeNode[] = columnSiblings.filter((n) => !n.isBranch());
		if (!leaves)
			return;

		var columns:IAttributeColumn[] = [];
		for (var leaf of leaves)
		{
			var columnRef = Weave.AS(leaf, IColumnReference);
			if (columnRef)
			{
				var meta = columnRef.getColumnMetadata();
				if (meta)
					columns.push(weavejs.WeaveAPI.AttributeColumnCache.getColumn(columnRef.getDataSource(), meta));
			}
		}

		var names:string[] = columns.map(column => column.getMetadata("title"));
		var format = _.assign({id: IQualifiedKey},_.zipObject(names, columns));
		var columnTitles = _.zipObject(names, names);
		var rows = ColumnUtils.getRecords(format, null, String);

		rows = rows.map((row) => {
			row.id = row.id.localName;
			return row;
		});


		var keyType = this.column && this.column.getMetadata("keyType");
		names.unshift("id");
		_.assign(columnTitles, {id: keyType ? Weave.lang("Key ({0})", keyType) : Weave.lang("Key")});

		return (
			<FixedDataTable rows={rows}
							columnIds={names}
							idProperty="id"
							showIdColumn={true}
							columnTitles={columnTitles as any}
			                disableSort={true}
			/>
		);
	};

	setSelection(props:IDataSourceEditorProps, newBranch:IWeaveTreeNode, newLeaf:IWeaveTreeNode)
	{
		let root = props.dataSource.getHierarchyRoot();
		var branch = newBranch || root;
		var leaves = branch.getChildren() || [];
		var leaf = newLeaf;
		if (leaves.indexOf(leaf) < 0)
			leaf = leaves[0];

		if(!branch.hasChildBranches())//tool config drop downs should have only columns as options
			weavejs.data.ColumnUtils.firstDataSet = leaves as any[];
		else
			weavejs.data.ColumnUtils.firstDataSet = null;
		
		var ref = Weave.AS(leaf, IColumnReference);
		this.column = weavejs.WeaveAPI.AttributeColumnCache.getColumn(ref && ref.getDataSource(), ref && ref.getColumnMetadata());
	
		// request all metadata for selected geometry column so we get the list of keys
		for (var sgc of Weave.getDescendants(this.column, StreamedGeometryColumn))
			sgc.requestAllMetadata();
		
		this.setState({
			selectedBranch: branch,
			selectedLeaf: leaf
		});
	}
	
	render():JSX.Element
	{
		return (
			<VBox className="ui vertical segments" style={{flex:1}}>
				{this.renderConfigureView()}
				{this.renderPreviewView()}
			</VBox>
		);
	}
};
