import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {VBox, HBox} from "../react-ui/FlexBox";
import ColorRampList from "../ui/ColorRampList";
import ColorRampComponent from "../react-ui/ColorRampComponent";
import ColorPicker from "../react-ui/ColorPicker";
import List from "../react-ui/List";
import CenteredIcon from "../react-ui/CenteredIcon";
import Button from "../semantic-ui/Button";
import ComboBox from "../semantic-ui/ComboBox";
import ReactUtils from "../utils/ReactUtils";
import {forceUpdateWatcher} from "../utils/WeaveReactUtils";

import ColorRamp = weavejs.util.ColorRamp;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import StandardLib = weavejs.util.StandardLib;

export interface ColorRampEditorProps extends React.Props<ColorRampEditor>
{
	colorRamp:ColorRamp;
	compact?:boolean;
	onButtonClick?:React.MouseEventHandler;
	pushCrumb?:Function;
}

export interface ColorRampEditorState 
{
}

const ALL:string = "All";
// Three Classes are used (all three classes depends on colorRamp, which is passed from ColorRampEditor)
// ColorRampEditor -> ColorRampSelector -> ColorRampCustomizer
export default class ColorRampEditor extends React.Component<ColorRampEditorProps, ColorRampEditorState>
{
	private colorRampWatcher = forceUpdateWatcher(this, ColorRamp);
	public get colorRamp():ColorRamp { return this.colorRampWatcher.target as ColorRamp; }
	public set colorRamp(value:ColorRamp) { this.colorRampWatcher.target = value; }
	
	constructor(props:ColorRampEditorProps)
	{
		super(props);
		this.colorRamp = props.colorRamp;
	}

	componentWillReceiveProps(nextProps:ColorRampEditorProps):void
	{
		if (this.props.colorRamp !== nextProps.colorRamp)
		{
			this.colorRamp = nextProps.colorRamp
		}
	}

	private onButtonClick = (event:React.MouseEvent)=>
	{
		if (this.props.pushCrumb)
		{
			this.props.pushCrumb("Color Ramp", <ColorRampSelector colorRamp={this.colorRamp} pushCrumb= {this.props.pushCrumb} />);
		}
		else if (this.props.onButtonClick)
		{
			this.props.onButtonClick(event);
		}
	}

	// for Weave Tool Editor
	renderCompactView()
	{
		return (
			<HBox className="weave-padded-hbox">
				<ColorRampComponent style={{ flex: 1 , border:"none"}} ramp={this.colorRamp && this.colorRamp.getHexColors()} direction="right"/>
				<Button
					onClick={this.onButtonClick}
					title="Click to change the color ramp"
					style={ { borderTopLeftRadius: 0, borderBottomLeftRadius: 0} }
				>
					<i className="fa fa-angle-right" aria-hidden="true" style={ {fontWeight:"bold"} }/>
				</Button>
			</HBox>
		);
	}

	renderFullView()
	{
		return <ColorRampSelector colorRamp={this.colorRamp}/>;
	}
	
	render()
	{
		return this.props.compact ? this.renderCompactView() : this.renderFullView();
	}
}

interface ColorRampSelectorProps extends React.Props<ColorRampSelector>
{
	colorRamp:ColorRamp;
	pushCrumb?:Function;
}

interface ColorRampSelectorState
{
	selectedFilter:string;
}

// Component to change the ramp
class ColorRampSelector extends React.Component<ColorRampSelectorProps, ColorRampSelectorState>
{
	private filterOptions:string[];

	constructor(props:ColorRampSelectorProps)
	{
		super(props);
		if (this.props.colorRamp)
			this.props.colorRamp.addGroupedCallback(this, this.forceUpdate);

		this.state = {
			selectedFilter: ALL
		};

		this.filterOptions = [];
		var tagsLookup:{[tag:string]:string} = {};
		for (var ramp of ColorRamp.allColorRamps)
			for (var tag of ramp.tags.split(","))
				if (!tagsLookup[tag])
					this.filterOptions.push(tagsLookup[tag] = tag);

		this.filterOptions.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
		this.filterOptions.unshift(ALL);
	}

	componentWillReceiveProps(nextProps:ColorRampSelectorProps):void
	{
		if (this.props.colorRamp !== nextProps.colorRamp)
		{
			if (this.props.colorRamp)
				this.props.colorRamp.removeCallback(this, this.forceUpdate);
			if (nextProps.colorRamp)
				nextProps.colorRamp.addGroupedCallback(this, this.forceUpdate);
		}
	}

