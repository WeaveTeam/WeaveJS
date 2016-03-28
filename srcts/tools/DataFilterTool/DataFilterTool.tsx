import * as React from "react";
import {IVisTool, IVisToolProps, IVisToolState} from "../IVisTool";
import AbstractFilterEditor from "./AbstractFilterEditor";
import NumericRangeDataFilterEditor from "./NumericRangeDataFilterEditor";
import DiscreteValuesDataFilterEditor from "./DiscreteValuesDataFilterEditor";
import SelectableAttributeComponent from "../../ui/SelectableAttributeComponent";
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
import LinkableHashMap = weavejs.core.LinkableHashMap;
import WeaveAPI = weavejs.WeaveAPI;

export interface IDataFilterToolState extends IVisToolState{
	filterType:string
}
export default class DataFilterTool extends React.Component<IVisToolProps, IDataFilterToolState> implements IVisTool, ILinkableObjectWithNewProperties
{
	public filter:LinkableDynamicObject = Weave.linkableChild(this, new LinkableDynamicObject(ColumnDataFilter),this.handleFilterWatcher);
	public filterEditor:LinkableDynamicObject = Weave.linkableChild(this, new LinkableDynamicObject(AbstractFilterEditor),this.handleEditor,true);

	
	constructor(props:IVisToolProps) 
	{
		super(props);
		Weave.getCallbacks(this).addGroupedCallback(this, this.forceUpdate);

		// Calling later will make sure instance of DataFilterTool linkableOwner is set
		WeaveAPI.Scheduler.callLater(this, this.initLater);

		this.state = {
			filterType: "continuous"
		}
	}



	private initLater():void
	{
		// only set default path if session state hasn't been set yet
		if (this.filter.triggerCounter == weavejs.core.CallbackCollection.DEFAULT_TRIGGER_COUNT)
			this.filter.targetPath = ["defaultSubsetKeyFilter", "filters", Weave.getRoot(this).getName(this)];
		if (!this.getFilter())
			this.setEditorType(DiscreteValuesDataFilterEditor, null);
	}

	//todo does this require in JS version?
	private _editorDiff:any = null;

	private handleFilterWatcher():void
	{

		var _filter:ColumnDataFilter = this.getFilter();

		if ( _filter)
		{
			var values:any[] = _filter.values.getSessionState() as any[] || [];
			if (typeof values[0] == "number" || typeof values[0] == "string")
				this.setEditorType(DiscreteValuesDataFilterEditor, this._editorDiff);
		}
		else
		{
			this.setEditorType(NumericRangeDataFilterEditor, this._editorDiff);
			this._editorDiff = null;
		}

		var _editor:AbstractFilterEditor = this.getFilterEditor();
		if (_editor)
			_editor.filter = _filter;
	}

	private  handleEditor():void
	{
		var _editor:AbstractFilterEditor = this.getFilterEditor();
		if (_editor)
			_editor.filter = this.filter.target as ColumnDataFilter;
	}

	//todo replace with class Type
	private setEditorType(editorType:(typeof AbstractFilterEditor),editorDiff:any):void{
		var editorState:any = this.filterEditor.target && Weave.getState(this.filterEditor.target);

		(Weave.getWeave(this) as Weave).requestObject(this.filter.targetPath, Weave.className(ColumnDataFilter));
		this.filterEditor.requestLocalObject(editorType, false);

		if (this.filterEditor.target && editorDiff)
		{
			editorState = WeaveAPI.SessionManager.combineDiff(editorState, editorDiff);
			Weave.setState(this.filterEditor.target, editorState);
		}

	}
	
	get deprecatedStateMapping()
	{
		return {
			"editor": this.filterEditor,
			"filter": this.filter
		};
	}

	private getFilter():ColumnDataFilter
	{
		return this.filter.target as ColumnDataFilter;
	}

	private  getFilterEditor():AbstractFilterEditor
	{
		return this.filterEditor.target as AbstractFilterEditor;
	}

	private getFilterColumn():DynamicColumn
	{
		return this.getFilter() ? this.getFilter().column : null;
	}

	handleMissingSessionStateProperty(newState:any, property:String):void
	{
		if (property == 'editor')
			this._editorDiff = {
				"layoutMode": "Combobox",
				"showToggle": true
			};
	}

	get title():string
	{
		var column = this.getFilterColumn();
		if (column)
			return Weave.lang('Filter for {0}', ColumnUtils.getTitle(column));
		return Weave.lang('Filter');
    }

	private filterEditorMap:any = {
		continuous:{
			editorType: NumericRangeDataFilterEditor,
			label: "Continuous range",
		},
		discrete:{
			editorType: DiscreteValuesDataFilterEditor,
			label: "Discrete values",
		}
	}



	// it has to be function as Filter DynamicColumn is set at Fly
	private getSelectableAttributes():{[label:string]:DynamicColumn} {
		return {
			Filter:this.getFilterColumn()
		}
	}

	setDataFilterUI(key:string){
		this.setState({
			filterType:key
		});
		this.filterEditor.requestLocalObject(this.filterEditorMap[key].editorType, false);
	}


	renderEditor():JSX.Element
	{
		var filterEditorMapKeys:string[] = Object.keys(this.filterEditorMap);
		var editorOptionsUI:JSX.Element[] = filterEditorMapKeys.map(function(key:string,index:number){
			var filterEditorItem:any = this.filterEditorMap[key];

			return <HBox key={index} style={{alignItems:"baseline"}}>
						<input type="radio"
							   name="dataFilterOptions"
							   value={filterEditorItem.label}
							   defaultChecked={(this.state.filterType == key)}
							   onClick={this.setDataFilterUI.bind(this,key)}/>
						<span>&nbsp;{Weave.lang(filterEditorItem.label)}</span>
					</HBox>
		},this);

		var selectableAttributes:{[label:string]:DynamicColumn} = this.getSelectableAttributes();
		var attrLabels = Object.keys(selectableAttributes);

		var selectors:JSX.Element[] =  attrLabels.map((label:string, index:number) => {
				if (selectableAttributes[label] instanceof DynamicColumn)
				{
					let attribute = selectableAttributes[label] as DynamicColumn;
					return <SelectableAttributeComponent key={index} label={ label } attribute={ attribute }/>;
				}
			});



		return (
			<VBox>
				<form>
					<VBox>
						{editorOptionsUI}
					</VBox>
				</form>
				<HBox>
					{selectors}
				</HBox>

			</VBox>
		)
	}

	render():JSX.Element
	{
		var editorClass = LinkablePlaceholder.getClass(this.filterEditor.target) as typeof AbstractFilterEditor;
		
		var editor:JSX.Element = null;
		if (editorClass)
			editor = React.createElement(
				editorClass as any,
				{
					ref: (editor:AbstractFilterEditor) => {
						if (editor)
							LinkablePlaceholder.setInstance(this.filterEditor.target, editor);
					},
					filter: this.getFilter()
				}
			);

		return (
			<VBox style={{flex: 1}}>
				{
					editor
				}
			</VBox>
		)
	}
}

Weave.registerClass("weavejs.tool.DataFilter", DataFilterTool, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties], "Data Filter");
Weave.registerClass("weave.ui::DataFilterTool", DataFilterTool);
