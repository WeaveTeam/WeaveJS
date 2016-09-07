import * as React from "react";
import * as weavejs from "weavejs";
import * as _ from "lodash";
import {Weave} from "weavejs";

import HBox = weavejs.ui.flexbox.HBox;
import VBox = weavejs.ui.flexbox.VBox;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;
import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import ColumnUtils = weavejs.data.ColumnUtils;
import AbstractFilterEditor from "weaveapp/editor/AbstractFilterEditor";
import {FilterEditorProps} from "weaveapp/editor/AbstractFilterEditor";
import HSlider from "weaveapp/ui/slider/HSlider";
import VSlider from "weaveapp/ui/slider/VSlider";

export default class NumericRangeDataFilterEditor extends AbstractFilterEditor
{
	static WEAVE_INFO = Weave.setClassInfo(NumericRangeDataFilterEditor, {
		id: "weavejs.editor.NumericRangeDataFilterEditor",
		interfaces: [ILinkableObjectWithNewProperties]
	});

	static get OPTIONS():string[]{
		return ["Force Discrete Values"];
	}

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
			this.options = ColumnUtils.getRecords(
				{ value: this.column, label: this.column },
				this.column.keys,
				{ value: Number, label: String }
			);
			this.options = _.sortByOrder(_.uniq(this.options, "value"), ["value"], ["asc"]);
		}
		let values:any = this.filter ? this.filter.values.state : [];
		if (this.forceDiscreteValues.value)
		{
			return (
				<HBox style={{flex: 1, padding: 25}}>
					<HSlider type="numeric-discrete" options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
				</HBox>
			);
		}
		else
		{
			return (
				<HBox style={{flex: 1, padding: 25}}>
					<HSlider type="numeric" options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
				</HBox>
			);
		}
	}
}
