/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>


import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";

import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {round} from "d3";
import ReactBootstrapTable from "../react-bootstrap-datatable/ReactBootStrapTable";

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
    data:{[key:string]: string}[]
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
            data: []
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
        this.setState({
            data: (Weave.getPath(this.columns) as WeavePathData).retrieveRecords(this.columns.getNames(), {keySet: Weave.getPath(this.filteredKeySet), dataType: "string"})
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
        var columnTitles:{[columnId:string]: string} = {};

        columnTitles["id"] = "Key";

        this.columns.getObjects().forEach((column:IAttributeColumn) => {
            var columnId:string = (Weave.getPath(column).pop() as any);
            columnTitles[columnId] = column.getMetadata("title");
        });

        return <ReactBootstrapTable columnTitles={columnTitles}
                                    rows={this.state.data}
                                    idProperty="id"
                                    height={this.props.style.height}
                                    striped={true}
                                    hover={true}
                                    bordered={true}
                                    condensed={true}
                                    selectedIds={this.selectionKeySet.keys}
                                    probedIds={this.probeKeySet.keys}
                                    onProbe={this.handleProbe.bind(this)}
                                    onSelection={this.handleSelection.bind(this)}
                                    showIdColumn={false}
                />
    }
}

weavejs.util.BackwardsCompatibility.forceDeprecatedState(WeaveReactTable); // TEMPORARY HACK - remove when class is refactored

Weave.registerClass("weavejs.tool.Table", WeaveReactTable, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::TableTool", WeaveReactTable);
