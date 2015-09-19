import React from "react";
import * as bs from "react-bootstrap";
import _ from "lodash";

var customSearchStyle = {
    display: "flex",
    flexDirection: "row"
};

var inputStyle = {
    flex: 1,
    paddingLeft: 4
};


var searchButtonStyle = {
    flex: 1
};

var glyphStyle = {
    paddingLeft: "5px",
    fontSize: "12px"
};

export default class CustomSearchTool extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            searchObject: {}
        };
        this.searchFields = this.props.searchFields;
    }

    componentDidUpdate() {
        this.props.handleSearch();
    }

    updateState(field) {
        var components = _.clone(this.state.searchObject);
        components[field] = this.refs[field].getInputDOMNode().value;
        this.setState({
            searchObject: components
        });
    }

    removeSearchOption(key) {
        var components = _.clone(this.state.searchObject);
        delete components[key];
        this.setState({
            searchObject: components
        });
    }

    handleDropdownSelect (event, eventKey){
        var components = _.clone(this.state.searchObject);
        components[eventKey] = this.state.searchObject[eventKey] || "";
        this.setState({
            searchObject: components
        });
    }

    render() {

        var menuItems = this.searchFields.map((searchField, index) => {
            return <bs.MenuItem key={index} eventKey={searchField.key}> {searchField.label} </bs.MenuItem>;
        });

        var inputs = [];

        for(var i in this.searchFields) {
            var field = this.searchFields[i].key;
            if(this.state.searchObject.hasOwnProperty(field)) {
                var buttonBefore = <bs.Button key={"button" + i}>
                                            {this.searchFields[i].label}
                                            <bs.Glyphicon glyph="remove" style={glyphStyle} onClick={this.removeSearchOption.bind(this, field)}/>
                                    </bs.Button>;
                var searchInput = <div style={inputStyle} key={"searchInput" + i}>
                                    <bs.Input
                                        value={this.state.searchObject[field]}
                                        ref={field}
                                        type="text"
                                        buttonBefore={buttonBefore}
                                        hasFeedback={true}
                                        placeholder={"Enter " + this.searchFields[i].label}
                                        onChange={this.updateState.bind(this, field)}>
                                    </bs.Input>
                                   </div>;
                inputs.push(searchInput);
            }
        }
        return (
            <div style={customSearchStyle}>
                <bs.Dropdown title="Dropdown" id="" onSelect={this.handleDropdownSelect.bind(this)}>
                    <bs.Dropdown.Toggle>
                        <bs.Glyphicon glyph="search"/>
                        Search
                    </bs.Dropdown.Toggle>
                    <bs.Dropdown.Menu>
                        {menuItems}
                    </bs.Dropdown.Menu>
                </bs.Dropdown>
                {
                    inputs
                }
            </div>
        );
    }
}
