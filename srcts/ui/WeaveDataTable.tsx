import * as React from 'react';
import * as _ from 'lodash';
import * as ReactVirtualized from "react-virtualized";

import {HBox, VBox} from "../react-ui/FlexBox";


import CellProps = FixedDataTable.CellProps;
import ResizingDiv, {ResizingDivState} from "./ResizingDiv";
import SmartComponent from "../ui/SmartComponent";
import DynamicComponent from "./DynamicComponent";

import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IKeySet = weavejs.api.data.IKeySet;
import IKeyFilter = weavejs.api.data.IKeyFilter;
import ILinkableObject = weavejs.api.core.ILinkableObject;
import ILinkableVariable = weavejs.api.core.ILinkableVariable;

import KeySet = weavejs.data.key.KeySet;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;

export interface IWeaveDataTableProps extends React.HTMLProps<WeaveDataTable> {
	columns: IAttributeColumn[];
	subsetKeySet: FilteredKeySet;
	selectionKeySet?: KeySet;
	probeKeySet?: KeySet;
	sortDirections?: ILinkableVariable; /* TODO */
	showKeyColumn?: boolean; /* TODO */
}

export interface IWeaveDataTableState {
	height: number;
	width: number;
}

export default class WeaveDataTable extends SmartComponent<IWeaveDataTableProps,IWeaveDataTableState>
{
	constructor(props:IWeaveDataTableProps)
	{
		super(props);
		this.state = {
			height: 10,
			width: 10
		};
		this.componentWillReceiveProps(props);
	}

	componentWillReceiveProps(nextProps:IWeaveDataTableProps)
	{	
		DynamicComponent.setDependencies(this, [].concat([nextProps.subsetKeySet, nextProps.selectionKeySet, nextProps.probeKeySet], nextProps.columns));
	}

	cellDataGetter = (data: { columnData: IAttributeColumn, dataKey: string, rowData: IQualifiedKey }): string =>
	{
		return data.columnData.getValueFromKey(data.rowData, String);
	}

	onHeaderClick = (dataKey: string, columnData: IAttributeColumn) =>
	{
		let column = Weave.AS(columnData, IAttributeColumn);
		if (this.props.subsetKeySet)
		{
			this.props.subsetKeySet.setColumnKeySources(this.props.columns);
		}
	}

	onRowMouseOut = (data: {index: number})=>
	{
		let key = this.props.subsetKeySet.keys[data.index];
		if (this.props.probeKeySet)
		{
			this.props.probeKeySet.removeKeys(key);
		}
	}

	onRowMouseOver = (data: {index: number})=>
	{
		let key = this.props.subsetKeySet.keys[data.index];
		if (this.props.probeKeySet)
		{
			this.props.probeKeySet.replaceKeys([key]);
		}
	}

	onRowClick = (data: {index: number}) =>
	{
		let key = this.props.subsetKeySet.keys[data.index];
		if (this.props.selectionKeySet)
		{
			this.props.selectionKeySet.replaceKeys([key]);
		}
	}

	renderColumn=(iac:IAttributeColumn, index:number):JSX.Element=>
	{
		return (<ReactVirtualized.FlexColumn cellDataGetter={this.cellDataGetter} key={index} dataKey={String(index)} width={125} columnData={iac} label={iac.getMetadata("title") }/>);
	}

	rowWrapperClassName=(data:{index: number}):string=>
	{
		let key = this.props.subsetKeySet.keys[data.index];

		let selected = this.props.selectionKeySet && this.props.selectionKeySet.containsKey(key);
		let probed = this.props.probeKeySet && this.props.probeKeySet.containsKey(key);

		if (probed && selected)
			return "table-row-probed-selected";
		if (probed)
			return "table-row-probed";
		if (selected)
			return "table-row-selected";
	}

	render():JSX.Element
	{
		let columns = this.props.columns.map(this.renderColumn);
		let keys = this.props.subsetKeySet.keys;

		return <ResizingDiv onResize={(state) => { this.setState({ height: state.height, width: state.width }) } }>
			<ReactVirtualized.FlexTable
				headerHeight={16}
				onHeaderClick={this.onHeaderClick}
				height={this.state.height} width={this.state.height}
				rowGetter={(data: { index: number }) => keys[data.index]}
				rowCount={keys.length} rowHeight={16}>
				{columns}
			</ReactVirtualized.FlexTable>
		</ResizingDiv>;
	}
}