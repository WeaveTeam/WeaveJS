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
	onCloseClick?:(tool:IVisTool)=>void;
	onExportClick?:(tool:IVisTool)=>void;
}

export interface IWeaveToolState
{
	title?: string;
	showControls?: boolean;
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
	};

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
	};
	
	onMaximizeClick=():void=>
	{
		if (this.props.onMaximizeClick)
			this.props.onMaximizeClick(this.watcher.target as IVisTool);
	};
	
	
	onCloseClick=():void=>
	{
		if (this.props.onCloseClick)
			this.props.onCloseClick(this.watcher.target as IVisTool);
	};

	onExportClick=():void=>
	{
		if (this.props.onExportClick)
			this.props.onExportClick(this.watcher.target as IVisTool);
	};

	render():JSX.Element
	{
		return (
			<VBox style={this.props.style} 
				  className="weave-tool"
				  onDragOver={this.props.onDragOver}
				  onDragEnd={this.props.onDragEnd}
				  onMouseOver={() => {
						this.setState({ showControls: true });
				  }}
			      onMouseLeave={() => {
						this.setState({ showControls: false });
				  }}>
				<TitleBar ref={(c:TitleBar) => this.titleBar = c }
						  showControls={this.state.showControls}
						  onDragStart={this.props.onDragStart}
						  titleBarHeight={this.titleBarHeight}
						  title={Weave.lang(this.state.title)}
						  onGearClick={this.onGearClick}
						  onMaximizeClick={this.onMaximizeClick}
						  onExportClick={this.onExportClick}
						  onCloseClick={this.onCloseClick}
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
	showControls:boolean;
	titleBarHeight:number;
	title:string;
	onGearClick:React.MouseEventHandler;
	onMaximizeClick:React.MouseEventHandler;
	onExportClick:React.MouseEventHandler;
	onCloseClick:React.MouseEventHandler;
}

interface ITitleBarState
{
	
}

class TitleBar extends SmartComponent<ITitleBarProps, ITitleBarState>
{
	constructor(props:ITitleBarProps)
	{
		super(props);
	}
	render()
	{
		return(
			<HBox className={this.props.showControls ? "weave-tool-title-bar-hovered" : "weave-tool-title-bar"} style={{height: this.props.titleBarHeight}} draggable={true} onDragStart={this.props.onDragStart}>
				<CenteredIcon onClick={this.props.onGearClick}
							  iconProps={{className: "fa fa-cog fa-fw"}}/>

				<HBox style={{flex: 1, alignSelf: "stretch", cursor: "move", overflow: "hidden", visibility: "visible"}}>
					<span className="weave-tool-title-bar-text" style={{width: "100%", textAlign: "center", textOverflow: "ellipsis"}}>{this.props.title}</span>
				</HBox>

				<CenteredIcon onClick={this.props.onMaximizeClick}
							  iconProps={{className: "fa fa-expand fa-fw"}}/>
				<CenteredIcon onClick={this.props.onExportClick}
							  iconProps={{className: "fa fa-external-link fa-fw"}}/>
			    <CenteredIcon onClick={this.props.onCloseClick}
							  iconProps={{className: "fa fa-times fa-fw"}}/>
			</HBox>
		);
	}
}
