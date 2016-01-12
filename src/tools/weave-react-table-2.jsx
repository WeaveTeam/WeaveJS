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

    customFormat(cell, row) {
        if(typeof cell === "number") {
            return round(cell, 2)
        } else {
            return cell;
        }
    }

    handleProbe(id) {
        this.toolPath.probe_keyset.setKeys(id);
    }

    handleSelection(id) {
        this.toolPath.push("selectionKeySet", null).setKeys(id);
    }

    render() {

        var columns = {};

        columns.id = "Key";

        this.columnsPath.getChildren().forEach((columnPath) => {
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
