import $ from "jquery";
import React from "react";
import Layout from "./react-flexible-layout/Layout.jsx";
import {WeaveLayoutManager} from "./WeaveLayoutManager.jsx";
import DataGrid from "./DataGrid.jsx";
import CustomSearchTool from "./CustomSearchTool.jsx";
import WeaveReactTable from "./weave-react-table.jsx";
import Weave from "./Weave.jsx";
import _ from "lodash";

var tableContainer = {
    flex: 1
};

var leftPaneStyle = {
    display: "flex",
    flexDirection: "column"
};

export default class App extends React.Component {

    constructor(props) {
        super(props);

        window.weaveReady = () => {
            this.handleWeaveReady();
        };

        this.tables = {
            "Practitioners": ["TableTool", "columns"],
            "Patients": ["TableTool2", "columns"],
            "Prescriptions": ["TableTool3", "columns"]
        };

        this.searchFields = [{key: "FirstName", label: "First Name"}, {key: "MiddleName", label: "Middle Name"},
                            {key: "LastName", label: "Last Name"}, {key: "Specialization", label: "Specialization"},
                            {key: "CountyFIPS", label: "FIPS"}];
    }

    handleSearch() {
        if(this.weave) {
            var weavePath = this.weave.path();
            weavePath.push("practitionerSearch").state(this.refs.searchTool.state.searchObject);
        }
        // function getColumns(columnPath) {
        //     let column = columnPath.getState();
        //     return {
        //         name: columnPath.getPath().pop(),
        //         title: column.metadata.title
        //     };
        // }

        // for(var key in this.tables) {
        //     var tabletoolPath = this.weave.path(this.tables[key]);
        //     var records = tabletoolPath.retrieveRecords(tabletoolPath);
        //     var columns = tabletoolPath.getChildren().map(getColumns);
        //     this.refs[key].setState({
        //         records: records,
        //         id: "id",
        //         columnNames: columns

        //     });
        // }
    }

    componentDidMount() {
        this.reactReady = true;
    }

    handleWeaveReady() {
        if(!this.weave) {
            this.weave = document.getElementById("weave");
        }
        if(this.reactReady) {
            this.weave.path("practitionerSearch").request("LinkableVariable").addCallback(this.getSearchableFields.bind(this), true, false);
        } else {
            setTimeout(this.handleWeaveReady.bind(this), 200);
        }
    }

    getSearchableFields() {
        this.refs.searchTool.setState({
            searchObject: this.weave.path("practitionerSearch").getState()
        });
    }

    componentWillUnmount() {

    }

    render() {

        var datagrids = [];
        for(var key in this.tables) {
            datagrids.push(<div key={key} style={tableContainer}>{key}<DataGrid key={key} ref={key}/></div>);
        }

        return (
            <div style = { {display: "flex", flexDirection: "column"} }>
                <CustomSearchTool ref="searchTool" searchFields={this.searchFields} handleSearch={_.debounce(this.handleSearch.bind(this), 100)}/>
                <Weave/>
            </div>
        );
                     // <div style={ {flex: 40} }>
                     //    <div style={leftPaneStyle} ref="datagrids">
                     //        {datagrids}
                     //    </div>
                     // </div>
    }
}
