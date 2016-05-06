import * as React from 'react';
import {HBox, VBox} from "../react-ui/FlexBox";
import List from "../react-ui/List";
import HSlider from "../react-ui/RCSlider/HSlider";
import VSlider from "../react-ui/RCSlider/VSlider";
import ComboBox from '../semantic-ui/ComboBox';
import {ComboBoxOption} from "../semantic-ui/ComboBox";
import CheckBoxList from "../react-ui/CheckBoxList";
import * as _ from 'lodash';

export interface IMenuLayoutComponentProps
{
	selectedItems:any;//TODO find out right typing
	options:{label:string,value:any}[];
	displayMode:string;
	onChange : (selectedValue:any[]) => void;
}

const LAYOUT_LIST:string = "List";
const LAYOUT_COMBO:string = "ComboBox";
const LAYOUT_VSLIDER:string = "VSlider";
const LAYOUT_HSLIDER:string = "HSlider";
const LAYOUT_CHECKBOXLIST:string = "CheckBoxList";

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
		switch (this.props.displayMode)
		{
			case LAYOUT_LIST:
				return (
					<VBox>
						<List options={ this.props.options }  onChange={ this.props.onChange } selectedValues={ this.props.selectedItems }/>
					</VBox>
				);
			case LAYOUT_HSLIDER:
				return (
					<HBox style={{ flex: 1, padding: 25}}>
						<HSlider options={ this.props.options } onChange={ this.props.onChange} selectedValues={ this.props.selectedItems } type="categorical"/>
					</HBox>
				);
			case LAYOUT_VSLIDER:
				return (
					<VBox style={{ flex: 1, padding: 25 }}>
						<VSlider options={ this.props.options } onChange={ this.props.onChange } selectedValues={ this.props.selectedItems } type="categorical"/>
					</VBox>
				);
			case LAYOUT_CHECKBOXLIST:
				return (
					<VBox style={{flex: 1, padding: 10}}>
						<CheckBoxList options={this.props.options} onChange={this.props.onChange} selectedValues={this.props.selectedItems}/>
					</VBox>
				);
			case LAYOUT_COMBO:
				return (
					<VBox style={{flex: 1, justifyContent:"center", padding: 5}}>
						<ComboBox placeholder={(Weave.lang("Select a column"))}
						          options={ this.props.options as ComboBoxOption[] }
						          onChange={ this.props.onChange }
						          value={ _.head(this.props.selectedItems as any[]) }/>
					</VBox>
				);
			default:
				return (
					<div/>
				)
		}
	}
}