import React from "react";
import * as bs from "react-bootstrap";
import _ from "lodash";
import {registerToolImplementation} from "./WeaveTool.jsx";

var inputStyle = {
    flex: 1,
    paddingLeft: 4,
    paddingRight: 4
};

var separatorStyle = {
    background: "#000",
    opacity: .3,
    boxSizing: "border-box",
    backgroundClip: "padding",
    height: "1px",
    width: "100%"
};

var searchButtonStyle = {
    flex: 1
};

var glyphStyle = {
    fontSize: "12px"
};

export default class CustomListView extends React.Component {


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
                <div style={separatorStyle}/>
                <List items={items}/>
            </div>
        );
    }
}

class SearchBar extends React.Component {

    render() {
        return (
            <bs.Input type="search" ref="searchKey" bsSize="small" onChange={this.props.searchHandler} value={this.props.searchKey}/>
        );
    }
}

class ListItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hovered: false
        };
    }

    toggleHover(bool) {
        this.setState({
            hovered: bool
        });
    }

    render() {
        var style = {
                        display: "flex",
                        flexDirection: "row",
                        backgroundColor: this.state.hovered ? "#EBEBEB" : "white"
                    };

        var contactIcon = {
            flex: 1,
            backgroundColor: this.state.hovered ? "#EBEBEB" : "white",
            backgroundImage: "url(img/contact-icon.png)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center"
        };

        return (
            <div style={style} onMouseOver={this.toggleHover.bind(this, true)} onMouseOut={this.toggleHover.bind(this, false)}>
                <div style={contactIcon}/>
                <div style={{flex: 4, paddingLeft: 4, marginTop: 5}}>
                    <p style={{fontSize: 13, margin: 1}}> First Name, Last Name </p>
                    <p style={{fontSize: 12, margin: 1}}> Contact title </p>
                </div>
            </div>
        );
    }
}

class List extends React.Component {

    render() {
        var items = this.props.items.map(function (item, index) {
            return (
                <div key={index}>
                    <ListItem/>
                    <div style={separatorStyle}/>
                </div>
            );
        });

        return (
            <div>
                {items}
            </div>
        );
    }
}

// registerToolImplementation("CustomListView", CustomListView);
