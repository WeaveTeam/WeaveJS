import React from "react";
import {ListGroupItem, ListGroup} from "react-bootstrap";
import {registerToolImplementation} from "../WeaveTool.jsx";
import AbstractWeaveTool from "./AbstractWeaveTool";

class SessionStateMenuTool extends AbstractWeaveTool {

  constructor(props) {
    super(props);
    var boundForceUpdate = this.forceUpdate.bind(this);
    this.toolPath.push("choices").addCallback(boundForceUpdate);
    this.toolPath.push("selectedChoice").addCallback(boundForceUpdate);
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
                                       : <ListGroupItem key={index} onClick={this.handleItemClick.bind(this, index)}>{choice}</ListGroupItem>
    });

    return (<ListGroup>
      {
        menus
      }
    </ListGroup>);
  }
}

export default SessionStateMenuTool;

registerToolImplementation("weave.ui::SessionStateMenuTool", SessionStateMenuTool);
