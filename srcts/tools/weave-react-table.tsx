/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>


import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";

import {registerToolImplementation} from "../WeaveTool";
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

export interface IDataTableState extends IVisToolState {
    data:{[key:string]: string}[]
}

export default class WeaveReactTable extends React.Component<IVisToolProps, IDataTableState> implements IVisTool {

    private toolPath:WeavePath;
    private columnsPath:WeavePath;

    constructor(props:IVisToolProps) {
        super(props);
        this.toolPath = props.toolPath;
        this.columnsPath = this.toolPath.push("columns");
        this.state = {
            data: []
        };
    }

    protected handleMissingSessionStateProperties(newState:any)
	{

	}

    get title():string {
       return (this.toolPath.getType('panelTitle') ? this.toolPath.getState('panelTitle') : '') || this.toolPath.getPath().pop();
    }

    componentDidMount() {
        this.columnsPath.addCallback(this, this.dataChanged, true);
        this.toolPath.push("filteredKeySet").addCallback(this, this.dataChanged, true);
        this.toolPath.push("selectionKeySet").addCallback(this, this.forceUpdate, true);
        (this.toolPath as WeavePathData).probe_keyset.addCallback(this, this.forceUpdate, true);

        (this.toolPath.getObject("filteredKeySet") as FilteredKeySet).setColumnKeySources((this.toolPath.getObject("columns") as ILinkableHashMap).getObjects());
    }

    componentDidUpdate() {

    }

    dataChanged() {
        this.setState({
            data: (this.columnsPath as WeavePathData).retrieveRecords(this.columnsPath.getNames(), {keySet: this.toolPath.push("filteredKeySet"), dataType: "string"})
        });
    }

    // customFormat(cell, row) {
    //     if(typeof cell === "number") {
    //         return round(cell, 2)
    //     } else {
    //         return cell;
    //     }
    // }

    handleProbe(ids:string[]) {
        (this.toolPath as WeavePathData).probe_keyset.setKeys(ids);
    }

    handleSelection(ids:string[]) {
        (this.toolPath.push("selectionKeySet", null) as WeavePathData).setKeys(ids);
    }

    render() {

        var columns:{[columnId:string]: string} = {};

        columns["id"] = "Key";

        this.columnsPath.getChildren().forEach((columnPath:WeavePath) => {
            columns[columnPath.getPath().pop()] = (columnPath.getObject() as IAttributeColumn).getMetadata('title');
        });

        return <ReactBootstrapTable columnTitles={columns}
                                    rows={this.state.data}
                                    idProperty="id"
                                    height={this.props.style.height}
                                    striped={true}
                                    hover={true}
                                    bordered={true}
                                    condensed={true}
                                    selectedIds={(this.toolPath.push("selectionKeySet", null) as WeavePathData).getKeys()}
                                    probedIds={(this.toolPath as WeavePathData).probe_keyset.getKeys()}
                                    onProbe={this.handleProbe.bind(this)}
                                    onSelection={this.handleSelection.bind(this)}
                                    showIdColumn={false}
                />
    }
}
registerToolImplementation("weave.visualization.tools::TableTool", WeaveReactTable);
//Weave.registerClass("weavejs.tools.TableTool", WeaveReactTable, [weavejs.api.core.ILinkableObjectWithNewProperties]);
