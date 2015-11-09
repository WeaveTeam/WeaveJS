import React from "react";
import ReactDataGrid from "react-datagrid";

var DEFAULTHEIGHT = 300;

class DataGrid extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            keyColumn: "",
            records: [],
            columnNames: []
        };
    }

    render() {
        return <ReactDataGrid
                    ref="grid"
                    idProperty="id"
                    dataSource={this.state.records}
                    columns={this.state.columnNames}
                    style={{height: this.props.height || DEFAULTHEIGHT}}
                    /*onColumnResize={this.onColumnResize.bind(this)}*/
                    /*onSelectionChange={this.onSelectionChange.bind(this)}*/
                    showCellBorders={true}/>;
    }
}

export default DataGrid;
