/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/react-swf/react-swf.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as bs from "react-bootstrap";
import * as _ from "lodash";
import VBox from "./VBox";
import HBox from "./Hbox";

interface IListItemProps extends React.Props<ListItem> {
    values:any[];
    labels?:string[];
    onChange?:(selectedValues:string[]) => void;
    selectedValues?:string[];
    labelPosition:string;
}

interface IListItemstate {
    itemStates:boolean[];
}
export default class ListItem extends React.Component<IListItemProps, IListItemstate> {

    private checkboxes:HTMLElement[];

    constructor(props:IListItemProps) {
        super(props);

        if(this.props.selectedValues) {
            this.state = {
                itemStates: props.values.map((value) => {
                    return props.selectedValues.indexOf(value) > -1;
                })
            }
        } else {
            this.state = {
                itemStates: props.values.map((value) => {
                    return false;
                })
            }
        }
    }

    componentWillReceiveProps(nextProps:IListItemProps) {
        if(nextProps.selectedValues) {
            var itemStates:boolean[] = nextProps.values.map((value) => {
                return nextProps.selectedValues.indexOf(value) > -1;
            });

            this.setState({
                itemStates
            });
        }
    }

    handleChange(index:number, event:React.MouseEvent) {
        console.log("change event");
        var itemStates:boolean[] = this.state.itemStates.splice(0);
        itemStates[index] = !itemStates[index];
        var selectedValues:string[] = [];
        itemStates.forEach((itemState:boolean, index:number) => {
            if(itemState) {
                selectedValues.push(this.props.values[index]);
            }
        });

        if(this.props.onChange)
            this.props.onChange(selectedValues);

        this.setState({
            itemStates
        });
    }

    render():JSX.Element {
        var labelPosition:string = this.props.labelPosition || "right";


        return (
            <VBox style={{height: "100%", width: "100%"}}>
                {
                    this.state.itemStates.map((itemState:boolean, index:number) => {
                        var style:React.CSSProperties = {
                            padding: 5,
                            borderStyle: "solid",
                            borderWith: 1,
                            backgroundColor: itemState ? "red" : "blue",
                            width: "100%"
                        };
                        var listItem:JSX.Element[] = [
                            <HBox style={style} onClick={this.handleChange.bind(this, index)}>
                                <span>{this.props.labels[index]}</span>
                            </HBox>
                        ];
                        return (
                            <HBox key={index}>
                                {
                                    labelPosition == "right" ? listItem : listItem.reverse()
                                }
                            </HBox>
                        );
                    })
                }
            </VBox>
        );
    }
}
