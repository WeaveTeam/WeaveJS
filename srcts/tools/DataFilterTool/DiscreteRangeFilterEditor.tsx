/// <reference path="../../../typings/react/react.d.ts"/>
/// <reference path="../../../typings/weave/weavejs.d.ts"/>
/// <reference path="../../../typings/react-bootstrap/react-bootstrap.d.ts"/>

import * as React from "react";
import ui from "../../react-ui/ui";
import {DropdownButton, MenuItem} from "react-bootstrap";

import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;
import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;

type FilterOption = {
	value:string, 
	label:string
}

export interface DiscreteValuesDataFilterEditorProps {
	filter: ColumnDataFilter;
	column:IAttributeColumn;
}

export interface DiscreteValuesDataFilterEditorState {

}

export default class DiscreteValuesDataFilterEditor extends React.Component<DiscreteValuesDataFilterEditorProps, DiscreteValuesDataFilterEditorState>
 													implements ILinkableObjectWithNewProperties {

	private static LAYOUT_LIST:string = "List";
	private static LAYOUT_COMBO:string = "ComboBox";
	private static LAYOUT_VSLIDER:string = "VSlider";
	private static LAYOUT_HSLIDER:string = "HSlider";
	private static LAYOUT_CHECKBOXLIST:string = "CheckBoxList";

	public layoutMode:LinkableString = Weave.linkableChild(this, new LinkableString(DiscreteValuesDataFilterEditor.LAYOUT_LIST));
	public showPlayButton:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
	public showToggle:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
	public showToggleLabel:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
	
	public values:LinkableVariable;

	
	private options:FilterOption[];

	constructor(props:DiscreteValuesDataFilterEditorProps) {
		super(props);
		this.options = [];
	}

	componentDidMount() {
		Weave.getCallbacks(this.layoutMode).addGroupedCallback(this, this.forceUpdate);
		Weave.getCallbacks(this.showToggle).addGroupedCallback(this, this.forceUpdate);
		Weave.getCallbacks(this.showToggleLabel).addGroupedCallback(this, this.forceUpdate);
		Weave.getCallbacks(this.props.column).addGroupedCallback(this, this.columnChanged);
	}

	columnChanged() {
		this.options = _.sortByOrder(_.uniq(this.props.column.keys.map((key:IQualifiedKey) => {
			let val:string = this.props.column.getValueFromKey(key, String);
			return {
				value: val,
				label: val
			};
		}), "value"), ["value"], ["asc"]);
		this.forceUpdate();
	}

	onChange(selectedValues:string[]) {
		this.props.filter.values.state = selectedValues;
	}

	get deprecatedStateMapping()
	{
		return {};
	}

	render():JSX.Element {
		let values:any = this.props.filter.values.state;
		
		switch (this.layoutMode && this.layoutMode.value) {
			case DiscreteValuesDataFilterEditor.LAYOUT_CHECKBOXLIST:
				return <ui.CheckBoxList values={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
			case DiscreteValuesDataFilterEditor.LAYOUT_LIST:
				return <ui.ListItem options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
			case DiscreteValuesDataFilterEditor.LAYOUT_HSLIDER:
				return <ui.HBox style={{width:"100%", height:"100%", alignItems:"center", padding: 10}}>
							<ui.HSlider type="categorical" options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
						</ui.HBox>;
			case DiscreteValuesDataFilterEditor.LAYOUT_VSLIDER:
				return <ui.VBox style={{width:"100%", height:"100%", alignItems:"center", padding: 10}}>
							<ui.VSlider type="categorical" options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
						</ui.VBox>;
			case DiscreteValuesDataFilterEditor.LAYOUT_COMBO:
				return <ui.VBox style={{height:"100%", flex:1.0, alignItems:"center"}}>
							<DropdownButton title={values[0]} id="bs.dropdown">
								{
									this.options.map((option:FilterOption, index:number) => {
										return  <MenuItem active={values.indexOf(option) > -1} key={index} onSelect={() => { this.props.filter.values.state = [option.value]; }}>{option.label || option.value}</MenuItem>
									})
								}
							</DropdownButton>
						</ui.VBox>;
		}
	}
}
