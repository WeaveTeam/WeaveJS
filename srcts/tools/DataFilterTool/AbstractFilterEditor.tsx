import * as React from "react";

import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;
import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IColumnStatistics = weavejs.api.data.IColumnStatistics;
import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
import LinkableWatcher = weavejs.core.LinkableWatcher;

export type FilterOption = {
	value:string|number, 
	label:string
}

export interface FilterEditorProps
{
	filter:ColumnDataFilter
}

export interface FilterEditorState
{
}

export default class AbstractFilterEditor
	extends React.Component<FilterEditorProps, FilterEditorState>
	implements ILinkableObjectWithNewProperties
{
	public showPlayButton = Weave.linkableChild(this, new LinkableBoolean(false));
	public showToggle = Weave.linkableChild(this, new LinkableBoolean(true));
	public showToggleLabel = Weave.linkableChild(this, new LinkableBoolean(false));
	
	private filterWatcher = Weave.privateLinkableChild(this, new LinkableWatcher(ColumnDataFilter), this.handleFilter);
	private statsWatcher = Weave.privateLinkableChild(this, new LinkableWatcher(IColumnStatistics), this.handleColumn);

	protected options:FilterOption[];

	constructor(props:FilterEditorProps) 
	{
		super(props);
		this.options = [];
		Weave.getCallbacks(this).addGroupedCallback(this, this.forceUpdate);
	}
	
	componentWillReceiveProps(props:FilterEditorProps):void
	{
		this.filterWatcher.target = props.filter;
		this.statsWatcher.target = this.column ? weavejs.WeaveAPI.StatisticsCache.getColumnStatistics(this.column) : null;
	}
	
	get filter():ColumnDataFilter 
	{
		return this.filterWatcher.target as ColumnDataFilter;
	}

	set filter(columnDataFilter:ColumnDataFilter)
	{
		this.filterWatcher.target  = columnDataFilter ;
	}
	
	get column():DynamicColumn
	{
		var filter = this.filter;
		return filter ? filter.column : null;
	}

	get stats():IColumnStatistics
	{
		return this.statsWatcher.target as IColumnStatistics;
	}

	handleFilter()
	{
		
	}

	handleColumn()
	{
		
	}

	componentDidMount() 
	{

	}

	onChange(selectedValues:Object)
	{
		var filter = this.filter;
		if (filter)
			filter.values.state = selectedValues;
	}

	get deprecatedStateMapping():Object
	{
		return {
			"showPlayButton": this.showPlayButton,
			"showToggle": this.showToggle,
			"showToggleLabel": this.showToggleLabel
		};
	}
}
