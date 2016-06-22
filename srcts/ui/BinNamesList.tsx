import * as React from "react";
import {ObjectFixedDataTable, IFixedDataTableProps, IRow} from "../tools/FixedDataTable";

import AbstractBinningDefinition = weavejs.data.bin.AbstractBinningDefinition;

export interface BinNamesListProps {
	binningDefinition:AbstractBinningDefinition;
	showHeaderRow?:boolean;
}
export default class BinNamesList extends React.Component<BinNamesListProps, {}>{
	
	constructor(props:BinNamesListProps)
	{
		super(props);
		if(this.props.binningDefinition){
			Weave.getCallbacks(this.props.binningDefinition).addGroupedCallback(this,this.forceUpdate);
		}
	}

	componentWillReceiveProps(nextProps:BinNamesListProps) {
		if(this.props.binningDefinition !== nextProps.binningDefinition){
			// null is possible when user selects option "none"
			if(this.props.binningDefinition)Weave.getCallbacks(this.props.binningDefinition).removeCallback(this,this.forceUpdate);
			if(nextProps.binningDefinition)Weave.getCallbacks(nextProps.binningDefinition).addGroupedCallback(this,this.forceUpdate);
		}
	}

	componentWillUnmount(){
		if(this.props.binningDefinition)Weave.getCallbacks(this.props.binningDefinition).removeCallback(this,this.forceUpdate);
	}
	
	static defaultProps:BinNamesListProps = {
		showHeaderRow: true,
		binningDefinition: null
	};
	
	render()
	{
		var binDef:AbstractBinningDefinition = this.props.binningDefinition;
		var rows:IRow[] = [];
		if(binDef)
		{
			rows = binDef.getBinNames().map((binName, index) => {
				return {
					id: index,
					value: binName
				} as IRow;
			});
		}
		
		var columnTitles:{[columnId:string]: string|JSX.Element} = {
			id: "Key",
			value: "Bin names"
		};

		return (
			<ObjectFixedDataTable columnIds={["id", "value"]}
				idProperty="id"
				rows={rows}
				columnTitles={columnTitles}
				headerHeight={this.props.showHeaderRow ? undefined : 0}
				showIdColumn={false}
				allowResizing={false}
				evenlyExpandRows={true}
				enableHover={false}
				enableSelection={false}
			/>
		);
	}
}
