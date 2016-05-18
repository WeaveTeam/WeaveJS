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
import EditableTextCell from '../react-ui/EditableTextCell';
import MiscUtils from "../utils/MiscUtils";
import ComboBox from "../semantic-ui/ComboBox";
import CheckBox from "../semantic-ui/Checkbox";
import CenteredIcon from "../react-ui/CenteredIcon";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import Tabs from "../react-ui/Tabs";
import Input from "../semantic-ui/Input";
import StatefulTextField from "../ui/StatefulTextField";
import MenuLayoutComponent from "../ui/MenuLayoutComponent";
import ReactUtils from "../utils/ReactUtils";
import {ListOption} from "../react-ui/List";

import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableVariable = weavejs.core.LinkableVariable;
import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
import LinkableString = weavejs.core.LinkableString;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ILinkableVariable = weavejs.api.core.ILinkableVariable;
import WeaveAPI = weavejs.WeaveAPI;
import LinkableBoolean = weavejs.core.LinkableBoolean;

const LAYOUT_LIST:string = "List";
const LAYOUT_COMBO:string = "ComboBox";
const LAYOUT_VSLIDER:string = "VSlider";
const LAYOUT_HSLIDER:string = "HSlider";
const menuOptions:string[] = [LAYOUT_LIST, LAYOUT_COMBO, LAYOUT_HSLIDER, LAYOUT_VSLIDER];//todo add the verify callback

export default class SessionStateMenuTool extends AbstractVisTool<IVisToolProps, IVisToolState>
{
	public selectedChoice = Weave.linkableChild(this, LinkableString, this.forceUpdate, true);
	public layoutMode = Weave.linkableChild(this, new LinkableString(LAYOUT_LIST, this.verifyLayoutMode), this.forceUpdate, true);
	public autoRecord = Weave.linkableChild(this, new LinkableBoolean(false), this.forceUpdate);

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

	getTargetStates = ():{[key:string]: LinkableDynamicObject[]} =>
	{
		let states = {} as {[key:string]: LinkableDynamicObject[]};
		for (let wrapper of this.targets.getObjects())
		{
			if(!wrapper.target)
				continue;
			var targetName:string = this.targets.getName(wrapper);
			states[targetName] = WeaveAPI.SessionManager.getSessionState(wrapper.target) as LinkableDynamicObject[];
		}
		return states;
	};

	handleSelection = (selectedValue:any):void =>
	{
		if (!selectedValue)
			return;

		var selection = Array.isArray(selectedValue) ? selectedValue[0] : selectedValue;//combobox returns only one selection, rest all return [] of selections
		this.selectedChoice.value = this.choices.getName(selection);

		this.setTargetStates(selection.state);
	};

	recordSelectedChoice = ():void =>
	{
		var selectedName = this.selectedChoice.value;//current selected choice in the menu tab
		if(selectedName)//if there is a current seletion
		{
			var choice:LinkableVariable = this.choices.requestObject(selectedName, LinkableVariable, false);//get its corresponding choice object
			choice.setSessionState(this.getTargetStates());//update it session state
		}
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
			<SessionStateMenuToolEditor sessionStateMenuTool={ this }/>
		)
	}

	render()
	{
		if(this.autoRecord.value)
			this.recordSelectedChoice();

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
		this.state = {}
	}

	//clean up states for associated choices (called whenever targets are added or removed)
	tidySavedStates():void
	{
		this.props.sessionStateMenuTool.choices.getObjects().forEach((choice:LinkableVariable)=>
		{
			let updated:Boolean = false;
			let choiceState:{[key:string]: LinkableDynamicObject[]} = (choice.getSessionState() || {}) as {[key:string]: LinkableDynamicObject[]};
			let name:string;

			//update the choice state when targets are ADDED
			let targets = this.props.sessionStateMenuTool.targets;
			for(let wrapper of targets.getObjects())
			{
				if(!wrapper.target)
					continue;
				name = targets.getName(wrapper);
				if(!choiceState.hasOwnProperty(name))
				{
					choiceState[name] = WeaveAPI.SessionManager.getSessionState(wrapper.target) as  LinkableDynamicObject[];
					updated = true;
				}
			}

			//update the choice state when targets are REMOVED
			for(let targetName in choiceState)
			{
				if(!this.props.sessionStateMenuTool.targets.getObject(targetName))
				{
					delete choiceState[targetName];//remove the associated LinkableDynamicObject
					updated = true;
				}
			}

			if(updated)
				choice.setSessionState(choiceState);//update the new state for that choice
		});
	};

	//removes the target from the target list
	removeSelectedTarget =(target:LinkableDynamicObject): void =>
	{
		if(target)
		{
			var name:string = this.props.sessionStateMenuTool.targets.getName(target);
			this.props.sessionStateMenuTool.targets.removeObject(name);
		}
		this.tidySavedStates();
	};

	//renders the target list UI
	getTargetList():JSX.Element[]
	{
		return this.props.sessionStateMenuTool.targets.getObjects().map((target:LinkableDynamicObject, index:number)=>{
			return(
				<HBox key={index} style={{justifyContent: "space-between", alignItems:"center"}}>
					<span style={{overflow: "hidden"}}>{target.targetPath.join(', ')}</span>
					<HBox>
						<CenteredIcon onClick={ ()=>{this.removeSelectedTarget(target)} }
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
				<HBox className="weave-padded-hbox" style={ {alignItems: 'center'} }>
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

		var menuItems:ListOption[] = this.props.sessionStateMenuTool.choices.getObjects().map((choice) =>
		{
			return({
				label: (
					<EditableTextCell textContent={ this.props.sessionStateMenuTool.choices.getName(choice) }/>
				),
				value:choice
			});
		});

		return(
			<List options={ menuItems }/>
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
				Weave.lang("Auto-update active menu item"),
				<CheckBox ref={ linkReactStateRef(this, {value: this.props.sessionStateMenuTool.autoRecord}) } label={" "}/>
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
			<VBox style={{flex:"1 0"}}>
				{ this.renderTargetsAndMenuItems() }
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