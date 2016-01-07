import React from "react";
import {ListGroupItem, ListGroup} from "react-bootstrap";
import {registerToolImplementation} from "../../outts/WeaveTool.jsx";
import AbstractWeaveTool from "../../outts/tools/AbstractWeaveTool.jsx";
import _ from "lodash";

const sessionStateMenuStyle = {width: "100%"};

class SessionStateMenuTool extends AbstractWeaveTool {

  constructor(props) {
    super(props);
    this.toolPath.push("choices").addCallback(this, _.debounce(this.forceUpdate.bind(this), 0));
    this.toolPath.push("selectedChoice").addCallback(this, _.debounce(this.forceUpdate.bind(this), 0));
  }

  componentDidMount() {

  }

  handleItemClick(index, event) {
    this.toolPath.state("selectedChoice", this.choices.getNames()[index]);
    // var targets = this.toolPath.push("targets");
    // var choice = this.choices.getState(index);
    // targets.forEach(choice, (value, key) => {
    //   this.push(key, null).state(value)
    // });
  }

  render() {

    this.choices = this.toolPath.push("choices");
    var selectedChoice = this.toolPath.getState("selectedChoice");
    var menus = this.choices.getNames().map((choice, index) => {

      return choice === selectedChoice ? <ListGroupItem active key={index} onClick={this.handleItemClick.bind(this, index)}>{choice}</ListGroupItem>
    : <ListGroupItem key={index} onClick={this.handleItemClick.bind(this, index)}>{choice}</ListGroupItem>;
    });

    return (<div style={sessionStateMenuStyle}>
      <ListGroup>
        {
          menus
        }
      </ListGroup>
    </div>);
  }
}

export default SessionStateMenuTool;

registerToolImplementation("weave.ui::SessionStateMenuTool", SessionStateMenuTool);
