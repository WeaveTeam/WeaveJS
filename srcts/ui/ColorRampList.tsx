import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {ObjectFixedDataTable, IRow} from "../tools/FixedDataTable";
import {HBox, VBox, Label} from "../react-ui/FlexBox";
import ColorRampComponent from "../react-ui/ColorRampComponent";

import StandardLib = weavejs.util.StandardLib;

export interface ColorRampListProps extends React.Props<ColorRampList>
{
	allColorRamps:{name:string, tags:string, colors:number[]}[];
	selectedColors?:number[];
	onChange?:(selectedRamp:number[]) => void;
}

export interface ColorRampListState
{
	selectedColors?:number[];
}

export default class ColorRampList extends React.Component<ColorRampListProps, ColorRampListState>
{
	columnTitles:{[columnId: string]: string|JSX.Element} = {};
	tableContainer:VBox;
	tableContainerElement:HTMLElement;

	constructor(props:ColorRampListProps)
	{
		super(props);
		this.columnTitles["id"] = "Key";
		this.columnTitles["value"] = Weave.lang("Color scale presets");
		this.state = {
			selectedColors: props.selectedColors
		}
	}
	
	static defaultProps:ColorRampListProps = {
		allColorRamps: []
	}
	
	private getRampNameFromRamp(selectedColors:number[])
	{
		if(selectedColors)
		{
			var selectedRampConfig = this.props.allColorRamps.find(v => _.isEqual(v.colors, selectedColors));
			if(selectedRampConfig)
				return selectedRampConfig.name;
			return "";
		}
	}
	
	componentWillReceiveProps(nextProps:ColorRampListProps)
	{
		if(nextProps.selectedColors)
		{
			this.setState({
				selectedColors: nextProps.selectedColors
			});
		}
	}
	
	handleTableSelection = (id:string[]) =>
	{
		if(id.length)
		{
			var selectedRampConfig = this.props.allColorRamps.find(v => v.name == id[0]);
			if(selectedRampConfig)
				this.props.onChange && this.props.onChange(selectedRampConfig.colors);
		}
	}
	
	render():JSX.Element
	{
		
		var selectedId = this.getRampNameFromRamp(this.state.selectedColors);
		var rows:IRow[] = this.props.allColorRamps.map((colorRampConfig) => {
			var row:IRow = {};
			var rampRow = (
				<HBox padded style={{flex: 1}}>
					<ColorRampComponent style={{flex: 1}} ramp={colorRampConfig.colors.map(StandardLib.getHexColor)}/>
					<Label style={{flex: 1}} children={colorRampConfig.name}/>
				</HBox>
			);
			row["id"] = colorRampConfig.name;
			row["value"] = rampRow;
			return row;
		});

		return (
			<ObjectFixedDataTable columnIds={["id", "value"]} 
							idProperty="id" rows={rows} 
							columnTitles={this.columnTitles} 
							showIdColumn={false}
							selectedIds={[selectedId]}
							allowResizing={false}
							evenlyExpandRows={true}
							onSelection={this.handleTableSelection}/>
		);
	}
}
