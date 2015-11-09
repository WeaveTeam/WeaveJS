import React from "react";
import * as bs from "react-bootstrap";
import _ from "lodash";
import {registerToolImplementation} from "./WeaveTool.jsx";
import DatePicker from "react-date-picker";

var customSearchStyle = {
    display: "flex",
    flexDirection: "row",
    height: 30
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

class CustomSearchTool extends React.Component {


    constructor(props) {
        super(props);

        this.props.toolPath.request("ExternalTool");

        this.state = {
            searchObject: this.props.toolPath.push("searchValues").request("LinkableVariable").getState() || {}
        };
        this.searchFields = this.props.toolPath.push("searchFields").request("LinkableVariable").getState() || [];

        this.updateStateFuncs = {};
        this.searchFields.forEach(function (field) {
            this.updateStateFuncs[field.label] = this.updateState.bind(this, field.label);
        }, this);

        this.debouncedComponentDidUpdate = _.debounce(() => {
            this.props.toolPath.state("searchValues", this.state.searchObject);
        }, 2000);
    }

    componentDidMount() {
        this.props.toolPath.addCallback(this.handleWeaveState.bind(this), true, false);
        this.props.toolPath.push("searchFields").addCallback(() => {
            this.searchFields = this.props.toolPath.getState("searchFields") || [];
            this.updateStateFuncs = {};
            this.searchFields.forEach((field) => {
                this.updateStateFuncs[field.label] = this.updateState.bind(this, field.label);
            }, this);
        }, true);
    }

    handleWeaveState() {
        this.setState({
            searchObject: this.props.toolPath.getState("searchValues") || {}
        });
    }

    componentDidUpdate() {
        // this.debouncedComponentDidUpdate();
    }

    submitSearch(event) {
        this.props.toolPath.state("searchValues", this.state.searchObject);
        event.preventDefault();
    }

    updateState(label, event, callback) {
        var components = _.clone(this.state.searchObject);
        components[label] = event.target.value;
        this.setState({
            searchObject: components
        }, callback);
    }

    updateDateField(label, value, moment) {
        // TODO use moment object to manipulate format
        var components = _.clone(this.state.searchObject);
        components[label] = value;
        this.setState({
            searchObject: components
        });
    }

    updateStateDateField(label, event) {
        var datePicker = this.refs["datePicker" + label];

        // set the datepicker date so that it moves to that view
        if(datePicker) {
            if(isNaN(Date.parse(event.target.value)) === false) {
                datePicker.gotoDate(new Date(event.target.value));
            }
        }
        this.updateStateFuncs[label](event);
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
            return <bs.MenuItem key={index} eventKey={searchField.label}> {searchField.label} </bs.MenuItem>;
        });

        var inputs = [];

        for(var i in this.searchFields) {
            var label = this.searchFields[i].label;
            var type = this.searchFields[i].type;

            if(this.state.searchObject.hasOwnProperty(label)) {

                var closeButton = <bs.Button className={"close-button"} key={"close" + i} tabIndex={-1} onClick={this.removeSearchOption.bind(this, label)} bsSize={this.props.bsSize}>
                                            <bs.Glyphicon glyph="remove" style={glyphStyle}/>
                                  </bs.Button>;

                var searchInput = "";


                if(type === "date") {
                    var dateFormat = this.searchFields[i].dateFormat || "MM/DD/YYYY";
                    var datePicker = <bs.Popover>
                                        <DatePicker ref={"datePicker" + label} dateFormat={dateFormat} date={this.state.searchObject[label]} onChange={this.updateDateField.bind(this, label)}/>
                                     </bs.Popover>;

                    searchInput = <div style={inputStyle} key={"searchInput" + i}>
                        <bs.OverlayTrigger trigger="click" rootClose placement="bottom" overlay={datePicker}>
                            <bs.Input
                                bsSize={this.props.bsSize}
                                value={this.state.searchObject[label]}
                                ref={label}
                                type="text"
                                addonBefore={label}
                                buttonAfter={closeButton}
                                hasFeedback={true}
                                placeholder={dateFormat}
                                onChange={this.updateStateDateField.bind(this, label)}>
                            </bs.Input>
                       </bs.OverlayTrigger>
                   </div>;

                } else if (type === "text") {
                    searchInput = <div style={inputStyle} key={"searchInput" + i}>
                        <bs.Input
                            bsSize={this.props.bsSize}
                            value={this.state.searchObject[label]}
                            ref={label}
                            type="text"
                            addonBefore={label}
                            buttonAfter={closeButton}
                            hasFeedback={true}
                            placeholder={"Enter " + label}
                            onChange={this.updateStateFuncs[label]}>
                        </bs.Input>
                   </div>;
                }
                inputs.push(searchInput);
            }
        }
        return (
            <div style={customSearchStyle}>
                <bs.Dropdown title="Dropdown" bsSize={this.props.bsSize} bsStyle="primary" onSelect={this.handleDropdownSelect.bind(this)}>
                    <bs.Dropdown.Toggle bsStyle="primary">
                        <bs.Glyphicon glyph="search"/>
                    </bs.Dropdown.Toggle>
                    <bs.Dropdown.Menu>
                        {menuItems}
                    </bs.Dropdown.Menu>
                </bs.Dropdown>
                <form onsubmit={this.submitSearch.bind(this)} style={customSearchStyle}>
                    {
                        inputs
                    }
                    <div style={{float: "right"}}>
                        <bs.ButtonInput type="submit" bsStyle="primary" onClick={this.submitSearch.bind(this)}> Search </bs.ButtonInput>
                    </div>
                </form>
            </div>
        );
    }
}

export default CustomSearchTool;

registerToolImplementation("CustomSearchTool", CustomSearchTool);
