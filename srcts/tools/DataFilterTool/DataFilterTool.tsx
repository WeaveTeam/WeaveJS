import * as React from "react";
import {IVisTool, IVisToolProps, IVisToolState} from "../IVisTool";
import AbstractFilterEditor from "./AbstractFilterEditor";
import NumericRangeDataFilterEditor from "./NumericRangeDataFilterEditor";
import DiscreteValuesDataFilterEditor from "./DiscreteValuesDataFilterEditor";
import {FilterEditorProps, FilterEditorState} from "./AbstractFilterEditor";
import {HBox, VBox} from "../../react-ui/FlexBox";

import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;
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
	public filter:LinkableDynamicObject = Weave.linkableChild(this, new LinkableDynamicObject(ColumnDataFilter));
	public editor:LinkableDynamicObject = Weave.linkableChild(this, new LinkableDynamicObject(AbstractFilterEditor));
	public editorType:typeof AbstractFilterEditor;

	private listItemOptions:{value:new(..._:any[])=>AbstractFilterEditor, label:string}[] = [
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
		WeaveAPI.Scheduler.callLater(this, this.initLater);
	}

	handleEditorTypeChange(item:(typeof AbstractFilterEditor)[]) 
	{
		this.editor.requestLocalObject(item[0], false);
	}
	
	initLater() 
	{
		// only set default path if session state hasn't been set yet
		if (this.filter.triggerCounter == weavejs.core.CallbackCollection.DEFAULT_TRIGGER_COUNT)
			this.filter.targetPath = ["defaultSubsetKeyFilter", "filters", Weave.getRoot(this).getName(this)];
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

	private getFilterColumn():DynamicColumn
	{
		return this.getFilter() ? this.getFilter().column : null;
	}

	get title():string
	{
		var column = this.getFilterColumn();
		if (column)
			return Weave.lang('Filter for {0}', ColumnUtils.getTitle(column));
		return Weave.lang('Filter');
    }

	render():JSX.Element
	{
		var editorClass = LinkablePlaceholder.getClass(this.editor.target) as typeof AbstractFilterEditor;
		
		var editor:any = null;
		if (editorClass)
			editor = React.createElement(
				editorClass as any,
				{
					ref: (editor:AbstractFilterEditor) => {
						if (editor)
							LinkablePlaceholder.setInstance(this.editor.target, editor);
					},
					filter: this.getFilter()
				}
			);
		
		//<ListItem options={this.listItemOptions} onChange={this.handleEditorTypeChange.bind(this)} selectedValues={[editorClass]}/>
		return (
			<VBox style={{flex: 1}}>
				{
					editor
				}
			</VBox>
		)
	}
}

Weave.registerClass("weavejs.tool.DataFilter", DataFilterTool, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.ui::DataFilterTool", DataFilterTool);
