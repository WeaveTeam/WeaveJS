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
import LinkableString = weavejs.core.LinkableString;
import IAltText from "./accessibility/IAltText";
import {KEYCODES} from "./utils/KeyboardUtils";

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
	showCaption?:boolean;
	caption?:string;
	hovered?: boolean;
	dragging?:boolean;
	highlightTitle?: boolean;
}

export default class WeaveTool extends SmartComponent<IWeaveToolProps, IWeaveToolState>
{
	private watcher:LinkableWatcher;
	private clickState:boolean;
	private closeIcon:CenteredIcon;
	private gearIcon:CenteredIcon;

	private firstIcon:CenteredIcon;
	private lastIcon:CenteredIcon;

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
			Weave.getCallbacks(this.watcher).addGroupedCallback(this, this.update);
		}

		this.update();
	};

	componentDidMount():void
	{
		this.firstIcon = this.gearIcon;
		this.lastIcon = this.closeIcon;
		// ReactUtils.getDocument(this).addEventListener("keypress", this.handleKeyPress);
		this.update();
    }

	componentWillUnmount():void
	{
		// ReactUtils.getDocument(this).removeEventListener("keypress", this.handleKeyPress);
	}

	componentDidUpdate():void
	{
		if (!MouseUtils.forComponent(this).mouseButtonDown)
			this.setState({
				dragging: false
			});
	}

	update():void
	{
		this.updateTitle();
		this.updateCaption();
	}

	handleKeyDown=(event:React.KeyboardEvent)=>
	{
		// if we hit tab
		if(event.keyCode == KEYCODES.TAB)
		{
			// and on close or shift tab and on gear icon
			if(ReactUtils.hasFocus(this.lastIcon) || (ReactUtils.hasFocus(this) && event.shiftKey))
			{
				// hide the controls
				this.setState({hovered: false});
			}
		}
	};

	updateTitle():void
	{
		var path = this.props.path;
		var title:string = this.watcher && this.watcher.target ? (this.watcher.target as IVisTool).title : '';
		if (!title && path)
			title = path[path.length - 1];
		if (this.state.title != title)
			this.setState({title});
	}

	updateCaption():void
	{
		var tool = Weave.AS(this.watcher && this.watcher.target, IAltText);
		if(tool)
		{
			this.setState({
				showCaption: tool.altText.showAsCaption.value,
				caption: tool.altText.text.value || tool.getAutomaticDescription()
			});
		}
	}

	onGearClick=(event:React.MouseEvent):void=>
	{
		if (MouseUtils.receivedMouseDown(event.target as Element))
			this.handleGear();
	};

	handleGear=()=>
	{
		if (this.props.onGearClick)
		{
			this.props.onGearClick(this);
		}
		else if (this.watcher && this.watcher.target && (this.watcher.target as any).renderEditor)
		{
			PopupWindow.open({
				context: this,
				title: Weave.lang("Settings for {0}", this.state.title),
				modal: false,
				content: (this.watcher.target as any).renderEditor()
			});
		}
	};
	
	onMaximizeClick=(event:React.MouseEvent):void=>
	{
		if (MouseUtils.receivedMouseDown(event.target as Element))
			this.handleMaximize();
	};

	handleMaximize=()=>
	{
		var layout = ReactUtils.findComponent(this, AbstractLayout as any) as AnyAbstractLayout;
		if (layout)
			layout.maximizePanel(this.props.path, !this.props.maximized);
	};

	onPopoutPopinClick=(event:React.MouseEvent):void=>
	{
		if (MouseUtils.receivedMouseDown(event.target as Element))
			this.handlePopoutPopin();
	};

	handlePopoutPopin=()=>
	{
		if (this.props.onPopoutClick)
			this.props.onPopoutClick(this);
		if (this.props.onPopinClick)
			this.props.onPopinClick(this);
	};

	onCloseClick=(event:React.MouseEvent):void=>
	{
		if (MouseUtils.receivedMouseDown(event.target as Element))
			this.handleClose();
	};

	handleClose=()=>
	{
		var layout = ReactUtils.findComponent(this, AbstractLayout as any) as AnyAbstractLayout;
		if (layout)
		{
			this.props.weave.removeObject(this.props.path);
			layout.removePanel(this.props.path);
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
			<HBox className={className} style={{alignItems: 'center'}} onDoubleClick={this.onMaximizeClick}>
				<HBox overflow style={{display: showControls ? "flex" : "none"}}>
					<CenteredIcon
						ref={(c:CenteredIcon) => this.gearIcon = c}
						title={Weave.lang("Configure")}
						onMouseUp={this.onGearClick}
						onClick={this.handleGear}
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
				<HBox overflow style={{display: showControls ? "flex" : "none", flexDirection: "row"}}>
					<CenteredIcon
						title={maximizeTitleText}
						onMouseUp={this.onMaximizeClick}
						onClick={this.handleMaximize}
						iconProps={{ className: maximizeClassName }}
					/>
					{
						Weave.beta
					    ?	<CenteredIcon
								title={this.props.onPopoutClick ? Weave.lang("Display in new window") : Weave.lang("Restore to main window")}
								onMouseUp={this.onPopoutPopinClick}
								onClick={this.handlePopoutPopin}
								iconProps={{className: this.props.onPopoutClick ? "fa fa-external-link fa-fw" : "fa fa-level-down fa-fw fa-rotate-90"}}
							/>
						:	null
					}
					<CenteredIcon
						ref={(c:CenteredIcon) => this.closeIcon = c}
						title={Weave.lang("Close")}
					    onMouseUp={this.onCloseClick}
					    onClick={this.handleClose}
						iconProps={{className: "fa fa-times fa-fw"}}
					/>
				</HBox>
			</HBox>
		);
	}

	renderCaption()
	{
		return (
			<HBox style={{padding: 20, overflow: "auto"}} className="weave-caption-border">
				{this.state.caption}
			</HBox>
		)
	}
	
	render():JSX.Element
	{
		return (
			<VBox
				style={this.props.style}
				className="weave-tool"
				aria-label={Weave.lang("{0} Visualization", this.props.path[(this.props.path.length || 0) - 1])}
				tabIndex={0}
				onKeyDown={this.handleKeyDown}
				onMouseOver={() => {
					this.setState({ hovered: true });
				}}
			    onMouseLeave={() => {
					this.setState({ hovered: false });
				}}
			    onFocus={() => {
			        this.setState({ hovered: true });
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
				/>
				{
					this.state.showCaption
						?
					<div style={{maxHeight: "30%"}}>{ this.renderCaption() }</div>
						:
					null
				}
			</VBox>
		);
	}
}
