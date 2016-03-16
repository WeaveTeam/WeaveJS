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
}

export interface IWeaveToolState
{
	title?: string;
	style?: CSSProperties;
}

export default class WeaveTool extends React.Component<IWeaveToolProps, IWeaveToolState>
{
	private titleBarHeight:number = 25;
	private titleBar:React.Component<ITitleBarProps, ITitleBarState>;
	private watcher:LinkableWatcher;
	
	constructor(props:IWeaveToolProps)
	{
		super(props);
		this.state = {};
	}
	
	shouldComponentUpdate(nextProps:IWeaveToolProps, nextState:IWeaveToolState, nextContext:any):boolean
	{
		return !_.isEqual(this.state, nextState)
			|| !_.isEqual(this.props, nextProps)
			|| !_.isEqual(this.context, nextContext);
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
	
	showEditor()
	{
		if (this.watcher && this.watcher.target && (this.watcher.target as any).renderEditor)
			PopupWindow.open({
				title: Weave.lang("Settings for {0}", this.state.title),
				modal: false,
				content: (this.watcher.target as any).renderEditor()
			});
	}

	updateTitle():void
	{
		var title:string = (this.watcher && this.watcher.target ? (this.watcher.target as IVisTool).title : '') || this.props.path[this.props.path.length - 1];
		if (this.state.title != title)
			this.setState({title});
	}

	render():JSX.Element
	{
		return (
			<VBox style={this.state.style} className="weave-tool"
				  onMouseEnter={() => {
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
						  onGearClick={this.showEditor.bind(this)}
				/>
				<WeaveComponentRenderer style={{overflow: 'auto'}} weave={this.props.weave} path={this.props.path} ref={ReactUtils.onWillUpdateRef(this.handleTool)}/>
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
	onGearClick:React.MouseEventHandler
}

interface ITitleBarState
{
	showControls: boolean;
	notification: boolean;
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
				{<HBox style={prefixer(leftControls)}>
					<div onClick={this.props.onGearClick}>
						<Glyphicon glyph="cog"/>
					</div>
				</HBox>}
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