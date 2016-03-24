import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";

import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {round} from "d3";
import ReactBootstrapTable from "../react-bootstrap-datatable/ReactBootstrapTable";
import {IRow} from "../react-bootstrap-datatable/TableRow";
import AbstractVisTool from "./AbstractVisTool";
import Menu from "../react-ui/Menu";
import {MenuItemProps, IGetMenuItems} from "../react-ui/Menu";
import MiscUtils from "../utils/MiscUtils";
import FixedDataTable from "./FixedDataTable";

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

export interface IDataTableState extends IVisToolState
{
    data:IRow[],
    columnTitles:{[columnId:string]: string},
	columnIds:string[]
}

export default class TableTool extends React.Component<IVisToolProps, IDataTableState> implements IVisTool
{
    columns = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
	
	sortFieldIndex = Weave.linkableChild(this, new LinkableNumber(0));
	columnWidth = Weave.linkableChild(this, new LinkableNumber(85));
	rowHeight = Weave.linkableChild(this, new LinkableNumber(30));
	headerHeight = Weave.linkableChild(this, new LinkableNumber(50));
	sortInDescendingOrder = Weave.linkableChild(this, new LinkableBoolean(false));

    panelTitle = Weave.linkableChild(this, new LinkableString);
	
    selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
    probeFilter = Weave.linkableChild(this, DynamicKeyFilter);
    filteredKeySet = Weave.linkableChild(this, FilteredKeySet);

    private get selectionKeySet() { return this.selectionFilter.getInternalKeyFilter() as KeySet; }
    private get probeKeySet() { return this.probeFilter.getInternalKeyFilter() as KeySet; }
	
	idProperty:string = ''; // won't conflict with any column name
	private element:HTMLElement;
	private secondRender = false;

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
			columnIds: []
        };
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
    {
		this.element = ReactDOM.findDOMNode(this) as HTMLElement;

		if (this.secondRender)
		{
			this.secondRender = false;
		}
		else
		{
			this.secondRender = true;
			this.forceUpdate();
		}
    }

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
        columnTitles[this.idProperty] = Weave.lang("Key");

        this.setState({
            data: records,
            columnTitles,
			columnIds: names
        });
    }

    // customFormat(cell, row)
	// {
    //     if (typeof cell === "number")
    //         return round(cell, 2)
    //     else
    //         return cell;
    // }

    setProbe=(ids:IQualifiedKey[]) =>
    {
        this.probeKeySet.replaceKeys(ids)
    };

	clearProbe=() =>
	{
		this.probeKeySet.clearKeys();
	};

    handleSelection=(ids:IQualifiedKey[]) =>
    {
        this.selectionKeySet.replaceKeys(ids);
    };

    render()
    {
		return(
			<FixedDataTable
				columnTitles={this.state.columnTitles}
				rows={this.state.data}
				idProperty={this.idProperty}
				striped={true}
				hover={true}
				bordered={true}
				condensed={true}
				selectedIds={this.selectionKeySet ? this.selectionKeySet.keys as QKey[] : []}
				probedIds={this.probeKeySet ? this.probeKeySet.keys as QKey[] : []}
				onProbeOver={this.setProbe}
				onProbeOut={this.clearProbe}
				onSelection={this.handleSelection}
				showIdColumn={false}
				columnIds={this.state.columnIds}
				width={this.secondRender ? this.element.clientWidth:0}
				height={this.secondRender ? this.element.clientHeight:0}
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
