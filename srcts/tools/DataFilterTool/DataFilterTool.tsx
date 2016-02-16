/// <reference path="../../../typings/react/react.d.ts"/>
///<reference path="../../../typings/weave/weavejs.d.ts"/>

import * as React from "react";
import {IVisTool, IVisToolProps, IVisToolState} from "../IVisTool";
import DiscreteValuesDataFilterEditor from "./DiscreteValuesDataFilterEditor";
import NumericRangeDataFilterEditor from "./NumericRangeDataFilterEditor";

import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IColumnStatistics = weavejs.api.data.IColumnStatistics;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;
import LinkableVariable = weavejs.core.LinkableVariable;
import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
import ColumnUtils = weavejs.data.ColumnUtils;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;

export interface IDataFilterState extends IVisToolState {
	editorType:any; //React.Component<any, any>;
}

//Weave.registerClass("weave.ui.DataFilterTool", DataFilterTool, [weavejs.api.core.ILinkableObjectWithNewProperties]);
export default class DataFilterTool extends React.Component<IVisToolProps, IDataFilterState> implements IVisTool, ILinkableObjectWithNewProperties {

	public filter:LinkableDynamicObject = Weave.linkableChild(this,  new LinkableDynamicObject(ColumnDataFilter));
	public editor:LinkableDynamicObject = Weave.linkableChild(this, new LinkableDynamicObject());

	// static DISCRETEFILTERCLASS:string = "weave.editors::DiscreteValuesDataFilterEditor";
	// static RANGEFILTERCLASS:string = "weave.editors::NumericRangeDataFilterEditor";

	constructor(props:IVisToolProps) {
		super(props);
	}

	componentDidMount() {
		this.filter.targetPath = ["defaultSubsetKeyFilter", "filters", Weave.getRoot(this).getName(this)]; 
	}
	
	onClick(item:any/*React.Component<any, any>*/):void
	{
		this.setState({
			editorType: item
		});
	}

	get deprecatedStateMapping()
	{
		return {};
	}

	private getFilter():ColumnDataFilter
	{
		return this.filter.target as ColumnDataFilter;
	}

	private getFilterColumn():IAttributeColumn
	{
		return this.getFilter() ? this.getFilter().column as IAttributeColumn : null;
	}

	get title():string {
		if (this.getFilterColumn())
			return Weave.lang('Filter for {0}', ColumnUtils.getTitle(this.getFilterColumn()));
		return Weave.lang('Filter');
    }

	render():JSX.Element {
		return React.createElement(this.state.editorType, {
			ref: (editor:any) => {
				this.editor.target
			},
			filter: this.filter.target
		});
	}
}

weavejs.util.BackwardsCompatibility.forceDeprecatedState(DataFilterTool); // TEMPORARY HACK - remove when class is refactored

Weave.registerClass("weavejs.tool.DataFilter", DataFilterTool, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.ui::DataFilterTool", DataFilterTool);
