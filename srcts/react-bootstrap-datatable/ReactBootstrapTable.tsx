/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>

import * as React from "react";
import {Table} from "react-bootstrap";
import * as _ from "lodash";
import TableHead from "./TableHead";
import TableBody from "./TableBody";
import {IRow} from "./TableRow";
import {IColumnTitles} from "./TableHead";

export interface IReactBootstrapTableProps extends React.Props<ReactBootstrapTable> {
    striped?:boolean;
    bordered?:boolean;
    condensed?:boolean;
    hover?:boolean;
    rows:IRow[];
    columnTitles:IColumnTitles;
    height:number|string;
    sortable?:boolean;
    idProperty:string;
    selectedIds:string[];
    probedIds:string[];
    onProbe?:(id:string[]) => void;
    onSelection?:(id:string[]) => void;
    showIdColumn:boolean;
}

export interface IReactBootstrapTableState {
    probedIds?:string[];
    selectedIds?:string[];
}

export default class ReactBootstrapTable extends React.Component<IReactBootstrapTableProps, IReactBootstrapTableState> {

    private tableHead:TableHead;
    private tableBody:TableBody;
    private keyDown:boolean;
    private shiftDown:boolean;
    private firstIndex:number;
    private secondIndex:number;
    private lastClicked:string;

    constructor(props:IReactBootstrapTableProps) {
        super(props);
        this.state = {
            selectedIds: props.selectedIds,
            probedIds: props.probedIds
        }
        this.lastClicked = props.selectedIds[props.selectedIds.length - 1];
    }

    onMouseOver(id:string, status:boolean) {
        var probedIds:string[] = this.state.probedIds.concat();

        // find the selected record location
        var keyLocation:number = probedIds.indexOf(id);
        if (status && keyLocation < 0) {
            probedIds.push(id);
        } else if (!status && keyLocation >= 0) {
            probedIds.splice(keyLocation, 1);
        }

        if(this.props.onProbe) {
            this.props.onProbe(probedIds);
        }
        this.setState({
            probedIds
        });
    }

    onClick(id:string, event:React.MouseEvent) {
        var selectedIds:string[] = this.state.selectedIds.concat();

        // in single selection mode,
        // or ctrl/cmd selcection mode
        // already selected keys get unselected

        // find the selected record location
        var keyLocation:number = selectedIds.indexOf(id);

        // multiple selection
        if((event.ctrlKey || event.metaKey))
        {
            // if the record is already in the selection
            // we remove it
            if(keyLocation > -1)
            {
                selectedIds.splice(keyLocation, 1);
            }
            else
            {
                selectedIds.push(id)
            }
            this.lastClicked = id;
        }

        // shift selection
        else if(event.shiftKey) {
            selectedIds = [];
            if(this.lastClicked == null)
            {
            } else {
                var start:number = _.findIndex(this.props.rows, (row:IRow) => {
                    return row["id"] == this.lastClicked;
                });

                var end:number = _.findIndex(this.props.rows, (row:IRow) => {
                    return row["id"] == id;
                });

                if(start > end) {
                    let temp:number = start;
                    start = end;
                    end = temp;
                }

                for(var i:number = start; i <= end; i++) {
                    selectedIds.push(this.props.rows[i]["id"]);
                }
            }

        }

        // single selection
        else
        {
            // if there was only one record selected
            // and we are clicking on it again, then we want to
            // clear the selection.
            if(selectedIds.length == 1 && selectedIds[0] == id)
            {
                selectedIds = [];
                this.lastClicked = null;
            }
            else
            {
                selectedIds = [id];
                this.lastClicked = id;
            }
        }

        if(this.props.onSelection) {
            this.props.onSelection(selectedIds);
        }

        this.setState({
            selectedIds
        });
    }

    componentWillReceiveProps(nextProps:IReactBootstrapTableProps) {
        this.setState({
            selectedIds: nextProps.selectedIds,
            probedIds: nextProps.probedIds
        });
    }

    render() {

        var tableContainer:React.CSSProperties = {
                overflow: "auto",
                height: this.props.height
        };

        var selectedIds:string[];
        var probedIds:string[];

        // if(this.props.selectedIds) {
        //     selectedIds = this.props.selectedIds;
        // } else {
        //     selectedIds = this.state.selectedIds;
        // }
        //
        // if(this.props.probedIds) {
        //     probedIds = this.props.probedIds;
        // } else {
        //     probedIds = this.state.probedIds;
        // }

        return (
            <div style={tableContainer}>
                <Table key="table" ref="table" striped={this.props.striped} bordered={this.props.bordered} condensed={this.props.condensed} hover={true}>
                    <TableHead key="head"
                               ref={(c:TableHead) => {this.tableHead = c;}}
                               columnTitles={this.props.columnTitles}
                               idProperty={this.props.idProperty}
                               showIdColumn={this.props.showIdColumn}/>
                    <TableBody key="body" ref={(c:TableBody) => {this.tableBody = c;}}
                               idProperty={this.props.idProperty}
                               onMouseOver={this.onMouseOver.bind(this)}
                               onClick={this.onClick.bind(this)}
                               rows={this.props.rows}
                               selectedIds={this.state.selectedIds}
                               probedIds={this.state.probedIds}
                               showIdColumn={this.props.showIdColumn}/>
                </Table>
            </div>
        );
    }
}
