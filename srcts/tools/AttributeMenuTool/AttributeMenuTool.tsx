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
	public choices = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn), this.forceUpdate, true );
	public layoutMode = Weave.linkableChild(this, new LinkableString(LAYOUT_LIST));
	public selectedAttribute = Weave.linkableChild(this, new LinkableString, this.forceUpdate, true);

	public targetToolPath:LinkableVariable = Weave.linkableChild(this, new LinkableVariable(Array), this.setToolWatcher.bind(this));
	public targetAttribute = Weave.linkableChild(this, new LinkableString);
	public toolWatcher = Weave.linkableChild(this, new LinkableWatcher());

	//callback for targetToolPath
	setToolWatcher():void
	{
		this.toolWatcher.targetPath = this.targetToolPath.state as string[];
		this.forceUpdate();
	}

	get title():string
	{
		return Weave.lang('Attribute Menu Tool');
	}

	get selectableAttributes()
	{
		return new Map<string, IColumnWrapper | LinkableHashMap>().set("Choices", this.choices);
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
		if(!selectedValue)
			return;

		var tool = this.toolWatcher.target as IVisTool;
		var targetAttribute = tool.selectableAttributes.get(this.targetAttribute.state as string);

		var targetAttributeColumn:DynamicColumn;//attribute which will be set
		var selectedColumn:IColumnWrapper = selectedValue instanceof Array ? selectedValue[0] as IColumnWrapper : selectedValue as IColumnWrapper;//attribute option chosen from tool; used to set target attribute


		if(Weave.IS(targetAttribute, IColumnWrapper))
		{
			targetAttributeColumn = ColumnUtils.hack_findInternalDynamicColumn(targetAttribute as IColumnWrapper);
		}
		else//LinkableHashMap take the first object and force it into a column
		{
			var hm = targetAttribute as LinkableHashMap;
			ColumnUtils.forceFirstColumnDynamic(hm);
			var firstColumn = hm.getObjects(IAttributeColumn)[0];
			targetAttributeColumn = ColumnUtils.hack_findInternalDynamicColumn(firstColumn as IColumnWrapper);
		}

		this.selectedAttribute.state = this.choices.getName(selectedColumn);//for the list UI to rerender

		if(targetAttributeColumn)
		{
			if(selectedColumn)
				targetAttributeColumn.requestLocalObjectCopy(selectedColumn);
		}
	};

	renderEditor(linkFunction :Function = null):JSX.Element
	{
		return (
			<VBox>
				<AttributeMenuTargetEditor attributeMenuTool={ this }/>
				{ renderSelectableAttributes(this.selectableAttributes, linkFunction) }
			</VBox>
		);
	}

	render():JSX.Element
	{
		//console.log("toolPath", this.targetToolPath.state);
		console.log("targetAttribute in tool", this.targetAttribute.state);
		//console.log("selectedAttribute", this.selectedAttribute.state);
		//console.log("choices***************************", this.choices.getNames());
		let selectedAttribute = this.choices.getObject(this.selectedAttribute.state as string) as IAttributeColumn;//get object from name

		switch (this.layoutMode.value)
		{
			case LAYOUT_LIST:
				return (
					<VBox>
						<List options={ this.options }  onChange={ this.handleSelection.bind(this) } selectedValues={ [selectedAttribute] }/>
					</VBox>
				);
			case LAYOUT_HSLIDER:
				return (
					<HBox style={{ flex: 1, alignItems: "center", padding: 10}}>
						<HSlider options={ this.options } onChange={ this.handleSelection} selectedValues={ [selectedAttribute] } type="categorical"/>
					</HBox>
				);
			case LAYOUT_VSLIDER:
				return (
					<VBox style={{ flex: 1, paddingLeft: 20, padding: 10 }}>
						<VSlider options={ this.options } onChange={ this.handleSelection } selectedValues={ [selectedAttribute] } type="categorical"/>
					</VBox>
				);
			case LAYOUT_COMBO:
				return (<ComboBox options={ this.options as ComboBoxOption[] } onChange={ this.handleSelection.bind(this) } value={ selectedAttribute } placeholder="Select an attribute" />); //have to return a valid react component, otherwise invariant violation
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
		//if(this.tool) console.log('targetattroptions',Array.from(this.tool.selectableAttributes.keys())as string[]);
		return(this.tool ? Array.from(this.tool.selectableAttributes.keys())as string[] : []);
	}

	getTargetToolPath= ():string =>
	{
		let toolPath = this.props.attributeMenuTool.targetToolPath.state as string[];
		return (toolPath[0] as string);
	};

	get toolConfigs():[ JSX.Element, JSX.Element][]
	{
		var toolName:string;
		var menuLayout:string = this.props.attributeMenuTool.layoutMode.state as string;

		if (this.props.attributeMenuTool.targetToolPath.state)
			toolName = this.getTargetToolPath();

		var labelStyle:React.CSSProperties = {
			textAlign: 'right',
			display:"flex",
			justifyContent: "flex-end"
		};
		
		return [
			[
				<span style={ labelStyle }>{ Weave.lang("Visualization Tool") }</span>,
				<ComboBox
					className="weave-sidebar-dropdown"
					placeholder="Select a visualization"
					value={ toolName }
					options={ this.openTools }
					onChange={ this.handleTargetToolChange }
				/>
			],
			[
				<span style={ labelStyle }>{ Weave.lang("Visualization Attribute")}</span>,

				<ComboBox
					className="weave-sidebar-dropdown"
					placeholder="Select an attribute"
					ref={ linkReactStateRef(this, { value: this.props.attributeMenuTool.targetAttribute })}
					options={ this.getTargetToolAttributeOptions() }
				/>
			],
			[
				<span style={ labelStyle }>{ Weave.lang("Menu Layout")}</span>,
				<ComboBox
					className="weave-sidebar-dropdown"
					ref={ linkReactStateRef(this, { value: this.props.attributeMenuTool.layoutMode })}
					options={ menuOptions }
				/>
			]
		];
	}


	render ():JSX.Element
	{

		return (
			<VBox>
				{
					this.openTools && this.openTools.length > 0
					?	ReactUtils.generateGridLayout(["four","twelve"], this.toolConfigs)
					:	null
				}
			</VBox>
		);
	}
}
