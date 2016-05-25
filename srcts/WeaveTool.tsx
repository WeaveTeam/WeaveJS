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
import ToolTip from "./tools/ToolTip";
import {IToolTipProps, IToolTipState} from "./tools/ToolTip";
import PopupWindow from "./react-ui/PopupWindow";
import ReactUtils from "./utils/ReactUtils";
import WeaveComponentRenderer from "./WeaveComponentRenderer";
import SmartComponent from "./ui/SmartComponent";
import classNames from "./modules/classnames";
import DraggableDiv from "./react-ui/DraggableDiv";
import AbstractLayout from "./layouts/AbstractLayout";

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
	showControls?: boolean;
	highlightTitle?: boolean;
}

export default class WeaveTool extends SmartComponent<IWeaveToolProps, IWeaveToolState>
{
	private titleBarHeight:number = 25;
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
	
	onGearClick=():void=>
	{
		if (this.watcher && this.watcher.target && (this.watcher.target as any).renderEditor)
		{
			if (this.props.onGearClick)
			{
				this.props.onGearClick(this);
			}
			else
			{
				PopupWindow.open({
					title: Weave.lang("Settings for {0}", this.state.title),
					modal: false,
					content: (this.watcher.target as any).renderEditor()
				});
			}
		}
	};
	
	onMaximizeClick=():void=>
	{
		var layout = ReactUtils.findComponent(this, AbstractLayout as any) as AbstractLayout;
		if (layout)
			layout.maximizePanel(this.props.path, !this.props.maximized);
	};
	
	onPopoutPopinClick=():void=>
	{
		if (this.props.onPopoutClick)
			this.props.onPopoutClick(this);
		if (this.props.onPopinClick)
			this.props.onPopinClick(this);
	};

	onCloseClick=():void=>
	{
		var layout = ReactUtils.findComponent(this, AbstractLayout as any) as AbstractLayout;
		if (layout)
		{
			this.props.weave.removeObject(this.props.path);
			layout.removePanel(this.props.path);
		}
	};
			
	renderTitleBar():JSX.Element
	{
		var className = "weave-tool-title-bar";
		if (this.state.showControls || this.state.highlightTitle)
			className = "weave-tool-title-bar-hovered";
		if (this.state.highlightTitle)
			className += " weave-tool-title-bar-highlighted";
		var maximizeClassName = "fa fa-fw fa-" + (this.props.maximized ? "compress" : "expand");
		var maximizeTitleText = this.props.maximized ? Weave.lang("Restore") : Weave.lang("Maximize");

		return (
			<HBox className={className} style={{height: this.titleBarHeight}} draggable={true} onDoubleClick={this.onMaximizeClick}>
				{
					this.state.showControls
					?	[
							<CenteredIcon key="0" title={Weave.lang("Configure")} onClick={this.onGearClick}
										  iconProps={{className: "fa fa-cog fa-fw"}}/>,
							<div key="1" style={{width: 28, height: 24}}/>,
							Weave.beta ? <div key="2" style={{width: 28, height: 24}}/> : null
						]
					:	null
				}
				<HBox style={{flex: 1, alignSelf: "stretch", cursor: "move", visibility: "visible", overflow: "hidden"}}>
					<p className="weave-tool-title-bar-text" style={{width: "100%", padding: 5, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis"}}>
						{Weave.lang(this.state.title)}
					</p>
				</HBox>
				{
					this.state.showControls 
					?	[
							<CenteredIcon key="0" title={maximizeTitleText} onClick={this.onMaximizeClick}
										  iconProps={{ className: maximizeClassName }}/>,
							Weave.beta 
							?	<CenteredIcon key="1"
										title={this.props.onPopoutClick ? Weave.lang("Display in new window") : Weave.lang("Restore to main window")}
										onClick={this.onPopoutPopinClick}
										iconProps={{className: this.props.onPopoutClick ? "fa fa-external-link fa-fw" : "fa fa-level-down fa-fw fa-rotate-90"}}
									/>
							:	null,
							<CenteredIcon key="2" title={Weave.lang("Close")} onClick={this.onCloseClick}
										  iconProps={{className: "fa fa-times fa-fw"}}/>
				    ]
					: null
				}
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
					this.setState({ showControls: true });
				}}
			    onMouseLeave={() => {
					this.setState({ showControls: false });
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
