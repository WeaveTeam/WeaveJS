/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>

import * as React from "react";
import {Table} from "react-bootstrap";
import {CSSProperties} from "react";
import StandardLib from "../Utils/StandardLib";
import * as Prefixer from "react-vendor-prefix";

export interface IRow {
    [columnId:string]: string
};

interface ITableRowProps extends React.Props<TableRow> {
    row:IRow;
    idProperty:string;
    onMouseOver:() => void;
    onClick:() => void;
    probed:boolean;
    selected:boolean;
    showIdColumn:boolean;
}

interface ITableRowState {
}

const baseStyle:CSSProperties = {
    userSelect: "none"
};

export default class TableRow extends React.Component<ITableRowProps, ITableRowState> {

    private selectedStyle:CSSProperties;
    private clear:CSSProperties;
    private probedStyle:CSSProperties;
    private probedAndSelected:CSSProperties;

    constructor(props:ITableRowProps) {
        super(props);

        this.selectedStyle = {
            backgroundColor: "#DAE2FC"
        };

        this.clear = {};

        this.probedAndSelected = {
            backgroundColor: "#DCC6DC"
        };

        this.probedStyle = {
            backgroundColor: "rgba(224, 141, 157, 0.4)"
        }
    }

    render():JSX.Element {
        var style = {}
        var selected:boolean = this.props.selected;
        var probed:boolean = this.props.probed;

        if(selected && probed) {
            style = this.probedAndSelected;
        }
        if(selected && !probed) {
            style = this.selectedStyle;
        }
        if(!selected && probed) {
            style = this.probedStyle;
        }
        if(!selected && !probed) {
            style = this.clear;
        }

        StandardLib.merge(style, baseStyle);

        var cells:JSX.Element[] = [];

        var keys:string[] = Object.keys(this.props.row);
        if(!this.props.showIdColumn) {
            keys.splice(keys.indexOf(this.props.idProperty), 1);
        }
        cells = keys.map((key:string) => {
            return <td key={key}>{this.props.row[key]}</td>;
        });

        return (
            <tr style={Prefixer.prefix({styles: style}).styles} onMouseOver={this.props.onMouseOver.bind(this, true)} onMouseOut={this.props.onMouseOver.bind(this, false)} onClick={this.props.onClick.bind(this)}>
                {
                    cells
                }
            </tr>
        )
    }
}
