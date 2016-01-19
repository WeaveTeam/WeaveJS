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

interface IReactBootstrapTableProps extends React.Props<ReactBootstrapTable> {
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
    onProbe:(id:string[]) => void;
    onSelection:(id:string[]) => void;
    showIdColumn:boolean;
}

interface IReactBootStrapTableState {
    probedIds?:string[];
    selectedIds?:string[];
}

export default class ReactBootstrapTable extends React.Component<IReactBootstrapTableProps, IReactBootStrapTableState> {

    private tableHead:TableHead;
    private tableBody:TableBody;
    private keyDown:boolean;
    private shiftDown:boolean;
    private firstIndex:number;
    private secondIndex:number;

    constructor(props:IReactBootstrapTableProps) {
        super(props);
        this.state = {
            probedIds: [],
            selectedIds: []
        }
    }

    componentDidMount() {

    }

    componentWillUnmount() {
        // TODO: remove event listeners
    }

    onMouseOver(id:string, status:boolean) {

        var probedIds:string[] = this.state.probedIds.slice(0);

        var keyLocation:number = probedIds.indexOf(id);
        if(!status && keyLocation > -1) {
            probedIds.splice(keyLocation, 1);
        } else {
            probedIds.push(id);
        }

        if(this.props.onProbe) {
            this.props.onProbe(probedIds);
        }

        this.setState({
            probedIds
        });
    }

    onClick(id:string, event:React.MouseEvent) {
        var selectedIds:string[] = this.state.selectedIds.slice(0);

        // in single selection mode,
        // or ctrl/cmd selcection mode
        // already selected keys get unselected
        var keyLocation:number = selectedIds.indexOf(id);
        if(keyLocation > -1) {
            if((event.ctrlKey || event.metaKey)) {
                selectedIds.splice(keyLocation, 1);
            } else {
                selectedIds = [];
            }
        } else {
            if((event.ctrlKey || event.metaKey)) {
                selectedIds.push(id)
            } else {
                selectedIds = [id];
            }
        }

        // if(this.shiftDown) {
        //     if(this.firstIndex < 0) {
        //
        //         this.firstIndex = this.props.rows.map((row) => { return row[this.props.idProperty] }).indexOf(id);
        //     } else {
        //         this.secondIndex = this.props.rows.map((row) => { return row[this.props.idProperty] }).indexOf(id);
        //     }
        //
        //     // first time selection is clicked,
        //     // there is no second index, in which case
        //     // we select the first item
        //     if(this.secondIndex < -1) {
        //         selectedIds = [this.props.rows[this.firstIndex][this.props.idProperty]];
        //     }
        //
        //     if(this.firstIndex > this.secondIndex && this.secondIndex < 0) {
        //         var temp:number = this.firstIndex;
        //         this.firstIndex = this.secondIndex;
        //         this.secondIndex = temp;
        //     }
        //     selectedIds = [];
        //     for(var i:number = this.firstIndex; i < this.secondIndex; i++) {
        //         selectedIds.push(this.props.rows[i][this.props.idProperty]);
        //     }
        // } else {
        //     this.firstIndex = -1;
        //     this.secondIndex = -1;
        // }

        if(this.props.onSelection) {
            this.props.onSelection(selectedIds);
        }

        this.setState({
            selectedIds
        });
    }


    render() {

        var tableContainer:React.CSSProperties = {
                overflow: "auto",
                height: this.props.height
        };

        var selectedIds:string[];
        var probedIds:string[];

        if(this.props.selectedIds) {
            selectedIds = this.props.selectedIds;
        } else {
            selectedIds = this.state.selectedIds;
        }

        if(this.props.probedIds) {
            probedIds = this.props.probedIds;
        } else {
            probedIds = this.state.probedIds;
        }

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
                               selectedIds={selectedIds}
                               probedIds={probedIds}
                               showIdColumn={this.props.showIdColumn}/>
                </Table>
            </div>
        );
    }
}
