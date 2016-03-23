import * as React from "react";
import * as _ from "lodash";
import AbstractFilterEditor from "./AbstractFilterEditor";
import {FilterEditorProps, FilterEditorState, FilterOption} from "./AbstractFilterEditor";
import HSlider from "../../react-ui/RCSlider/HSlider";
import VSlider from "../../react-ui/RCSlider/VSlider";
import {HBox, VBox} from "../../react-ui/FlexBox";

import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;
import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import LinkableWatcher = weavejs.core.LinkableWatcher;

export default class NumericRangeDataFilterEditor extends AbstractFilterEditor
{
	public forceDiscreteValues:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false), this.handleColumn);

	constructor(props:FilterEditorProps)
	{
		super(props);
		this.options = [];
	}

	get deprecatedStateMapping():Object
	{
		return [super.deprecatedStateMapping, {
			"forceDiscreteValues": this.forceDiscreteValues
		}];
	}

	onChange(selectedValues:number[]) 
	{
		this.filter.values.state = selectedValues;
	}

	render():JSX.Element
	{
		if (Weave.detectChange(this, this.column))
		{
			this.options = weavejs.data.ColumnUtils.getRecords(
				{ value: this.column, label: this.column },
				this.column.keys,
				{ value: Number, label: String }
			);
			this.options = _.sortByOrder(_.uniq(this.options, "value"), ["value"], ["asc"]);
		}
		let values:any = this.filter ? this.filter.values.state : [];
		if (this.forceDiscreteValues.value)
		{
			return <HBox style={{flex: 1, alignItems: "center", padding: 10}}>
					<HSlider type="numeric-discrete" options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
				</HBox>;
		}
		else
		{
			return <HBox style={{flex: 1, alignItems: "center", padding: 10}}>
					<HSlider type="numeric" options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
				</HBox>;
		}
	}
}

Weave.registerClass("weavejs.tool.NumericRangeDataFilterEditor", NumericRangeDataFilterEditor, [weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.editors::NumericRangeDataFilterEditor", NumericRangeDataFilterEditor);
