import * as React from 'react';
import {IVisTool, IVisToolProps, IVisToolState, renderSelectableAttributes} from "./IVisTool";
import {HBox, VBox} from "../react-ui/FlexBox";
import ReactUtils from "../utils/ReactUtils";
import {ListOption} from "../react-ui/List";
import List from "../react-ui/List";
import * as lodash from "lodash";
import HSlider from "../react-ui/RCSlider/HSlider";
import VSlider from "../react-ui/RCSlider/VSlider";
import SliderOption from "../react-ui/RCSlider/RCSlider";
import ComboBox from '../semantic-ui/ComboBox';
import {ComboBoxOption} from "../semantic-ui/ComboBox";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import StatefulTextField from "../ui/StatefulTextField";
import HelpIcon from "../react-ui/HelpIcon";
import MenuLayoutComponent from '../ui/MenuLayoutComponent';

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
import OpenLayersMapTool from "OpenLayersMapTool";
import AbstractLayer from "OpenLayersMap/Layers/AbstractLayer";

const LAYOUT_LIST:string = "List";
const LAYOUT_COMBO:string = "ComboBox";
const LAYOUT_VSLIDER:string = "VSlider";
const LAYOUT_HSLIDER:string = "HSlider";

const menuOptions:string[] = [LAYOUT_LIST, LAYOUT_COMBO, LAYOUT_HSLIDER, LAYOUT_VSLIDER];

export interface IAttributeMenuToolState extends IVisToolState
{
}

export default class AttributeMenuTool extends React.Component<IVisToolProps, IAttributeMenuToolState> implements IVisTool
{
	constructor (props:IVisToolProps)
	{
		super(props);
		this.state = {};

		this.targetToolPath.addGroupedCallback(this, this.setToolWatcher)
	}

	//session properties
	public panelTitle = Weave.linkableChild(this, LinkableString);
	public choices = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn), this.forceUpdate, true );
	public layoutMode = Weave.linkableChild(this, new LinkableString(LAYOUT_LIST, this.verifyLayoutMode), this.forceUpdate, true);
	public selectedAttribute = Weave.linkableChild(this, LinkableString, this.forceUpdate, true);

	public targetToolPath = Weave.linkableChild(this, new LinkableVariable(Array));
	public targetAttribute = Weave.linkableChild(this, LinkableString);
	toolWatcher = Weave.privateLinkableChild(this, LinkableWatcher);
	altText:LinkableString = Weave.linkableChild(this, new LinkableString(this.panelTitle.value));

	verifyLayoutMode(value:string):boolean
	{
		return menuOptions.indexOf(value) >= 0;
	}

	//callback for targetToolPath
	setToolWatcher =():void =>
	{
		this.toolWatcher.targetPath = this.targetToolPath.state as string[];
		if(this.selectedAttribute.state)
			this.handleSelection(this.choices.getObject(this.selectedAttribute.state as string) as IAttributeColumn);
		this.forceUpdate();
	};

	get title():string
	{
		return this.panelTitle.value;
	}

	get selectableAttributes()
	{
		return new Map<string, IColumnWrapper | ILinkableHashMap>().set("Choices", this.choices);
	}

	get options():{label: string, value: IAttributeColumn}[]
	{
		return this.choices.getObjects(IAttributeColumn).map(column => {
			return {
				label: column.getMetadata(weavejs.api.data.ColumnMetadata.TITLE) || "",
				value: column
			};
		});
	}

	handleSelection = (selectedValue:any):void =>
	{
		if (!selectedValue)
			return;

		var tool = this.toolWatcher.target as IVisTool;
		if (!tool || !tool.selectableAttributes)
			return;
		var targetAttribute = tool.selectableAttributes.get(this.targetAttribute.value);

		var targetAttributeColumn:DynamicColumn;//attribute which will be set
		var selectedColumn:IColumnWrapper = Array.isArray(selectedValue) ? selectedValue[0] as IColumnWrapper : selectedValue as IColumnWrapper;

		if (Weave.IS(targetAttribute, IColumnWrapper))
		{
			targetAttributeColumn = ColumnUtils.hack_findInternalDynamicColumn(targetAttribute as IColumnWrapper);
		}
		else if (Weave.IS(targetAttribute, ILinkableHashMap))
		{
			var hm = targetAttribute as ILinkableHashMap;
			ColumnUtils.forceFirstColumnDynamic(hm);
			targetAttributeColumn = hm.getObjects(DynamicColumn)[0];
		}

		this.selectedAttribute.state = this.choices.getName(selectedColumn);//for the list UI to rerender

		if (targetAttributeColumn)
		{
			if (selectedColumn)
				targetAttributeColumn.requestLocalObjectCopy(selectedColumn);
		}
	};

	renderEditor =(pushCrumb :(title:string,renderFn:()=>JSX.Element , stateObject:any )=>void = null):JSX.Element=> 
	{
		return (
			<VBox>
				<AttributeMenuTargetEditor attributeMenuTool={ this } pushCrumb={ pushCrumb }/>
			</VBox>
		);
	}

	render():JSX.Element
	{
		let selectedAttribute = this.choices.getObject(this.selectedAttribute.state as string) as IAttributeColumn;//get object from name

		return(<MenuLayoutComponent options={ this.options}
		                     displayMode={ this.layoutMode.value }
		                     onChange={ this.handleSelection }
		                     selectedItems={ [selectedAttribute] }
		/>);
	}
}

