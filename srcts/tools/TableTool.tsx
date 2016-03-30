import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import * as _ from "lodash";
import * as React from "react";
import {IRow} from "../react-bootstrap-datatable/TableRow";
import AbstractVisTool from "./AbstractVisTool";
import Menu, {MenuItemProps} from "../react-ui/Menu";
import MiscUtils from "../utils/MiscUtils";
import FixedDataTable from "./FixedDataTable";
import ResizingDiv, {ResizingDivState} from "../react-ui/ResizingDiv";
import {HBox, VBox} from "../react-ui/FlexBox";
import SelectableAttributeComponent from "../ui/SelectableAttributeComponent";
import SelectableAttributesList from "../ui/SelectableAttributesList";


import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableString = weavejs.core.LinkableString;
import LinkableNumber = weavejs.core.LinkableNumber;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
import ColumnUtils = weavejs.data.ColumnUtils;
import KeySet = weavejs.data.key.KeySet;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import QKey = weavejs.data.key.QKey;
import QKeyManager = weavejs.data.key.QKeyManager;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;

export interface IDataTableState extends IVisToolState
{
	data?:IRow[],
	columnTitles?:{[columnId:string]: string},
	columnIds?:string[],
	width?:number,
	height?:number
}

export default class TableTool extends React.Component<IVisToolProps, IDataTableState> implements IVisTool
{
	columns = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));

	sortFieldIndex = Weave.linkableChild(this, new LinkableNumber(0));
	columnWidth = Weave.linkableChild(this, new LinkableNumber(85));
	rowHeight = Weave.linkableChild(this, new LinkableNumber(30));
	headerHeight = Weave.linkableChild(this, new LinkableNumber(30));
	sortInDescendingOrder = Weave.linkableChild(this, new LinkableBoolean(false));
	showKeyColumn = Weave.linkableChild(this, new LinkableBoolean(false));

	panelTitle = Weave.linkableChild(this, new LinkableString);

	selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
	probeFilter = Weave.linkableChild(this, DynamicKeyFilter);
	filteredKeySet = Weave.linkableChild(this, FilteredKeySet);

	private get selectionKeySet() { return this.selectionFilter.getInternalKeyFilter() as KeySet; }
	private get probeKeySet() { return this.probeFilter.getInternalKeyFilter() as KeySet; }

	idProperty:string = ''; // won't conflict with any column name
	private debounced_forceUpdate:Function;

	constructor(props:IVisToolProps)
	{
		super(props);
		Weave.getCallbacks(this).addGroupedCallback(this, this.forceUpdate);

		this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
		this.probeFilter.targetPath = ['defaultProbeKeySet'];

		this.columns.addGroupedCallback(this, this.dataChanged, true);
		this.filteredKeySet.addGroupedCallback(this, this.dataChanged, true);
		this.state = {
			data: [],
			columnTitles: {},
			columnIds: [],
			width:0,
			height:0
		};

		this.debounced_forceUpdate = _.debounce(this.forceUpdate.bind(this),30);
	}

	get deprecatedStateMapping()
	{
		return {};
	}

	get title():string
	{
		return MiscUtils.stringWithMacros(this.panelTitle.value, this);
	}

	componentDidMount()
	{
		Menu.registerMenuSource(this);
	}

	componentDidUpdate()
	{}

	getMenuItems():MenuItemProps[]
	{
		return AbstractVisTool.getMenuItems(this);
	}

	dataChanged()
	{
		var columns = this.columns.getObjects(IAttributeColumn);
		var names:string[] = this.columns.getNames();

		var sortDirections = new Array<number>(columns.length);
		sortDirections[this.sortFieldIndex.value] = this.sortInDescendingOrder.value ? -1 : 1;
		this.filteredKeySet.setColumnKeySources(columns, sortDirections);

		if (weavejs.WeaveAPI.Locale.reverseLayout)
		{
			columns.reverse();
			names.reverse();
		}

		var format:any = _.zipObject(names, columns);
		format[this.idProperty] = IQualifiedKey;
		var records:IRow[] = ColumnUtils.getRecords(format, this.filteredKeySet.keys, String);
		var titles:string[] = columns.map(column => Weave.lang(column.getMetadata("title")));
		var columnTitles = _.zipObject(names, titles) as { [columnId: string]: string; };
		names.unshift(this.idProperty);
		columnTitles[this.idProperty] = Weave.lang("Key");

		this.setState({
			data: records,
			columnTitles,
			columnIds: names
		});
	}

	handleProbe=(ids:string[]) =>
	{
		if(ids.length)
			this.probeKeySet.replaceKeys(ids as any);
		else
			this.probeKeySet.clearKeys();
	};

	handleSelection=(ids:string[]) =>
	{
		this.selectionKeySet.replaceKeys(ids as any);
	};

	selectableAttributes:{[label:string] : IColumnWrapper|LinkableHashMap} ={
		Columns : this.columns
	};

	renderEditor():JSX.Element {

		var attrLabels = Object.keys(this.selectableAttributes);
		var selectors = attrLabels.map((label:string, index:number) => {
			if (Weave.IS(this.selectableAttributes[label], IColumnWrapper))
			{
				let attribute = this.selectableAttributes[label] as IColumnWrapper;
				return <SelectableAttributeComponent key={index} attributeNames={attrLabels} label={ label } attribute={ attribute }/>;
			}
			else // LinkableHashMap
			{
				let attribute = this.selectableAttributes[label] as LinkableHashMap;
				return(<SelectableAttributesList key={index}  attributeNames={attrLabels}  label={ label } columns={ attribute } showLabelAsButton={ true }/>);
			}
		});
		return(
			<VBox>
				{selectors}
			</VBox>
		)
	};

	render()
	{
		return (
			<FixedDataTable
				columnTitles={this.state.columnTitles}
				rows={this.state.data}
				idProperty={this.idProperty}
				selectedIds={this.selectionKeySet && this.selectionKeySet.keys as any}
				probedIds={this.probeKeySet && this.probeKeySet.keys as any}
				onHover={this.handleProbe}
				onSelection={this.handleSelection}
				showIdColumn={this.showKeyColumn.value}
				columnIds={this.state.columnIds}
				rowHeight={this.rowHeight.value}
				headerHeight={this.headerHeight.value}
				columnWidth={this.columnWidth.value}
			/>
		);
	}
}

Weave.registerClass("weavejs.tool.Table", TableTool, [weavejs.api.ui.IVisTool_Utility, weavejs.api.core.ILinkableObjectWithNewProperties], "Table");
Weave.registerClass("weave.visualization.tools::TableTool", TableTool);
Weave.registerClass("weave.visualization.tools::AdvancedTableTool", TableTool);
