import {IVisTool, IVisToolProps, IVisToolState, renderSelectableAttributes} from "./IVisTool";
import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import AbstractVisTool from "./AbstractVisTool";
import Menu, {MenuItemProps} from "../react-ui/Menu";
import MiscUtils from "../utils/MiscUtils";
import {ObjectFixedDataTable, IRow} from "./FixedDataTable";
import {SortTypes, SortDirection} from "./FixedDataTable";
import ReactUtils from "../utils/ReactUtils";
import PrintUtils from "../utils/PrintUtils";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import Checkbox from "../semantic-ui/Checkbox";

import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IColumnReference = weavejs.api.data.IColumnReference;
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
import IInitSelectableAttributes = weavejs.api.ui.IInitSelectableAttributes;
import EventCallbackCollection = weavejs.core.EventCallbackCollection;

export interface IDataTableState extends IVisToolState
{
	data?: IRow[],
	columnTitles?:{[columnId:string]: string},
	columnIds?:string[],
	width?:number,
	height?:number
}


export interface TableEventData {
	key: IQualifiedKey;
	column: IAttributeColumn;
}



export default class TableTool extends React.Component<IVisToolProps, IDataTableState> implements IVisTool, IInitSelectableAttributes
{
	fixedDataTable: ObjectFixedDataTable;

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

	altText:LinkableString = Weave.linkableChild(this, new LinkableString(this.panelTitle.value));

	idProperty:string = ''; // won't conflict with any column name

	constructor(props:IVisToolProps)
	{
		super(props);
		Weave.getCallbacks(this).addGroupedCallback(this, this.forceUpdate);

		this.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
		this.selectionFilter.targetPath = ['defaultSelectionKeySet'];
		this.probeFilter.targetPath = ['defaultProbeKeySet'];

		this.columns.addGroupedCallback(this, this.dataChanged, true);
		this.sortFieldIndex.addGroupedCallback(this, this.dataChanged, true);
		this.sortInDescendingOrder.addGroupedCallback(this, this.dataChanged, true);
		this.filteredKeySet.addGroupedCallback(this, this.dataChanged, true);
		this.selectionFilter.addGroupedCallback(this, this.forceUpdate);
		this.probeFilter.addGroupedCallback(this, this.forceUpdate);
		this.state = {
			data: [],
			columnTitles: {},
			columnIds: [],
			width:0,
			height:0
		};
	}

	get deprecatedStateMapping()
	{
		return {};
	}

	get title():string
	{
		return MiscUtils.evalTemplateString(this.panelTitle.value, this) || this.defaultPanelTitle;
	}

	componentDidMount()
	{
		Menu.registerMenuSource(this);
	}

	componentDidUpdate()
	{}

	getMenuItems():MenuItemProps[]
	{
		let menuItems:MenuItemProps[] = AbstractVisTool.getMenuItems(this);

		if (this.selectionKeySet && this.selectionKeySet.keys.length)
		{
			menuItems.push({
				label: Weave.lang("Move selected to top"),
				click: () => this.fixedDataTable.moveSelectedToTop()
			});
		}

		if(Weave.beta)
			menuItems.push({
				label: Weave.lang("Print Tool (Beta)"),
				click: PrintUtils.printTool.bind(null, ReactDOM.findDOMNode(this))
			});

		return menuItems;
	}

	dataChanged()
	{
		var columns = this.columns.getObjects(IAttributeColumn);
		var names:string[] = this.columns.getNames();

		var sortDirections = columns.map((column, index) => {
			if(this.sortFieldIndex.value == index)
			{
				if(this.sortInDescendingOrder.value)
				{
					return -1;
				}
				return 1;
			}
			return 0;
		});

		this.filteredKeySet.setColumnKeySources(columns, sortDirections);

		if (weavejs.WeaveAPI.Locale.reverseLayout)
		{
			columns.reverse();
			names.reverse();
		}

		var format:any = _.zipObject(names, columns);
		format[this.idProperty] = IQualifiedKey;
		var records: IRow[] = ColumnUtils.getRecords(format, this.filteredKeySet.keys, String);
		records.forEach(record => record[this.idProperty] = record[this.idProperty].toString());

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
		if (!this.probeKeySet)
			return;
		if (ids && ids.length)
			this.probeKeySet.replaceKeys(ids && ids.map((id) => weavejs.WeaveAPI.QKeyManager.stringToQKey(id)));
		else
			this.probeKeySet.clearKeys();
	};

