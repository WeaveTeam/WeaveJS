import {registerToolImplementation} from "../WeaveTool.jsx";
import _ from "lodash";
import React from "react";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
//import ReactDataGrid from "react-datagrid";
import AbstractWeaveTool from "./AbstractWeaveTool.jsx";

class WeaveReactTable extends AbstractWeaveTool {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        super.componentDidMount();
        React.render(
            <DataTable toolPath={this.toolPath}/>, this.element);
    }
}

class DataTable extends React.Component {

    constructor(props) {
        super(props);
        this.toolPath = props.toolPath;
        this._columnsPath = this.toolPath.push("columns");

        this.forceUpdate = this.forceUpdate.bind(this);
    }

    componentDidMount() {
        this._columnsPath.addCallback(this.forceUpdate, true, false);
        this.toolPath.push("filteredKeySet").addCallback(this.forceUpdate, true, false);
        this.toolPath.push("selectionKeySet").addCallback(this._selectionKeysChanged.bind(this), true, false);
    }
    _selectionKeysChanged () {
        // var keys = this.toolPath.push("selectionKeySet", null).getKeys();
        // var selection = {};
        // keys.forEach((key) => {
        //     selection[key] = {};
        // });
        // this.setState({
        //     selected: selection
        // });
    }

    onSelectionChange(selectedIds) {
        this.setState({
            selected: selectedIds
        });
        this.toolPath.push("selectionKeySet", null).setKeys(_.keys(selectedIds));
    }

    render() {
        var data = this._columnsPath.retrieveRecords(this._columnsPath.getNames(), this.toolPath.push("filteredKeySet")) || [];
        var columns = this._columnsPath.getChildren().map((columnPath) => {
                        return {
                            name: columnPath.getPath().pop(),
                            title: columnPath.getValue("getMetadata('title')")
                        };
                    });
        columns.push({
          name: "id",
          title: "id"
        });

        var columnHeaders = columns.map((column, index) => {
          return <TableHeaderColumn dataField={column.name} key={index} dataAlign="left" dataSort={true}>column.title</TableHeaderColumn>;
        });

        return <BootstrapTable data={data} keyField="id" striped={true} hover={true}>
                  {
                    columnHeaders
                  }
                </BootstrapTable>;
    }
}

export default WeaveReactTable;

registerToolImplementation("weave.visualization.tools::TableTool", WeaveReactTable);
