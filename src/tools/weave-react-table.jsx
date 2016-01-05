import {registerToolImplementation} from "../../outts/WeaveTool.jsx";
import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import {round} from "d3";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
//import ReactDataGrid from "react-datagrid";
import AbstractWeaveTool from "../../outts/tools/AbstractWeaveTool.jsx";

class WeaveReactTable extends AbstractWeaveTool {
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        var elementSize = this.element ? this.getElementSize() : null;
        ReactDOM.render(
            <DataTable toolPath={this.toolPath} width={elementSize.width + "px"} height={elementSize.height + "px"}/>
        , this.element);
    }
}

class DataTable extends React.Component {

    constructor(props) {
        super(props);
        this.toolPath = props.toolPath;
        this._columnsPath = this.toolPath.push("columns");
    }

    componentDidMount() {
        this._columnsPath.addCallback(this, _.debounce(this.forceUpdate.bind(this), 0), true, false);
        this.toolPath.push("filteredKeySet").addCallback(this, _.debounce(this.forceUpdate.bind(this), 0), true, false);
        this.toolPath.push("selectionKeySet").addCallback(this, this._selectionKeysChanged, true, false);
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

    customFormat(cell, row) {
        if(typeof cell === "number") {
            return round(cell, 2)
        } else {
            return cell;
        }
    }

    render() {
        var data = this._columnsPath.retrieveRecords(this._columnsPath.getNames(), this.toolPath.push("filteredKeySet")) || [];

        var columns = this._columnsPath.getChildren().map((columnPath) => {
            return {
                name: columnPath.getPath().pop(),
                title: columnPath.getValue("this.getMetadata('title')")
            };
        });

        columns.push({
            name: "id",
            title: "id"
        });

        //var columnWidth = this.props.container.clientWidth / columns.length;

        var columnHeaders = columns.map((column, index) => {
          return <TableHeaderColumn dataField={column.name} key={index} dataAlign="left" dataFormat={this.customFormat} dataSort={true}>{column.title}</TableHeaderColumn>;
        });

        return <BootstrapTable data={data} keyField="id" striped={true} hover={true} width={this.props.width} height={this.props.height}>
                  {
                    columnHeaders
                  }
                </BootstrapTable>;
    }
}

export default WeaveReactTable;

registerToolImplementation("weave.visualization.tools::TableTool", WeaveReactTable);
