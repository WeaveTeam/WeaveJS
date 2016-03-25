import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import {Table, Column, Cell} from 'fixed-data-table';
import CellProps = FixedDataTable.CellProps;
import QKey = weavejs.data.key.QKey;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ResizingDiv, {ResizingDivState} from "../react-ui/ResizingDiv";

export interface IColumnTitles
{
	[columnId: string] : string
}

export interface  IColumnWidths
{
	[columnId: string] : number
}

export interface IColumnSortDirections
{
	[columnId: string] : string
}

export interface IRow
{
	[columnId:string]: string
}

export interface IFixedDataTableProps extends React.Props<FixedDataTable>
{
	idProperty:string;
	rows:IRow[];
	columnIds:string[];
	columnTitles?:IColumnTitles;
	enableHover?:boolean;
	enableSelection?:boolean;
	probedIds?:string[];
	selectedIds?:string[];
	onHover?:(id:string[]) => void;
	onSelection?:(id:string[]) => void;
	showIdColumn?:boolean;
	rowHeight?:number;
	headerHeight?:number;
	columnWidth?:number;
}

export interface IFixedDataTableState
{
	columnWidths?:IColumnWidths;
	sortId?:string;
	sortDirection?:string;
	probedIds?:string[];
	selectedIds?:string[];
}

export interface ISortHeaderProps extends React.Props<SortHeaderCell>
{
	onSortChange?: (columnKey:string, sortDirection:string) => void;
	sortDirection?: string;
	columnKey: string;
}

export interface ISortHeaderState
{

}

const SortTypes = {
	ASC: 'ASC',
	DESC: 'DESC',
};

export class SortHeaderCell extends React.Component<ISortHeaderProps, ISortHeaderState>
{
	constructor(props:ISortHeaderProps) {
		super(props);

	}

	render():JSX.Element {
		return (
			<Cell {...this.props}>
				<a onClick={this.onSortChange}>
					{this.props.children} {this.props.sortDirection ? (this.props.sortDirection === SortTypes.DESC ? '↓' : '↑') : ''}
				</a>
			</Cell>
		);
	}

	onSortChange=(e:React.MouseEvent) =>
	{
		e.preventDefault();

		if (this.props.onSortChange) {
			this.props.onSortChange(
				this.props.columnKey,
				this.props.sortDirection ?
					this.reversesortDirection(this.props.sortDirection) :
					SortTypes.DESC
			);
		}
	};

	reversesortDirection=(sortDirection:string) =>
	{
		return sortDirection === SortTypes.DESC ? SortTypes.ASC : SortTypes.DESC;
	}
}

export default class FixedDataTable extends React.Component<IFixedDataTableProps, IFixedDataTableState>
{
	private keyDown:boolean;
	private shiftDown:boolean;
	private firstIndex:number;
	private secondIndex:number;
	private lastClicked:string;
	private container:HTMLElement;
	static defaultProps:IFixedDataTableProps = {
		idProperty: "",
		rows: [],
		columnTitles:{},
		columnIds:[],
		enableHover:true,
		enableSelection:true,
		selectedIds: [],
		probedIds: [],
		showIdColumn:false,
		rowHeight:30,
		headerHeight:30,
		columnWidth:85
	};

	constructor(props:IFixedDataTableProps)
	{
		super(props);

		var columnWidths = _.zipObject(props.columnIds, this.props.columnIds.map((id)=>{return this.props.columnWidth})) as { [columnId: string]: number; };
		if(props.selectedIds && props.probedIds)
			this.lastClicked = props.selectedIds[props.selectedIds.length - 1];

		this.state = {
			columnWidths
		};
	}

	getRowClass=(index: number):string =>
	{
		var id:string = this.props.rows[index][this.props.idProperty];
		if(_.includes(this.state.probedIds,id))
		{
			//item needs probed class
			return "table-row-probed";
		} else if(_.includes(this.state.selectedIds,id))
		{
			//item needs selected class
			return "table-row-selected";
		}
	};

	onColumnResizeEndCallback=(newColumnWidth:number, columnKey:string) =>
	{
		var columnWidths = _.cloneDeep(this.state.columnWidths);
		columnWidths[columnKey] = newColumnWidth;
		this.setState({
			columnWidths
		});
	};

	onMouseEnter=(event:React.MouseEvent, index:number):void =>
	{
		//mouse entering, so set the keys
		var id:string = this.props.rows[index][this.props.idProperty];
		var probedIds:string[] = [id];
		this.setState({
			probedIds
		})
		this.props.onHover && this.props.onHover(probedIds);
	};

	onMouseLeave=(event:React.MouseEvent, index:number):void =>
	{
		this.setState({
			probedIds: []
		})
		this.props.onHover && this.props.onHover([]);
	};