	reverseColors=()=>
	{
		if (this.props.colorRamp)
			this.props.colorRamp.reverse();
	}

	addColor=(color:string)=>
	{
		var colors = this.props.colorRamp.getColors() as number[];
		colors.push(StandardLib.asNumber(color));
		this.props.colorRamp.setSessionState(colors)
	}


	handleColorRampSelectionChange = (newColors:number[]) =>
	{
		if (this.props.colorRamp)
			this.props.colorRamp.setSessionState(newColors);
	}

	private onCustomizeButtonClick = (event:React.MouseEvent) =>
	{
		if (this.props.pushCrumb)
		{
			this.props.pushCrumb("Customize" , <ColorRampCustomizer colorRamp={this.props.colorRamp} pushCrumb={this.props.pushCrumb}/>)
		}
	}

	// this ensures parent(colorRampEditor colorRamp) callback wont call render again
	shouldComponentUpdate(nextProps:ColorRampSelectorProps)
	{
		return this.props.colorRamp !== nextProps.colorRamp;
	}

	render()
	{
		var colors:number[] = this.props.colorRamp ? this.props.colorRamp.getColors() : [];
		var hexColors:string[] = this.props.colorRamp ? this.props.colorRamp.getHexColors() : [];

		var filteredRamps = (
			this.state.selectedFilter == ALL
			?	ColorRamp.allColorRamps
			:	ColorRamp.allColorRamps.filter((v) => v.tags.indexOf(this.state.selectedFilter) >= 0)
		);

		if (this.props.pushCrumb)
		{
			return (
				<VBox className="weave-padded-vbox" style={{flex: 1}} disabled={!this.props.colorRamp}>
					<VBox className="weave-padded-vbox">
						<HBox style={{overflow: "auto"}} className="weave-padded-hbox">
							<ColorRampComponent style={{flex: 1, border:"none" }} direction="right" ramp={hexColors}/>
							<Button
								onClick={this.reverseColors}
								title="Click to reverse colors"
								style={ { borderRadius:0, borderLeft:"none"} }
							>
								{'↓↑'}
							</Button>
							<Button
								onClick={this.onCustomizeButtonClick}
								title="Click to customize colors"
								style={ { borderTopLeftRadius:0, borderBottomLeftRadius:0,borderLeft:"none"} }
							>
								<i className="fa fa-angle-right" aria-hidden="true" style={ {fontWeight:"bold"} }/>
							</Button>
						</HBox>
					</VBox>
					
					<ColorRampList selectedColors={colors} allColorRamps={filteredRamps} onChange={this.handleColorRampSelectionChange}/>
					<HBox style={{alignItems: "center"}} className="weave-padded-hbox">
						{Weave.lang("Filter: ")}
						<ComboBox
							fluid={false}
							value={this.state.selectedFilter}
							options={this.filterOptions}
							onChange={(value:string) => { this.setState({ selectedFilter: value}) }} direction="upward"
						/>
					</HBox>
				</VBox>
			);
		}
		else
		{
			return (
				<VBox className="weave-padded-vbox" style={{flex: 1}} disabled={!this.props.colorRamp}>
					<HBox className="weave-padded-hbox" style={{flex: 1}}>
						<HBox style={{flex: .7, overflow: "auto"}}>
							<ColorRampList selectedColors={colors} allColorRamps={filteredRamps} onChange={this.handleColorRampSelectionChange}/>
						</HBox>
						<VBox style={{flex: .3}} className="weave-padded-vbox">
							<label style={{marginTop: 5, fontWeight: "bold"}}>{Weave.lang("Customize")}</label>
							<ColorRampCustomizer colorRamp={this.props.colorRamp} />
						</VBox>
					</HBox>
					<HBox className="weave-padded-hbox">
						<HBox style={{flex: .7, alignItems: "center"}} className="weave-padded-hbox">
							{Weave.lang("Filter: ")}
							<ComboBox
								fluid={false}
								value={this.state.selectedFilter}
								options={this.filterOptions}
								onChange={(value:string) => { this.setState({ selectedFilter: value}) }}
								direction="upward"
							/>
						</HBox>
						<HBox style={{flex: .3, justifyContent: "space-between"}}>
							<CenteredIcon onClick={this.reverseColors}>{'↓↑'}</CenteredIcon>
							<ColorPicker  buttonMode={true} direction={ColorPicker.TOP_LEFT} buttonLabel="Add color" onClose={(newColor:string) => this.addColor( newColor)}/>
						</HBox>
					</HBox>
				</VBox>
			);
		}
	}
}

