import * as React from 'react';
import * as _ from 'lodash';
import {Table, Column, Cell} from 'fixed-data-table';
import CellProps = FixedDataTable.CellProps;
import QKey = weavejs.data.key.QKey;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ResizingDiv, {ResizingDivState} from "../react-ui/ResizingDiv";
import SmartComponent from "../ui/SmartComponent";

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
	width?:number;
	height?:number;
	sortIndices?:number[];
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

export interface ITextCellProps extends CellProps
{
	data?:IRow[];
	sortIndices?:number[];
}

export interface ITextCellState
{

}

const SortTypes = {
	ASC: 'ASC',
	DESC: 'DESC',
};


export class TextCell extends React.Component<ITextCellProps, ITextCellState>
{

	constructor(props:ITextCellProps) {
		super(props);

	}

	render():JSX.Element {
		const {rowIndex, columnKey, data, sortIndices} = this.props;
		return (
			<Cell {...this.props}>
				{data[sortIndices[rowIndex]] && data[sortIndices[rowIndex]][columnKey]}
			</Cell>
		);
	}
}

export class SortHeaderCell extends React.Component<ISortHeaderProps, ISortHeaderState>
{
	constructor(props:ISortHeaderProps) {
		super(props);

	}

	render():JSX.Element {
		return (
			<Cell {...this.props}>
				<div style={{whiteSpace: "nowrap", overflow: "ellipsis"}} onClick={this.onSortChange}>
					{this.props.sortDirection ? (this.props.sortDirection === SortTypes.DESC ? '↓' : '↑') : ''} {this.props.children}
				</div>
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
					this.reverseSortDirection(this.props.sortDirection) :
					SortTypes.DESC
			);
		}
	};

	reverseSortDirection=(sortDirection:string) =>
	{
		return sortDirection === SortTypes.DESC ? SortTypes.ASC : SortTypes.DESC;
	}
}

export default class FixedDataTable extends SmartComponent<IFixedDataTableProps, IFixedDataTableState>
{
	private keyDown:boolean;
	private shiftDown:boolean;
	private firstIndex:number;
	private secondIndex:number;
	private lastClicked:number;
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
		var sortIndices:number[] = this.props.rows.map((row, index) => index);

		if(props.selectedIds && props.probedIds)
			this.lastClicked = props.selectedIds.length - 1;

		this.state = {
			columnWidths,
			sortIndices,
			selectedIds: props.selectedIds,
			probedIds: props.probedIds
		};
	}

	getRowClass=(index: number):string =>
	{
		var id:string = this.props.rows[this.state.sortIndices[index]][this.props.idProperty];
		if (_.includes(this.state.probedIds, id) && _.includes(this.state.selectedIds, id)) {
			return "table-row-probed-selected"
		} else if (_.includes(this.state.probedIds, id)) {
			//item needs probed class
			return "table-row-probed";
		} else if (_.includes(this.state.selectedIds, id)) {
			//item needs selected class
			return "table-row-selected";
		}
	};

	onColumnResizeEndCallback=(newColumnWidth:number, columnKey:string):void =>
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
		var id:string = this.props.rows[this.state.sortIndices[index]][this.props.idProperty];
		var probedIds:string[] = [id];

		this.setState({
			probedIds
		});

		if(this.props.onHover){
			this.props.onHover(probedIds);
		}
	};

	onMouseLeave=(event:React.MouseEvent, index:number):void =>
	{
		//console.log("Leave",event,index);
		this.setState({
			probedIds: []
		});
		this.props.onHover && this.props.onHover([]);
	};

	onMouseDown=(event:React.MouseEvent, index:number):void =>
	{
		//console.log("Down",event,index);
		
		var selectedIds:string[] = this.state.selectedIds;
		var id:string = this.props.rows[this.state.sortIndices[index]][this.props.idProperty];

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
			this.lastClicked = index;
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
				var start:number = this.lastClicked;

				var end:number = index;

				if (start > end)
				{
					let temp:number = start;
					start = end;
					end = temp;
				}

				for (var i:number = start; i <= end; i++)
				{
					selectedIds.push(this.props.rows[this.state.sortIndices[i]][this.props.idProperty]);
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
				this.lastClicked = index;
			}
		}
		
		this.setState({
			selectedIds
		});
		if (this.props.onSelection)
			this.props.onSelection(selectedIds);

		this.forceUpdate();
	};

	updateSortDirection=(columnKey:string, sortDirection:string) =>
	{
		var sortIndices:number[] = this.state.sortIndices;
		this.sortColumnIndices(columnKey,sortDirection,sortIndices);
		this.setState({
			sortId: columnKey,
			sortDirection,
			sortIndices
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

		if(nextProps.rows.length !== this.state.sortIndices.length)
			newState.sortIndices = nextProps.rows.map((row, index) => index);

		newState.probedIds = nextProps.probedIds;
		newState.selectedIds = nextProps.selectedIds;
		this.setState(newState);
		this.forceUpdate();
	}
	
	handleResize=(newSize:ResizingDivState) => {
		this.setState({
			width: newSize.width,
			height: newSize.height
		});
	};

	render():JSX.Element
	{
		var tableContainer:React.CSSProperties = {
			overflow: "auto",
			flex: 1,
			whiteSpace: "nowrap"
		};

		return (
			<ResizingDiv style={tableContainer} onResize={this.handleResize}>
				{this.state.width && this.state.height ?
					<Table
						rowsCount={this.props.rows.length}
						width={this.state.width}
						height={this.state.height}
						headerHeight={this.props.headerHeight}
						rowHeight={this.props.rowHeight}
						onRowMouseDown={this.onMouseDown}
						onRowMouseEnter={this.onMouseEnter}
						onRowMouseLeave={this.onMouseLeave}
						rowClassNameGetter={this.getRowClass}
						onColumnResizeEndCallback={this.onColumnResizeEndCallback}
						isColumnResizing={false}
					>
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
												<TextCell
													data={this.props.rows}
													sortIndices={this.state.sortIndices}
													{...props}
												/>)
											}
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
