///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
///<reference path="../utils/StandardLib.ts"/>

import {IVisToolProps, IVisToolState} from "./IVisTool";
import {IVisTool} from "./IVisTool";

import * as React from "react";
import ui from "../react-ui/ui";
import {ListGroupItem, ListGroup, DropdownButton, MenuItem} from "react-bootstrap";
import * as _ from "lodash";
import {MouseEvent} from "react";
import {CSSProperties} from "react";

import WeavePath = weavejs.path.WeavePath;

import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableVariable = weavejs.core.LinkableVariable;
import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
import LinkableString = weavejs.core.LinkableString;

//TODO: This is a hack to allow react to be imported in generated JSX. Without this, import is missing and render encounters an exception
var stub:any = React;
const sessionStateMenuStyle:CSSProperties = {display:"flex", flex:1, height:"100%", flexDirection:"column", overflow:"auto"};
const sessionStateComboBoxStyle:CSSProperties = {display:"flex", flex:1, height:"100%", flexDirection:"column"};

export default class SessionStateMenuTool extends React.Component<IVisToolProps, IVisToolState> {

	selectedChoice:LinkableString = Weave.linkableChild(this, LinkableString);
	layoutMode:LinkableString = Weave.linkableChild(this, LinkableString);
	choices:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(LinkableVariable));
	targets:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(LinkableDynamicObject));

	constructor(props:IVisToolProps) {
		super(props);

		this.choices.addGroupedCallback(this, this.choiceChanged);
		this.selectedChoice.addGroupedCallback(this, this.choiceChanged);
		this.targets.addGroupedCallback(this, this.choiceChanged);

		this.layoutMode.addGroupedCallback(this, this.forceUpdate);
	}

	componentDidMount() {
	}

	setTargetStates(states:any):void {
		if (!states)
			return;

//		this.targets.delayCallbacks();

		for (let wrapper of this.targets.getObjects() as LinkableDynamicObject[])
		{
			if (!wrapper.target)
				continue;
			let name:string = this.targets.getName(wrapper);

			if (states.hasOwnProperty(name))
				Weave.setState(wrapper.target, states[name]);
		}

//		this.targets.resumeCallbacks();
	}

	choiceChanged()
	{
		let choice: LinkableVariable = this.choices.getObject(this.selectedChoice.value) as LinkableVariable;

		this.setTargetStates(choice.state);

		this.forceUpdate();
	}

	handleItemClick(index:number, event:MouseEvent):void {
		this.selectedChoice.value = this.choices.getNames()[index];
	}

	render() {

		let isComboBox: boolean = this.layoutMode.value === "ComboBox";
		var menus:JSX.Element[] = this.choices.getNames().map((choice:string, index:number) => {
			if(isComboBox) {
				return choice === this.selectedChoice.value ? <MenuItem active key={index} onSelect={this.handleItemClick.bind(this, index)}>{choice}</MenuItem>
				: <MenuItem key={index} onSelect={this.handleItemClick.bind(this, index)}>{choice}</MenuItem>;
			} else {
				return choice === this.selectedChoice.value ? <ListGroupItem active key={index} onClick={this.handleItemClick.bind(this, index)}>{choice}</ListGroupItem>
				: <ListGroupItem key={index} onClick={this.handleItemClick.bind(this, index)}>{choice}</ListGroupItem>;
			}
		});

		var container:JSX.Element;

		if(isComboBox) {
			container =
			<ui.VBox style={{height:"100%", flex:1.0, alignItems:"center"}}>
				<DropdownButton title={this.selectedChoice.value} id={`dropdown-${Weave.className(this)}`}>
					{menus}
				</DropdownButton>
			</ui.VBox>
		}else{
			container =
			<ListGroup>
				{menus}
			</ListGroup>
		}

		return (<div style={isComboBox ? sessionStateComboBoxStyle : sessionStateMenuStyle}>
				{container}
				</div>);
	}
}

//weavejs.util.BackwardsCompatibility.forceDeprecatedState(SessionStateMenuTool); // TEMPORARY HACK - remove when class is refactored

Weave.registerClass("weavejs.tool.SessionStateMenu", SessionStateMenuTool, [weavejs.api.ui.IVisTool/*, weavejs.api.core.ILinkableObjectWithNewProperties*/]);
Weave.registerClass("weave.ui::SessionStateMenuTool", SessionStateMenuTool);
