/// <reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>

import * as React from "react";
import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
import ui from "../react-ui/ui";
import * as bs from "react-bootstrap";
import * as _ from "lodash";
import {DropdownButton, MenuItem} from "react-bootstrap";

import WeavePath = weavejs.path.WeavePath;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IColumnStatistics = weavejs.api.data.IColumnStatistics;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;
import LinkableVariable = weavejs.core.LinkableVariable;
import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;

interface IDataFilterPaths
{
	editor:WeavePath;
	filter:WeavePath;
}

interface IDataFilterState extends IVisToolState
{
	columnStats:IColumnStatistics
}

//Weave.registerClass("weave.ui.DataFilterTool", DataFilterTool, [weavejs.api.core.ILinkableObjectWithNewProperties]);
export default class DataFilterTool extends React.Component<IVisToolProps, IVisToolState> implements IVisTool
{
	private toolPath:WeavePath;
	private paths:IDataFilterPaths;
	private filter:WeavePath;
	private editor:WeavePath;

	static DISCRETEFILTERCLASS:string = "weave.editors::DiscreteValuesDataFilterEditor";
	static RANGEFILTERCLASS:string = "weave.editors::NumericRangeDataFilterEditor";

	constructor(props:IVisToolProps)
	{
		super(props);
		this.toolPath = this.props.toolPath;
		this.filter = this.toolPath.push("filter", null);
		this.editor = this.toolPath.push("editor", null);
		this.setupCallbacks();
	}

	private setupCallbacks()
	{
		this.filter.addCallback(this, this.forceUpdate);
		this.editor.addCallback(this, this.forceUpdate);
	}

	get deprecatedStateMapping()
	{
		return {};
	}

	get title():string
	{
	   return (this.toolPath.getType('panelTitle') ? this.toolPath.getState('panelTitle') : '') || this.toolPath.getPath().pop();
	}

	render():JSX.Element 
	{
		var editorType:string = this.editor.getType();
		if (editorType == DataFilterTool.DISCRETEFILTERCLASS)
		{
			return <DiscreteValuesDataFilterEditor editor={this.editor} filter={this.filter}/>
		}
		else if (editorType == DataFilterTool.RANGEFILTERCLASS)
		{
			return <NumericRangeDataFilterEditor editor={this.editor} filter={this.filter}/>
		}
		else
		{
			return <div/>;// blank tool
		}
	}
}

weavejs.util.BackwardsCompatibility.forceDeprecatedState(DataFilterTool); // TEMPORARY HACK - remove when class is refactored

