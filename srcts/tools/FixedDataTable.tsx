import * as React from 'react';
import * as _ from 'lodash';
import {Table, Column, Cell} from 'fixed-data-table';
import {HBox, VBox} from "../react-ui/FlexBox";


import CellProps = FixedDataTable.CellProps;
import ResizingDiv, {ResizingDivState} from "../react-ui/ResizingDiv";
import SmartComponent from "../ui/SmartComponent";

export declare type SortDirection = "ASC"|"DESC"|"NONE";
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
	[columnId:string]: React.ReactChild;
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
	initialColumnWidth?:number;
	evenlyExpandRows?:boolean;
	allowResizing?:boolean;
	width?:number;
	height?:number;
	showBottomBorder?:boolean;
	allowClear?: boolean;
	multiple?: boolean;
	sortId?:string;
	sortDirection?: SortDirection;
	/** 
	 *	a callback function that will be called if you want to sort the data
	 *  manually. if this function is provided, the sortFunction will not be used
	 **/
	onSortCallback?: (columnKey:string, sortDirection:SortDirection) => void;

	/** 
	 *  a sort function that will be called if you want to sort the data
	 *  manually, otherwise the table will be sorted by default using plain value
	 *  comparison
	 **/
	sortFunction?: (rowIndexA:number, rowIndexB:number, columnKey:string) => number;
}

export interface IFixedDataTableState
{
	columnWidths?:IColumnWidths;
	sortId?:string;
	sortDirection?:SortDirection;
	width?:number;
	height?:number;
	sortIndices?:number[];
	probedIds?:string[];
	selectedIds?:string[];
}

export interface ISortHeaderProps extends React.Props<SortHeaderCell>
{
	onSortChange?: (columnKey:string, sortDirection:SortDirection) => void;
	sortDirection?: SortDirection;
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

export const SortTypes = {
	ASC: 'ASC' as 'ASC',
	DESC: 'DESC' as 'DESC',
};


export class TextCell extends React.Component<ITextCellProps, ITextCellState>
{

	constructor(props:ITextCellProps)
	{
		super(props);
	}

	render():JSX.Element
	{
		const {rowIndex, columnKey, data, sortIndices} = this.props;
		var value = data[sortIndices[rowIndex]];
		return (
			<Cell {...this.props}>
				{value && value[columnKey]}
			</Cell>
		);
	}
}

export class SortHeaderCell extends React.Component<ISortHeaderProps, ISortHeaderState>
{
	constructor(props:ISortHeaderProps)
	{
		super(props);
	}
	static UpArrow(props:{})
	{
		return (
			<span style={{alignSelf: "stretch", display: "flex", cursor: "pointer"}}>
				<i className="fa fa-play fa-fw fa-rotate-270" style={{alignSelf: "center",fontSize: "60%", paddingRight: 2}}/>
			</span>
		);
	}
	
	static DownArrow(props:{})
	{
		return (
			<span style={{alignSelf: "stretch", display: "flex", cursor: "pointer"}}>
				<i className="fa fa-play fa-fw fa-rotate-90" style={{alignSelf: "center",fontSize: "60%", paddingRight: 2}}/>
			</span>
		);
	}

	render():JSX.Element
	{
		var sortArrow:React.ReactChild = "";
		if (this.props.sortDirection == SortTypes.DESC)
			sortArrow = <SortHeaderCell.DownArrow/>;
		if (this.props.sortDirection == SortTypes.ASC)
			sortArrow = <SortHeaderCell.UpArrow/>;
		
		return (
			<Cell {...this.props}>
				<HBox style={{whiteSpace: "nowrap", overflow: "ellipsis"}} onClick={this.onSortChange}>
					{sortArrow} {this.props.children}
				</HBox>
			</Cell>
		);
	}

	onSortChange=(e:React.MouseEvent) =>
	{
		e.preventDefault();

		if (this.props.onSortChange)
		{
			this.props.onSortChange(
				this.props.columnKey,
				this.props.sortDirection ?
					this.reverseSortDirection(this.props.sortDirection) :
					SortTypes.DESC
			);
		}
	};

	reverseSortDirection=(sortDirection:SortDirection) =>
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
		showIdColumn:false,
		multiple:true,
		rowHeight:30,
		headerHeight:30,
		initialColumnWidth: 85,
		allowResizing: true,
		evenlyExpandRows: true,
		showBottomBorder: true,
		allowClear:true,
		sortFunction: function(indexA:number, indexB:number, columnKey:string):number {
			var valueA = this.getValue(indexA, columnKey);
			var valueB = this.getValue(indexB, columnKey);
			valueA = typeof valueA == "string" ? valueA : valueA && (valueA as any).value;
			valueB = typeof valueB == "string" ? valueB : valueA && (valueB as any).value;
			var sortVal = 0;
			if (valueA > valueB)
				sortVal = 1;
			if (valueA < valueB)
				sortVal = -1;
			return sortVal;
		}
	};

	constructor(props:IFixedDataTableProps)
	{
		super(props);
		var sortIndices:number[] = this.props.rows.map((row, index) => index);
		var headerIndices:number[] = [];

		if (props.selectedIds && props.probedIds)
			this.lastClicked = props.selectedIds.length - 1;

		this.state = {
			columnWidths: {},
			sortIndices,
			selectedIds: props.selectedIds || [],
			probedIds: props.probedIds || [],
			sortId: props.sortId,
			sortDirection: props.sortDirection,
			width: props.width,
			height: props.height
		};
	}

