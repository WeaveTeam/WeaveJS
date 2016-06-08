import ILinkableObject = weavejs.api.core.ILinkableObject;
import LinkablePlaceholder = weavejs.core.LinkablePlaceholder;
import LinkableWatcher = weavejs.core.LinkableWatcher;

import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {HBox, VBox} from "./react-ui/FlexBox";
import prefixer from "./react-ui/VendorPrefixer";
import CenteredIcon from "./react-ui/CenteredIcon";
import {CSSProperties} from "react";
import {IVisTool, IVisToolProps, IVisToolState} from "./tools/IVisTool";
import PopupWindow from "./react-ui/PopupWindow";
import ReactUtils from "./utils/ReactUtils";
import MouseUtils from "./utils/MouseUtils";
import WeaveComponentRenderer from "./WeaveComponentRenderer";
import SmartComponent from "./ui/SmartComponent";
import classNames from "./modules/classnames";
import DraggableDiv from "./react-ui/DraggableDiv";
import {AbstractLayout, AnyAbstractLayout} from "./layouts/AbstractLayout";

export interface IWeaveToolProps extends React.Props<WeaveTool>
{
	weave:Weave;
	path:string[];
	props?:any; // passed in to WeaveComponentRenderer
	maximized?:boolean;
	style?: CSSProperties;
	onGearClick?:(tool:WeaveTool)=>void;
	onPopoutClick?:(tool:WeaveTool)=>void;
	onPopinClick?:(tool:WeaveTool)=>void;
}

export interface IWeaveToolState
{
	title?: string;
	altText?:string;
	hovered?: boolean;
	dragging?:boolean;
	highlightTitle?: boolean;
}

export default class WeaveTool extends SmartComponent<IWeaveToolProps, IWeaveToolState>
{
	private titleBarHeight:number = 25;
	private watcher:LinkableWatcher;
	private clickState:boolean;

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
		{
			Weave.getCallbacks(this.watcher).addGroupedCallback(this, this.updateTitle);
			Weave.getCallbacks(this.watcher).addGroupedCallback(this, this.updateAltText);
		}

		this.updateTitle();
	};

	componentDidMount():void
	{
		this.updateTitle();
    }

	componentDidUpdate():void
	{
		if (!MouseUtils.forComponent(this).mouseButtonDown)
			this.setState({
				dragging: false
			});
	}
	
	updateTitle():void
	{
		var path = this.props.path;
		var title:string = this.watcher && this.watcher.target ? (this.watcher.target as IVisTool).title : '';
		if (!title && path)
			title = path[path.length - 1];
		if (this.state.title != title)
			this.setState({title});
	}

	updateAltText():void
	{
		var path = this.props.path;
		var altTextLinkable = this.watcher && this.watcher.target && (this.watcher.target as IVisTool).altText;
		var altText = altTextLinkable ? altTextLinkable.value : '';
		if (this.state.altText != altText)
			this.setState({altText});
	}
	
	onGearClick=(event:React.MouseEvent):void=>
	{
		if (MouseUtils.receivedMouseDown(event.target as Element))
		{
			if (this.watcher && this.watcher.target && (this.watcher.target as any).renderEditor)
			{
				if (this.props.onGearClick)
				{
					this.props.onGearClick(this);
				}
				else
				{
					PopupWindow.open(this, {
						title: Weave.lang("Settings for {0}", this.state.title),
						modal: false,
						content: (this.watcher.target as any).renderEditor()
					});
				}
			}
		}
	};
	
	onMaximizeClick=(event:React.MouseEvent):void=>
	{
		if (MouseUtils.receivedMouseDown(event.target as Element))
		{
			var layout = ReactUtils.findComponent(this, AbstractLayout as any) as AnyAbstractLayout;
			if (layout)
				layout.maximizePanel(this.props.path, !this.props.maximized);
		}
	};
	
	onPopoutPopinClick=(event:React.MouseEvent):void=>
	{
		if (MouseUtils.receivedMouseDown(event.target as Element))
		{
			if (this.props.onPopoutClick)
				this.props.onPopoutClick(this);
			if (this.props.onPopinClick)
				this.props.onPopinClick(this);
		}
	};

	onCloseClick=(event:React.MouseEvent):void=>
	{
		if (MouseUtils.receivedMouseDown(event.target as Element))
		{
			var layout = ReactUtils.findComponent(this, AbstractLayout as any) as AnyAbstractLayout;
			if (layout)
			{
				this.props.weave.removeObject(this.props.path);
				layout.removePanel(this.props.path);
			}
		}
	};
	
	renderTitleBar():JSX.Element
	{
		var showControls = this.state.hovered || this.state.dragging;
		var className = "weave-tool-title-bar";
		if (showControls|| this.state.highlightTitle)
			className = "weave-tool-title-bar-hovered";
		if (this.state.highlightTitle)
			className += " weave-tool-title-bar-highlighted";
		var maximizeClassName = "fa fa-fw fa-" + (this.props.maximized ? "compress" : "expand");
		var maximizeTitleText = this.props.maximized ? Weave.lang("Restore") : Weave.lang("Maximize");

		return (
			<HBox className={className} style={{height: this.titleBarHeight}} onDoubleClick={this.onMaximizeClick}>
				<HBox style={{display: showControls ? "flex" : "none"}}>
					<CenteredIcon 
						title={Weave.lang("Configure")}
						onMouseUp={this.onGearClick}
						iconProps={{className: "fa fa-cog fa-fw"}}
					/>
					<div style={{width: 28, height: 24}}/>
					{Weave.beta ? <div style={{width: 28, height: 24}}/> : null}
				</HBox>
				<HBox draggable={true} style={{flex: 1, alignSelf: "stretch", cursor: "move", visibility: "visible", overflow: "hidden"}}>
					<p className="weave-tool-title-bar-text" style={{width: "100%", padding: 5, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis"}}>
						{Weave.lang(this.state.title)}
					</p>
				</HBox>
				<HBox style={{display: showControls ? "flex" : "none", flexDirection: "row"}}>
					<CenteredIcon
						title={maximizeTitleText}
						onMouseUp={this.onMaximizeClick}
						iconProps={{ className: maximizeClassName }}
					/>
					{
						Weave.beta
					    ?	<CenteredIcon
								title={this.props.onPopoutClick ? Weave.lang("Display in new window") : Weave.lang("Restore to main window")}
								onClick={this.onPopoutPopinClick}
								iconProps={{className: this.props.onPopoutClick ? "fa fa-external-link fa-fw" : "fa fa-level-down fa-fw fa-rotate-90"}}
							/>
						:	null
					}
					<CenteredIcon
						title={Weave.lang("Close")}
					    onMouseUp={this.onCloseClick}
						iconProps={{className: "fa fa-times fa-fw"}}
					/>
				</HBox>
			</HBox>
		);
	}
	
	render():JSX.Element
	{
		return (
			<VBox
				style={this.props.style}
				className="weave-tool"
				role="img"
				onMouseOver={() => {
					this.setState({ hovered: true });
				}}
			    onMouseLeave={() => {
					this.setState({ hovered: false });
				}}
			    onDragStart={() => {
			        this.setState({ dragging: true });
			    }}
			>
				<div>{ this.renderTitleBar() }</div>
				<WeaveComponentRenderer
					ref={ReactUtils.onWillUpdateRef(this.handleTool)}
					weave={this.props.weave}
					path={this.props.path}
					props={this.props.props}
					style={{overflow: 'hidden'}}
				/>
			</VBox>
		);
	}
}
