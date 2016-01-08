import {registerToolImplementation} from "../../outts/WeaveTool.jsx";
import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import {round} from "d3";
import ReactBootstrapTable from "../../outts/react-bootstrap-datatable/ReactBootstrapTable";
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
        this.filteredKeySetChanged = this.forceUpdate.bind(this)
        this.selectionKeySetChanged = this._selectionKeysChanged;
        this.columnsChanged = this.forceUpdate.bind(this);
        this._columnsPath.addCallback(this, this.columnsChanged, true);
        this.toolPath.push("filteredKeySet").addCallback(this, this.filteredKeySetChanged, true);
        this.toolPath.push("selectionKeySet").addCallback(this, this.selectionKeySetChanged, true);
    }

    componentWillUnmount() {
        this._columnsPath.removeCallback(this, this.columnsChanged);
        this.toolPath.push("filteredKeySet").removeCallback(this, this.filteredKeySetChanged);
        this.toolPath.push("selectionKeySet").removeCallback(this, this.selectionKeySetChanged);
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

    onRowSelect(cell, row) {
        this.toolPath.selection_keyset.addKeys([row.id]);
    }

    render() {
        var data = this._columnsPath.retrieveRecords(this._columnsPath.getNames(), this.toolPath.push("filteredKeySet")) || [];

        var columns = {};

        columns.id = "Key";

        this._columnsPath.getChildren().forEach((columnPath) => {
            columns[columnPath.getPath().pop()] = columnPath.getValue("this.getMetadata('title')");
        });

        return <ReactBootstrapTable columnTitles={columns} rows={data} idProperty="id" height={this.props.height} striped={true} hover={true} bordered={true} condensed={true}/>
    }
}

export default WeaveReactTable;

registerToolImplementation("weave.visualization.tools::TableTool", WeaveReactTable);
