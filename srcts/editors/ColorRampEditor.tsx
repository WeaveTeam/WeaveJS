import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {VBox, HBox} from "../react-ui/FlexBox";
import ColorRampList from "../ui/ColorRampList";
import ColorRampComponent from "../react-ui/ColorRamp";
import ColorPicker from "../react-ui/ColorPicker";
import List from "../react-ui/List";
import CenteredIcon from "../react-ui/CenteredIcon";
import Button from "../semantic-ui/Button";
import ComboBox from "../semantic-ui/ComboBox";
import ReactUtils from "../utils/ReactUtils";

import ColorRamp = weavejs.util.ColorRamp;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import StandardLib = weavejs.util.StandardLib;

export interface ColorRampEditorProps extends React.Props<ColorRampEditor>
{
		colorRamp:ColorRamp;
		compact?:boolean;
		onButtonClick?:React.MouseEventHandler;
}

export interface ColorRampEditorState 
{
		selectedFilter:string;
}

const ALL:string = "All";
// stub
export default class ColorRampEditor extends React.Component<ColorRampEditorProps, ColorRampEditorState>
{
	private colorRampWatcher:LinkableWatcher = Weave.disposableChild(this, new LinkableWatcher(ColorRamp, null, this.forceUpdate.bind(this)));
	public get colorRamp():ColorRamp { return this.colorRampWatcher.target as ColorRamp; }
	public set colorRamp(value:ColorRamp) { this.colorRampWatcher.target = value; }
	
	private filterOptions:string[];
	
	constructor(props:ColorRampEditorProps)
	{
		super(props);
		this.state = {
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
	
	componentWillReceiveProps(props:ColorRampEditorProps):void
	{
		this.colorRamp = props.colorRamp;
	}
	
	updateColorsAtIndex(index:number, color:string)
	{
		if (this.colorRamp)
		{
			var colors = this.colorRamp.getColors() as number[];
			colors[index] = StandardLib.asNumber(color);
			this.colorRamp.setSessionState(colors)
		}
	}
	
	removeColorAtIndex(index:number)
	{
		if (this.colorRamp)
		{
			var colors:number[] = this.colorRamp.getColors() as number[];
			colors.splice(index, 1);
			this.colorRamp.setSessionState(colors)
		}
	}
	
	addColor=()=>
	{
		if (this.colorRamp)
		{
			var colors:number[] = this.colorRamp.getColors() as number[];
			colors.push(StandardLib.asNumber("#FFFFFF"));
			this.colorRamp.setSessionState(colors);
		}
	}
	
	reverseColors=()=>
	{
		if (this.colorRamp)
			this.colorRamp.reverse();
	}
	
	handleColorRampSelectionChange = (newColors:number[]) =>
	{
		if (this.colorRamp)
			this.colorRamp.setSessionState(newColors);
	}
	
	renderCompactView()
	{
		// return ReactUtils.generateGridLayout(
		// 	["four","twelve"],
		// 	[
		// 		[
		// 			<span className="weave-sidebar-label">{Weave.lang("Color Theme")}</span>,
		// 			<HBox className="weave-padded-hbox" style={{padding: 0, alignItems: "center"}}>
		// 				<ColorRampComponent style={{height: 20, marginRight: 5, flex: 1}} ramp={this.colorRamp.getHexColors()}/>
		// 				<Button onClick={this.props.onButtonClick}>{Weave.lang("Edit")}</Button>
		// 			</HBox>
		// 		],
		var tableStyles = {
			table: { width: "100%", fontSize: "inherit"},
			td: [
				{ textAlign: "right", whiteSpace: "nowrap", paddingRight: 8},
				{ paddingBottom: 8, width: "100%", paddingLeft: 8}
			]
		};
		
		return (
			<HBox className="weave-padded-hbox" style={{alignItems: "center"}}>
				<ColorRampComponent style={{height: 20, marginRight: 5, flex: 1}} ramp={this.colorRamp && this.colorRamp.getHexColors()}/>
				<Button onClick={this.props.onButtonClick}>{Weave.lang("Edit")}</Button>
			</HBox>
		);
		/*return ReactUtils.generateTable(
			null,
			[
				[ 
					Weave.lang("Color Theme"),
					<HBox className="weave-padded-hbox" style={{padding: 0, alignItems: "center"}}>
						<ColorRampComponent style={{height: 20, marginRight: 5, flex: 1}} ramp={this.colorRamp && this.colorRamp.getHexColors()}/>
						<Button onClick={this.props.onButtonClick}>{Weave.lang("Edit")}</Button>
					</HBox>
				],
			],
			{
				table: {width: "100%"},
				td: [{whiteSpace: "nowrap"}, {padding: 5, width: "100%"}]
			}
		)*/
	}

	renderFullView()
	{
		var colors:number[] = this.colorRamp ? this.colorRamp.getColors() : [];
		var hexColors:string[] = this.colorRamp ? this.colorRamp.getHexColors() : [];
		
		var filteredRamps = this.state.selectedFilter == ALL ? ColorRamp.allColorRamps : ColorRamp.allColorRamps.filter((v) => v.tags.indexOf(this.state.selectedFilter) >= 0);
		
		var listOptions = hexColors.map((hexColor, index) => {
			return {
				value: index,
				label: (
					<HBox style={{flex: 1, justifyContent: "space-between", verticalAlign: "middle"}}>
						<HBox className="weave-padded-hbox">
							<ColorPicker hexColor={hexColor} onClose={(newColor:string) => this.updateColorsAtIndex(index, newColor)}/>
							<span style={{alignSelf: "center", fontFamily: "monospace"}}>{hexColor.toUpperCase()}</span>
						</HBox>
						<CenteredIcon iconProps={{className: "fa fa-times fa-fw"}} onClick={() => this.removeColorAtIndex(index)}/>
					</HBox>
				)
			}
		})
		return (
			<VBox className="weave-padded-vbox" style={{flex: 1}} disabled={!this.colorRamp}>
				<HBox className="weave-padded-hbox" style={{flex: 1}}>
					<HBox style={{flex: .7, overflow: "auto"}}>
						<ColorRampList selectedColors={colors} allColorRamps={filteredRamps} onChange={this.handleColorRampSelectionChange}/>
					</HBox>
					<VBox style={{flex: .3}} className="weave-padded-vbox">
						<label style={{marginTop: 5, fontWeight: "bold"}}>{Weave.lang("Customize")}</label>
						<HBox style={{flex: 1, overflow: "auto"}} className="weave-padded-hbox">
							<ColorRampComponent style={{width: 30}} direction="bottom" ramp={hexColors}/>
							<List options={listOptions}/>
						</HBox>
					</VBox>
				</HBox>
				<HBox className="weave-padded-hbox">
					<HBox style={{flex: .7, alignItems: "center"}} className="weave-padded-hbox">
						{Weave.lang("Filter: ")}
						<ComboBox fluid={false} value={this.state.selectedFilter} options={this.filterOptions} onChange={(value:string) => { this.setState({ selectedFilter: value}) }} direction="upward"/>
					</HBox>
					<HBox style={{flex: .3, justifyContent: "space-between"}}>
						<CenteredIcon onClick={this.reverseColors}>{'↓↑'}</CenteredIcon>
						<Button onClick={this.addColor}>{Weave.lang("Add color")}</Button>
					</HBox>
				</HBox>
			</VBox>
		)
	}
	
	render()
	{
		return this.props.compact ? this.renderCompactView() : this.renderFullView();
	}
}
