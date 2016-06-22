import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {VBox, HBox} from "../react-ui/FlexBox";
import InteractiveTour from "../react-ui/InteractiveTour";
import ResizingDiv from "../ui/ResizingDiv";
import ReactUtils from "../utils/ReactUtils";
import SmartComponent from "../ui/SmartComponent";
import DynamicComponent from "../ui/DynamicComponent";
import StatefulTextField from "../ui/StatefulTextField";
import WeaveTree from "../ui/WeaveTree";
import FixedDataTable from "../tools/FixedDataTable";
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
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;

export const PREVIEW:"preview" = "preview";
export const METADATA:"metadata" = "metadata";
export const BROWSE:"browse" = "browse";
export type View = typeof PREVIEW | typeof METADATA | typeof BROWSE;

export interface IDataSourceEditorProps
{
	dataSource: IDataSource;
};

export interface IDataSourceEditorState
{
	selectedBranch?: IWeaveTreeNode;
	selectedLeaf?: IWeaveTreeNode;
	showPreviewView?: boolean;
	guideToTab?:string;
};

export default class DataSourceEditor extends SmartComponent<IDataSourceEditorProps, IDataSourceEditorState> 
{
	dataSourceWatcher = forceUpdateWatcher(this, IDataSource);
	protected enablePreview:boolean = true;
	protected tree:WeaveTree;
	protected editorButtons:Map<React.ReactChild, Function>;
	protected weaveRoot:ILinkableHashMap;

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
		ColumnUtils.map_root_firstDataSet.delete(this.weaveRoot);
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

	private static nodeEqualityFunc(a:IWeaveTreeNode, b:IWeaveTreeNode):boolean
	{
		if (a && b)
			return a.equals(b);
		else
			return (a === b);
	}

	private static isNotGeometryList(node:IWeaveTreeNode):boolean
	{
		let glnClass = (weavejs.data.source.WeaveDataSource as any).GeomListNode;
		return !(node instanceof glnClass);
	}
	
	renderPreviewView():JSX.Element
	{
		let root = this.props.dataSource.getHierarchyRoot();
		var columns = this.getColumns();
		return (
			<VBox className="ui segment" style={{flex: 1,border:"none",borderRadius:0}}>
				<div className="ui medium dividing header" aria-label={Weave.lang("Preview of") + " " + this.props.dataSource.getLabel()}>{Weave.lang("Preview")}</div>
				<HBox className={root && root.hasChildBranches() ? "weave-padded-hbox" : null} style={{flex: 1, border: "none"}}>
					<VBox style={{flex: root && root.hasChildBranches() ? 1 : 0, overflow: 'auto'}}>
						<WeaveTree
							root={root}
							hideLeaves={true}
							filterFunc={DataSourceEditor.isNotGeometryList}
							initialSelectedItems={this.state.selectedBranch ? [this.state.selectedBranch] : []}
							onSelect={(selectedItems) => this.setSelection(this.props, selectedItems && selectedItems[0], this.state.selectedLeaf)}
						/>
					</VBox>
					<VBox className="weave-padded-vbox"
					      style={{flex: 1, overflow: 'auto'}}
					      ref={InteractiveTour.enable ? InteractiveTour.getComponentRefCallback("Preview") : null}>
						<DynamicComponent dependencies={columns} render={() => {return this.renderTablePreview(columns)}}/>
					</VBox>
				</HBox>
			</VBox>
		);
	}
	
	renderConfigureView():JSX.Element
	{
		let registry = weavejs.WeaveAPI.ClassRegistry;
		let displayName:string = Weave.lang(weavejs.WeaveAPI.ClassRegistry.getDisplayName(this.props.dataSource.constructor as typeof IDataSource));
		return (
			<VBox className="ui segment" style={ {border:"none",borderRadius:0} }>
				<div className="ui medium dividing header" aria-label={Weave.lang("Configure {0}:{1}",displayName,Weave.lang(this.props.dataSource.getLabel()))}>{Weave.lang("Configure {0}",displayName)}</div>
				{
					this.renderFields()
				}
			</VBox>
		);
	}

	getColumns():IAttributeColumn[]
	{
		var columnSiblings: IWeaveTreeNode[] = this.state.selectedBranch && this.state.selectedBranch.getChildren() || [];

		let leaves:IWeaveTreeNode[] = columnSiblings.filter((n) => !n.isBranch());
		if (!leaves)
			return [];

		var columns:IAttributeColumn[] = [];
		for (var leaf of leaves)
		{
			var columnRef = Weave.AS(leaf, IColumnReference);
			if (columnRef)
			{
				var meta = columnRef.getColumnMetadata();
				if (meta) {
					var column = weavejs.WeaveAPI.AttributeColumnCache.getColumn(columnRef.getDataSource(), meta);
					columns.push(column);
					// request all metadata for each geometry column so we get the list of keys
					for (var sgc of Weave.getDescendants(column, StreamedGeometryColumn))
						sgc.requestAllMetadata();
				}
			}
		}
		return columns;
	}
	
	renderTablePreview=(columns:IAttributeColumn[]):JSX.Element =>
	{
		var names:string[] = columns.map(column => column.getMetadata("title"));
		var format = _.assign({id: IQualifiedKey},_.zipObject(names, columns));
		var columnTitles = _.zipObject(names, names);
		var rows = ColumnUtils.getRecords(format, null, String);

		rows = rows.map((row) => {
			row.id = row.id.localName;
			return row;
		});


		var keyType = columns.length && columns[0].getMetadata("keyType");
		names.unshift("id");
		_.assign(columnTitles, {id: keyType ? Weave.lang("Key ({0})", keyType) : Weave.lang("Key")});

		return (
			<FixedDataTable rows={rows}
							columnIds={names}
							idProperty="id"
							showIdColumn={!!columns.length}
							columnTitles={columnTitles as any}
			                disableSort={true}
			                multiple={false}
			/>
		);
	};

	setSelection(props:IDataSourceEditorProps, newBranch:IWeaveTreeNode, newLeaf:IWeaveTreeNode)
	{
		let root = props.dataSource.getHierarchyRoot();
		var branch = newBranch || root;
		var leaf = newLeaf;
	
		//firstDataSet should be set if there are leaves which are column refs and unset otherwise
		let weaveRoot = Weave.getRoot(props.dataSource);
		if (weaveRoot != this.weaveRoot)
		{
			ColumnUtils.map_root_firstDataSet.delete(this.weaveRoot);
			this.weaveRoot = weaveRoot;
		}
		var leaves = branch && branch.getChildren() || [];
		leaves = leaves.filter(leaf => {
			var ref = Weave.AS(leaf, IColumnReference);
			return !!(ref && ref.getColumnMetadata());
		});
		if (leaves.length)
			weavejs.data.ColumnUtils.map_root_firstDataSet.set(weaveRoot, leaves as any[]);
		else
			weavejs.data.ColumnUtils.map_root_firstDataSet.delete(weaveRoot);
		
		// select the first leaf by default
		if (leaves.indexOf(leaf) < 0)
			leaf = leaves[0];
		
		this.setState({
			selectedBranch: branch,
			selectedLeaf: leaf
		});
	}
	/* Border and shadow of ui segements in Tab gives contrasting color to its backgrouund */
	render():JSX.Element
	{
		return (
			<VBox className="ui vertical segments" style={ {flex:1,border:"none",borderRadius:0,boxShadow:"none"} }>
				{this.renderConfigureView()}
				{this.renderPreviewView()}
			</VBox>
		);
	}
};
