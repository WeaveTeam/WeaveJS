import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {HBox, VBox} from "../../react-ui/FlexBox";
import CheckBoxList from "../../react-ui/CheckBoxList";
import List from "../../react-ui/List";
import HSlider from "../../react-ui/RCSlider/HSlider";
import VSlider from "../../react-ui/RCSlider/VSlider";
import AbstractFilterEditor from "./AbstractFilterEditor";
import {FilterEditorProps, FilterEditorState, FilterOption} from "./AbstractFilterEditor";

import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;
import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import DataType = weavejs.api.data.DataType;
import ColumnMetadata = weavejs.api.data.ColumnMetadata;

export const LAYOUT_LIST:string = "List";
export const LAYOUT_COMBO:string = "ComboBox";
export const LAYOUT_VSLIDER:string = "VSlider";
export const LAYOUT_HSLIDER:string = "HSlider";
export const LAYOUT_CHECKBOXLIST:string = "CheckBoxList";



export default class DiscreteValuesDataFilterEditor extends AbstractFilterEditor
{
	static get OPTIONS():string[]{
		return [LAYOUT_LIST,
			LAYOUT_COMBO,
			LAYOUT_VSLIDER,
			LAYOUT_HSLIDER,
			LAYOUT_CHECKBOXLIST];
	}

	public layoutMode:LinkableString = Weave.linkableChild(this, new LinkableString(LAYOUT_LIST, this.verifyLayoutMode), this.forceUpdate);
	public values:LinkableVariable = Weave.linkableChild(this, LinkableVariable);

	constructor(props:FilterEditorProps) 
	{
		super(props);
		this.options = [];
	}


	
	verifyLayoutMode(value:string):boolean
	{
		return [
			LAYOUT_LIST,
			LAYOUT_COMBO,
			LAYOUT_VSLIDER,
			LAYOUT_HSLIDER,
			LAYOUT_CHECKBOXLIST
		].indexOf(value) >= 0;
	}

	get deprecatedStateMapping():Object
	{
		return [super.deprecatedStateMapping, {
			"layoutMode": this.layoutMode
		}];
	}
	
	getChoices():FilterOption[]
	{
		var dataType = DataType.getClass(this.column.getMetadata(ColumnMetadata.DATA_TYPE));
		this.options = weavejs.data.ColumnUtils.getRecords(
			{ value: this.column, label: this.column },
			this.column.keys,
			{ value: dataType, label: String }
		);
		return _.sortByOrder(_.uniq(this.options, "value"), ["value"], ["asc"]);
	}

	render():JSX.Element 
	{
		if (Weave.detectChange(this, this.column))
		{
			this.options = this.getChoices();
		}
		let values:any = this.filter ? this.filter.values.state : [];
		
		switch (this.layoutMode.value)
		{
			case LAYOUT_CHECKBOXLIST:
				return <CheckBoxList options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
				
			case LAYOUT_LIST:
				return <List options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
				
			case LAYOUT_HSLIDER:
				return <HBox style={{flex: 1, alignItems:"center", padding: 10}}>
							<HSlider type="categorical" options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
						</HBox>;
			
			case LAYOUT_VSLIDER:
				return <VBox style={{flex: 1, alignItems:"center", padding: 10}}>
							<VSlider type="categorical" options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
						</VBox>;
				
			case LAYOUT_COMBO:
				return <VBox style={{flex: 1, alignItems:"center"}}>
							<select style={{flex:1, padding: 5}} value={values && values.length ? values[0] : ""} onChange={(event:React.FormEvent) => { this.onChange([(event.target as any).value]) }} placeholder="Selected filter value...">
								{
									this.options.map((option:FilterOption, index:number) => {
										// TODO non efficient.. needs to be fixed with external bound function
										return  <option value={option.value as string} key={index}>
											{
												option.label || option.value
											}
										</option>;
									})
								}
							</select>
						</VBox>;
		}
	}
}

Weave.registerClass(DiscreteValuesDataFilterEditor, "weavejs.tool.DiscreteValuesDataFilterEditor", [weavejs.api.core.ILinkableObjectWithNewProperties]);
