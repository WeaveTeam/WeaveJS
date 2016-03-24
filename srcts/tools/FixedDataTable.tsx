import * as React from 'react';
import * as _ from 'lodash';
import {Table, Column, Cell} from 'fixed-data-table';
import CellProps = FixedDataTable.CellProps;
import QKey = weavejs.data.key.QKey;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import SyntheticEvent = __React.SyntheticEvent;

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
	[columnId:string]: string|QKey
}

export interface IFixedDataTableProps extends React.Props<FixedDataTable>
{
	idProperty:string;
	rows:IRow[];
	columnTitles:IColumnTitles;
	columnIds:string[];
	striped?:boolean;
	bordered?:boolean;
	condensed?:boolean;
	hover?:boolean;
	sortable?:boolean;
	selectedIds?:QKey[];
	probedIds?:QKey[];
	onProbeOver?:(id:QKey[]) => void;
	onProbeOut?:() => void;
	onSelection?:(id:QKey[]) => void;
	showIdColumn?:boolean;
	width:number;
	height:number;
	rowHeight:number;
	headerHeight:number;
	columnWidth:number;
}

export interface IFixedDataTableState
{
	columnWidths?:IColumnWidths;
	columnSortDirections?:IColumnSortDirections;
	sortIndexes?:number[];
}

export interface ISortHeaderProps extends React.Props<SortHeaderCell>
{
	onSortChange?: (columnKey:string, sortDir:string) => void;
	sortDir?: string;
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
					{this.props.children} {this.props.sortDir ? (this.props.sortDir === SortTypes.DESC ? '↓' : '↑') : ''}
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
				this.props.sortDir ?
					this.reverseSortDirection(this.props.sortDir) :
					SortTypes.DESC
			);
		}
	};

	reverseSortDirection=(sortDir:string) =>
	{
		return sortDir === SortTypes.DESC ? SortTypes.ASC : SortTypes.DESC;
	}
}

export default class FixedDataTable extends React.Component<IFixedDataTableProps, IFixedDataTableState>
{
	private keyDown:boolean;
	private shiftDown:boolean;
	private firstIndex:number;
	private secondIndex:number;
	private lastClicked:QKey;

	constructor(props:IFixedDataTableProps)
	{
		super(props);

		var columnWidths = _.zipObject(props.columnIds, this.props.columnIds.map((id)=>{return this.props.columnWidth})) as { [columnId: string]: number; };
		var sortIndexes:number[];
		for (var index = 0; index < props.rows.length; index++) {
			sortIndexes.push(index);
		}
		if(props.selectedIds && props.probedIds)
			this.lastClicked = props.selectedIds[props.selectedIds.length - 1];

		this.state = {
			columnWidths,
			columnSortDirections: {},
			sortIndexes
		};
	}

