/// <reference path="../../../typings/react/react.d.ts"/>
///<reference path="../../../typings/weave/weavejs.d.ts"/>

import * as React from "react";
import ui from "../../react-ui/ui";
import {IVisTool, IVisToolProps, IVisToolState} from "../IVisTool";
import AbstractFilterEditor from "./AbstractFilterEditor";
import NumericRangeDataFilterEditor from "./NumericRangeDataFilterEditor";
import DiscreteValuesDataFilterEditor from "./DiscreteValuesDataFilterEditor";
import {FilterEditorProps, FilterEditorState} from "./AbstractFilterEditor";

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
import LinkablePlaceholder = weavejs.core.LinkablePlaceholder;
import WeaveAPI = weavejs.WeaveAPI;

export default class DataFilterTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool, ILinkableObjectWithNewProperties
{
	public filter:LinkableDynamicObject = Weave.linkableChild(this,  new LinkableDynamicObject(ColumnDataFilter), this.handleFilterChange);
	public editor:LinkableDynamicObject = Weave.linkableChild(this, new LinkableDynamicObject(), this.forceUpdate);
	public editorType:typeof AbstractFilterEditor;

	private listItemOptions = [
		{
			value: NumericRangeDataFilterEditor,
			label: "Continuous range"
		},
		{
			value: DiscreteValuesDataFilterEditor,
			label: "Discrete values"
		}
	]
	
	constructor(props:IVisToolProps) 
	{
		super(props);
		Weave.getCallbacks(this).addGroupedCallback(this, this.forceUpdate);
		this.initFilterLater();
	}

	handleEditorTypeChange(item:typeof AbstractFilterEditor[]) 
	{
		//LinkablePlaceholder.setInstance(item[0]);
	}
	
	handleFilterChange(filter:LinkableDynamicObject) 
	{
		var _editor = this.editor.target as AbstractFilterEditor;
		if (_editor)
			_editor.setFilter(filter.target as ColumnDataFilter);
	}
	
	initFilterLater() 
	{
		if (!Weave.getRoot(this)) 
		{
			WeaveAPI.Scheduler.callLater(this, this.initFilterLater);
			return;
		}
		this.filter.targetPath = ["defaultSubsetKeyFilter", "filters", Weave.getRoot(this).getName(this)];
	}
	
	initEditorLater(editor:AbstractFilterEditor)
	{
		if (!Weave.getRoot(this)) 
		{
			WeaveAPI.Scheduler.callLater(this, this.initEditorLater);
			return;
		}
		this.editor.target = editor;
	}
	
	get deprecatedStateMapping()
	{
		return {
			"editor": this.editor,
			"filter": this.filter
		};
	}

	private getFilter():ColumnDataFilter
	{
		return this.filter.target as ColumnDataFilter;
	}

	private getFilterColumn():IAttributeColumn
	{
		return this.getFilter() ? this.getFilter().column as IAttributeColumn : null;
	}

	get title():string
	{
		if (this.getFilterColumn())
			return Weave.lang('Filter for {0}', ColumnUtils.getTitle(this.getFilterColumn()));
		return Weave.lang('Filter');
    }

	render():JSX.Element
	{
		var editorClass:(typeof AbstractFilterEditor) = LinkablePlaceholder.getClass(this.editor) as typeof AbstractFilterEditor;
		
		var filterEditor:any = editorClass ? React.createElement(editorClass as any, {
			ref: this.initEditorLater,
		}) : null;
		
		return (
			<ui.VBox>
				<ui.ListItem options={this.listItemOptions} onChange={this.handleEditorTypeChange.bind(this)} selectedValues={[editorClass]}/>
				{
					filterEditor
				}
			</ui.VBox>
		)
	}
}

Weave.registerClass("weavejs.tool.DataFilter", DataFilterTool, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.ui::DataFilterTool", DataFilterTool);
