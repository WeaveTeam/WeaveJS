import * as React from "react";
import * as ReactDOM from "react-dom";

import {HBox, VBox} from "../react-ui/FlexBox";
import SessionStateEditor from "../ui/SessionStateEditor";
import {IVisTool} from "../tools/IVisTool";
import Button from "../semantic-ui/Button";
import classNames from "../modules/classnames";
import {forceUpdateWatcher} from "../utils/WeaveReactUtils";

import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import LinkableWatcher = weavejs.core.LinkableWatcher;

export interface WeaveToolEditorProps extends React.HTMLProps<WeaveToolEditor>
{
	tool:IVisTool;
	onCloseHandler:() => void;
}

export interface WeaveToolEditorState
{
	activeCrumb:string
}


export default class WeaveToolEditor extends React.Component<WeaveToolEditorProps, WeaveToolEditorState>
{
	private toolWatcher = forceUpdateWatcher(this, weavejs.api.ui.IVisTool);
	public get tool():IVisTool { return this.toolWatcher.target as IVisTool; }
	public set tool(value:IVisTool) { this.toolWatcher.target = value; }
	private weaveRoot:ILinkableHashMap;
	private toolName:string;
	private displayName:string;
	private mapping_crumb_children:any = {};
	private mapping_crumb_children_state:any = {};
	private crumbOrder:string[] = [];

	constructor(props:WeaveToolEditorProps)
	{
		super(props);
		this.handleNewTool(props.tool);
	}

	openSessionStateEditor=()=>
	{
		SessionStateEditor.openInstance(this.toolName, this.weaveRoot);
	};

	//todo : find a better way to get linked children
	pushCrumb=(title:string,uiObject:React.ReactChild , stateObject:any = null):void=>
	{
		if(stateObject)
		{
			this.mapping_crumb_children_state[title] = stateObject;
			return;
		}

		this.mapping_crumb_children[title] = uiObject;
		this.setState({
			activeCrumb: title
		});
		this.crumbOrder.push(title);
	};



	componentWillReceiveProps(nextProps:WeaveToolEditorProps)
	{
		if (this.tool !== nextProps.tool)
		{
			//reset
			this.mapping_crumb_children = {};
			this.mapping_crumb_children_state = {};
			this.crumbOrder = [];
			
			this.handleNewTool(nextProps.tool);
		}
	}
	
	private handleNewTool(tool:IVisTool)
	{
		this.weaveRoot = Weave.getRoot(tool);
		this.displayName = weavejs.WeaveAPI.ClassRegistry.getDisplayName(tool.constructor as new (..._: any[]) => any)
		this.toolName = this.weaveRoot.getName(tool);
		this.tool = tool;
		var state = {
			activeCrumb: this.displayName
		};
		if (this.state)
			this.setState(state);
		else
			this.state = state;
		this.crumbOrder[0] = this.displayName;

		// Respective tool Editor is stored under display name
		this.mapping_crumb_children[this.displayName] = this.tool.renderEditor(this.pushCrumb);
	}

	// flag to know is editor component mounted due crumb click
	private isCrumbClicked:boolean = false;

	crumbClick=(crumbTitle:string, index:number)=>
	{
		this.setState({
			activeCrumb:crumbTitle
		});
		this.crumbOrder = this.crumbOrder.slice(0, index + 1);
		this.isCrumbClicked = true;
	};

	stepBackInCrumbView = ()=>{
		let index:number = this.crumbOrder.length - 2; //prev index make it active
		let activeCrumbTitle:string = this.crumbOrder[index];
		this.setState({
			activeCrumb:activeCrumbTitle
		});
		this.crumbOrder = this.crumbOrder.slice(0, index + 1);
		this.isCrumbClicked = true;
	};
	
	componentWillUpdate()
	{
		if (!this.tool && this.props.onCloseHandler) // this ensures when tool is removed close handler is called
			this.props.onCloseHandler();
	}

	// Has to be handled here as this.refs[this.state.activeCrumb] will be availble only at this stage of the React Component cycle
	componentDidUpdate()
	{
		if(this.isCrumbClicked && this.activeEditor) // if component go mounted due to crumb click
		{
			this.isCrumbClicked = false;
			let stateObj:any = this.mapping_crumb_children_state[this.state.activeCrumb] ; // get the state object which was stored , while editor component was unmounted
			if(stateObj)
				(this.activeEditor as any).setState(stateObj);
		}
	}


	private activeEditor:Element;

	render()
	{

		var crumbStyle:React.CSSProperties = {
			alignItems:"center"
		};

		let originalEditorUI = this.mapping_crumb_children[this.state.activeCrumb];

		// cloned to add ref function to get the reference of active editor
		// which helep in setting the state back when it was mounted
		let editorUI = React.cloneElement(originalEditorUI,{ref: (e:Element) =>{
			if(typeof originalEditorUI.ref == 'function') // this ensures any ref attached in original Element still works
			{
				let refFunction:Function = originalEditorUI.ref as Function;
				refFunction(e);
			}
			this.activeEditor = e;
		}});

		var crumbUI:JSX.Element = (
			<div className="ui breadcrumb">
				{
					this.crumbOrder.map((crumb:string, index:number):JSX.Element[] => {
						let styleObj:React.CSSProperties = {};
						let elements:JSX.Element[];
			
						let label:string = crumb;
						if (this.state.activeCrumb == crumb && this.crumbOrder.length > 1)
						{
							styleObj.color = "black";
							//styleObj["cursor"] = "none"; causes error to disappear
							elements = [
								<div
									key={String(index)}
									ref={String(index)}
									style={styleObj}
									className="active section"
									onClick={this.crumbClick.bind(this, crumb, index)}
								>
									{label}
								</div>
							];
			
						}
						else
						{
							styleObj.color = "grey";
							styleObj["cursor"] = "pointer";
							elements = [
								<div
									key={String(index)}
									ref={String(index)}
									style={styleObj}
									className="section"
									onClick={this.crumbClick.bind(this, crumb, index)}
								>
									{label}
								</div>
							];
						}
			
						if (this.crumbOrder.length > 1 && index < this.crumbOrder.length - 1) // add icon except for last crumb
							elements.push(<i className="right chevron icon divider"/>);
			
						return elements;
					})
				}
			</div>
		);


		let backButtonUI:JSX.Element = null;
		if (this.crumbOrder.length > 1)
		{
			backButtonUI = (
				<Button onClick={ this.stepBackInCrumbView }>
					<i className="fa fa-chevron-left"/>
				</Button>
			);
		}

		return (
			<VBox className={ classNames(this.props.className) }
			      style={ this.props.style }
			      onMouseEnter={() => this.forceUpdate()}>
				<HBox className="weave-ToolEditor-Header">
					{backButtonUI}
					<HBox className="weave-padded-hbox" style={ crumbStyle }>
						{crumbUI}
					</HBox>
					<span style={ {flex: "1"} }/>
					{
						Weave.beta
						?	<Button
								onClick={ this.openSessionStateEditor }
								title="Edit session state">
								<i className="fa fa-code"/>
							</Button>
						:	null
					}
					<Button
						onClick={ () => this.props.onCloseHandler() }
					    title="Close editor">
						&#x2715;
					</Button>
				</HBox>
				<VBox style={{flex: 1, padding: 8, overflow: "auto"}}>
					{editorUI}
				</VBox>
			</VBox>
		);
	}
}
