import React from "react";
import * as bs from "react-bootstrap";
import _ from "lodash";
import {registerToolImplementation} from "./WeaveTool.jsx";

var inputStyle = {
    flex: 1,
    paddingLeft: 4,
    paddingRight: 4
};


var searchButtonStyle = {
    flex: 1
};

var glyphStyle = {
    fontSize: "12px"
};

export default class CustomSearchTool extends React.Component {


    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    handleSearch() {
        
    }

    render() {
        var items = [1, 2, 3, 4, 5];

        return (
            <div>
                <SearchBar searchHandler={this.handleSearch.bind(this)}/>
                <List items={items}/>
            </div>
        );
    }
}

class SearchBar extends React.Component {
    
    render() {
        return (
            <div className="bar bar-standard bar-header-secondary">
                <input type="search" ref="searchKey" onChange={this.props.searchHandler} value={this.props.searchKey}/>
            </div>

        );
    }
}

class ListItem extends React.Component {

    render() {
        return (
            <li>
                <a href={{}}>
                    First Name, Last Name
                    <p> Contact title </p>
                </a>
            </li>
        );

    }
}

class List extends React.Component {

    render() {
        var items = this.props.items.map(function (item, index) {
            return (
                <ListItem key={index}/>
            );
        });

        return (
            <ul>
                {items}
            </ul>
        );
    }
}

registerToolImplementation("CustomSearchTool", CustomSearchTool);