	getRowClass=(index: number):string =>
	{
		var id:QKey = this.props.rows[index][this.props.idProperty] as QKey;

		if(_.includes(this.props.probedIds,id))
		{
			//item needs probed class
			return "table-row-probed";
		} else if(_.includes(this.props.selectedIds,id))
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

	// onScrollStart(x:number, y:number):void
	// {
	// 	var probedIds:QKey[] = [];
	// 	this.setState({
	// 		probedIds
	// 	})
	// }

	onMouseEnter=(event:React.MouseEvent, index:number):void =>
	{
		//mouse entering, so set the keys
		var id:QKey = this.props.rows[index][this.props.idProperty] as QKey;
		var probedIds:QKey[] = [id];

		if (this.props.onProbeOver)
		{
			this.props.onProbeOver(probedIds);
		}
	};

	onMouseLeave=(event:React.MouseEvent, index:number):void =>
	{
		if (this.props.onProbeOut)
		{
			this.props.onProbeOut();
		}
	};

	onMouseDown=(event:React.MouseEvent, index:number):void =>
	{
		var selectedIds:QKey[] = this.props.selectedIds;
		var id:QKey = this.props.rows[index][this.props.idProperty] as QKey;

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
					selectedIds.push(this.props.rows[i][this.props.idProperty] as QKey);
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

		if (this.props.onSelection)
		{
			this.props.onSelection(selectedIds);
		}
	};

	componentWillReceiveProps(nextProps:IFixedDataTableProps)
	{
		if((!this.state.sortIndexes) || this.state.sortIndexes.length !== nextProps.rows.length) {
			var sortIndexes:number[] = [];
			for (var index = 0; index < nextProps.rows.length; index++) {
				sortIndexes.push(index);
			}
			this.setState({
				sortIndexes
			});
		}
	}

	getCell(props:CellProps,id:string)
	{
		return this.props.rows[this.state.sortIndexes[props.rowIndex]][id];
	}

	onSortChange=(columnKey:string, sortDir:string) =>
	{
		var sortIndexes = this.state.sortIndexes.slice();
		sortIndexes.sort((indexA:number, indexB:number) => {
			var valueA = this.props.rows[indexA][columnKey];
			var valueB = this.props.rows[indexB][columnKey];
			var sortVal = 0;
			if (valueA > valueB) {
				sortVal = 1;
			}
			if (valueA < valueB) {
				sortVal = -1;
			}
			if (sortVal !== 0 && sortDir === SortTypes.ASC) {
				sortVal = sortVal * -1;
			}

			return sortVal;
		});

		this.setState({
			columnSortDirections: {
				[columnKey]: sortDir,
			},
			sortIndexes
		});
	};

	render():JSX.Element
	{
		var tableContainer:React.CSSProperties = {
			overflow: "auto",
			flex: 1,
			whiteSpace: "nowrap"
		};

		var selectedIds:string[];
		var probedIds:string[];

		// if (this.props.selectedIds)
		//     selectedIds = this.props.selectedIds;
		// else
		//     selectedIds = this.state.selectedIds;
		//
		// if (this.props.probedIds)
		//     probedIds = this.props.probedIds;
		// else
		//     probedIds = this.state.probedIds;

		// return (
		// 	<div style={tableContainer}>
		// 		<Table key="table" ref="table" striped={this.props.striped} bordered={this.props.bordered} condensed={this.props.condensed}>
		// 			<TableHead key="head"
		// 					   ref={(c:TableHead) => {this.tableHead = c;}}
		// 					   columnTitles={this.props.columnTitles}
		// 					   idProperty={this.props.idProperty}
		// 					   showIdColumn={this.props.showIdColumn}/>
		// 			<TableBody key="body" ref={(c:TableBody) => {this.tableBody = c;}}
		// 					   idProperty={this.props.idProperty}
		// 					   onMouseOver={this.onMouseOver.bind(this)}
		// 					   onMouseDown={this.onMouseDown.bind(this)}
		// 					   rows={this.props.rows}
		// 					   selectedIds={this.state.selectedIds}
		// 					   probedIds={this.state.probedIds}
		// 					   showIdColumn={this.props.showIdColumn}/>
		// 		</Table>
		// 	</div>
		// );

		return (
			<div style={tableContainer}>
				<Table
					rowHeight={this.props.rowHeight}
					rowsCount={this.props.rows.length}
					width={this.props.width}
					height={this.props.height}
					headerHeight={this.props.headerHeight}
					onRowMouseDown={this.onMouseDown}
					onRowMouseEnter={this.onMouseEnter}
					onRowMouseLeave={this.onMouseLeave}
					rowClassNameGetter={this.getRowClass}
					onColumnResizeEndCallback={this.onColumnResizeEndCallback}
					isColumnResizing={false}>
					{
						this.props.columnIds.map((id:string,index:number) => {
							if(this.props.showIdColumn && (id === this.props.idProperty)){
								return (
									<Column
										key={index}
										columnKey={id}
										header={
											<SortHeaderCell
												onSortChange={this.onSortChange}
												sortDir={this.state.columnSortDirections[id]}
												columnKey={id}
												>
												{this.props.columnTitles[id]}
											</SortHeaderCell>
										}
										cell={(props:CellProps) => (
											<Cell {...props}>
												{String(this.getCell(props,id))}
											</Cell>
										)}
										width={this.state.columnWidths[id] ? this.state.columnWidths[id]:this.props.columnWidth}
										isResizable={true}
									/>
								);
							}
							return (
								<Column
									key={index}
									columnKey={id}
									header={
										<SortHeaderCell
											onSortChange={this.onSortChange}
											sortDir={this.state.columnSortDirections[id]}
											columnKey={id}
											>
											{this.props.columnTitles[id]}
										</SortHeaderCell>
									}
									cell={(props:CellProps) => (
										<Cell {...props}>
											{this.getCell(props,id)}
										</Cell>
									)}
									width={this.state.columnWidths[id] ? this.state.columnWidths[id]:this.props.columnWidth}
									isResizable={true}
								/>
							);
						})
					}
				</Table>
			</div>
		);
	}
}