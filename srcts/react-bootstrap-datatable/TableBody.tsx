import * as React from "react";
import TableRow from "./TableRow";
import {IRow} from "./TableRow";
import * as _ from "lodash";

export interface ITableBodyProps extends React.Props<TableBody>
{
    rows:IRow[];
    idProperty:string;
    selectedIds:string[];
    probedIds:string[];
    onMouseOver:(id:string, status:boolean) => void;
    onMouseDown:(id:string) => void;
    showIdColumn:boolean;
    hack?:boolean;
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

    shouldComponentUpdate(nextProps:ITableBodyProps, nextState:ITableBodyState)
    {
        // only update the row if the key has changed
        return (this.props.selectedIds != nextProps.selectedIds) ||
            (this.props.probedIds != nextProps.probedIds) ||
            (!_.isEqual(this.props.rows, nextProps.rows)) || this.props.hack != nextProps.hack;
    }

    render():JSX.Element
	{

        if(this.props.hack) {
            var riyadhIndex:number = -1;
            this.props.rows.forEach((row, index) => {
                if ((row["ReferencedColumn9"] == "Riyadh") || (row["ReferencedColumn9"] == "الرياض")) {
                    riyadhIndex = index;
                }
            });
            if (riyadhIndex >= 1) {
                var temp = this.props.rows[0];
                this.props.rows[0] = this.props.rows[riyadhIndex];
                this.props.rows[riyadhIndex] = temp;
            }
        }

        return (
            <tbody>
                {
                    this.props.rows.map((row:IRow, index:number) => {
                        if(row)
                        return <TableRow
                                     ref={(tableRow:TableRow) => { this.tableRows[row[this.props.idProperty]] = tableRow }}
                                     key={index}
                                     onMouseOver={this.props.onMouseOver.bind(this, row[this.props.idProperty])}
                                     onMouseDown={this.props.onMouseDown.bind(this, row[this.props.idProperty])}
                                     idProperty={this.props.idProperty}
                                     row={row}
                                     probed={this.props.probedIds.indexOf(row[this.props.idProperty]) > -1}
                                     selected={this.props.selectedIds.indexOf(row[this.props.idProperty]) > -1}
                                     showIdColumn={this.props.showIdColumn}
                                     hack={this.props.hack}
                                />;
                        return "";
                    })
                }
            </tbody>
        );
    }
}