interface ColorRampCustomizerProps extends React.Props<ColorRampCustomizer>
{
	colorRamp:ColorRamp;
	pushCrumb?:Function;
}

interface ColorRampCustomizerState
{
}

// Component to customize the selected ramp
class ColorRampCustomizer extends React.Component<ColorRampCustomizerProps, ColorRampCustomizerState>
{
	constructor(props:ColorRampCustomizerProps)
	{
		super(props);
		if (this.props.colorRamp)
			this.props.colorRamp.addGroupedCallback(this, this.forceUpdate);
	}

	componentWillReceiveProps(nextProps:ColorRampCustomizerProps):void
	{
		if (this.props.colorRamp !== nextProps.colorRamp)
		{
			if (this.props.colorRamp)
				this.props.colorRamp.removeCallback(this, this.forceUpdate);
			if (nextProps.colorRamp)
				nextProps.colorRamp.addGroupedCallback(this, this.forceUpdate);
		}
	}

	updateColorsAtIndex(index:number, color:string)
	{
		if (this.props.colorRamp)
		{
			var colors = this.props.colorRamp.getColors() as number[];
			if(index != null){
				colors[index] = StandardLib.asNumber(color);
			}
			else
			{
				colors.push(StandardLib.asNumber(color));
			}
			this.props.colorRamp.setSessionState(colors)

		}
	}

	removeColorAtIndex(index:number)
	{
		if (this.props.colorRamp)
		{
			var colors:number[] = this.props.colorRamp.getColors() as number[];
			colors.splice(index, 1);
			this.props.colorRamp.setSessionState(colors)
		}
	}

	handleColorRampSelectionChange = (newColors:number[]) =>
	{
		if (this.props.colorRamp)
			this.props.colorRamp.setSessionState(newColors);
	}

	// this ensures parent(colorRampSelector colorRamp) callback wont call render again
	shouldComponentUpdate(nextProps:ColorRampCustomizerProps)
	{
		return this.props.colorRamp !== nextProps.colorRamp;
	}

	render()
	{
		var colors:number[] = this.props.colorRamp ? this.props.colorRamp.getColors() : [];
		var hexColors:string[] = this.props.colorRamp ? this.props.colorRamp.getHexColors() : [];

		var listOptions = hexColors.map((hexColor, index) => {
			return {
				value: index,
				label: (
					<HBox style={{flex: 1, justifyContent: "space-between", verticalAlign: "middle"}}>
						<HBox className="weave-padded-hbox">
							<ColorPicker height="14px" width="36px" hexColor={hexColor} onClose={(newColor:string) => this.updateColorsAtIndex(index, newColor)}/>
							<span style={{alignSelf: "center", fontFamily: "monospace"}}>{hexColor.toUpperCase()}</span>
						</HBox>
						<CenteredIcon iconProps={{className: "fa fa-times fa-fw"}} onClick={() => this.removeColorAtIndex(index)}/>
					</HBox>
				)
			}
		});

		if (this.props.pushCrumb) // for Weave Tool Editor
		{
			return (
				<VBox className="weave-padded-vbox">
					<HBox style={{overflow: "auto"}} className="weave-padded-hbox">
						<ColorRampComponent style={{width: 30}} direction="bottom" ramp={hexColors}/>
						<List style={ {flex:1} } options={listOptions}/>
					</HBox>
					<div style={{alignSelf:"flex-end"}}>
						<HBox>
							<ColorPicker  buttonMode={true} buttonLabel="Add"  direction={ColorPicker.BOTTOM_LEFT} onClose={(newColor:string) => this.updateColorsAtIndex(null, newColor)}/>
						</HBox>

					</div>
				</VBox>
			);
		}
		else // for popUp
		{
			return (
				<HBox style={{overflow: "auto"}} className="weave-padded-hbox">
					<ColorRampComponent style={{width: 30}} direction="bottom" ramp={hexColors}/>
					<List style={ {flex:1} }  options={listOptions}/>
				</HBox>
			);
		}
	}
}
