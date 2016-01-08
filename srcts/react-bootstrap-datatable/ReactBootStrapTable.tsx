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
    onRowSelect?:Function;
    height:number|string;
    sortable?:boolean;
    idProperty:string;
    onMouseOver:React.EventHandler<React.MouseEvent>
    onClick:React.EventHandler<React.MouseEvent>
}

interface IReactBootStrapTableState {
    selectedIds:string[];
    probedIds:string[];
}

export default class ReactBootstrapTable extends React.Component<IReactBootstrapTableProps, IReactBootStrapTableState> {

    private tableHead:TableHead;
    private tableBody:TableBody;

    constructor(props:IReactBootstrapTableProps) {
        super(props);

        this.state = {
            selectedIds: [],
            probedIds: []
        };
    }

    onMouseOver(id:string, event:React.MouseEvent) {
        console.log('mouse over', id);
    }

    render() {

        var tableContainer:React.CSSProperties = {
                overflow: "auto",
                height: this.props.height
        };

        return (
            <div style={tableContainer}>
                <Table key="table" ref="table" striped={this.props.striped} bordered={this.props.bordered} condensed={this.props.condensed} hover={true}>
                    <TableHead key="head" ref={(c:TableHead) => {this.tableHead = c;}} columnTitles={this.props.columnTitles}/>
                    <TableBody key="body" ref={(c:TableBody) => {this.tableBody = c;}} idProperty={this.props.idProperty} onMouseOver={this.onMouseOver.bind(this)} rows={this.props.rows}/>
                </Table>
            </div>
        );
    }
}
