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
import Dropdown from "../semantic-ui/Dropdown";
import {linkReactStateRef} from "../utils/WeaveReactUtils";

import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableVariable = weavejs.core.LinkableVariable;
import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
import LinkableString = weavejs.core.LinkableString;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;

export default class SessionStateMenuTool extends AbstractVisTool<IVisToolProps, IVisToolState>
{
	selectedChoice = Weave.linkableChild(this, LinkableString);
	layoutMode = Weave.linkableChild(this, LinkableString);
	choices = Weave.linkableChild(this, new LinkableHashMap(LinkableVariable));
	targets = Weave.linkableChild(this, new LinkableHashMap(LinkableDynamicObject));

	panelTitle = Weave.linkableChild(this, LinkableString);

	get title():string
	{
		return MiscUtils.stringWithMacros(this.panelTitle.value, this);
	}

	constructor(props:IVisToolProps)
	{
		super(props);

		this.choices.addGroupedCallback(this, this.choiceChanged);
		this.selectedChoice.addGroupedCallback(this, this.choiceChanged);
		this.targets.addGroupedCallback(this, this.choiceChanged);

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

	choiceChanged()
	{
		let choice: LinkableVariable = this.choices.getObject(this.selectedChoice.value) as LinkableVariable;

		this.setTargetStates(choice.state);

		this.forceUpdate();
	}

	handleItemClick(value:string):void 
	{
		this.selectedChoice.value = value;
	}

	renderEditor():JSX.Element
	{
		return (
			<VBox>
				{
					super.renderEditor()
				}
				<HBox>
					<label>
						{Weave.lang("Choices")}
						{/*Todo: need selectors and ui for adding choices*/}
					</label>
				</HBox>
				<HBox>
					<label>
						{Weave.lang("Targets")}
						{/*Todo: need selectors and ui for adding targets*/}
					</label>
				</HBox>
			</VBox>
		)
	}

	render()
	{
		if (this.layoutMode.value === "ComboBox")
		{
			return (
				<VBox style={{flex: 1, alignItems: "center"}}>
					<Dropdown ref={linkReactStateRef(this, { value: this.selectedChoice })} options={this.choices.getNames()}/>
				</VBox>
			);
		}
		else
		{
			var listOptions = this.choices.getNames().map((name:string) => {
				 return {
					  value: name
				 };
			})
			return (
				<List options={listOptions} 
					  selectedValues={[this.selectedChoice.value]}
					  allowClear={false}
					  multiple={false}
			    	  onChange={(selectedValues) => {
						  this.selectedChoice.value = selectedValues[0];
					  }}/>
			);
		}
	}
}

Weave.registerClass("weavejs.tool.SessionStateMenu", SessionStateMenuTool, [weavejs.api.ui.IVisTool_Utility/*, weavejs.api.core.ILinkableObjectWithNewProperties*/], "Session State Menu Tool");
Weave.registerClass("weave.ui::SessionStateMenuTool", SessionStateMenuTool);