	moveSelectedToTop():void
	{
		//get sort index of selected records
		var sortIndices:number[] = this.state.sortIndices;
		var selectedIndices:number[] = this.state.selectedIds.map( (id:string,index:number) => {
			let foundIndex:number = _.indexOf(this.props.rows.map((row:IRow) => {
				return row[this.props.idProperty]
			}), id);
			return sortIndices.indexOf(foundIndex);
		});
		//splice found indices to front of sort list
		selectedIndices.forEach( (value) => {
			var element = sortIndices[value];
			sortIndices.splice(value, 1);
			sortIndices.splice(0, 0, element);
		});

		this.setState({
			sortIndices
		});

		if (this.props.onSelection)
			this.props.onSelection(this.state.selectedIds);

		this.forceUpdate();
	}
	
	getValue(index:number, property:string):string
	{
		var row = this.props.rows[this.state.sortIndices[index]];
		return row && row[this.props.idProperty] as string;
	}

	getRowClass=(index: number):string =>
	{
		var id:string = this.getValue(index, this.props.idProperty);

		if (!id || !this.props.enableHover || !this.props.enableSelection)
			return "";

		if (this.props.enableHover && this.props.enableSelection && _.includes(this.state.probedIds, id) && _.includes(this.state.selectedIds, id))
		{
			return "table-row-probed-selected"
		}
		else if (this.props.enableHover && _.includes(this.state.probedIds, id))
		{
			//item needs probed class
			return "table-row-probed";
		}
		else if (this.props.enableSelection && _.includes(this.state.selectedIds, id)) 
		{
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
		var id:string = this.getValue(index, this.props.idProperty);
		var probedIds:string[] = id ? [id] : [];

		this.setState({
			probedIds
		});

		if (this.props.onHover)
			this.props.onHover(probedIds);
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
		var id:string = this.getValue(index, this.props.idProperty);
		
		if (!id)
			return;

		// in single selection mode,
		// or ctrl/cmd selcection mode
		// already selected keys get unselected

		// find the selected record location
		var keyLocation:number = selectedIds.indexOf(id);

		// multiple selection
		if ((event.ctrlKey || event.metaKey) && this.props.multiple)
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
		else if (event.shiftKey && this.props.multiple)
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
					id = this.getValue(this.state.sortIndices[i], this.props.idProperty);
					if (id)
						selectedIds.push(id);
				}
			}
		}

		// single selection
		else
		{
			// if there was only one record selected
			// and we are clicking on it again, then we want to
			// clear the selection.
			if (selectedIds.length == 1 && selectedIds[0] == id && this.props.allowClear)
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

	updateSortDirection=(columnKey:string, sortDirection:SortDirection) =>
	{
		var sortIndices:number[] = this.state.sortIndices;
		this.sortColumnIndices(columnKey,sortDirection,sortIndices);
		this.setState({
			sortId: columnKey,
			sortDirection,
			sortIndices
		})
	};

	sortColumnIndices=(columnKey:string, sortDirection:SortDirection, sortIndices:number[]) =>
	{
		if (this.props.onSortCallback)
		{
			this.props.onSortCallback(columnKey, sortDirection);
		}
		else
		{
			sortIndices.sort((indexA:number, indexB:number) => {
				var sortVal = this.props.sortFunction(indexA, indexB, columnKey);
				if (sortVal !== 0 && sortDirection === SortTypes.ASC)
					sortVal = sortVal * -1;
				return sortVal;
			});
		}
	};

	componentWillReceiveProps(nextProps:IFixedDataTableProps)
	{
		var newState:IFixedDataTableState = {};

		if (nextProps.rows.length !== this.state.sortIndices.length)
			newState.sortIndices = nextProps.rows.map((row, index) => index);

		if (nextProps.probedIds)
			newState.probedIds = nextProps.probedIds.concat([]);
		
		if (nextProps.selectedIds)
			newState.selectedIds = nextProps.selectedIds.concat([]);
		
		if (nextProps.sortId)
		{
			newState.sortId = nextProps.sortId;
		}
		
		if (nextProps.sortDirection)
		{
			newState.sortDirection = nextProps.sortDirection;
		}
		this.setState(newState);
	}
	
	handleResize=(newSize:ResizingDivState) =>
	{
		this.setState({
			width: newSize.width,
			height: newSize.height
		});
	};

	render():JSX.Element
	{
		var tableContainer:React.CSSProperties = {
			flex: 1,
			whiteSpace: "nowrap"
		};
		var evenWidth:number;

		if (this.props.evenlyExpandRows && this.state.width > 0)
			evenWidth = Math.max(this.state.width / (this.props.columnIds.length - (this.props.showIdColumn ? 0:1)), this.props.initialColumnWidth);

		return (
			<ResizingDiv className={this.props.showBottomBorder ? null : "weave-disableBottomBorder"} style={tableContainer} onResize={this.handleResize}>
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
								if (this.props.showIdColumn || id != this.props.idProperty){
									return (
										<Column
											key={index}
											columnKey={id}
											header={
												<SortHeaderCell
													onSortChange={this.updateSortDirection}
													sortDirection={id == this.state.sortId ? this.state.sortDirection : "NONE"}
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
											width={this.state.columnWidths[id] || (this.props.evenlyExpandRows ? (evenWidth || this.props.initialColumnWidth):this.props.initialColumnWidth)}
											isResizable={this.props.allowResizing}
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
