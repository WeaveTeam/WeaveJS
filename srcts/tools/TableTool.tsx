import {IVisTool, IVisToolProps, IVisToolState, renderSelectableAttributes} from "./IVisTool";
import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import AbstractVisTool from "./AbstractVisTool";
import Menu, {MenuItemProps} from "../react-ui/Menu";
import MiscUtils from "../utils/MiscUtils";
import FixedDataTable from "./FixedDataTable";
import {SortTypes, SortDirection} from "./FixedDataTable";
import ReactUtils from "../utils/ReactUtils";
import PrintUtils from "../utils/PrintUtils";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import Checkbox from "../semantic-ui/Checkbox";
import Accordion from "../semantic-ui/Accordion";
import {HBox, VBox} from "../react-ui/FlexBox";
import ColorRampEditor from "../editors/ColorRampEditor";

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
import ColorRamp = weavejs.util.ColorRamp;
import IColumnStatistics = weavejs.api.data.IColumnStatistics;
import ColumnStatistics = weavejs.data.ColumnStatistics;

export interface IDataTableState extends IVisToolState
{
	width?:number,
	height?:number
}


export interface TableEventData {
	key: IQualifiedKey;
	column: IAttributeColumn;
}

export class AttributeColumnTable extends FixedDataTable<IQualifiedKey> {

}



export default class TableTool extends React.Component<IVisToolProps, IDataTableState> implements IVisTool, IInitSelectableAttributes
{
	attributeColumnTable: AttributeColumnTable;

	columns = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
	statsColumns = {};

	heatMapColors = Weave.linkableChild(this, new ColorRamp(["0xFF0000","0xFFFF66","0xCCFF66","0x33CC00"]));
	enableHeatMap = Weave.linkableChild(this, new LinkableBoolean(false));
	overrideMinMax = Weave.linkableChild(this, new LinkableBoolean(false));
	tableMinValue = Weave.linkableChild(this,  LinkableNumber);
	tableMaxValue = Weave.linkableChild(this,  LinkableNumber);

	sortFieldIndex = Weave.linkableChild(this, new LinkableNumber(0));
	columnWidth = Weave.linkableChild(this, new LinkableNumber(85));
	rowHeight = Weave.linkableChild(this, new LinkableNumber(30));
	headerHeight = Weave.linkableChild(this, new LinkableNumber(30));

	sortInDescendingOrder = Weave.linkableChild(this, new LinkableBoolean(false));

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

		this.overrideMinMax.addImmediateCallback(this, this.updateColumnChildListCallbacks, true);
		this.columns.addGroupedCallback(this, this.dataChanged, true);

