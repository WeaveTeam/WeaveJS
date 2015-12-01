import {registerToolImplementation} from "../WeaveTool.jsx";
import _ from "lodash";
import React from "react";
import ReactDataGrid from "react-datagrid";
import AbstractWeaveTool from "./AbstractWeaveTool.jsx";

class WeaveReactTable extends AbstractWeaveTool {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        super.componentDidMount();
        React.render(
            <DataGrid toolPath={this.toolPath} element={this.element} />, this.element);
    }
}

class DataGrid extends React.Component {

    constructor(props) {
        super(props);
        this.toolPath = props.toolPath;
        this._columnsPath = this.toolPath.push("columns");

        this._setupCallbacks();

        this.state = {
            columns: [],
            rows: [],
            selected: {}
        };

        this.toolPath.push("selectionKeySet").addCallback(this._selectionKeysChanged.bind(this), true, false);
    }

    onColumnResize(firstCol, firstSize) {
        firstCol.width = firstSize;
        // this.setState({});
    }

    _selectionKeysChanged () {
        var keys = this.toolPath.push("selectionKeySet", null).getKeys();
        var selection = {};
        keys.forEach((key) => {
            selection[key] = {};
        });
        this.setState({
            selected: selection
        });
    }

    _setupCallbacks() {
        var dataChanged = _.debounce(this._dataChanged.bind(this), 100);
        this._columnsPath.addCallback(dataChanged, true, false);
        this.toolPath.push("filteredKeySet").addCallback(dataChanged, true, false);
    }

    _dataChanged() {

        var records = this._columnsPath.retrieveRecords(this._columnsPath.getNames(), this.toolPath.push("filteredKeySet"));
        var columns = this._columnsPath.getChildren().map((columnPath) => {
                        return {
                            name: columnPath.getPath().pop(),
                            title: columnPath.getValue("getMetadata('title')")
                        };
                    });
        this.setState({records, columns});
    }

    onSelectionChange(selectedIds) {
        this.setState({
            selected: selectedIds
        });
        this.toolPath.push("selectionKeySet", null).setKeys(_.keys(selectedIds));
    }

    render() {
        return <ReactDataGrid
                        ref="grid"
                        idProperty="id"
                        dataSource={this.state.records}
                        columns={this.state.columns}
                        style={{height: this.props.element.clientHeight}}
                        onColumnResize={this.onColumnResize.bind(this)}
                        selected={this.state.selected}
                        rowStyle={this.rowStyle}
                        onSelectionChange={this.onSelectionChange.bind(this)}
                        showCellBorders={"vertical"}>
                </ReactDataGrid>;
    }
}

export default WeaveReactTable;

registerToolImplementation("weave.visualization.tools::TableTool", WeaveReactTable);
