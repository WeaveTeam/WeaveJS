/// <reference path="../../../typings/react/react.d.ts"/>
/// <reference path="../../../typings/weave/weavejs.d.ts"/>

import * as React from "react";
import ui from "../../react-ui/ui";

import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;
import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;

interface NumericRangeDataFilterEditorProps {
	filter: ColumnDataFilter;
}

interface NumericRangeDataFilterEditorState {

}

export type FilterOption = {
	value:number, 
	label:string
}

class NumericRangeDataFilterEditor extends React.Component<NumericRangeDataFilterEditorProps, NumericRangeDataFilterEditorState> {

	public enabled:LinkableBoolean;
	public forceDiscreteValues:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
	public showPlayButton:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
	public showToggle:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
	public showToggleLabel:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));

	private min:number;
	private max:number;
	private options:FilterOption[];

	constructor(props:NumericRangeDataFilterEditorProps) {
		super(props);
		this.options = [];
	}

	get deprecatedStateMapping()
	{
		return {};
	}

	componentDidMount() {
		Weave.getCallbacks(this.forceDiscreteValues).addGroupedCallback(this, this.columnChanged);
		Weave.getCallbacks(this.props.filter.column).addGroupedCallback(this, this.columnChanged);
	}

	onChange(selectedValues:number[]) {
		this.props.filter.values.state = selectedValues;
	}

	columnChanged() {
		this.options = _.sortByOrder(_.uniq(this.props.filter.column.keys.map((key:IQualifiedKey) => {
			return {
				value: this.props.filter.column.getValueFromKey(key, Number) as number,
				label: this.props.filter.column.getValueFromKey(key, String) as string
			};
		}), "value"), ["value"], ["asc"]);
		this.forceUpdate();
	}

	render():JSX.Element {
		let values:any = this.props.filter.values.state;
		if (this.forceDiscreteValues.value)
		{
			return <ui.HBox style={{width:"100%", height:"100%", alignItems:"center", padding: 10}}>
					<ui.HSlider type="numeric-discrete" options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
				</ui.HBox>;
		}
		else
		{
			return <ui.HBox style={{width:"100%", height:"100%", alignItems:"center", padding: 10}}>
					<ui.HSlider type="numeric"  options={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
				</ui.HBox>;
		}
	}
}