Weave.registerClass("weavejs.tool.DataFilter", DataFilterTool, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.ui::DataFilterTool", DataFilterTool);

interface NumericRangeDataFilterEditorProps
{
	editor:WeavePath
	filter:WeavePath
}

interface NumericRangeDataFilterEditorState
{
}

class NumericRangeDataFilterEditor extends React.Component<NumericRangeDataFilterEditorProps, NumericRangeDataFilterEditorState>
{
	public column:IAttributeColumn;
	public enabled:LinkableBoolean;
	public values:LinkableVariable;
	public filter:ColumnDataFilter;
	public forceDiscreteValues:LinkableBoolean;

	private min:number;
	private max:number;
	private options:any;

	constructor(props:NumericRangeDataFilterEditorProps)
	{
		super(props);
		this.filter = this.props.filter.getObject() as ColumnDataFilter;
		this.values = this.filter.values;
		this.column = this.filter.column;
		this.forceDiscreteValues = this.props.editor.getObject("forceDiscreteValues") as LinkableBoolean;
		this.options = [];
	}

	componentWillReceiveProps(nextProps:DiscreteValuesDataFilterEditorProps)
	{
		this.filter = this.props.filter.getObject() as ColumnDataFilter;
		this.values = this.filter.values;
		this.column = this.filter.column;
		this.forceDiscreteValues = this.props.editor.getObject("forceDiscreteValues") as LinkableBoolean;
	}

	get deprecatedStateMapping()
	{
		return {};
	}

	componentDidMount()
	{
		Weave.getCallbacks(this.forceDiscreteValues).addGroupedCallback(this, this.columnChanged);
		Weave.getCallbacks(this.column).addGroupedCallback(this, this.columnChanged);
	}

	onChange(selectedValues:number[])
	{
		this.values.state = selectedValues;
	}

	columnChanged()
	{
		this.options = _.sortByOrder(_.uniq(this.column.keys.map((key:IQualifiedKey) => {
			return {
				value: this.column.getValueFromKey(key, Number),
				label: this.column.getValueFromKey(key, String)
			};
		}), "value"), ["value"], ["asc"]);
		this.forceUpdate();
	}

	render():JSX.Element 
	{
		let values:any = this.values.state;
		if (this.forceDiscreteValues.value)
		{
			return <ui.HBox style={{width:"100%", height:"100%", alignItems:"center", padding: 10}}>
					<ui.HSlider type="numeric-discrete" values={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
				</ui.HBox>;
		}
		else
		{
			return <ui.HBox style={{width:"100%", height:"100%", alignItems:"center", padding: 10}}>
					<ui.HSlider type="numeric"  values={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
				</ui.HBox>;
		}
	}
}
//Weave.registerClass("weave.editors.NumericRangeDataFilterEditor", NumericRangeDataFilterEditor, [weavejs.api.core.ILinkableObjectWithNewProperties]);

interface DiscreteValuesDataFilterEditorProps
{
	editor:WeavePath
	filter:WeavePath
}

interface DiscreteValuesDataFilterEditorState
{
}

class DiscreteValuesDataFilterEditor extends React.Component<DiscreteValuesDataFilterEditorProps, DiscreteValuesDataFilterEditorState>
{
	static LAYOUT_LIST:string = "List";
	static LAYOUT_COMBO:string = "ComboBox";
	static LAYOUT_VSLIDER:string = "VSlider";
	static LAYOUT_HSLIDER:string = "HSlider";
	static LAYOUT_CHECKBOXLIST:string = "CheckBoxList";

	public showPlayButton:LinkableBoolean;
	public showToggle:LinkableBoolean;
	public showToggleLabel:LinkableBoolean;
	public layoutMode:LinkableString;
	public filter:ColumnDataFilter;
	public column:IAttributeColumn;
	public enabled:LinkableBoolean;
	public values:LinkableVariable;

	private options:any;

	constructor(props:DiscreteValuesDataFilterEditorProps)
	{
		super(props);
		this.layoutMode = this.props.editor.getObject("layoutMode") as LinkableString;
		this.showToggle = this.props.editor.getObject("showToggle") as LinkableBoolean;
		this.showToggleLabel = this.props.editor.getObject("showToggleLabel") as LinkableBoolean;
		this.filter = this.props.filter.getObject() as ColumnDataFilter;
		this.values = this.filter.values;
		this.column = this.filter.column;
		this.enabled = this.filter.enabled;
		this.options = [];
	}

	componentWillReceiveProps(nextProps:DiscreteValuesDataFilterEditorProps)
	{
		this.layoutMode = this.props.editor.getObject("layoutMode") as LinkableString;
		this.showToggle = this.props.editor.getObject("showToggle") as LinkableBoolean;
		this.showToggleLabel = this.props.editor.getObject("showToggleLabel") as LinkableBoolean;
		this.filter = this.props.filter.getObject() as ColumnDataFilter;
		this.values = this.filter.values;
		this.column = this.filter.column;
		this.enabled = this.filter.enabled;
	}

	componentDidMount()
	{
		Weave.getCallbacks(this.layoutMode).addGroupedCallback(this, this.forceUpdate);
		Weave.getCallbacks(this.showToggle).addGroupedCallback(this, this.forceUpdate);
		Weave.getCallbacks(this.showToggleLabel).addGroupedCallback(this, this.forceUpdate);
		Weave.getCallbacks(this.column).addGroupedCallback(this, this.columnChanged);
	}

	columnChanged()
	{
		this.options = _.sortByOrder(_.uniq(this.column.keys.map((key:IQualifiedKey) => {
			let val:string = this.column.getValueFromKey(key, String);
			return {
				value: val,
				label: val
			};
		}), "value"), ["value"], ["asc"]);
		this.forceUpdate();
	}

	onChange(selectedValues:string[])
	{
		this.values.state = selectedValues;
	}

	get deprecatedStateMapping()
	{
		return {};
	}

	render():JSX.Element 
	{
		let values:any = this.values.state;

		switch (this.layoutMode && this.layoutMode.value)
		{
			case DiscreteValuesDataFilterEditor.LAYOUT_CHECKBOXLIST:
				return <ui.CheckBoxList values={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
			case DiscreteValuesDataFilterEditor.LAYOUT_LIST:
				return <ui.ListItem values={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
			case DiscreteValuesDataFilterEditor.LAYOUT_HSLIDER:
				return <ui.HBox style={{width:"100%", height:"100%", alignItems:"center", padding: 10}}>
							<ui.HSlider type="categorical" values={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
						</ui.HBox>;
			case DiscreteValuesDataFilterEditor.LAYOUT_VSLIDER:
				return <ui.VBox style={{width:"100%", height:"100%", alignItems:"center", padding: 10}}>
							<ui.VSlider type="categorical" values={this.options} selectedValues={values} onChange={this.onChange.bind(this)}/>
						</ui.VBox>;
			case DiscreteValuesDataFilterEditor.LAYOUT_COMBO:
				return <ui.VBox style={{height:"100%", flex:1.0, alignItems:"center"}}>
							<DropdownButton title={values[0]} id="bs.dropdown">
								{
									this.options.map((option:string, index:number) => {
										return  <MenuItem active={values.indexOf(option) > -1} key={index} onSelect={() => { this.values.state = [option]; }}>{option}</MenuItem>
									})
								}
							</DropdownButton>
						</ui.VBox>;
		}
	}
}
//Weave.registerClass("weave.editors.DiscreteValuesDataFilterEditor", {}, [weavejs.api.core.ILinkableObjectWithNewProperties]);
