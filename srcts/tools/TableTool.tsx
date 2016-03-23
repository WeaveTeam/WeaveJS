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

export interface IDataTableState extends IVisToolState
{
    data:IRow[],
    columnTitles:{[columnId:string]: string}
}

export default class TableTool extends React.Component<IVisToolProps, IDataTableState> implements IVisTool
{
    columns = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
	
	sortFieldIndex = Weave.linkableChild(this, new LinkableNumber(0));
	sortInDescendingOrder = Weave.linkableChild(this, new LinkableBoolean(false));

    panelTitle = Weave.linkableChild(this, new LinkableString);
	
    selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
    probeFilter = Weave.linkableChild(this, DynamicKeyFilter);
    filteredKeySet = Weave.linkableChild(this, FilteredKeySet);

    private get selectionKeySet() { return this.selectionFilter.getInternalKeyFilter() as KeySet; }
    private get probeKeySet() { return this.probeFilter.getInternalKeyFilter() as KeySet; }
	
	idProperty:string = ''; // won't conflict with any column name

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
            columnTitles: {}
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
            columnTitles
        });
    }

    // customFormat(cell, row)
	// {
    //     if (typeof cell === "number")
    //         return round(cell, 2)
    //     else
    //         return cell;
    // }

    handleProbe(ids:IQualifiedKey[])
    {
        this.probeKeySet.replaceKeys(ids)
    }

    handleSelection(ids:IQualifiedKey[])
    {
        this.selectionKeySet.replaceKeys(ids);
    }

    render()
    {
        return <ReactBootstrapTable columnTitles={this.state.columnTitles}
                                    rows={this.state.data}
                                    idProperty={this.idProperty}
                                    selectedIds={this.selectionKeySet ? this.selectionKeySet.keys as any[] as string[] : []}
                                    probedIds={this.probeKeySet ? this.probeKeySet.keys as any[] as string[] : []}
                                    onProbe={this.handleProbe.bind(this)}
                                    onSelection={this.handleSelection.bind(this)}
                />
    }
}

Weave.registerClass("weavejs.tool.Table", TableTool, [weavejs.api.ui.IVisTool_Utility, weavejs.api.core.ILinkableObjectWithNewProperties], "Table");
Weave.registerClass("weave.visualization.tools::TableTool", TableTool);
Weave.registerClass("weave.visualization.tools::AdvancedTableTool", TableTool);