	onMouseDown=(event:React.MouseEvent, index:number):void =>
	{
		var selectedIds:string[] = this.props.selectedIds;
		var id:string = this.props.rows[index][this.props.idProperty];

		// in single selection mode,
		// or ctrl/cmd selcection mode
		// already selected keys get unselected

		// find the selected record location
		var keyLocation:number = selectedIds.indexOf(id);

		// multiple selection
		if ((event .ctrlKey || event.metaKey))
		{
			// if the record is already in the selection
			// we remove it
			if (_.includes(selectedIds,id))
			{
				selectedIds.splice(keyLocation, 1);
			}
			else
			{
				selectedIds.push(id)
			}
			this.lastClicked = id;
		}

		// shift selection
		else if (event.shiftKey)
		{
			selectedIds = [];
			if (this.lastClicked == null)
			{
			}
			else
			{
				var start:number = _.findIndex(this.props.rows, (row:IRow) => {
					return row[this.props.idProperty] == this.lastClicked;
				});

				var end:number = _.findIndex(this.props.rows, (row:IRow) => {
					return row[this.props.idProperty] == id;
				});

				if (start > end)
				{
					let temp:number = start;
					start = end;
					end = temp;
				}

				for (var i:number = start; i <= end; i++)
				{
					selectedIds.push(this.props.rows[i][this.props.idProperty]);
				}
			}
		}

		// single selection
		else
		{
			// if there was only one record selected
			// and we are clicking on it again, then we want to
			// clear the selection.
			if (selectedIds.length == 1 && selectedIds[0] == id)
			{
				selectedIds = [];
				this.lastClicked = null;
			}
			else
			{
				selectedIds = [id];
				this.lastClicked = id;
			}
		}

		this.setState({
			selectedIds
		});
		if (this.props.onSelection)
		{
			this.props.onSelection(selectedIds);
		}
	};

	updateSortDirection=(columnKey:string, sortDirection:string) =>
	{
		this.setState({
			sortId: columnKey,
			sortDirection
		})
	};

	sortColumnIndices=(columnKey:string, sortDirection:string, sortIndices:number[]) =>
	{
		sortIndices.sort((indexA:number, indexB:number) => {
			var valueA = this.props.rows[indexA][columnKey];
			var valueB = this.props.rows[indexB][columnKey];
			var sortVal = 0;
			if (valueA > valueB) {
				sortVal = 1;
			}
			if (valueA < valueB) {
				sortVal = -1;
			}
			if (sortVal !== 0 && sortDirection === SortTypes.ASC) {
				sortVal = sortVal * -1;
			}
			return sortVal;
		});
	};

	componentWillReceiveProps(nextProps:IFixedDataTableProps)
	{
		var newState:IFixedDataTableState = {};

		if(nextProps.probedIds)
			newState.probedIds = nextProps.probedIds;

		if(nextProps.selectedIds)
			newState.selectedIds = nextProps.selectedIds;

		this.setState(newState);
	}

	componentDidMount()
	{
		this.container = ReactDOM.findDOMNode(this) as HTMLElement;
	}

	getCell(props:CellProps,id:string)
	{
		return
	}

	render():JSX.Element
	{
		var tableContainer:React.CSSProperties = {
			overflow: "auto",
			flex: 1,
			whiteSpace: "nowrap"
		};


		var	sortIndices = this.props.rows.map((row, index) => index);
		this.sortColumnIndices(this.state.sortId, this.state.sortDirection, sortIndices);
		return (
			<ResizingDiv style={tableContainer}>
				{this.container ?
					<Table
						rowsCount={this.props.rows.length}
						width={this.container.clientWidth}
						height={this.container.clientHeight}
						headerHeight={this.props.headerHeight}
						rowHeight={this.props.rowHeight}
						onRowMouseDown={this.onMouseDown}
						onRowMouseEnter={this.onMouseEnter}
						onRowMouseLeave={this.onMouseLeave}
						rowClassNameGetter={this.getRowClass}
						onColumnResizeEndCallback={this.onColumnResizeEndCallback}
						isColumnResizing={false}>
						{
							this.props.columnIds.map((id:string,index:number) => {
								if(this.props.showIdColumn || id != this.props.idProperty){
									return (
										<Column
											key={index}
											columnKey={id}
											header={
												<SortHeaderCell
													onSortChange={this.updateSortDirection}
													sortDirection={id == this.state.sortId ? this.state.sortDirection : ""}
													columnKey={id}
													>
													{this.props.columnTitles ? this.props.columnTitles[id]:id}
												</SortHeaderCell>
											}
											cell={(props:CellProps) => (
												<Cell {...props}>
													{this.props.rows[sortIndices[props.rowIndex]][id]}
												</Cell>
											)}
											width={this.state.columnWidths[id] ? this.state.columnWidths[id]:this.props.columnWidth}
											isResizable={true}
										/>
									);
								}
							})
						}
					</Table>:""
				}
			</ResizingDiv>
		);
	}
}