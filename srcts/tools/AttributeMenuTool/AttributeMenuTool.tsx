import * as React from 'react';
import {IVisTool, IVisToolProps, IVisToolState, renderSelectableAttributes} from "../IVisTool";
import {HBox, VBox} from "../../react-ui/FlexBox";
import ReactUtils from "../../utils/ReactUtils";
import {ListOption} from "../../react-ui/List";
import List from "../../react-ui/List";
import * as lodash from "lodash";
import HSlider from "../../react-ui/RCSlider/HSlider";
import VSlider from "../../react-ui/RCSlider/VSlider";
import SliderOption from "../../react-ui/RCSlider/RCSlider";
import ComboBox from '../../semantic-ui/ComboBox';
import {ComboBoxOption} from "../../semantic-ui/ComboBox";
import {linkReactStateRef} from "../../utils/WeaveReactUtils";
import StatefulTextField from "../../ui/StatefulTextField";

import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableString = weavejs.core.LinkableString;
import LinkableVariable = weavejs.core.LinkableVariable;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import ILinkableObject = weavejs.api.core.ILinkableObject;
import ColumnUtils = weavejs.data.ColumnUtils;
import WeaveAPI = weavejs.WeaveAPI;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;

const LAYOUT_LIST:string = "List";
const LAYOUT_COMBO:string = "ComboBox";
const LAYOUT_VSLIDER:string = "VSlider";
const LAYOUT_HSLIDER:string = "HSlider";

const menuOptions:string[] = [LAYOUT_LIST, LAYOUT_COMBO, LAYOUT_HSLIDER, LAYOUT_VSLIDER];//todo add the verify callback

export interface IAttributeMenuToolState extends IVisToolState
{
}

export default class AttributeMenuTool extends React.Component<IVisToolProps, IAttributeMenuToolState> implements IVisTool
{
	constructor (props:IVisToolProps)
	{
		super(props);
		this.state = {};
	}

	//session properties
	public panelTitle = Weave.linkableChild(this, new LinkableString('Attribute Menu Tool'));
	public choices = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn), this.forceUpdate, true );
	public layoutMode = Weave.linkableChild(this, new LinkableString(LAYOUT_LIST), this.forceUpdate, true);
	public selectedAttribute = Weave.linkableChild(this, new LinkableString, this.forceUpdate, true);

	public targetToolPath = Weave.linkableChild(this, new LinkableVariable(Array), this.setToolWatcher.bind(this));
	public targetAttribute = Weave.linkableChild(this, new LinkableString);
	toolWatcher = Weave.privateLinkableChild(this, new LinkableWatcher());

	//callback for targetToolPath
	setToolWatcher():void
	{
		this.toolWatcher.targetPath = this.targetToolPath.state as string[];
		this.forceUpdate();
	}

	get title():string
	{
		return this.panelTitle.value;
	}

	get selectableAttributes()
	{
		return new Map<string, IColumnWrapper | ILinkableHashMap>().set("Choices", this.choices);
	}

	get options()
	{
		return this.choices.getObjects(IAttributeColumn).map(column => {
			return {
				label: column.getMetadata(weavejs.api.data.ColumnMetadata.TITLE),
				value: column
			};
		});
	}

	handleSelection = (selectedValue:any):void =>
	{
		if (!selectedValue)
			return;

		var tool = this.toolWatcher.target as IVisTool;
		if (!tool)
			return;
		var targetAttribute = tool.selectableAttributes.get(this.targetAttribute.state as string);

		var targetAttributeColumn:DynamicColumn;//attribute which will be set
		var selectedColumn:IColumnWrapper = selectedValue instanceof Array ? selectedValue[0] as IColumnWrapper : selectedValue as IColumnWrapper;//attribute option chosen from tool; used to set target attribute


		if (Weave.IS(targetAttribute, IColumnWrapper))
		{
			targetAttributeColumn = ColumnUtils.hack_findInternalDynamicColumn(targetAttribute as IColumnWrapper);
		}
		else//ILinkableHashMap take the first object and force it into a column
		{
			var hm = targetAttribute as ILinkableHashMap;
			ColumnUtils.forceFirstColumnDynamic(hm);
			var firstColumn = hm.getObjects(IAttributeColumn)[0];
			targetAttributeColumn = ColumnUtils.hack_findInternalDynamicColumn(firstColumn as IColumnWrapper);
		}

		this.selectedAttribute.state = this.choices.getName(selectedColumn);//for the list UI to rerender

		if (targetAttributeColumn)
		{
			if (selectedColumn)
				targetAttributeColumn.requestLocalObjectCopy(selectedColumn);
		}
	};

	renderEditor(linkFunction :Function = null):JSX.Element
	{
		return (
			<VBox>
				<AttributeMenuTargetEditor attributeMenuTool={ this } linkFunction={ linkFunction }/>
			</VBox>
		);
	}

	render():JSX.Element
	{
		let selectedAttribute = this.choices.getObject(this.selectedAttribute.state as string) as IAttributeColumn;//get object from name

		switch (this.layoutMode.value)
		{
			case LAYOUT_LIST:
				return (
					<VBox>
						<List options={ this.options }  onChange={ this.handleSelection } selectedValues={ [selectedAttribute] }/>
					</VBox>
				);
			case LAYOUT_HSLIDER:
				return (
					<HBox style={{ flex: 1, padding: 25}}>
						<HSlider options={ this.options } onChange={ this.handleSelection} selectedValues={ [selectedAttribute] } type="categorical"/>
					</HBox>
				);
			case LAYOUT_VSLIDER:
				return (
					<VBox style={{ flex: 1, padding: 25 }}>
						<VSlider options={ this.options } onChange={ this.handleSelection } selectedValues={ [selectedAttribute] } type="categorical"/>
					</VBox>
				);
			case LAYOUT_COMBO:
				return (<ComboBox options={ this.options as ComboBoxOption[] } onChange={ this.handleSelection } value={ selectedAttribute } placeholder="Select an attribute" />); //have to return a valid react component, otherwise invariant violation
		}
	}
}

