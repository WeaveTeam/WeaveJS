import d3 from "d3";
import c3 from "c3";
import {registerToolImplementation} from "./WeaveTool.jsx";
import _ from "lodash";
import React from "react";
import ReactDataGrid from "react-datagrid";

export default class WeaveReactTable {
    constructor(element, toolPath) {
        this.element = element;
        this._toolPath = toolPath;
        React.render(
            <DataGrid toolPath={this._toolPath} />, this.element);

    }

    _updateContents() {

    }

    destroy() {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
    }
}

class DataGrid extends React.Component {

    constructor(props) {
        super(props);
        this._toolPath = props.toolPath;
        this._columnsPath = this._toolPath.push("columns");

        this._setupCallbacks();

        this.state = {
            columns: [],
            rows: []
        };

        this._toolPath.push("selectionKeySet").addCallback(this._selectionKeysChanged.bind(this), true, false);

        this.SELECTED_ID = {};
    }

    onColumnResize(firstCol, firstSize) {
        firstCol.width = firstSize;
        this.setState({});
    }

    _selectionKeysChanged () {
        var keys = this._toolPath.push("selectionKeySet", null).getKeys();
        this.SELECTED_ID = keys;
        this.refs.grid.setState({
            selected: keys
        });
        console.log(this.refs.grid);
        // var indices = keys.map((key) => {
        //     return Number(this.keyToIndex[key]);
        // });
    }

    _setupCallbacks() {
        var dataChanged = _.debounce(this._dataChanged.bind(this), 100);
        this._columnsPath.addCallback(dataChanged, true, false);
        opener.weave.path("defaultSubsetKeyFilter").addCallback(dataChanged, true, false);
    }

    _dataChanged() {

        var records = this._columnsPath.retrieveRecords(this._columnsPath.getNames(), opener.weave.path("defaultSubsetKeyFilter"));
        var columns = this._columnsPath.getChildren().map((columnPath) => {
                        return {
                            name: columnPath.getPath().pop(),
                            title: columnPath.getValue("getMetadata('title')")
                        };
                    });
        this.setState({records, columns});
    }

    onSelectionChange(selectedIds) {
        this._toolPath.push("selectionKeySet", null).setKeys(selectedIds);
    }

    render() {
        return <ReactDataGrid
                    ref="grid"
                    idProperty="id"
                    dataSource={this.state.records}
                    columns={this.state.columns}
                    style={{height: 400}}
                    onColumnResize={this.onColumnResize.bind(this)}
                    selected={this.SELECTED_ID}
                    onSelectionChange={this.onSelectionChange.bind(this)}
                    showCellBorders={true}/>;
    }
}

registerToolImplementation("weave.visualization.tools::TableTool", WeaveReactTable);
