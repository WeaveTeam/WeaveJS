/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>
/// <reference path="../../typings/weave/WeavePath.d.ts"/>

import {registerToolImplementation} from "../WeaveTool";
import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {round} from "d3";
import ReactBootstrapTable from "../react-bootstrap-datatable/ReactBootStrapTable";
import AbstractWeaveTool from "./AbstractWeaveTool";
import {IAbstractWeaveToolProps, IAbstractWeaveToolState, ElementSize} from "./AbstractWeaveTool";

class WeaveReactTable extends AbstractWeaveTool {
    constructor(props:IAbstractWeaveToolProps) {
        super(props);
    }

    componentDidUpdate() {
        var newElementSize:ElementSize = this.getElementSize();
        if(!_.isEqual(newElementSize, this.elementSize)) {
            this.elementSize = newElementSize;
            ReactDOM.render(
                <DataTable toolPath={this.toolPath} width={newElementSize.width + "px"} height={newElementSize.height + "px"}/>
                , this.element);
        }
    }
}

interface IDataTableProps {
    toolPath:WeavePath;
    width:string;
    height:string;
}

interface IDataTableState {
    data:{[key:string]: string}[]
}

class DataTable extends React.Component<IDataTableProps, IDataTableState> {

    private toolPath:WeavePath;
    private columnsPath:WeavePath;

    constructor(props:IDataTableProps) {
        super(props);
        this.toolPath = props.toolPath;
        this.columnsPath = this.toolPath.push("columns");
        this.state = {
            data: []
        };
    }

    componentDidMount() {
        this.columnsPath.addCallback(this, this.dataChanged, true);
        this.toolPath.push("filteredKeySet").addCallback(this, this.dataChanged, true);
        this.toolPath.push("selectionKeySet").addCallback(this, this.forceUpdate, true);
        this.toolPath.probe_keyset.addCallback(this, this.forceUpdate, true);
    }

    dataChanged() {
        this.setState({
            data: this.columnsPath.retrieveRecords(this.columnsPath.getNames(), this.toolPath.push("filteredKeySet"))
        });
    }

    // customFormat(cell, row) {
    //     if(typeof cell === "number") {
    //         return round(cell, 2)
    //     } else {
    //         return cell;
    //     }
    // }

    handleProbe(id:string) {
        this.toolPath.probe_keyset.setKeys(id);
    }

    handleSelection(id:string) {
        this.toolPath.push("selectionKeySet", null).setKeys(id);
    }

    render() {

        var columns:{[columnId:string]: string} = {};

        columns["id"] = "Key";

        this.columnsPath.getChildren().forEach((columnPath:WeavePath) => {
            columns[columnPath.getPath().pop()] = columnPath.getValue("this.getMetadata('title')");
        });

        return <ReactBootstrapTable columnTitles={columns}
                                    rows={this.state.data}
                                    idProperty="id"
                                    height={this.props.height}
                                    striped={true}
                                    hover={true}
                                    bordered={true}
                                    condensed={true}
                                    selectedIds={this.toolPath.push("selectionKeySet", null).getKeys()}
                                    probedIds={this.toolPath.probe_keyset.getKeys()}
                                    onProbe={this.handleProbe.bind(this)}
                                    onSelection={this.handleSelection.bind(this)}
                                    showIdColumn={false}
                />
    }
}

export default WeaveReactTable;

registerToolImplementation("weave.visualization.tools::TableTool", WeaveReactTable);