Weave.registerClass(
	AttributeMenuTool,
	["weave.ui::AttributeMenuTool", "weavejs.tool.AttributeMenu"],
	[weavejs.api.ui.IVisTool],
	"Attribute Menu Tool"
);

//EDITOR for the Attribute Menu Tool

interface IAttributeMenuTargetEditorProps
{
	attributeMenuTool:AttributeMenuTool;
	linkFunction : Function;
}

interface IAttributMenuToolEditorState
{
	openTools?:any[];
}

class AttributeMenuTargetEditor extends React.Component<IAttributeMenuTargetEditorProps, IAttributMenuToolEditorState>
{
	constructor(props:IAttributeMenuTargetEditorProps)
	{
		super(props);
		this.weaveRoot = Weave.getRoot(this.props.attributeMenuTool);

		this.weaveRoot.childListCallbacks.addGroupedCallback(this, this.getOpenVizTools,true);//will be called whenever a new tool is added

		Weave.getCallbacks(this.props.attributeMenuTool.toolWatcher).addGroupedCallback(this, this.forceUpdate);//registering callbacks

		//this.props.attributeMenuTool.targetAttribute.addGroupedCallback(this, this.forceUpdate);
	}

	componentWillReceiveProps(nextProps:IAttributeMenuTargetEditorProps)
	{
		if (this.props.attributeMenuTool != nextProps.attributeMenuTool)
		{
			this.weaveRoot.childListCallbacks.removeCallback(this, this.getOpenVizTools);
			Weave.getCallbacks(this.props.attributeMenuTool.toolWatcher).removeCallback(this, this.forceUpdate);
			//this.props.attributeMenuTool.targetAttribute.removeCallback(this, this.forceUpdate);

			this.weaveRoot = Weave.getRoot(nextProps.attributeMenuTool);
			this.weaveRoot.childListCallbacks.addGroupedCallback(this, this.getOpenVizTools, true);//will be called whenever a new tool is added
			Weave.getCallbacks(nextProps.attributeMenuTool.toolWatcher).addGroupedCallback(this, this.forceUpdate);//registering callbacks
			//nextProps.attributeMenuTool.targetAttribute.addGroupedCallback(this, this.forceUpdate);
		}
	}

