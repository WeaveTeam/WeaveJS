/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>

import * as React from "react";
import {Table} from "react-bootstrap";

export interface IColumnTitles {
    [columnId: string] : string
}

interface ITableHeadProps extends React.Props<TableHead> {
    columnTitles:IColumnTitles
}

interface ITableHeadState {

}

export default class TableHead extends React.Component<ITableHeadProps, ITableHeadState> {

    constructor(props:ITableHeadProps) {
        super(props);
    }

    render():JSX.Element {
        return (
            <thead>
                <tr>
                    {
                        Object.keys(this.props.columnTitles).map((columnId:string) => {
                            return <th key={columnId}>{this.props.columnTitles[columnId]}</th>;
                        })
                    }
                </tr>
            </thead>
        );
    }
}
