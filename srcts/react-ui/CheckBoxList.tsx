/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/react-swf/react-swf.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as bs from "react-bootstrap";
import * as _ from "lodash";
import VBox from "./VBox";
import HBox from "./HBox";

export interface ICheckBoxListProps extends React.Props<CheckBoxList> {
    values:any[];
    labels?:string[];
    onChange?:(selectedValues:string[]) => void;
    selectedValues?:string[];
    labelPosition?:string;
}

export interface ICheckBoxListState {
    checkboxStates:boolean[];
}

export default class CheckBoxList extends React.Component<ICheckBoxListProps, ICheckBoxListState> {

    private checkboxes:HTMLElement[];

    constructor(props:ICheckBoxListProps) {
        super(props);

        if(this.props.selectedValues) {
            this.state = {
                checkboxStates: props.values.map((value) => {
                    return props.selectedValues.indexOf(value) > -1;
                })
            }
        } else {
            this.state = {
                checkboxStates: props.values.map((value) => {
                    return false;
                })
            }
        }
    }

    componentWillReceiveProps(nextProps:ICheckBoxListProps) {
        if(nextProps.selectedValues) {
            var checkboxStates:boolean[] = nextProps.values.map((value) => {
                return nextProps.selectedValues.indexOf(value) > -1;
            });

            this.setState({
                checkboxStates
            });
        }
    }

    handleChange(index:number, event:React.FormEvent) {
        var checkboxState:boolean = (event.target as any).checked;
        var checkboxStates:boolean[] = this.state.checkboxStates.splice(0);
        checkboxStates[index] = checkboxState;

        var selectedValues:string[] = [];
        checkboxStates.forEach((checkboxState:boolean, index:number) => {
            if(checkboxState) {
                selectedValues.push(this.props.values[index]);
            }
        });

        if(this.props.onChange)
            this.props.onChange(selectedValues);

        this.setState({
            checkboxStates
        });
    }

    render():JSX.Element {
        var labelPosition:string = this.props.labelPosition || "right";

        return (
            <div style={{height: "100%", width: "100%", overflow: "scroll"}}>
                {
                    this.state.checkboxStates.map((checkBoxState:boolean, index:number) => {
                        var checkboxItem:JSX.Element[] = [
                            <input type="checkbox" checked={checkBoxState} value={this.props.values[index]} onChange={this.handleChange.bind(this, index)}/>,
                            <span style={{paddingLeft: 5}}>{this.props.labels ? this.props.labels[index] : this.props.values[index]}</span>
                        ];
                        return (
                            <HBox key={index} style={{height: 30, paddingLeft: 10}}>
                                {
                                    labelPosition == "right" ? checkboxItem : checkboxItem.reverse()
                                }
                            </HBox>
                        );
                    })
                }
            </div>
        );
    }
}
