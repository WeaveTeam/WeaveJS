///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
///<reference path="../../typings/weave/WeavePath.d.ts"/>
///<reference path="../utils/StandardLib.ts"/>

import AbstractWeaveTool from "./AbstractWeaveTool";
import {registerToolImplementation} from "../WeaveTool";
import * as React from "react";
import {ListGroupItem, ListGroup} from "react-bootstrap";
import * as _ from "lodash";
import {IAbstractWeaveToolProps} from "./AbstractWeaveTool";
import {IAbstractWeaveToolPaths} from "./AbstractWeaveTool";
import {MouseEvent} from "react";
import CSSProperties = __React.CSSProperties;


const sessionStateMenuStyle:CSSProperties = {width: "100%"};

class SessionStateMenuTool extends AbstractWeaveTool {
    private choices:WeavePath;
    protected toolPath:WeavePath;

    constructor(props:IAbstractWeaveToolProps) {
        super(props);
        this.toolPath.push("choices").addCallback(this, this.forceUpdate);
        this.toolPath.push("selectedChoice").addCallback(this, this.forceUpdate);
    }

    componentDidMount() {
    }

    handleItemClick(index:number, event:MouseEvent):void {
        this.toolPath.state("selectedChoice", this.choices.getNames()[index]);
        var targets:WeavePath = this.toolPath.push("targets");
        var choice:any = this.choices.getState(index);
        targets.forEach(choice, function (value:any, key:string) {
            this.push(key, null).state(value)
        });
    }

    render() {
        this.choices = this.toolPath.push("choices");
        var selectedChoice:string = this.toolPath.getState("selectedChoice");

        var menus:JSX.Element[] = this.choices.getNames().map((choice:string, index:number) => {
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
