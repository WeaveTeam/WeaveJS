/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/react-swf/react-swf.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as bs from "react-bootstrap";
import * as _ from "lodash";
import VBox from "./VBox";
import HBox from "./HBox";
import MiscUtils from "../utils/MiscUtils";
import * as Prefixer from "react-vendor-prefix";

export interface IListItemProps extends React.Props<ListItem>
{
    values:any[];
    labels?:string[];
    onChange?:(selectedValues:string[]) => void;
    selectedValues?:string[];
}

export interface IListItemstate
{
    selectedValues?:string[];
    hovered?:number;
}

export default class ListItem extends React.Component<IListItemProps, IListItemstate>
{
    private checkboxes:HTMLElement[];
    private lastIndexClicked:number;
    private selectedValues:string[];

    constructor(props:IListItemProps)
	{
        super(props);
        this.state = {
            selectedValues: props.selectedValues || []
        };
        if (props.selectedValues)
        {
            this.lastIndexClicked = props.selectedValues.length - 1;
        }
    }

    componentWillReceiveProps(nextProps:IListItemProps)
	{
        if (nextProps.selectedValues)
        {
            this.setState({
                selectedValues: nextProps.selectedValues
            });
        }
    }

    handleChange(value:string, event:React.MouseEvent)
	{
        var selectedValues:string[] = this.state.selectedValues.splice(0);
        // new state of the item in the list

        var currentIndexClicked:number = selectedValues.indexOf(value);
        // ctrl selection
        if (event.ctrlKey || event.metaKey)
        {
            if (currentIndexClicked > -1)
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
        else if (event.shiftKey)
        {
            selectedValues = [];
            if (this.lastIndexClicked == null)
            {
                // do nothing
            }
            else
            {
                var start:number = this.lastIndexClicked;
                var end:number = this.props.values.indexOf(value);

                if (start > end)
                {
                    let temp:number = start;
                    start = end;
                    end = temp;
                }

                for (var i:number = start; i <= end; i++)
                {
                    selectedValues.push(this.props.values[i]);
                }
            }
        }
        // single selection
        else
        {
            // if there was only one record selected
            // and we are clicking on it again, then we want to
            // clear the selection.
            if (selectedValues.length == 1 && selectedValues[0] == value)
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

        if (this.props.onChange)
            this.props.onChange(selectedValues);


        this.setState({
          selectedValues
        });
    }

    render():JSX.Element
	{
        var values:string[] = this.props.values || [];

        var spanStyle:React.CSSProperties = {
            width:"100%",
            height:"100%",
            userSelect: "none"
        }

        spanStyle = Prefixer.prefix({styles: spanStyle}).styles;

        return (
            <div style={{height: "100%", width: "100%", overflow: "auto"}}>
                {
                    values.map((value:string, index:number) => {
                        var hovered:boolean = this.state.hovered == index;
                        var selected:boolean = this.state.selectedValues.indexOf(value) > -1;

                        var style:React.CSSProperties = {
                            padding: 5,
                            height: 30,
                            width: "100%",
                        };

                        if (selected && hovered)
                        {
                            style["backgroundColor"] = "#99D6FF";
                        }

                        if (selected && !hovered)
                        {
                            style["backgroundColor"] = "#80CCFF";
                        }

                        if (!selected && hovered)
                        {
                            style["backgroundColor"] = MiscUtils.rgba(153, 214, 255, 0.4);
                        }

                        if (!selected && !hovered)
                        {
                            style["backgroundColor"] = "#FFFFFF";
                        }

                        return (
                            <HBox key={index} style={style} onMouseOver={(event:React.MouseEvent) => { this.setState({hovered: index}) }} onClick={this.handleChange.bind(this, values[index])}>
                               <span style={spanStyle}>{this.props.labels ? this.props.labels[index] : value}</span>
                            </HBox>
                        );
                    })
                }
            </div>
        );
    }
}
