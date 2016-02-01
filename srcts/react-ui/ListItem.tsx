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
    selectedValues:string[];
}
export default class ListItem extends React.Component<IListItemProps, IListItemstate> {

    private checkboxes:HTMLElement[];
    private lastIndexClicked:number;
    private selectedValues:string[];

    constructor(props:IListItemProps) {
        super(props);
        this.state = {
            selectedValues: props.selectedValues
        };
        this.lastIndexClicked = props.selectedValues.length - 1;
    }

    componentWillReceiveProps(nextProps:IListItemProps) {
        if(nextProps.selectedValues) {
            this.setState({
                selectedValues: nextProps.selectedValues
            });
        }
    }

    handleChange(value:string, event:React.MouseEvent) {
        var selectedValues:string[] = this.state.selectedValues.splice(0);
        // new state of the item in the list

        var currentIndexClicked:number = selectedValues.indexOf(value);
        // ctrl selection
        if(event.ctrlKey || event.metaKey)
        {
            if(currentIndexClicked > -1)
            {
                selectedValues.splice(currentIndexClicked, 1);
            }
            else
            {
                selectedValues.push(value);
            }
            this.lastIndexClicked = currentIndexClicked;
        }
        // shift selection
        else if(event.shiftKey)
        {
            selectedValues = [];
            if(this.lastIndexClicked == null)
            {
                // do nothing
            } else {
                var start:number = this.lastIndexClicked;
                var end:number = this.props.values.indexOf(value);

                if(start > end) {
                    let temp:number = start;
                    start = end;
                    end = temp;
                }

                for(var i:number = start; i <= end; i++) {
                    selectedValues.push(this.props.values[i]);
                }
            }
        }
        // single selection
        else {
            // if there was only one record selected
            // and we are clicking on it again, then we want to
            // clear the selection.
            if(selectedValues.length == 1 && selectedValues[0] == value)
            {
                selectedValues = [];
                this.lastIndexClicked = null;
            }
            else
            {
                selectedValues = [value];
                this.lastIndexClicked = this.props.values.indexOf(value);
            }
        }

        if(this.props.onChange)
            this.props.onChange(selectedValues);


        this.setState({
          selectedValues
        });
    }

    render():JSX.Element {
        var labelPosition:string = this.props.labelPosition || "right";


        return (
            <VBox style={{height: "100%", width: "100%"}}>
                {
                    this.props.values.map((value:string, index:number) => {
                        var style:React.CSSProperties = {
                            padding: 5,
                            borderStyle: "solid",
                            borderWith: 1,
                            backgroundColor: this.state.selectedValues.indexOf(value) > -1 ? "red" : "blue",
                            width: "100%"
                        };

                        return (
                            <HBox key={index} style={style} onClick={this.handleChange.bind(this, this.props.values[index])}>
                               <span>{this.props.labels[index]}</span>
                            </HBox>
                        );
                    })
                }
            </VBox>
        );
    }
}