		this.sortFieldIndex.addGroupedCallback(this, this.dataChanged, true);
		this.sortInDescendingOrder.addGroupedCallback(this, this.dataChanged, true);
		this.filteredKeySet.addGroupedCallback(this, this.dataChanged, true);
		this.selectionFilter.addGroupedCallback(this, this.forceUpdate);
		this.probeFilter.addGroupedCallback(this, this.forceUpdate);
		this.state = {
			width:0,
			height:0
		};
	}

	updateColumnChildListCallbacks=()=>
	{
		if(this.overrideMinMax.state)
		{
			this.columns.childListCallbacks.removeCallback(this, this.getRespectiveStatsColumn);
		}
		else
		{
			this.tableMinValue.value = NaN;
			this.tableMaxValue.value = NaN;
			this.columns.childListCallbacks.addImmediateCallback(this, this.getRespectiveStatsColumn,true);
		}
	};

	getMinMax=()=>
	{
		var keys = Object.keys(this.statsColumns);
		keys.map( (statsColName:string) => {
			let statsCol = (this.statsColumns as any)[statsColName] as IColumnStatistics;
			if(isNaN(this.tableMinValue.value) || this.tableMinValue.value > statsCol.getMin())
			{
				this.tableMinValue.value = statsCol.getMin();
			}
			if( isNaN(this.tableMaxValue.value) || this.tableMaxValue.value < statsCol.getMax())
			{
				this.tableMaxValue.value = statsCol.getMax();
			}

		});

	};

	getRespectiveStatsColumn=()=>
	{
		let addedColName:string = this.columns.childListCallbacks.lastNameAdded;
		let removedColName:string = this.columns.childListCallbacks.lastNameRemoved;

		if(addedColName){
			let colStats:IColumnStatistics = Weave.privateLinkableChild(this,weavejs.WeaveAPI.StatisticsCache.getColumnStatistics(this.columns.childListCallbacks.lastObjectAdded as IAttributeColumn)) as any;
			(this.statsColumns as any)[addedColName] = colStats;
			Weave.getCallbacks(colStats).addGroupedCallback(this, this.getMinMax);
		}
		else if(removedColName)
		{
			let colStats:IColumnStatistics =(this.statsColumns as any)[removedColName] as IColumnStatistics
			Weave.getCallbacks(colStats).removeCallback(this, this.getMinMax);
			delete (this.statsColumns as any)[removedColName];
		}
		else // happens when called from changing overrideMinMax value
		{
			this.getMinMax();
		}
	};

	get deprecatedStateMapping()
	{
		return {showKeyColumn: this.handleShowKeyColumn};
	}

	handleShowKeyColumn = (value: boolean) =>
	{
		if (value)
		{
			let keyCols = this.columns.getObjects(weavejs.data.column.KeyColumn); 
			if (keyCols.length == 0)
			{
				let nameOrder:string[] = this.columns.getNames();
				this.columns.requestObject(null, weavejs.data.column.KeyColumn);
				this.columns.setNameOrder(nameOrder);
			}
		}
		else
		{
			let keyColNames = this.columns.getNames(weavejs.data.column.KeyColumn); 
			for (let keyColName of keyColNames)
			{
				this.columns.removeObject(keyColName);
			}
		}
	};

	get keyColumnShown():boolean
	{
		let keyCols = this.columns.getObjects(weavejs.data.column.KeyColumn);
		return keyCols.length > 0;
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
				click: () => this.attributeColumnTable.moveSelectedToTop()
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

	static MAX_DEFAULT_COLUMNS = 10;
	initSelectableAttributes(input:(IAttributeColumn | IColumnReference)[]):void
	{
		input.slice(0, TableTool.MAX_DEFAULT_COLUMNS)
			.forEach((item, i) => ColumnUtils.initSelectableAttribute(this.columns, item, i == 0));
	}

	getSelectableAttributesEditor(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any)=>void = null):React.ReactChild[][]
	{
		return renderSelectableAttributes(this.selectableAttributes, pushCrumb);
	}

	getDisplayEditor(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any )=>void):React.ReactChild[][]
	{
		return [
					[Weave.lang("Show Key Column"),<Checkbox label={" "} onChange={this.handleShowKeyColumn} value={this.keyColumnShown}/>],
					[Weave.lang("Show Heat Map"),<Checkbox label={" "} ref={linkReactStateRef(this, { value: this.enableHeatMap })}/>],
					[Weave.lang("Override Min - Max"),<Checkbox label={" "} ref={linkReactStateRef(this, { value: this.overrideMinMax })}/>],
					[Weave.lang("Table Min - Max"),
						<HBox padded={true}>
							<StatefulTextField type="number" style={{textAlign: "center", minWidth: 60}} ref={linkReactStateRef(this, {value: this.tableMinValue })}/>
							<StatefulTextField type="number" style={{textAlign: "center", minWidth: 60}} ref={linkReactStateRef(this, {value: this.tableMaxValue})}/>
						</HBox>
					],
					[Weave.lang("Color theme"),
						<ColorRampEditor
							compact={true}
							colorRamp={this.heatMapColors}
							pushCrumb={ pushCrumb }
						/>
					]
				];
	}


	renderEditor =(pushCrumb:(title:string,renderFn:()=>JSX.Element , stateObject:any )=>void):JSX.Element =>
	{
		return Accordion.render(
			[Weave.lang("Data"), this.getSelectableAttributesEditor(pushCrumb)],
			[Weave.lang("Display"),this.getDisplayEditor(pushCrumb)],
			[Weave.lang("Titles"), this.getTitlesEditor()]
		);

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
	};

	getCellValue = (row:IQualifiedKey, columnKey:string):React.ReactChild =>
	{
		if (columnKey === null)
		{
			return row.toString();
		}
		else
		{
			let column = this.columns.getObject(columnKey) as IAttributeColumn;
			return column.getValueFromKey(row, String);
		}
	};

	getColumnTitle = (columnKey:string):React.ReactChild =>
	{
		if (columnKey === null)
		{
			return Weave.lang("Key");
		}
		else
		{
			let column = this.columns.getObject(columnKey) as IAttributeColumn;
			return column && column.getMetadata(weavejs.api.data.ColumnMetadata.TITLE);
		}
	};

	render()
	{
		var columnNames = this.columns.getNames(IAttributeColumn);
		if (weavejs.WeaveAPI.Locale.reverseLayout)
			columnNames.reverse();

		return (
			<AttributeColumnTable
				columnTitles={this.getColumnTitle}
				rows={this.filteredKeySet.keys}
				idProperty={(key)=>key.toString()}
				getCellValue={this.getCellValue}
				selectedIds={this.selectionKeySet && this.selectionKeySet.keys.map(String) as any}
				probedIds={this.probeKeySet && this.probeKeySet.keys.map(String) as any}
				sortId={columnNames[this.sortFieldIndex.value]}
				sortDirection={this.sortInDescendingOrder.value == true ? SortTypes.DESC : SortTypes.ASC}
				onHover={this.handleProbe}
				onSelection={this.handleSelection}
				onCellDoubleClick={this.handleCellDoubleClick}
				columnIds={columnNames}
				rowHeight={this.rowHeight.value}
				headerHeight={this.headerHeight.value}
				initialColumnWidth={this.columnWidth.value}
				evenlyExpandRows={true}
				allowResizing={true}
				onSortCallback={this.onSort}
				colorRamp={this.heatMapColors}
				enableHeatMap={this.enableHeatMap.value}
				tableMin={this.tableMinValue.value}
				tableMax={this.tableMaxValue.value}
				ref={(c: AttributeColumnTable) => { this.attributeColumnTable = c } }
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
