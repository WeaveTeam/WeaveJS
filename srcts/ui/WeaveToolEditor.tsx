import * as React from "react";
import * as ReactDOM from "react-dom";

import {HBox, VBox} from "../react-ui/FlexBox";
import SessionStateEditor from "../ui/SessionStateEditor";
import {IVisTool} from "../tools/IVisTool";
import IconButton from "../react-ui/IconButton";

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
	private childrenCrumbMap:any = {};
	private crumbOrder:string[] = [];

	constructor(props:WeaveToolEditorProps)
	{
		super(props);
		this.weaveRoot = Weave.getRoot(this.props.tool);
		this.displayName = weavejs.WeaveAPI.ClassRegistry.getDisplayName(this.props.tool.constructor as new (..._: any[]) => any)
		this.toolName = this.weaveRoot.getName(this.props.tool);
		//todo : find a better way to get linked children
		this.childrenCrumbMap[this.displayName] = this.props.tool.renderEditor(this.linktoToolEditorCrumbFunction);
		this.state = {
			activeCrumb: this.displayName
		};
		this.crumbOrder[0] = this.displayName;
	}

	openSessionStateEditor=()=>
	{
		SessionStateEditor.openInstance(this.toolName, this.weaveRoot);
	}


	//todo : find a better way to get linked children
	linktoToolEditorCrumbFunction=(title:string,ui:React.ReactChild):void=>
	{
		this.childrenCrumbMap[title] = ui;
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
			this.childrenCrumbMap = {};
			this.crumbOrder = [];

			//set new
			this.weaveRoot = Weave.getRoot(nextProps.tool);
			this.displayName = weavejs.WeaveAPI.ClassRegistry.getDisplayName(nextProps.tool.constructor as new (..._: any[]) => any)
			this.toolName = this.weaveRoot.getName(nextProps.tool);
			this.childrenCrumbMap[this.displayName] = nextProps.tool.renderEditor(this.linktoToolEditorCrumbFunction);
			this.setState({
				activeCrumb: this.displayName
			});
			this.crumbOrder[0] = this.displayName;
		}
	}

	crumbClick=(crumbTitle:string, index:number)=>
	{
		this.setState({
			activeCrumb:crumbTitle
		});
		this.crumbOrder = this.crumbOrder.slice(0, index + 1);
	}

	stepBackInCrumbView = ()=>{
		let index:number = this.crumbOrder.length-2; //prev index make it active
		let activeCrumbTitle:string = this.crumbOrder[index ]
		this.setState({
			activeCrumb:activeCrumbTitle
		});
		this.crumbOrder = this.crumbOrder.slice(0, index + 1);
	}

	render()
	{
		var crumbStyle:React.CSSProperties = {
			alignItems:"center"
		};
		var editorUI:JSX.Element[] | JSX.Element = this.childrenCrumbMap[this.state.activeCrumb];

		var crumbUI:JSX.Element = (
			<div className="ui breadcrumb">
				{
					this.crumbOrder.map((crumb:string,index:number):JSX.Element[] => {
						let styleObj:React.CSSProperties = {};
						let elements:JSX.Element[];
			
						let label:string = crumb;
						if (this.state.activeCrumb == crumb && this.crumbOrder.length > 1)
						{
							styleObj.color = "black";
							styleObj["cursor"] = "none";
							elements = [
								<div key={String(index)}
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
								<div key={String(index)}
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
		if(this.crumbOrder.length > 1)
		{
			let prevCrumbTitle:string = this.crumbOrder[this.crumbOrder.length - 2];
			backButtonUI = <IconButton clickHandler={ this.stepBackInCrumbView }
			                           mouseOverStyle={ {color:"black",background:"none"} }
			                           iconName="fa fa-chevron-left"
			                           toolTip={"Go back to view: " + prevCrumbTitle}/>
		}

		return (
			<VBox className={ "weave-padded-vbox "  + this.props.className } style={ this.props.style }>
				<HBox className="weave-padded-hbox" style = { {alignItems: "center",borderBottom:"1px solid lightgrey"} }>
					{backButtonUI}
					<HBox className="weave-padded-hbox" style={ crumbStyle }>
						{crumbUI}
					</HBox>
					<span style={ {flex: "1"} }/>
					<IconButton clickHandler={ this.openSessionStateEditor }
								iconName="fa fa-code"
								toolTip={"Edit session state"}/>
					<IconButton clickHandler={ this.props.onCloseHandler }
					            iconName="&#x2715"
					            mouseOverStyle={ {color:"red",background:"none"} }
					            toolTip="click to close Sidebar"
					/>
				</HBox>


	
				<div style={ { padding: "8px", display: "flex", flexDirection: "inherit", overflow: "auto" } }>
					<div style={ {overflow: "auto" } }>{editorUI}</div>
				</div>
			</VBox>
		);
	}
}



