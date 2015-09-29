import {registerToolImplementation} from "./WeaveTool.jsx";
import _ from "lodash";
import React from "react";
import ReactDataGrid from "react-datagrid";
import AbstractWeaveTool from "./AbstractWeaveTool";

export default class WeaveReactTable extends AbstractWeaveTool {
    constructor(props) {
        super(props);
        React.render(
            <DataGrid toolPath={this.toolPath} />, this.element);
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
        this.setState({
            selected: keys && keys.length ? keys[0] : {}
        });
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
                            title: columnPath.getValue("getMetadata('title')"),
                            width: 50
                        };
                    });
        this.setState({records, columns});
    }

    onSelectionChange(selectedIds) {
        console.log("selection changed", selectedIds);
        // this.toolPath.push("selectionKeySet", null).setKeys(selectedIds);
    }

    render() {
        console.log("rendered called", this.state.selected);
        return <ReactDataGrid
                    ref="grid"
                    idProperty="id"
                    dataSource={this.state.records}
                    columns={this.state.columns}
                    style={{height: 400}}
                    onColumnResize={this.onColumnResize.bind(this)}
                    selected={this.state.selected}
                    onSelectionChange={this.onSelectionChange.bind(this)}
                    showCellBorders={true}/>;
    }
}

registerToolImplementation("weave.visualization.tools::TableTool", WeaveReactTable);
