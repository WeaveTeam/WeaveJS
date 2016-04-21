import * as React from "react";
import * as ReactDOM from "react-dom";

import {HBox, VBox} from "../react-ui/FlexBox";
import SessionStateEditor from "../ui/SessionStateEditor";
import {IVisTool} from "../tools/IVisTool";
import Button from "../semantic-ui/Button";
import classNames from "../modules/classnames";

import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;

export interface WeaveToolEditorProps extends React.HTMLProps<WeaveToolEditor>
{
	tool:IVisTool;
	onCloseHandler:(event: React.MouseEvent) => void;
}

export interface WeaveToolEditorState
{
	activeCrumb:string
}

export default class WeaveToolEditor extends React.Component<WeaveToolEditorProps, WeaveToolEditorState>
{
	private weaveRoot:ILinkableHashMap;
	private toolName:string;
	private displayName:string;
	private mapping_crumb_children:any = {};
	private crumbOrder:string[] = [];

	constructor(props:WeaveToolEditorProps)
	{
		super(props);
		this.handleNewTool(props.tool);
	}

	openSessionStateEditor=()=>
	{
		SessionStateEditor.openInstance(this.toolName, this.weaveRoot);
	}


	//todo : find a better way to get linked children
	linktoToolEditorCrumbFunction=(title:string,ui:React.ReactChild):void=>
	{
		this.mapping_crumb_children[title] = ui;
		this.setState({
			activeCrumb: title
		});
		this.crumbOrder.push(title);
	}


	componentWillReceiveProps(nextProps:WeaveToolEditorProps)
	{
		if (this.props.tool !== nextProps.tool)
		{
			//reset
			this.mapping_crumb_children = {};
			this.crumbOrder = [];
			
			this.handleNewTool(nextProps.tool);
		}
	}
	
	private handleNewTool(tool:IVisTool)
	{
		this.weaveRoot = Weave.getRoot(tool);
		this.displayName = weavejs.WeaveAPI.ClassRegistry.getDisplayName(tool.constructor as new (..._: any[]) => any)
		this.toolName = this.weaveRoot.getName(tool);
		var state = {
			activeCrumb: this.displayName
		};
		if (this.state)
			this.setState(state);
		else
			this.state = state;
		this.crumbOrder[0] = this.displayName;
	}

	crumbClick=(crumbTitle:string, index:number)=>
	{
		this.setState({
			activeCrumb:crumbTitle
		});
		this.crumbOrder = this.crumbOrder.slice(0, index + 1);
	}

	stepBackInCrumbView = ()=>{
		let index:number = this.crumbOrder.length - 2; //prev index make it active
		let activeCrumbTitle:string = this.crumbOrder[index];
		this.setState({
			activeCrumb:activeCrumbTitle
		});
		this.crumbOrder = this.crumbOrder.slice(0, index + 1);
	};

	render()
	{
		this.mapping_crumb_children[this.displayName] = this.props.tool.renderEditor(this.linktoToolEditorCrumbFunction);
		
		var crumbStyle:React.CSSProperties = {
			alignItems:"center"
		};
		var editorUI:JSX.Element[] | JSX.Element = this.mapping_crumb_children[this.state.activeCrumb];

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
							styleObj["cursor"] = "none";
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
			let prevCrumbTitle:string = this.crumbOrder[this.crumbOrder.length - 2];
			backButtonUI = (
				<Button onClick={ this.stepBackInCrumbView } style={{borderColor: "rgba(0, 0, 0, 0)", padding: "8px"}}>
					<i className="fa fa-chevron-left"/>
				</Button>
			);
		}

		return (
			<VBox
				className={ classNames("weave-padded-vbox", this.props.className) }
				style={ this.props.style }
				onMouseEnter={() => Weave.beta && this.forceUpdate()}
			>
				<HBox
					className="weave-padded-hbox"
					style={ {alignItems: "center", borderBottom: "1px solid lightgrey", margin: 8} }
				>
					{backButtonUI}
					<HBox className="weave-padded-hbox" style={ crumbStyle }>
						{crumbUI}
					</HBox>
					<span style={ {flex: "1"} }/>
					{
						Weave.beta
						?	<Button
								onClick={ this.openSessionStateEditor }
						        style={ {borderColor: "rgba(0, 0, 0, 0)", padding: 8} }
						        title="Edit session state"
							>
								<i className="fa fa-code"/>
							</Button>
						:	null
					}
					<Button
						onClick={ this.props.onCloseHandler } 
					    style={ {borderColor: "rgba(0, 0, 0, 0)", padding: 8} } 
					    title="Close editor"
					>
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
