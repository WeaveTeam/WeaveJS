import * as React from "react";
import {IVisTool, IVisToolProps, IVisToolState, renderSelectableAttributes} from "../IVisTool";
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
import IColumnWrapper = weavejs.api.data.IColumnWrapper;




export default class DataFilterTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool, ILinkableObjectWithNewProperties
{
	public filter:LinkableDynamicObject = Weave.linkableChild(this, new LinkableDynamicObject(ColumnDataFilter),this.handleFilterWatcher);
	public filterEditor:LinkableDynamicObject = Weave.linkableChild(this, new LinkableDynamicObject(AbstractFilterEditor),this.handleEditor,true);

	
	constructor(props:IVisToolProps) 
	{
		super(props);
		Weave.getCallbacks(this).addGroupedCallback(this, this.forceUpdate);

		// Calling later will make sure instance of DataFilterTool linkableOwner is set
		WeaveAPI.Scheduler.callLater(this, this.initLater);

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


	// it has to be function as Filter DynamicColumn is set at Fly

	get selectableAttributes() {
		return new Map<string, (IColumnWrapper | LinkableHashMap)>()
			.set("Filter", this.getFilterColumn());
	}


	renderEditor():JSX.Element{
		return <DataFilterEditor filterEditor={ this.filterEditor }  selectableAttributes={ this.selectableAttributes }  />
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

Weave.registerClass(
	DataFilterTool,
	["weave.ui::DataFilterTool", "weavejs.tool.DataFilter"],
	[weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties],
	"Data Filter"
);


export interface IDataFilterEditorState {

}

export interface IDataFilterEditorProps {
	filterEditor:LinkableDynamicObject,
	selectableAttributes:Map<string, (IColumnWrapper | LinkableHashMap)>
}


const FILTER_TYPE  = {
	CONTINUOUS: "Continuous range",
	DISCRETE:"Discrete Values"
};

class DataFilterEditor extends React.Component<IDataFilterEditorProps, IDataFilterEditorState>{
	constructor(props:any)
	{
		super(props);
		// ensures any change in Tool will reflect in editor render
		Weave.getCallbacks(this.props.filterEditor).addGroupedCallback(this, this.forceUpdate);
	}

	// required to build UI in render
	private filterEditorMap:any = {
		continuous:{
			editorClass: NumericRangeDataFilterEditor,
			label: FILTER_TYPE.CONTINUOUS,
			options: [NumericRangeDataFilterEditor.OPTIONS]
		},
		discrete:{
			editorClass: DiscreteValuesDataFilterEditor,
			label: FILTER_TYPE.DISCRETE,
			options: DiscreteValuesDataFilterEditor.OPTIONS
		}
	}

	// event listener for Filter Selection
	onFilterTypeChange = (event:Event) =>
	{
		var key:string = (event.target as HTMLInputElement).value;
		var filterEditorItem:any = this.filterEditorMap[key];
		this.props.filterEditor.requestLocalObject(filterEditorItem.editorClass, false);
	}

	// event listener for Filter Options
	onFilterOptionChange = (event:Event)=>
	{
		var value:string | boolean = (event.target as HTMLInputElement).value;
		if(this.props.filterEditor.target){
			if(this.props.filterEditor.target instanceof DiscreteValuesDataFilterEditor)
			{
				(this.props.filterEditor.target as DiscreteValuesDataFilterEditor).layoutMode.state = value as string;
			}
			if(this.props.filterEditor.target instanceof NumericRangeDataFilterEditor)
			{
				var forceDiscreteValues:LinkableBoolean  = (this.props.filterEditor.target as NumericRangeDataFilterEditor).forceDiscreteValues;
				forceDiscreteValues.state = value as boolean;
			}
		}

	}

	componentWillUnmount():void
	{
		Weave.getCallbacks(this.props.filterEditor).removeCallback(this, this.forceUpdate);
	}

	render(){
		// variables used to decide the UI and its options
		var selectedFilter:string = ""; // continuous | discrete
		var selectedOption:string | boolean; // if its radio string checkbox boolean
		var uiType:string = ""; // radio | checkbox

		// session props are used to identify the respective UI
		if(this.props.filterEditor.target instanceof NumericRangeDataFilterEditor)
		{
			selectedFilter = FILTER_TYPE.CONTINUOUS;
			selectedOption = (this.props.filterEditor.target as NumericRangeDataFilterEditor).forceDiscreteValues.state as boolean;
			uiType = "checkbox"
		}
		else if(this.props.filterEditor.target instanceof DiscreteValuesDataFilterEditor)
		{
			selectedFilter = FILTER_TYPE.DISCRETE;
			selectedOption = (this.props.filterEditor.target as DiscreteValuesDataFilterEditor).layoutMode.state as string;
			uiType = "radio"
		}


		var filterEditorMapKeys:string[] = Object.keys(this.filterEditorMap);

		var editorOptionsUI:JSX.Element[] = filterEditorMapKeys.map(function(key:string,index:number){

			var filterEditorItem:any = this.filterEditorMap[key];
			var editorLabel:string = filterEditorItem.label;
			var isEditorSelected:boolean = (selectedFilter == editorLabel);

			var optionsUI:JSX.Element[];
			if(isEditorSelected) // if selected add further option for the editor
			{
				optionsUI = filterEditorItem.options.map(function(option:string,index:number){
					var defaultChecked:boolean;
					if(uiType == "radio")
					{
						defaultChecked = (selectedOption == option)
					}
					else if(uiType == "checkbox")
					{
						defaultChecked = selectedOption as boolean;
					}


					return <li key={index}>
								<input type={uiType}
									   name={uiType + "UiOptions"}
									   value={option}
									   defaultChecked={ defaultChecked }
									   onClick={ this.onFilterOptionChange }/>
								<span>&nbsp;{ Weave.lang(option) }</span>
							</li>
				},this);

			}
			return  <li key={index}>
						<input type="radio"
							   name="dataFilterOptions"
							   value={ key }
							   defaultChecked={ isEditorSelected }
							   onClick={ this.onFilterTypeChange }/>
						<span>&nbsp;{ Weave.lang(editorLabel) }</span>
						{isEditorSelected?<ul style={ {listStyleType:"none"} }>{ optionsUI }</ul>: ""}
					</li>;

		},this);


		return <VBox className="weave-padded-vbox ">
					<VBox className="weave-padded-vbox" >
						<label style={ {fontWeight: 'bold'} }>Column</label>
						<SelectableAttributeComponent attributes={ this.props.selectableAttributes }/>
					</VBox>
					<VBox className="weave-padded-vbox">
						<label style={ {fontWeight: 'bold'} }>Filter Type</label>
						<ul style={ {listStyleType:"none"} }>{editorOptionsUI}</ul>
					</VBox>
				</VBox>
	}

}
