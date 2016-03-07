///<reference path="../typings/react/react.d.ts"/>
///<reference path="../typings/react/react-dom.d.ts"/>
///<reference path="../typings/lodash/lodash.d.ts"/>
///<reference path="../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>
///<reference path="../typings/react-bootstrap/react-bootstrap.d.ts"/>
///<reference path="../typings/weave/weavejs.d.ts"/>

import ILinkableObject = weavejs.api.core.ILinkableObject;
import LinkablePlaceholder = weavejs.core.LinkablePlaceholder;
import WeavePath = weavejs.path.WeavePath;
import Layout from "./react-flexible-layout/Layout";

import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {HBox, VBox} from "./react-ui/FlexBox";
import * as VendorPrefix from "react-vendor-prefix";
import MiscUtils from "./utils/MiscUtils";
import {Glyphicon} from "react-bootstrap";
import {CSSProperties} from "react";
import {IVisTool, IVisToolProps, IVisToolState} from "./tools/IVisTool";
import ToolTip from "./tools/ToolTip";
import {IToolTipProps, IToolTipState} from "./tools/ToolTip";
import {REACT_COMPONENT} from "./react-ui/Menu";

declare type IToolTip = React.Component<IToolTipProps, IToolTipState>;

const grabberStyle:CSSProperties = {
	width: "16",
	height: "16",
	cursor: "move",
	background: "url(http://placehold.it/32x32)"
};

export interface IWeaveToolProps extends React.Props<WeaveTool>
{
	layout:Layout;
	toolPath:WeavePath;
	onDragStart:React.DragEventHandler;
	onDragEnd:React.DragEventHandler;
	onDragOver:React.DragEventHandler;
	onContextMenu?:React.MouseEventHandler;
}

export interface IWeaveToolState
{
	title?: string;
	style?: CSSProperties;
}

export default class WeaveTool extends React.Component<IWeaveToolProps, IWeaveToolState>
{
	private toolPath:WeavePath;
	
	private tool:IVisTool;
	private toolTip:IToolTip;
	private titleBarHeight: number;
	private titleBar:React.Component<ITitleBarProps, ITitleBarState>;
	
	constructor(props:IWeaveToolProps)
	{
		super(props);
		this.state = {};
		this.toolPath = this.props.toolPath;
		this.titleBarHeight = 25;
	}
	
	componentWillUnmount():void
	{
	}
	
	componentWillReceiveProps(props:IWeaveToolProps):void
	{
		//TODO
	}
	
	shouldComponentUpdate(nextProps:IWeaveToolProps, nextState:IWeaveToolState):boolean
	{
		return !_.isEqual(this.state, nextState)
			|| !_.isEqual(this.props, nextProps);
	}
	
	handleInstance=(tool:IVisTool):void=>
	{
		if (this.tool === tool)
			return; 
		
		this.tool = tool;
		
		if (this.tool)
			LinkablePlaceholder.setInstance(this.toolPath.getObject(), this.tool);
		
		// make sure title gets updated
		if (this.tool)
		{
			Weave.getCallbacks(this.tool).addGroupedCallback(this, this.updateTitle);
			(ReactDOM.findDOMNode(tool as any) as any)[REACT_COMPONENT] = tool;
		}
		
		this.updateTitle();
	}

	componentDidMount():void
	{
		this.updateTitle();
	}

	updateTitle():void
	{
		var title:string = (this.tool ? this.tool.title : '') || this.toolPath.getPath().pop();
		this.setState({title});
	}

	//TODO - we shouldn't have to render twice to set the tooltip of the tool
	render():JSX.Element
	{
		let reactTool:JSX.Element = null;
		let ToolClass = LinkablePlaceholder.getClass(this.toolPath.getObject()) as typeof React.Component;
		if (React.Component.isPrototypeOf(ToolClass))
		{
			reactTool = React.createElement(ToolClass, {
				key: "tool",
				ref: this.handleInstance,
				toolTip: this.toolTip
			});
		}

		return (
			<VBox style={this.state.style} className="weave-tool"
					onMouseEnter={() => {
						this.titleBar.setState({ showControls: true });
					}}
					onMouseLeave={() => {
						this.titleBar.setState({ showControls: false });
						this.toolTip.setState({ showToolTip: false });
					}}
					onDragOver={this.props.onDragOver}
					onDragEnd={this.props.onDragEnd}>
				<TitleBar ref={(c:TitleBar) => this.titleBar = c }
						  onDragStart={this.props.onDragStart}
						  titleBarHeight={this.titleBarHeight}
						  title={Weave.lang(this.state.title)}
						  />
					{ reactTool }
				<ToolTip ref={(c:ToolTip) => this.toolTip = c}/>
			</VBox>
		);
	}
}

interface ITitleBarProps extends React.Props<TitleBar>
{
	onDragStart:React.DragEventHandler;
	titleBarHeight:number;
	title:string;
}

interface ITitleBarState
{
	showControls: boolean;
}

class TitleBar extends React.Component<ITitleBarProps, ITitleBarState>
{
	constructor(props:ITitleBarProps)
	{
		super(props);
		this.state = {
			showControls: false
		};
	}
	render()
	{
		var windowBar:CSSProperties = {
			width: "100%",
			height: this.props.titleBarHeight,
			backgroundColor: this.state.showControls ? "#f8f8f8": ""
		};

		var titleStyle:CSSProperties = {
			cursor: "move",
			height: this.props.titleBarHeight,
			textAlign: "center",
			overflow: "hidden",
			whiteSpace: "nowrap",
			flex: 1,
			textOverflow: "ellipsis",
			paddingTop: "3"
		};

		var transitions:CSSProperties = {
			visibility: this.state.showControls ? "visible" : "hidden",
			opacity: this.state.showControls ? 0.7 : 0,
			transition: this.state.showControls ? "visibiliy 0s 0.1s, opacity 0.1s linear" : "visibility 0s 0.1s, opacity 0.1s linear"
		};

		var leftControls:CSSProperties = {
			marginLeft: 5,
			marginTop: 2,
			width: 20
		};

		var rightControls:CSSProperties = {
			marginTop: 2,
			width: 38
		};

		_.merge(leftControls, transitions);
		_.merge(rightControls, transitions);

		return(
			<HBox ref="header" style={windowBar} draggable={true} onDragStart={this.props.onDragStart}>
			{/*<HBox style={VendorPrefix.prefix({styles: leftControls}).styles}>
			<Glyphicon glyph="cog"/>
			</HBox>*/}
			<span style={titleStyle} className="weave-panel">{this.props.title}</span>
			{/*<HBox style={VendorPrefix.prefix({styles: rightControls}).styles}>
			<div style={{marginRight: 5}}>
			<Glyphicon glyph="unchecked"/>
			</div>
			<div style={{marginRight: 5}}>
			<Glyphicon glyph="remove"/>
			</div>
			</HBox>*/}
			</HBox>
		);
	}
}
