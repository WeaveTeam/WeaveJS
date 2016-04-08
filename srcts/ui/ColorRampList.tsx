import * as React from "react";
import * as ReactDOM from "react-dom";
import FixedDataTable from "../tools/FixedDataTable";
import {IRow, IColumnTitles} from "../tools/FixedDataTable";
import {HBox, VBox} from "../react-ui/FlexBox";
import ColorRamp from "../react-ui/ColorRamp";

import StandardLib = weavejs.util.StandardLib;

export interface ColorRampListProps extends React.Props<ColorRampList>
{
	allColorRamps:{name:string, tags:string, colors:number[]}[];
}

export interface ColorRampListState
{
	
}

export default class ColorRampList extends React.Component<ColorRampListProps, ColorRampListState>
{
	columnTitles:IColumnTitles = {};
	tableContainer:VBox;
	tableContainerElement:HTMLElement;

	constructor(props:ColorRampListProps)
	{
		super(props);
		this.columnTitles["id"] = "Key";
		this.columnTitles["value"] = Weave.lang("Color scale presets");
	}
	
	static defaultProps:ColorRampListProps = {
		allColorRamps: []
	}
	
	componentDidMount()
	{
		this.forceUpdate(); // force update to get the correct size for the table
	}
	
	componentWillUpdate()
	{
		this.tableContainerElement = ReactDOM.findDOMNode(this.tableContainer) as HTMLElement;
	}
	
	render():JSX.Element
	{

		var rows:IRow[] = this.props.allColorRamps.map((colorRampConfig) => {
			var row:IRow = {};
			var rampRow = (
				<HBox style={{flex: 1}}>
					<ColorRamp style={{flex: 1}} ramp={colorRampConfig.colors.map(StandardLib.getHexColor)}/>
					<HBox style={{flex: 1, paddingLeft: 10}}>{colorRampConfig.name}</HBox>
				</HBox>
			);
			row["id"] = colorRampConfig.name;
			row["value"] = rampRow;
			return row;
		});

		return (
			<VBox style={{flex: 1}} ref={(c:VBox) => this.tableContainer = c}>
				{
					this.tableContainerElement && 
					<FixedDataTable columnIds={["id", "value"]} 
									idProperty="id" rows={rows} 
									columnTitles={this.columnTitles} 
									showIdColumn={false}
									initialColumnWidth={this.tableContainerElement.clientWidth}/>
				}
			</VBox>
		);
	}
}
