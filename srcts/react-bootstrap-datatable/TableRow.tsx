/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>

import * as React from "react";
import {Table} from "react-bootstrap";
import {CSSProperties} from "react";

export interface IRow {
    [columnId:string]: string
};

interface ITableRowProps extends React.Props<TableRow> {
    row:IRow
    idProperty:string
    onMouseOver:() => void
    onClick:() => void
}

interface ITableRowState {
    selected:boolean;
    probed:boolean;
}

export default class TableRow extends React.Component<ITableRowProps, any> {

    private selectedStyle:CSSProperties;
    private unselectedStyle:CSSProperties;

    constructor(props:ITableRowProps) {
        super(props);

        this.selectedStyle = {
            backgroundColor: "blue"
        };

        this.unselectedStyle = {

        };

        this.state = {
            selected: false,
            probed: false
        };
    }

    toggleProbe(event:React.MouseEvent) {
        this.setState({
            probed: true
        }, ():any => {
            this.props.onMouseOver()
        });
    }

    toggleSelect(event:React.MouseEvent) {
        this.setState({
            selected: !this.state
        }, ():any => {
            this.props.onClick()
        });
    }

    render() {
        return (
            <tr style={this.state.selected ? this.selectedStyle : this.unselectedStyle} onMouseOver={this.toggleProbe.bind(this)} onClick={this.toggleSelect.bind(this)}>
                {
                    Object.keys(this.props.row).map((key:string) => {
                        return <td key={key}>{this.props.row[key]}</td>;
                    })
                }
            </tr>
        )
    }
}
