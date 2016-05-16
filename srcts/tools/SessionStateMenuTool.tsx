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
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import MenuLayoutComponent from "../ui/MenuLayoutComponent";

import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableVariable = weavejs.core.LinkableVariable;
import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
import LinkableString = weavejs.core.LinkableString;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ILinkableVariable = weavejs.api.core.ILinkableVariable;
import ReactUtils from "../utils/ReactUtils";

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
		return this.choices.getObjects(ILinkableVariable).map(choice => {
			return {
				label: this.choices.getName(choice),
				value: choice
			};
		});
	}

	renderEditor():JSX.Element
	{
		return (
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

	get editorConfigs():React.ReactChild[][]
	{
		return[
			//targets[],
			//choices[],
			[
				Weave.lang("Layout mode"),
				<ComboBox
					className="weave-sidebar-dropdown"
					ref={ linkReactStateRef(this, { value: this.props.sessionStateMenuTool.layoutMode })}
					options={ menuOptions }
				/>
			]//layout
		];
	}

	render()
	{
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
			</VBox>
		);
	}
}