/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>

import * as React from "react";
import {Table} from "react-bootstrap";

export interface IColumnTitles {
    [columnId: string] : string
}

interface ITableHeadProps extends React.Props<TableHead> {
    columnTitles:IColumnTitles;
    showIdColumn:boolean;
    idProperty:string;
}

interface ITableHeadState {

}

export default class TableHead extends React.Component<ITableHeadProps, ITableHeadState> {

    constructor(props:ITableHeadProps) {
        super(props);
    }

    render():JSX.Element {

        var headers:JSX.Element[] = [];

        var keys:string[] = Object.keys(this.props.columnTitles);
        if(!this.props.showIdColumn) {
            keys.splice(keys.indexOf(this.props.idProperty), 1);
        }
        headers = keys.map((columnId:string) => {
            return <th key={columnId}>{this.props.columnTitles[columnId]}</th>;
        });

        return (
            <thead className="table-header">
                <tr>
                    {
                        headers
                    }
                </tr>
            </thead>
        );
    }
}
