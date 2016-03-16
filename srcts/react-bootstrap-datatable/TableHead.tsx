import * as React from "react";
import {CSSProperties} from "react";
import prefixer from "../react-ui/VendorPrefixer";

export interface IColumnTitles
{
    [columnId: string] : string
}

export interface ITableHeadProps extends React.Props<TableHead>
{
    columnTitles:IColumnTitles;
    showIdColumn:boolean;
    idProperty:string;
}

export interface ITableHeadState
{
}

const baseStyle:CSSProperties = {
    userSelect: "none"
};

export default class TableHead extends React.Component<ITableHeadProps, ITableHeadState>
{
    constructor(props:ITableHeadProps)
	{
        super(props);
    }

    render():JSX.Element
	{
        var headers:JSX.Element[] = [];

        var keys:string[] = Object.keys(this.props.columnTitles);
        if (!this.props.showIdColumn)
        {
            keys.splice(keys.indexOf(this.props.idProperty), 1);
        }
        headers = keys.map((columnId:string) => {
            return <th key={columnId}>{this.props.columnTitles[columnId]}</th>;
        });

        return (
            <thead className="table-header" style={prefixer(baseStyle)} >
                <tr>
                    {
                        headers
                    }
                </tr>
            </thead>
        );
    }
}
