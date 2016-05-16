import AbstractVisTool from "./AbstractVisTool";
import {IVisToolProps, IVisToolState} from "./IVisTool";
import {IVisTool} from "./IVisTool";

import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import * as _ from "lodash";
import {MouseEvent} from "react";
import {CSSProperties} from "react";
import ResizingDiv from "../react-ui/ResizingDiv";
import List from "../react-ui/List";
import MiscUtils from "../utils/MiscUtils";
import ComboBox from "../semantic-ui/ComboBox";
import CenteredIcon from "../react-ui/CenteredIcon";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import Tabs from "../react-ui/Tabs";
import Input from "../semantic-ui/Input";
import StatefulTextField from "../ui/StatefulTextField";
import MenuLayoutComponent from "../ui/MenuLayoutComponent";
import ReactUtils from "../utils/ReactUtils";

import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableVariable = weavejs.core.LinkableVariable;
import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
import LinkableString = weavejs.core.LinkableString;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ILinkableVariable = weavejs.api.core.ILinkableVariable;

const LAYOUT_LIST:string = "List";
const LAYOUT_COMBO:string = "ComboBox";
const LAYOUT_VSLIDER:string = "VSlider";
const LAYOUT_HSLIDER:string = "HSlider";
const menuOptions:string[] = [LAYOUT_LIST, LAYOUT_COMBO, LAYOUT_HSLIDER, LAYOUT_VSLIDER];//todo add the verify callback

export default class SessionStateMenuTool extends AbstractVisTool<IVisToolProps, IVisToolState>
{
	public selectedChoice = Weave.linkableChild(this, LinkableString, this.forceUpdate, true);
	public layoutMode = Weave.linkableChild(this, new LinkableString(LAYOUT_LIST, this.verifyLayoutMode), this.forceUpdate, true);
	choices = Weave.linkableChild(this, new LinkableHashMap(LinkableVariable));
	targets = Weave.linkableChild(this, new LinkableHashMap(LinkableDynamicObject));

	panelTitle = Weave.linkableChild(this, LinkableString);

	verifyLayoutMode(value:string):boolean
	{
		return menuOptions.indexOf(value) >= 0;
	}

	get title():string
	{
		return MiscUtils.stringWithMacros(this.panelTitle.value, this);
	}

	constructor(props:IVisToolProps)
	{
		super(props);

		//this.choices.addGroupedCallback(this, this.choiceChanged);
		//this.targets.addGroupedCallback(this, this.forceUpdate);

		this.layoutMode.addGroupedCallback(this, this.forceUpdate);
	}

	setTargetStates(states:any):void 
	{
		if (!states)
			return;

		this.targets.delayCallbacks();

		for (let wrapper of this.targets.getObjects(LinkableDynamicObject))
		{
			if (!wrapper.target)
				continue;
			let name:string = this.targets.getName(wrapper);

			if (states.hasOwnProperty(name))
				Weave.setState(wrapper.target, states[name]);
		}

		this.targets.resumeCallbacks();
	}

	handleSelection = (selectedValue:any):void =>
	{
		if (!selectedValue)
			return;

		var selection = Array.isArray(selectedValue) ? selectedValue[0] : selectedValue;//combobox returns only one selection, rest all return [] of selections
		this.selectedChoice.value = this.choices.getName(selection);

		this.setTargetStates(selection.state);
	};

	get options():{ label:string, value:LinkableVariable}[]
	{
		return this.choices.getObjects(ILinkableVariable).map(choice =>
		{
			return {
				label: this.choices.getName(choice),
				value: choice
			};
		});
	}

	renderEditor():JSX.Element
	{
		return(
			<VBox>
				<SessionStateMenuToolEditor sessionStateMenuTool={ this }/>
			</VBox>
		)
	}

	render()
	{
		var selectedChoice = this.choices.getObject(this.selectedChoice.value) as ILinkableVariable;
		return(
			<MenuLayoutComponent options={ this.options }
			                    displayMode={ this.layoutMode.value }
			                    onChange={ this.handleSelection.bind(this) }
			                    selectedItems={ [selectedChoice] }
			/>
		);
	}
}

