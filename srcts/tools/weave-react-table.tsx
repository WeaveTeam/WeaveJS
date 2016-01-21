/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>
/// <reference path="../../typings/weave/WeavePath.d.ts"/>


import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";

import {registerToolImplementation} from "../WeaveTool";
import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {round} from "d3";
import ReactBootstrapTable from "../react-bootstrap-datatable/ReactBootStrapTable";

interface IDataTableState extends IVisToolState {
    data:{[key:string]: string}[]
}

class WeaveReactTable extends React.Component<IVisToolProps, IDataTableState> implements IVisTool {

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
        this.toolPath.probe_keyset.addCallback(this, this.forceUpdate, true);

        this.toolPath.getObject("filteredKeySet").setColumnKeySources(this.toolPath.getObject("columns").getObjects());
    }

    componentDidUpdate() {

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
            columns[columnPath.getPath().pop()] = columnPath.getObject().getMetadata('title');
        });

        return <ReactBootstrapTable columnTitles={columns}
                                    rows={this.state.data}
                                    idProperty="id"
                                    height={this.props.style.height}
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
//Weave.registerClass("weavejs.tools.TableTool", WeaveReactTable, [weavejs.api.core.ILinkableObjectWithNewProperties]);
