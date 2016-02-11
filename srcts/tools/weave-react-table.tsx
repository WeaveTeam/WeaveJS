/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>


import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";

import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {round} from "d3";
import ReactBootstrapTable from "../react-bootstrap-datatable/ReactBootstrapTable";
import {IRow} from "../react-bootstrap-datatable/TableRow";

import WeavePath = weavejs.path.WeavePath;
import WeavePathData = weavejs.path.WeavePathData;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableString = weavejs.core.LinkableString;
import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
import ColumnUtils = weavejs.data.ColumnUtils;
import KeySet = weavejs.data.key.KeySet;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;

export interface IDataTableState extends IVisToolState {
    data:IRow[],
    columnTitles:{[columnId:string]: string}
}

export default class WeaveReactTable extends React.Component<IVisToolProps, IDataTableState> implements IVisTool {

    columns:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
    panelTitle:LinkableString = Weave.linkableChild(this, new LinkableString);
    selectionFilter:DynamicKeyFilter = Weave.linkableChild(this, DynamicKeyFilter);
    probeFilter:DynamicKeyFilter = Weave.linkableChild(this, DynamicKeyFilter);
    filteredKeySet:FilteredKeySet = Weave.linkableChild(this, FilteredKeySet);

    private get selectionKeySet() { return this.selectionFilter.getInternalKeyFilter() as KeySet; }
    private get probeKeySet() { return this.probeFilter.getInternalKeyFilter() as KeySet; }

    constructor(props:IVisToolProps) {
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

    protected handleMissingSessionStateProperties(newState:any)
	{

	}

    get title():string {
       return this.panelTitle.value;;
    }

    componentDidMount() {

    }

    componentDidUpdate() {

    }

    dataChanged() {
        this.filteredKeySet.setColumnKeySources(this.columns.getObjects());
        var names:string[] = this.columns.getNames();
        var columns:IAttributeColumn[] = this.columns.getObjects();
        var records:IRow[] = ColumnUtils.getRecords(_.zipObject(names, columns), this.filteredKeySet.keys, String);
		var titles:string[] = columns.map((column:IAttributeColumn) => column.getMetadata("title"));
        var columnTitles = _.zipObject(names, titles) as { [columnId: string]: string; };
        columnTitles["id"] = "Key";

        this.setState({
            data: records,
            columnTitles
        });
    }

    // customFormat(cell, row) {
    //     if(typeof cell === "number") {
    //         return round(cell, 2)
    //     } else {
    //         return cell;
    //     }
    // }

    handleProbe(ids:IQualifiedKey[]) {
        this.probeKeySet.replaceKeys(ids)
    }

    handleSelection(ids:IQualifiedKey[]) {
        this.selectionKeySet.replaceKeys(ids);
    }

    render() {
        return <ReactBootstrapTable columnTitles={this.state.columnTitles}
                                    rows={this.state.data}
                                    idProperty="id"
                                    height={this.props.style.height}
                                    striped={true}
                                    hover={true}
                                    bordered={true}
                                    condensed={true}
                                    selectedIds={this.selectionKeySet ? this.selectionKeySet.keys : []}
                                    probedIds={this.probeKeySet ? this.probeKeySet.keys : []}
                                    onProbe={this.handleProbe.bind(this)}
                                    onSelection={this.handleSelection.bind(this)}
                                    showIdColumn={false}
                />
    }
}

Weave.registerClass("weavejs.tool.Table", WeaveReactTable, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::TableTool", WeaveReactTable);