Weave.registerClass(
	AttributeMenuTool,
	["weavejs.tool.AttributeMenu", "weave.ui::AttributeMenuTool"],
	[weavejs.api.ui.IVisTool, weavejs.api.data.ISelectableAttributes],
	"Attribute Menu Tool"
);

//EDITOR for the Attribute Menu Tool

interface IAttributeMenuTargetEditorProps
{
	attributeMenuTool:AttributeMenuTool;
	pushCrumb : (title:string,renderFn:()=>JSX.Element , stateObject:any )=>void;
}

interface IAttributMenuToolEditorState
{
	openToolNames?: {label:string, value:any}[];
}

class AttributeMenuTargetEditor extends React.Component<IAttributeMenuTargetEditorProps, IAttributMenuToolEditorState>
{
	constructor(props:IAttributeMenuTargetEditorProps)
	{
		super(props);
		this.weaveRoot = Weave.getRoot(this.props.attributeMenuTool);

		this.weaveRoot.childListCallbacks.addGroupedCallback(this, this.getOpenVizToolNames,true); //will be called whenever a new tool is added

		Weave.getCallbacks(this.props.attributeMenuTool.toolWatcher).addGroupedCallback(this, this.forceUpdate); //registering callbacks
		
		this.state = {
			openToolNames: []
		};
	}

	componentWillReceiveProps(nextProps:IAttributeMenuTargetEditorProps)
	{
		if (this.props.attributeMenuTool != nextProps.attributeMenuTool)
		{
			this.weaveRoot.childListCallbacks.removeCallback(this, this.getOpenVizToolNames);
			Weave.getCallbacks(this.props.attributeMenuTool.toolWatcher).removeCallback(this, this.forceUpdate);

			this.weaveRoot = Weave.getRoot(nextProps.attributeMenuTool);
			this.weaveRoot.childListCallbacks.addGroupedCallback(this, this.getOpenVizToolNames, true); // will be called whenever a new tool is added
			Weave.getCallbacks(nextProps.attributeMenuTool.toolWatcher).addGroupedCallback(this, this.forceUpdate); // registering callbacks
		}
	}

	private weaveRoot:ILinkableHashMap;

	getOpenVizToolNames():void
	{
		var openToolNames:{label:string, value:any}[] = [];

		Weave.getDescendants(this.weaveRoot, weavejs.api.data.ISelectableAttributes).forEach((toolOrLayer:any):void => {

			// excluding AttributeMenuTool from the list
			if (Weave.className(toolOrLayer) != Weave.className(this.props.attributeMenuTool))
			{
				openToolNames.push({
					label: Weave.findPath(this.weaveRoot, toolOrLayer).join(', '),
					value: Weave.findPath(this.weaveRoot, toolOrLayer)
				});
			}
		});
		this.setState({openToolNames});
	};

	//UI event handler for target Tool
	handleTargetToolChange = (selectedItem:string):void =>
	{
		if(selectedItem)
			this.props.attributeMenuTool.targetToolPath.state = selectedItem;
	};

	get tool():IVisTool
	{
		return this.props.attributeMenuTool.toolWatcher.target as IVisTool;
	}

	getTargetToolAttributeOptions():string[]
	{
		return this.tool ? weavejs.util.JS.mapKeys(this.tool.selectableAttributes) : [];
	}

	getTargetToolPath= ():string[] =>
	{
		let toolPath = this.props.attributeMenuTool.targetToolPath.state as string[];
		return toolPath;
	};

	get toolConfigs():React.ReactChild[][]
	{
		var toolPath:string[];

		if (this.props.attributeMenuTool.targetToolPath.state)
			toolPath = this.getTargetToolPath();
		
		return [
			[
				<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
					{Weave.lang("Chart")}
					<HelpIcon>{Weave.lang("Select a chart to control.")}</HelpIcon>
				</HBox>,
				<ComboBox
					className="weave-sidebar-dropdown"
					placeholder={Weave.lang("Select a chart")}
					value={ toolPath }
					options={ this.state.openToolNames }
					onChange={ this.handleTargetToolChange }
				/>
			],
			[
				<HBox className="weave-padded-hbox" style={{alignItems: "center", justifyContent: "flex-end"}}>
					{Weave.lang("Attribute")}
					<HelpIcon>{Weave.lang("Attribute of the chart to be controlled. Values selected in the Attribute Controller will change this attribute for the selected chart.")}</HelpIcon>
				</HBox>,
				<ComboBox
					className="weave-sidebar-dropdown"
					placeholder={Weave.lang("Select an attribute")}
					ref={ linkReactStateRef(this, { value: this.props.attributeMenuTool.targetAttribute })}
					options={ this.getTargetToolAttributeOptions() }
				/>
			],
			[
				Weave.lang("Layout mode"),
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
					ReactUtils.generateTable({
							body: [].concat(
								this.toolConfigs,
								renderSelectableAttributes(this.props.attributeMenuTool.selectableAttributes, this.props.pushCrumb),
								this.renderTitleEditor()
							),
							classes: {
								td: [
									"weave-left-cell",
									"weave-right-cell"
								]
							}
						})
				}
			</VBox>
		);
	}
}
