import * as React from "react";
import TableRow from "./TableRow";
import {IRow} from "./TableRow";

export interface ITableBodyProps extends React.Props<TableBody>
{
    rows:IRow[];
    idProperty:string;
    selectedIds:string[];
    probedIds:string[];
    onMouseOver:(id:string, status:boolean) => void;
    onClick:(id:string) => void;
    showIdColumn:boolean
}

export interface ITableBodyState
{
}

export default class TableBody extends React.Component<ITableBodyProps, ITableBodyState>
{
    private tableRows:{[id:string]: TableRow};

    constructor(props:ITableBodyProps)
	{
        super(props);

        this.tableRows = {};
    }

    componentDidUpdate()
	{
    }

    render():JSX.Element
	{
        return (
            <tbody>
                {
                    this.props.rows.map((row:IRow, index:number) => {
                        return <TableRow
                                     ref={(tableRow:TableRow) => { this.tableRows[row[this.props.idProperty]] = tableRow }}
                                     key={index}
                                     onMouseOver={this.props.onMouseOver.bind(this, row[this.props.idProperty])}
                                     onClick={this.props.onClick.bind(this, row[this.props.idProperty])}
                                     idProperty={this.props.idProperty}
                                     row={row}
                                     probed={this.props.probedIds.indexOf(row[this.props.idProperty]) > -1}
                                     selected={this.props.selectedIds.indexOf(row[this.props.idProperty]) > -1}
                                     showIdColumn={this.props.showIdColumn}
                                />;
                    })
                }
            </tbody>
        );
    }
}
