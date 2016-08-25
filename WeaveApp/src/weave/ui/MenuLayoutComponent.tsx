import * as React from "react";
import * as weavejs from "weavejs";
import * as _ from "lodash";
import HBox = weavejs.ui.flexbox.HBox;
import VBox = weavejs.ui.flexbox.VBox;
import HSlider from "weave/ui/slider/HSlider";
import VSlider from "weave/ui/slider/VSlider";
import ComboBox = weavejs.ui.ComboBox;
import FloatingDiv = weavejs.ui.FloatingDiv;
import CheckBoxList = weavejs.ui.CheckBoxList;
import ComboBoxOption = weavejs.ui.ComboBoxOption;
import List = weavejs.ui.List;
import {Weave} from "weavejs";

import Button = weavejs.ui.Button;
import CenteredIcon = weavejs.ui.CenteredIcon;

export interface IMenuLayoutComponentProps
{
	selectedItems:any;//TODO find out right typing
	options:{label:string,value:any}[];
	multiple?: boolean;
	displayMode:string;
	onChange : (selectedValue:any[]) => void;
	playToggle?: ()=>void; /* If playToggle is not given, don't display play/pause button */
	isPlaying?: boolean;
}

export const LAYOUT_LIST:string = "List";
export const LAYOUT_COMBO:string = "ComboBox";
export const LAYOUT_VSLIDER:string = "VSlider";
export const LAYOUT_HSLIDER:string = "HSlider";
export const LAYOUT_CHECKBOXLIST:string = "CheckBoxList";

export interface IMenuLayoutComponentState
{
	
}

export default class MenuLayoutComponent extends React.Component<IMenuLayoutComponentProps, IMenuLayoutComponentState>
{
	constructor(props:IMenuLayoutComponentProps)
	{
		super(props);
	}

	render():JSX.Element
	{
		var options = this.props.options.map((option) => {
			return {
				label: _.isString(option.label) ? Weave.lang(option.label) : option.label,
				value: option.value
			};
		});
		let button = this.props.playToggle ?
			<CenteredIcon onClick={this.props.playToggle} iconProps={{className: this.props.isPlaying ? "fa fa-pause fa-fw" : "fa fa-play fa-fw"}}/>
			: null;
		switch (this.props.displayMode)
		{
			case LAYOUT_LIST:
				return (
					<VBox>
						{button}
						<List options={ options } multiple={this.props.multiple} onChange={ this.props.onChange } selectedValues={ this.props.selectedItems }/>
					</VBox>
				);
			case LAYOUT_HSLIDER:
				return (
					<HBox style={{ flex: 1, paddingLeft: 25, paddingRight: 25, overflow: "hidden" }}>
						{button}
						<HSlider options={ options } onChange={ this.props.onChange} selectedValues={ this.props.selectedItems } type="categorical"/>
					</HBox>
				);
			case LAYOUT_VSLIDER:
				return (
					<VBox style={{ flex: 1, paddingTop: 25, paddingBottom: 25, overflow: "hidden" }}>
						{button}
						<VSlider options={ options } onChange={ this.props.onChange } selectedValues={ this.props.selectedItems } type="categorical"/>
					</VBox>
				);
			case LAYOUT_CHECKBOXLIST:
				return (
					<VBox style={{flex: 1}}>
						{button}
						<CheckBoxList options={options} selectedValues={this.props.selectedItems} onChange={this.props.onChange}/>
					</VBox>
				);
			case LAYOUT_COMBO:
				return (
					<VBox style={{flex: 1, padding: 5}}>
						<FloatingDiv useContentHeight style={{flex: 1}}>
							<ComboBox
								placeholder={(Weave.lang("Select a column"))}
								options={ options as ComboBoxOption[] }
								onChange={ this.props.onChange }
								value={ _.head(this.props.selectedItems as any[]) }
							/>
						</FloatingDiv>
					</VBox>
				);
			default:
				return null;
		}
	}
}