	handleSelection=(ids:string[]) =>
	{
		this.selectionKeySet.replaceKeys(ids && ids.map((id) => weavejs.WeaveAPI.QKeyManager.stringToQKey(id)));
	};

	get selectableAttributes()
	{
		return new Map<string, (IColumnWrapper | ILinkableHashMap)>()
			.set("Columns", this.columns);
	}

	get defaultPanelTitle():string
	{
		var columns = this.columns.getObjects() as IAttributeColumn[];
		if (columns.length == 0)
			return Weave.lang('Table');

		return Weave.lang("Table of {0}", columns.map(column=>weavejs.data.ColumnUtils.getTitle(column)).join(Weave.lang(", ")));
	}

	initSelectableAttributes(input:(IAttributeColumn | IColumnReference)[]):void
	{
		AbstractVisTool.initSelectableAttributes(this.selectableAttributes, input);
	}

	//todo:(pushCrumb)find a better way to link to sidebar UI for selectbleAttributes
	renderEditor =(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any )=>void):JSX.Element =>
	{
		return ReactUtils.generateTable({
			body: renderSelectableAttributes(this.selectableAttributes, pushCrumb)
				  .concat(this.getTitlesEditor())
				  .concat([
					  [
    					  Weave.lang("Show Key Column"),
    					  <Checkbox ref={linkReactStateRef(this, { value: this.showKeyColumn })} label={" "}/>
    				  ]  
				  ]),
			classes: {
				td: [
					"weave-left-cell",
					"weave-right-cell"
				]
			}
		});
	};
	
	getTitlesEditor():React.ReactChild[][]
	{
		return [
			[
				"Title",
				this.panelTitle,
				this.defaultPanelTitle
			]
		].map((row:[string, LinkableString]) => {

			return [
				Weave.lang(row[0]),
				<StatefulTextField ref={ linkReactStateRef(this, {value: row[1]})} placeholder={row[2] as string}/>
			]
		});
	}
	
	onSort = (columnKey:string, sortDirection:SortDirection) =>
	{
		this.sortFieldIndex.value = this.columns.getNames().indexOf(columnKey);
		this.sortInDescendingOrder.value = sortDirection == SortTypes.DESC;
	};

	events = Weave.linkableChild(this, new EventCallbackCollection<TableEventData>());

	handleCellDoubleClick = (rowId:string, columnKey:string)=>
	{
		let key: IQualifiedKey = weavejs.WeaveAPI.QKeyManager.stringToQKey(rowId);
		let column: IAttributeColumn = this.columns.getObject(columnKey) as IAttributeColumn;

		this.events.dispatch({ key, column });
	}

	render()
	{
		var columnNames = this.columns.getNames(IAttributeColumn);
		return (
			<ObjectFixedDataTable
				columnTitles={this.state.columnTitles}
				rows={this.state.data}
				idProperty={this.idProperty}
				selectedIds={this.selectionKeySet && this.selectionKeySet.keys.map(String) as any}
				probedIds={this.probeKeySet && this.probeKeySet.keys.map(String) as any}
				sortId={columnNames[this.sortFieldIndex.value]}
				sortDirection={this.sortInDescendingOrder.value == true ? SortTypes.DESC : SortTypes.ASC}
				onHover={this.handleProbe}
				onSelection={this.handleSelection}
				onCellDoubleClick={this.handleCellDoubleClick}
				showIdColumn={this.showKeyColumn.value}
				columnIds={this.state.columnIds}
				rowHeight={this.rowHeight.value}
				headerHeight={this.headerHeight.value}
				initialColumnWidth={this.columnWidth.value}
				evenlyExpandRows={true}
				allowResizing={true}
				onSortCallback={this.onSort}
				ref={(c: ObjectFixedDataTable) => { this.fixedDataTable = c } }
			/>
		);
	}
}

Weave.registerClass(
	TableTool,
	["weavejs.tool.TableTool", "weave.visualization.tools::TableTool", "weave.visualization.tools::AdvancedTableTool"],
	[weavejs.api.ui.IVisTool_Utility, weavejs.api.core.ILinkableObjectWithNewProperties, weavejs.api.data.ISelectableAttributes],
	"Table"
);
