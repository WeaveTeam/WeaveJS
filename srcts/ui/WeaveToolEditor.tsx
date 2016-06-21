import * as React from "react";
import * as ReactDOM from "react-dom";

import {HBox, VBox} from "../react-ui/FlexBox";
import InteractiveTour from "../react-ui/InteractiveTour";
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
	onCloseHandler:(editor:WeaveToolEditor) => void;
}

export interface WeaveToolEditorState
{
	activeCrumb:string
}


export default class WeaveToolEditor extends React.Component<WeaveToolEditorProps, WeaveToolEditorState>
{
	private toolWatcher:LinkableWatcher = forceUpdateWatcher(this, weavejs.api.ui.IVisTool);
	public get tool():IVisTool { return this.toolWatcher.target as IVisTool; }
	public set tool(value:IVisTool) { this.toolWatcher.target = value; }
	private displayName:string;
	private mapping_crumb_renderFn:any = {};
	private mapping_crumb_children_state:any = {};
	private crumbOrder:string[] = [];

	constructor(props:WeaveToolEditorProps)
	{
		super(props);
		this.handleNewTool(props.tool);
	}

	openSessionStateEditor=()=>
	{
		var weaveRoot = Weave.getRoot(this.tool);
		var toolName = weaveRoot.getName(this.tool);
		SessionStateEditor.openInstance(this, toolName, weaveRoot);
	};

	//todo : find a better way to get linked children
	pushCrumb=(title:string,renderFn:()=>JSX.Element , stateObject:any = null):void=>
	{
		if(stateObject)
		{
			this.mapping_crumb_children_state[title] = stateObject;
			return;
		}

		this.mapping_crumb_renderFn[title] = renderFn;
		this.setState({
			activeCrumb: title
		});
		this.crumbOrder.push(title);
	};



	reset=()=>
	{
		//reset
		this.mapping_crumb_renderFn = {};
		this.mapping_crumb_children_state = {};
		this.crumbOrder = [];
	};

	componentWillReceiveProps(nextProps:WeaveToolEditorProps)
	{
		if (this.tool !== nextProps.tool)
		{
			this.handleNewTool(nextProps.tool);
		}
	}
	
	private handleNewTool(tool:IVisTool)
	{
		this.reset();
		if (tool && !Weave.wasDisposed(tool))
		{
			this.tool = tool;
			this.displayName = weavejs.WeaveAPI.ClassRegistry.getDisplayName(this.tool.constructor as new (..._: any[]) => any);
			var state = {
				activeCrumb: this.displayName
			};
			if (this.state)
				this.setState(state);
			else
				this.state = state;
			this.crumbOrder[0] = this.displayName;

			// Respective tool Editor is stored under display name
			this.mapping_crumb_renderFn[this.displayName] = this.tool.renderEditor;
		}
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
			this.props.onCloseHandler(this);
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

	componentWillUnmount()
	{
		if (this.props.onCloseHandler) // this ensures when tool is removed close handler is called
			this.props.onCloseHandler(this);
	}

	closeEditor=(event:React.MouseEvent)=>
	{
		this.props.onCloseHandler && this.props.onCloseHandler(this);
		if(InteractiveTour.enable)
		{
			InteractiveTour.targetComponentOnClick("Tool editor");
		}
	};

	private activeEditor:Element;

	render()
	{
		if(!this.tool)
		{
			this.reset();
			// since forceUpdate is attached with toolWatcher, when tool gets disposed though weaveToolEditor is not rendered from weaveAPP
			// still we will get a call,
			// so its important to send empty div
			// todo:find a better approach // try using react state than weaveCallback after multiple window is implemented
			return <div/>;
		}

		var crumbStyle:React.CSSProperties = {
			alignItems:"center"
		};

		let editorFunction:Function = this.mapping_crumb_renderFn[this.state.activeCrumb];
		let originalEditorUI = editorFunction(this.pushCrumb);

		// cloned to add ref function to get the reference of active editor
		// which help in setting the state back when it was mounted
		let editorUI = React.cloneElement(originalEditorUI,{
			ref: (e:Element) =>{
					if(typeof originalEditorUI.ref == 'function') // this ensures any ref attached in original Element still works
					{
						let refFunction:Function = originalEditorUI.ref as Function;
						refFunction(e);
					}
					this.activeEditor = e;
				}
		});

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
			      ref={InteractiveTour.enable ? InteractiveTour.getComponentRefCallback("Tool editor") : null}
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
						onClick={ this.closeEditor }
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
