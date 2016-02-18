/// <reference path="../../../typings/react/react.d.ts"/>
/// <reference path="../../../typings/weave/weavejs.d.ts"/>
/// <reference path="../../../typings/react-bootstrap/react-bootstrap.d.ts"/>

import * as React from "react";
import ui from "../../react-ui/ui";
import {DropdownButton, MenuItem} from "react-bootstrap";
import AbstractFilterEditor from "./AbstractFilterEditor";
import {FilterEditorProps, FilterEditorState, FilterOption} from "./AbstractFilterEditor";

import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;
import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;

export default class DiscreteValuesDataFilterEditor extends AbstractFilterEditor {

	private static LAYOUT_LIST:string = "List";
	private static LAYOUT_COMBO:string = "ComboBox";
	private static LAYOUT_VSLIDER:string = "VSlider";
	private static LAYOUT_HSLIDER:string = "HSlider";
	private static LAYOUT_CHECKBOXLIST:string = "CheckBoxList";

	public layoutMode:LinkableString = Weave.linkableChild(this, new LinkableString(DiscreteValuesDataFilterEditor.LAYOUT_LIST), this.forceUpdate);
	public values:LinkableVariable = Weave.linkableChild(this, LinkableVariable);


	constructor(props:FilterEditorProps) {
		super(props);
		this.options = [];
	}

	componentDidMount() {

	}
	
	columnChanged() {
		var column:IAttributeColumn = this.getColumn();
		this.options = _.sortByOrder(_.uniq(column.keys.map((key:IQualifiedKey) => {
			let val:string = column.getValueFromKey(key, String);
			return {
				value: val,
				label: val
			};
		}), "value"), ["value"], ["asc"]);
		this.forceUpdate();
	}


	get deprecatedStateMapping():Object
	{
		return [super.deprecatedStateMapping, {
			"layoutMode": this.layoutMode
		}];
	}

	render():JSX.Element {
		let values:any = this.getFilter().values.state;
		
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
										// TODO non efficient.. needs to be fixed with external bound function
										return  <MenuItem active={values.indexOf(option) > -1} key={index} onSelect={() => { this.getFilter().values.state = [option.value]; }}>{option.label || option.value}</MenuItem>
									})
								}
							</DropdownButton>
						</ui.VBox>;
		}
	}
}


Weave.registerClass("weavejs.tool.DiscreteValuesDataFilterEditor", DiscreteValuesDataFilterEditor, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.editors::DiscreteValuesDataFilterEditor", DiscreteValuesDataFilterEditor);
