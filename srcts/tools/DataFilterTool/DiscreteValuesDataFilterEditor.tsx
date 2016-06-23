import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {HBox, VBox} from "../../react-ui/FlexBox";
import AbstractFilterEditor from "./AbstractFilterEditor";
import {FilterEditorProps, FilterEditorState, FilterOption} from "./AbstractFilterEditor";
import MenuLayoutComponent from '../../ui/MenuLayoutComponent';

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

	public layoutMode:LinkableString = Weave.linkableChild(this, new LinkableString(LAYOUT_LIST, this.verifyLayoutMode));
	public values:LinkableVariable = Weave.linkableChild(this, LinkableVariable);

	constructor(props:FilterEditorProps) 
	{
		super(props);
		this.options = [];
	}


	
	verifyLayoutMode(value:string):boolean
	{
		return DiscreteValuesDataFilterEditor.OPTIONS.indexOf(value) >= 0;
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

		return(<MenuLayoutComponent options={ this.options }
		                            displayMode={ this.layoutMode.value }
		                            onChange={ this.onChange.bind(this) }
		                            selectedItems={ values }
		/>);
	}
}

Weave.registerClass(DiscreteValuesDataFilterEditor, "weavejs.tool.DiscreteValuesDataFilterEditor", [weavejs.api.core.ILinkableObjectWithNewProperties]);
