/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>

import * as React from "react";
import {Table} from "react-bootstrap";
import TableRow from "./TableRow";
import {IRow} from "./TableRow";

interface ITableBodyProps extends React.Props<TableBody> {
    rows:IRow[];
    idProperty:string;
    onMouseOver:(idPropety:string) => void
}

interface ITableBodyState {

}

export default class TableBody extends React.Component<ITableBodyProps, ITableBodyState> {

    public tableRows:TableRow[];

    constructor(props:ITableBodyProps) {
        super(props);

        this.tableRows = [];
    }

    componentDidUpdate() {
    }

    onMouseOver(index:number) {
    }

    onClick(index:number) {
        console.log("clicked on : ", this.props.rows[index][this.props.idProperty]);
    }

    render():JSX.Element {
        return (
            <tbody>
                {
                    this.props.rows.map((row:IRow, index:number) => {
                        return <TableRow
                                         ref={(tableRow:TableRow) => { this.tableRows[index] = tableRow }}
                                         onMouseOver={this.onMouseOver.bind(this, index)}
                                         onClick={this.onClick.bind(this, index)}
                                         idProperty={this.props.idProperty}
                                         key={index}
                                         row={row}
                                />;
                    })
                }
            </tbody>
        );
    }
}
