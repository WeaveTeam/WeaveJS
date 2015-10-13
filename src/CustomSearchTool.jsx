import React from "react";
import * as bs from "react-bootstrap";
import _ from "lodash";
import {registerToolImplementation} from "./WeaveTool.jsx";

var customSearchStyle = {
    display: "flex",
    flexDirection: "row"
};

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

        this.state = {
            searchObject: this.props.toolPath.getState("searchValues")
        };
        this.searchFields = this.props.toolPath.getState("searchFields");
    }

    componentDidMount() {
        this.props.toolPath.addCallback(this.handleWeaveState.bind(this), true, false);
        this.props.toolPath.push("searchFields").addCallback(() => {
            this.searchFields = this.props.toolPath.getState("searchFields");
        }, true);
    }

    handleWeaveState() {
        this.setState({
            searchObject: this.props.toolPath.getState("searchValues")
        });
    }

    componentDidUpdate() {
        this.props.toolPath.state("searchValues", this.state.searchObject);
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
            return <bs.MenuItem key={index} eventKey={searchField}> {searchField} </bs.MenuItem>;
        });

        var inputs = [];

        for(var i in this.searchFields) {
            var field = this.searchFields[i];
            if(this.state.searchObject.hasOwnProperty(field)) {

                var closeButton = <bs.Button key={"close" + i} onClick={this.removeSearchOption.bind(this, field)} bsSize={this.props.bsSize}>
                                            <bs.Glyphicon glyph="remove" style={glyphStyle}/>
                                  </bs.Button>;

                var searchInput = <div style={inputStyle} key={"searchInput" + i}>
                                    <bs.Input
                                        bsSize={this.props.bsSize}
                                        value={this.state.searchObject[field]}
                                        ref={field}
                                        type="text"
                                        addonBefore={this.searchFields[i]}
                                        buttonAfter={closeButton}
                                        hasFeedback={true}
                                        placeholder={"Enter " + this.searchFields[i]}
                                        onChange={this.updateState.bind(this, field)}>
                                    </bs.Input>
                                   </div>;
                inputs.push(searchInput);
            }
        }
        return (
            <div style={customSearchStyle}>
                <bs.Dropdown title="Dropdown" bsSize={this.props.bsSize} bsStyle="primary" id="" onSelect={this.handleDropdownSelect.bind(this)}>
                    <bs.Dropdown.Toggle bsStyle="primary">
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

registerToolImplementation("CustomSearchTool", CustomSearchTool);