Weave.registerClass(
	SessionStateMenuTool,
	["weavejs.tool.SessionStateMenu", "weave.ui::SessionStateMenuTool"],
	[weavejs.api.ui.IVisTool_Utility/*, weavejs.api.core.ILinkableObjectWithNewProperties*/],
	"Session State Menu Tool"
);


//EDITOR for the Session state Menu tool
interface ISessionStateMenuToolEditorProps
{
	sessionStateMenuTool:SessionStateMenuTool;
	//pushCrumb:Function
}

interface ISessionStateMenuToolEditorState
{

}

class SessionStateMenuToolEditor extends React.Component<ISessionStateMenuToolEditorProps, ISessionStateMenuToolEditorState>
{
	constructor(props:ISessionStateMenuToolEditorProps)
	{
		super(props);
		this.state = {

		}
	}

	//renders the target list UI
	getTargetList():JSX.Element[]
	{
		return this.props.sessionStateMenuTool.targets.getObjects().map((target:LinkableDynamicObject, index:number)=>{
			return(
				<HBox key={index} style={{justifyContent: "space-between", alignItems:"center"}}>
					<span style={{overflow: "hidden"}}>{target.targetPath.join(', ')}</span>
					<HBox>
						<CenteredIcon onClick={ ()=>{} }
						              iconProps={{ className: "fa fa-times", title: "Delete this target" }}/>
					</HBox>
				</HBox>
			);
		});
	}

	//contains the target tab view, target paths that map to the menu items
	//TODO fix bad styling
	renderTargetItems():JSX.Element
	{
		return(
			<VBox className="weave-padded-vbox weave-container" style={ {flex: 1, border: "1px"} }>
				<HBox style={ {alignItems: 'center'} }>
					{ Weave.lang("Add target") }

					<Input style={ {flexGrow: 0.5} } placeholder={ Weave.lang("Paste path here") }/>

					<CenteredIcon onClick={ ()=>{} }
					              iconProps={{ className: "fa fa-plus", title: "Add this target" }}/>
				</HBox>

				{ this.getTargetList() }
			</VBox>
		);
	}

	//contains the menu items tab view, entries which map to the targets in the target view
	renderMenuItems():JSX.Element{
		return(
			<div>MenuItems</div>
		);
	}

	//renders the Entire tab component
	renderTargetsAndMenuItems():JSX.Element
	{
		var tabs = new Map<string, JSX.Element>()
			.set("Targets", this.renderTargetItems())
			.set("Menu Items", this.renderMenuItems());
		var activeTabIndex = 0;

		return(
			<Tabs
				labels={Array.from(tabs.keys())}
				activeTabIndex={activeTabIndex}
				tabs={Array.from(tabs.values())}
				onViewChange={() => this.forceUpdate()}
			/>
		);
	}

	get editorConfigs():React.ReactChild[][]
	{
		return[
			[
				Weave.lang("tabs"),//TODO get rid of fitting it to table
				this.renderTargetsAndMenuItems()
			],
			[//layout
				Weave.lang("Layout mode"),
				<ComboBox
					className="weave-sidebar-dropdown"
					ref={ linkReactStateRef(this, { value: this.props.sessionStateMenuTool.layoutMode })}
					options={ menuOptions }
				/>
			]
		];
	}

	render()
	{
		let targetCount = (this.props.sessionStateMenuTool.targets.getNames() as string[]).length;

		return (
			<VBox>
				{
					ReactUtils.generateTable({
						body: [].concat(
							this.editorConfigs
							),
						classes: {
							td: [
								"weave-left-cell",
								"weave-right-cell"
								]
							}
						})
					}
				{ targetCount == 0 ? Weave.lang("This menu tool will have no effect unless you add at least one target.") : null }
			</VBox>
		);
	}
}