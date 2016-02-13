/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>

import * as React from "react";
import {CSSProperties} from "react";
import * as Prefixer from "react-vendor-prefix";

export interface IColumnTitles {
    [columnId: string] : string
}

export interface ITableHeadProps extends React.Props<TableHead> {
    columnTitles:IColumnTitles;
    showIdColumn:boolean;
    idProperty:string;
}

export interface ITableHeadState {

}

const baseStyle:CSSProperties = {
    userSelect: "none"
};

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
            <thead className="table-header" style={Prefixer.prefix({styles: baseStyle}).styles} >
                <tr>
                    {
                        headers
                    }
                </tr>
            </thead>
        );
    }
}