	state : {openTool:any[]};
	private openTools:any [];//visualization tools open at the given time
	private weaveRoot:ILinkableHashMap;

	getOpenVizTools=():void =>
	{
		this.openTools = [];

		this.weaveRoot.getObjects().forEach((tool:any):void => {
			// excluding AttributeMenuTool from the list
			if (tool.selectableAttributes && Weave.className(tool) != Weave.className(this.props.attributeMenuTool))
				this.openTools.push(this.weaveRoot.getName(tool));
		});
		this.setState({openTools: this.openTools});
	};

	//UI event handler for target Tool
	handleTargetToolChange = (selectedItem:string):void =>
	{
		this.props.attributeMenuTool.targetToolPath.state = [selectedItem];
	};

	//UI event handler for target attribute (one of the selectable attributes of the target tool)
	handleTargetAttributeChange =(selectedItem:string):void =>
	{
		//this.props.attributeMenuTool.targetAttribute.state = selectedItem ;
	};

	//UI event handler for attribute menu layout
	handleMenuLayoutChange = (selectedItem:string):void =>
	{
		this.props.attributeMenuTool.layoutMode.state = selectedItem;// will re render the tool with new layout
	};

	get tool():IVisTool
	{
		return this.props.attributeMenuTool.toolWatcher.target as IVisTool;
	}

	getTargetToolAttributeOptions():string[]
	{
		//if (this.tool) console.log('targetattroptions',Array.from(this.tool.selectableAttributes.keys())as string[]);
		return(this.tool ? Array.from(this.tool.selectableAttributes.keys())as string[] : []);
	}

	getTargetToolPath= ():string =>
	{
		let toolPath = this.props.attributeMenuTool.targetToolPath.state as string[];
		return (toolPath[0] as string);
	};

	get toolConfigs():React.ReactChild[][]
	{
		var toolName:string;

		if (this.props.attributeMenuTool.targetToolPath.state)
			toolName = this.getTargetToolPath();
		
		return [
			[
				Weave.lang("Visualization Tool"),
				<ComboBox
					className="weave-sidebar-dropdown"
					placeholder="Select a visualization"
					value={ toolName }
					options={ this.openTools }
					onChange={ this.handleTargetToolChange }
				/>
			],
			[
				Weave.lang("Visualization Attribute"),
				<ComboBox
					className="weave-sidebar-dropdown"
					placeholder="Select an attribute"
					ref={ linkReactStateRef(this, { value: this.props.attributeMenuTool.targetAttribute })}
					options={ this.getTargetToolAttributeOptions() }
				/>
			],
			[
				Weave.lang("Menu Layout"),
				<ComboBox
					className="weave-sidebar-dropdown"
					ref={ linkReactStateRef(this, { value: this.props.attributeMenuTool.layoutMode })}
					options={ menuOptions }
				/>
			]
		];
	}

	renderTitleEditor():React.ReactChild[][]
	{
		return [
			[
				Weave.lang("Title"),
				<StatefulTextField
					className="ui input fluid"
					ref={ linkReactStateRef(this, { value:this.props.attributeMenuTool.panelTitle }) }
				/>
			]
		];
	}

	render ()
	{
		return (
			<VBox>
				{
					this.openTools && this.openTools.length > 0
					?	ReactUtils.generateTable({
							body: [].concat(
								this.toolConfigs,
								renderSelectableAttributes(this.props.attributeMenuTool.selectableAttributes, this.props.linkFunction),
								this.renderTitleEditor()
							),
							classes: {
								td: [
									"weave-left-cell",
									"weave-right-cell"
								]
							}
						})
					:	<div>{ 'Select a visualization from the Visualizations menu' }</div>
				}
			</VBox>
		);
	}
}
