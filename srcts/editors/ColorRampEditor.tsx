import * as React from "react";
import * as _ from "lodash";
import {VBox, HBox} from "../react-ui/FlexBox";
import {VSpacer, HSpacer} from "../react-ui/Spacer";
import ColorRampList from "../ui/ColorRampList";
import ColorRampComponent from "../react-ui/ColorRamp";
import ColorPicker from "../react-ui/ColorPicker";
import List from "../react-ui/List";
import CenteredIcon from "../react-ui/CenteredIcon";

import ColorRamp = weavejs.util.ColorRamp;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import StandardLib = weavejs.util.StandardLib;

export interface ColorRampEditorProps extends React.Props<ColorRampEditor>
{
		colorRamp:ColorRamp;
}

export interface ColorRampEditorState 
{
		currentColors:number[];
		selectedFilter:string[];
}

const ALL:string = Weave.lang("All");
// stub
export default class ColorRampEditor extends React.Component<any, any>
{
	private colorRampWatcher:LinkableWatcher = Weave.disposableChild(this, new LinkableWatcher(ColorRamp, null, this.handleColorRampChange.bind(this)));
	public get colorRamp():ColorRamp { return this.colorRampWatcher.target as ColorRamp; }
	public set colorRamp(value:ColorRamp) { this.colorRampWatcher.target = value; }
	
	private filterOptions:string[];
	
	constructor(props:ColorRampEditorProps)
	{
		super(props);
		this.state = {
			currentColors: [],
			selectedFilter: ALL
		};

		this.colorRamp = props.colorRamp;
		this.filterOptions = [];
		var tagsLookup:{[tag:string]:string} = {};
		for(var ramp of ColorRamp.allColorRamps)
			for(var tag of ramp.tags.split(","))
				if(!tagsLookup[tag])
					this.filterOptions.push(tagsLookup[tag] = tag);
		
		this.filterOptions.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
		this.filterOptions.unshift(ALL);
	}
	
	handleColorRampChange()
	{
		this.setState({
			currentColors: this.colorRamp.getColors()
		});
	}
	
	componentDidUpdate(nextProps:ColorRampEditorProps, nextState:ColorRampEditorState):void
	{
		this.colorRamp && this.colorRamp.setSessionState(this.state.currentColors);
	}
	
	updateColorsAtIndex(index:number, color:string)
	{
		var colors = this.state.currentColors.concat();
		colors[index] = StandardLib.asNumber(color);
		this.setState({
			currentColors: colors
		});
	}
	
	removeColorAtIndex(index:number)
	{
		var colors:number[] = this.state.currentColors.concat();
		colors.splice(index, 1);
		this.setState({
			currentColors: colors
		});
	}
	
	addColor=()=>
	{
		var colors:number[] = this.state.currentColors.concat();
		colors.push(StandardLib.asNumber("#FFFFFF"));
		this.setState({
			currentColors: colors
		});
	}
	
	reverseColors=()=>
	{
		var colors:number[] = this.state.currentColors.concat();
		colors.reverse();
		this.setState({
			currentColors: colors
		});
	}
	
	handleColorRampSelectionChange = (newColors:number[]) =>
	{
		this.setState({
			currentColors: newColors
		});
	}

	render()
	{
		var colors:string[] = this.state.currentColors.map((num:number) => {
			var hexColor:string = StandardLib.getHexColor(num);
			if(hexColor)
				return hexColor.toUpperCase();
		});
		
		var filteredRamps = this.state.selectedFilter == ALL ? ColorRamp.allColorRamps : ColorRamp.allColorRamps.filter((v) => v.tags.indexOf(this.state.selectedFilter) >= 0);
		
		var listOptions = colors.map((color, index) => {
			return {
				value: index,
				label: (
					<HBox style={{flex: 1, justifyContent: "space-between", verticalAlign: "middle"}}>
						<HBox>
							<ColorPicker hexColor={color} onClose={(newColor:string) => this.updateColorsAtIndex(index, newColor)}/>
							<VSpacer/>
							<span style={{alignSelf: "center", fontFamily: "monospace"}}>{color}</span>
						</HBox>
						<CenteredIcon iconProps={{className: "fa fa-times fa-fw"}} onClick={() => this.removeColorAtIndex(index)}/>
					</HBox>
				)
			}
		})
		return (
			<VBox style={{flex: 1}}>
				<HBox style={{flex: 1}}>
					<HBox style={{flex: .7}}>
						<ColorRampList selectedColors={this.state.currentColors} allColorRamps={filteredRamps} onChange={this.handleColorRampSelectionChange}/>
					</HBox>
					<VSpacer/>
					<VBox style={{flex: .3}}>
						<label style={{marginTop: 5, fontWeight: "bold"}}>{Weave.lang("Customize")}</label>
						<HSpacer/>
						<HBox style={{flex: 1, overflow: "auto"}}>
							<ColorRampComponent style={{width: 30}} direction="to bottom" ramp={colors}/>
							<VSpacer/>
							<List options={listOptions}/>
						</HBox>
					</VBox>
					<HSpacer/>
				</HBox>
				<HSpacer/>
				<HBox>
					<HBox style={{flex: .7}}>
						{Weave.lang("Filter: ")}
						<VSpacer/>
						<select value={this.state.selectedFilter} onChange={(event:React.FormEvent) => { this.setState({ selectedFilter: (event.target as any).value}) }}>
							{
								this.filterOptions.map((option, index) => <option value={option as string} key={index}>{option}</option>)
							}
						</select>
					</HBox>
					<VSpacer/>
					<HBox style={{flex: .3, justifyContent: "space-between"}}>
						<CenteredIcon onClick={this.reverseColors}>{'↓↑'}</CenteredIcon>
						<button onClick={this.addColor}>{Weave.lang("Add color")}</button>
					</HBox>
				</HBox>
				<HSpacer/>
			</VBox>
		)
	}
}
