import ILinkableObject = weavejs.api.core.ILinkableObject;
import LinkablePlaceholder = weavejs.core.LinkablePlaceholder;
import LinkableWatcher = weavejs.core.LinkableWatcher;

import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {HBox, VBox} from "./react-ui/FlexBox";
import prefixer from "./react-ui/VendorPrefixer";
import {Glyphicon} from "react-bootstrap";
import {CSSProperties} from "react";
import {IVisTool, IVisToolProps, IVisToolState} from "./tools/IVisTool";
import ToolTip from "./tools/ToolTip";
import {IToolTipProps, IToolTipState} from "./tools/ToolTip";
import PopupWindow from "./react-ui/PopupWindow";
import ReactUtils from "./utils/ReactUtils";
import WeaveComponentRenderer from "./WeaveComponentRenderer";
import SmartComponent from "./ui/SmartComponent";

const grabberStyle:CSSProperties = {
	width: "16",
	height: "16",
	cursor: "move",
	background: "url(http://placehold.it/32x32)"
};

export interface IWeaveToolProps extends React.Props<WeaveTool>
{
	weave:Weave;
	path:string[];
	onDragStart:React.DragEventHandler;
	onDragEnd:React.DragEventHandler;
	onDragOver:React.DragEventHandler;
	onContextMenu?:React.MouseEventHandler;
	style?: CSSProperties;
	onGearClick?:(tool:IVisTool, editorContent:JSX.Element)=>void;
	onMaximizeClick?:(tool:IVisTool)=>void;
}

export interface IWeaveToolState
{
	title?: string;
}

export default class WeaveTool extends SmartComponent<IWeaveToolProps, IWeaveToolState>
{
	private titleBarHeight:number = 25;
	private titleBar:React.Component<ITitleBarProps, ITitleBarState>;
	private watcher:LinkableWatcher;
	
	constructor(props:IWeaveToolProps)
	{
		super(props);
		this.state = {};
	}
	
	handleTool=(wcr:WeaveComponentRenderer):void=>
	{
		if (this.watcher == wcr.watcher)
			return;
		
		this.watcher = wcr.watcher;
		
		if (this.watcher)
			Weave.getCallbacks(this.watcher).addGroupedCallback(this, this.updateTitle);
		
		this.updateTitle();
	}

	componentDidMount():void
	{
		this.updateTitle();
    }
	
	updateTitle():void
	{
		var title:string = (this.watcher && this.watcher.target ? (this.watcher.target as IVisTool).title : '') || this.props.path[this.props.path.length - 1];
		if (this.state.title != title)
			this.setState({title});
	}
	
	onGearClick=():void=>
	{
		if (this.watcher && this.watcher.target && (this.watcher.target as any).renderEditor)
		{
			var content = (this.watcher.target as any).renderEditor() as JSX.Element;
			
			if (this.props.onGearClick)
			{
				this.props.onGearClick(this.watcher.target as IVisTool, content);
			}
			else
			{
				PopupWindow.open({
					title: Weave.lang("Settings for {0}", this.state.title),
					modal: false,
					content: content
				});
			}
		}
	}
	
	onMaximizeClick=():void=>
	{
		if (this.props.onMaximizeClick)
			this.props.onMaximizeClick(this.watcher.target as IVisTool);
	}

	render():JSX.Element
	{
		return (
			<VBox style={this.props.style} className="weave-tool"
					onMouseOver={() => {
						this.titleBar.setState({ showControls: true });
					}}
					onMouseLeave={() => {
						this.titleBar.setState({ showControls: false });
					}}
					onDragOver={this.props.onDragOver}
					onDragEnd={this.props.onDragEnd}>
				<TitleBar ref={(c:TitleBar) => this.titleBar = c }
						  onDragStart={this.props.onDragStart}
						  titleBarHeight={this.titleBarHeight}
						  title={Weave.lang(this.state.title)}
						  onGearClick={this.onGearClick}
						  onMaximizeClick={this.onMaximizeClick}
						  />
				<WeaveComponentRenderer style={{overflow: 'hidden'}} weave={this.props.weave} path={this.props.path} ref={ReactUtils.onWillUpdateRef(this.handleTool)}/>
			</VBox>
		);
	}

	componentWillUnmount():void
	{
	}
}

interface ITitleBarProps extends React.Props<TitleBar>
{
	onDragStart:React.DragEventHandler;
	titleBarHeight:number;
	title:string;
	onGearClick:React.MouseEventHandler;
	onMaximizeClick:React.MouseEventHandler;
}

interface ITitleBarState
{
	showControls: boolean;
}

class TitleBar extends SmartComponent<ITitleBarProps, ITitleBarState>
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
			height: this.props.titleBarHeight,
			padding:2,
			alignItems:"center"
		};

		if (this.state.showControls)
			_.merge(windowBar, {
				backgroundColor: "#f8f8f8",
				borderBottom: '1px solid #e6e6e6'
			});


		var titleStyle:CSSProperties = {
			cursor: "move",
			height: this.props.titleBarHeight,
			textAlign: "center",
			overflow: "hidden",
			whiteSpace: "nowrap",
			flex: 1,
			textOverflow: "ellipsis"
		};

		var transitions:CSSProperties = {
			visibility: this.state.showControls ? "visible" : "hidden",
			opacity: this.state.showControls ? 0.7 : 0,
			transition: this.state.showControls ? "visibiliy 0s 0.1s, opacity 0.1s linear" : "visibility 0s 0.1s, opacity 0.1s linear"
		};

		var leftControls:CSSProperties = {
			paddingLeft:4,
			fontSize: 14 // will set the size of the icons as icons are uniocode values
		};

		var rightControls:CSSProperties = {
			paddingRight:4,
			fontSize: 14 // will set the size of the icons as icons are uniocode values
		};

		var iconStyle:CSSProperties = {
			marginRight:"4px",
			cursor:"pointer"
		};

		_.merge(leftControls, transitions);
		_.merge(rightControls, transitions);

		return(
			<HBox ref="header" style={windowBar} draggable={true} onDragStart={this.props.onDragStart}>
				<HBox style={prefixer(leftControls)}>
	            	<div style={iconStyle} onClick={this.props.onGearClick}>
						<Glyphicon glyph="cog"/>
					</div>
	            </HBox>
				<span style={titleStyle} className="weave-panel">{this.props.title}</span>
				<HBox style={prefixer(rightControls)}>
					<div style={iconStyle} onClick={this.props.onMaximizeClick}>
						<Glyphicon glyph="unchecked"/>
					</div>
					<div style={iconStyle}>
						<Glyphicon glyph="remove"/>
					</div>
				</HBox>
			</HBox>
		);
	}
}
