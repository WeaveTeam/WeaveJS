/// <reference path="../../../typings/react/react.d.ts"/>
///<reference path="../../../typings/weave/weavejs.d.ts"/>

import * as React from "react";
import {IVisTool, IVisToolProps, IVisToolState} from "../IVisTool";

import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IColumnStatistics = weavejs.api.data.IColumnStatistics;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;
import LinkableVariable = weavejs.core.LinkableVariable;
import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;

interface IDataFilterState extends IVisToolState {
	columnStats:IColumnStatistics
}

//Weave.registerClass("weave.ui.DataFilterTool", DataFilterTool, [weavejs.api.core.ILinkableObjectWithNewProperties]);
export default class DataFilterTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool {

	private filter:LinkableDynamicObject;
	private editor:LinkableDynamicObject;

	public panelTitle:LinkableString = Weave.linkableChild(this, LinkableString);


	static DISCRETEFILTERCLASS:string = "weave.editors::DiscreteValuesDataFilterEditor";
	static RANGEFILTERCLASS:string = "weave.editors::NumericRangeDataFilterEditor";

	constructor(props:IVisToolProps) {
		super(props);
		Weave.getRoot(this).getName(this);
		'filters', WeaveAPI.globalHashMap.getName(this)];
		
		filter.targetPath = Weave.getRoot(this).getName("defaultSubsetKeyFilter"); 

		this.filter.targetPath = 
		this.setupCallbacks();
	}

	private setupCallbacks() {
		this.filter.addCallback(this, this.forceUpdate);
		this.editor.addCallback(this, this.forceUpdate);
	}

	get deprecatedStateMapping()
	{
		return {};
	}

	get title():string {
		if (getFilterColumn())
			return lang('Filter for {0}', ColumnUtils.getTitle(getFilterColumn()));
		
		return lang('Filter');
    }

	render():JSX.Element {
		var editorType:string = this.editor.getType();
		if(editorType == DataFilterTool.DISCRETEFILTERCLASS) {
			return <DiscreteValuesDataFilterEditor ref={(editor:DiscreteValuesDataFilterEditor) => { this.editor.target = editor }} filter={this.filter}/>
		} else if (editorType == DataFilterTool.RANGEFILTERCLASS){
			return <NumericRangeDataFilterEditor ref={(editor:NumericRangeDataFilterEditor) => { this.editor.target = editor }} filter={this.filter}/>
		} else {
			return <div/>;// blank tool
		}
	}
}

weavejs.util.BackwardsCompatibility.forceDeprecatedState(DataFilterTool); // TEMPORARY HACK - remove when class is refactored

Weave.registerClass("weavejs.tool.DataFilter", DataFilterTool, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.ui::DataFilterTool", DataFilterTool);


//Weave.registerClass("weave.editors.NumericRangeDataFilterEditor", NumericRangeDataFilterEditor, [weavejs.api.core.ILinkableObjectWithNewProperties]);


//Weave.registerClass("weave.editors.DiscreteValuesDataFilterEditor", {}, [weavejs.api.core.ILinkableObjectWithNewProperties]);
