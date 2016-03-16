import {IVisToolProps, IVisToolState} from "./IVisTool";
import {IVisTool} from "./IVisTool";

import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import {ListGroupItem, ListGroup, DropdownButton, MenuItem} from "react-bootstrap";
import * as _ from "lodash";
import {MouseEvent} from "react";
import {CSSProperties} from "react";
import ResizingDiv from "../react-ui/ResizingDiv";
import MiscUtils from "../utils/MiscUtils";

import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableVariable = weavejs.core.LinkableVariable;
import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
import LinkableString = weavejs.core.LinkableString;

export default class SessionStateMenuTool extends React.Component<IVisToolProps, IVisToolState>
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

	componentDidMount()
	{
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

	handleItemClick(index:number, event:MouseEvent):void 
	{
		this.selectedChoice.value = this.choices.getNames()[index];
	}

	render()
	{
		if (this.layoutMode.value === "ComboBox")
		{
			return (
				<VBox style={{flex:1.0, alignItems: "center"}}>
					<DropdownButton title={this.selectedChoice.value} id={`dropdown-${Weave.className(this)}`}>
						{
							this.choices.getNames().map((choice:string, index:number) => {
								if (choice === this.selectedChoice.value)
									return <MenuItem active key={index} onSelect={this.handleItemClick.bind(this, index)}>{choice}</MenuItem>;
								return <MenuItem key={index} onSelect={this.handleItemClick.bind(this, index)}>{choice}</MenuItem>;
							})
						}
					</DropdownButton>
				</VBox>
			);
		}
		else
		{
			return (
				<ResizingDiv>
					<ListGroup>
						{
							this.choices.getNames().map((choice:string, index:number) => {
								if (choice === this.selectedChoice.value)
									return <ListGroupItem active key={index} onClick={this.handleItemClick.bind(this, index)}>{choice}</ListGroupItem>;
								return <ListGroupItem key={index} onClick={this.handleItemClick.bind(this, index)}>{choice}</ListGroupItem>;
							})
						}
					</ListGroup>
				</ResizingDiv>
			);
		}
	}
}

Weave.registerClass("weavejs.tool.SessionStateMenu", SessionStateMenuTool, [weavejs.api.ui.IVisTool/*, weavejs.api.core.ILinkableObjectWithNewProperties*/]);
Weave.registerClass("weave.ui::SessionStateMenuTool", SessionStateMenuTool);
