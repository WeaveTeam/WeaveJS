/// <reference path="../../../typings/react/react.d.ts"/>
/// <reference path="../../../typings/weave/weavejs.d.ts"/>

import * as React from "react";
import ui from "../../react-ui/ui";
import AbstractFilterEditor from "./AbstractFilterEditor";
import {FilterEditorProps, FilterEditorState, FilterOption} from "./AbstractFilterEditor";

import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;
import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;


export default class NumericRangeDataFilterEditor extends AbstractFilterEditor {

	public forceDiscreteValues:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false), this.columnChanged);

	private min:number;
	private max:number;

	constructor(props:FilterEditorProps) {
		super(props);
		this.options = [];
	}

	get deprecatedStateMapping():Object
	{
		return [super.deprecatedStateMapping, {
			"forceDiscreteValues": this.forceDiscreteValues
		}];
	}

	componentDidMount() {

	}

	onChange(selectedValues:number[]) {
		this.getFilter().values.state = selectedValues;
	}

	columnChanged() {
		var column:IAttributeColumn = this.getColumn();
		this.options = _.sortByOrder(_.uniq(column.keys.map((key:IQualifiedKey) => {
			return {
				value: column.getValueFromKey(key, Number) as number,
				label: column.getValueFromKey(key, String) as string
			};
		}), "value"), ["value"], ["asc"]);
		this.forceUpdate();
	}

	render():JSX.Element {
		let values:any = this.getFilter().values.state;
		if (this.forceDiscreteValues.value)
		{
			return <ui.HBox style={{width:"100%", height:"100%", alignItems:"center", padding: 10}}>
					<ui.HSlider type="numeric-discrete" options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
				</ui.HBox>;
		}
		else
		{
			return <ui.HBox style={{width:"100%", height:"100%", alignItems:"center", padding: 10}}>
					<ui.HSlider type="numeric" options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
				</ui.HBox>;
		}
	}
}

Weave.registerClass("weavejs.tool.NumericRangeDataFilterEditor", NumericRangeDataFilterEditor, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.editors::NumericRangeDataFilterEditor", NumericRangeDataFilterEditor);
