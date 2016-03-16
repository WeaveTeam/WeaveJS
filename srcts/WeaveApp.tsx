import * as React from "react";
import * as _ from "lodash";
import Menu from "./react-ui/Menu";
import {MenuItemProps} from "./react-ui/Menu";
import {HBox, VBox} from "./react-ui/FlexBox";
import PopupWindow from "./react-ui/PopupWindow";
import WeaveMenuBar from "./WeaveMenuBar";
import WeaveComponentRenderer from "./WeaveComponentRenderer";
import FlexibleLayout from "./FlexibleLayout";
import MiscUtils from "./utils/MiscUtils";
import SessionHistorySlider from "./editors/SessionHistorySlider";

import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import WeavePath = weavejs.path.WeavePath;

const WEAVE_EXTERNAL_TOOLS = "WeaveExternalTools";

export interface WeaveAppProps extends React.HTMLProps<WeaveApp>
{
	weave?:Weave;
	renderPath?:string[];
	readUrlParams?:boolean;
}

export interface WeaveAppState
{
	showContextMenu: boolean;
	contextMenuXPos?: number;
	contextMenuYPos?: number;
	contextMenuItems?: MenuItemProps[];
}

export default class WeaveApp extends React.Component<WeaveAppProps, WeaveAppState>
{
	contextMenu:HTMLElement;
	menuBar:WeaveMenuBar;

	constructor(props:WeaveAppProps)
	{
		super(props);
		this.state = {
			showContextMenu: false,
			contextMenuXPos: 0,
			contextMenuYPos: 0,
			contextMenuItems: []
		};
	}

	componentDidMount()
	{
		if(this.props.readUrlParams)
		{
			var urlParams = MiscUtils.getUrlParams();
			var weaveExternalTools:any = window.opener && (window.opener as any)[WEAVE_EXTERNAL_TOOLS];
			
			if (urlParams.file)
			{
				// read from url
				this.menuBar.fileMenu.loadUrl(urlParams).then(this.forceUpdate.bind(this));
			}

			else if (weaveExternalTools && weaveExternalTools[window.name])
			{
				// read content from flash
				var ownerPath:WeavePath = weaveExternalTools[window.name].path;
				var content:Uint8Array = atob(ownerPath.getValue('btoa(Weave.createWeaveFileContent())') as string) as any;
				weavejs.core.WeaveArchive.loadFileContent(this.props.weave, content);
				this.forceUpdate();
			}
		}
	}
	
	static defaultProps:WeaveAppProps = {
		weave: new Weave(),
		readUrlParams: false
	}
	
	showContextMenu(event:React.MouseEvent)
	{
		// if context menu already showing do nothing
		var contextMenuItems = Menu.getMenuItems(event.target as HTMLElement);
		this.setState({
			showContextMenu: true,
			contextMenuItems,
			contextMenuXPos: event.clientX,
			contextMenuYPos: event.clientY
		});
		event.preventDefault();
	}
	
	handleRightClickOnContextMenu(event:React.MouseEvent)
	{
		event.stopPropagation();
		event.preventDefault();
	}
	
	hideContextMenu(event:React.MouseEvent)
	{
		if (this.contextMenu && this.contextMenu.contains(event.target as HTMLElement))
			return;
		this.setState({
			showContextMenu:false
		});
	}
	
	render():JSX.Element
	{
		var renderPath = this.props.renderPath || ["Layout"];
		
		if (!this.props.weave)
			return <VBox>Cannot render WeaveApp without an instance of Weave.</VBox>;
		
		if (!this.props.weave.getObject(renderPath))
		{
			try
			{
				var parentPath = renderPath.concat();
				var childName = parentPath.pop();
				var parent = this.props.weave.getObject(parentPath);
				if (parent instanceof LinkableHashMap)
					(parent as LinkableHashMap).requestObject(childName, FlexibleLayout);
			}
			catch (e)
			{
				// ignore
			}
		}
		
		// backwards compatibility
		var enableMenuBar = this.props.weave.getObject('WeaveProperties', 'enableMenuBar') as LinkableBoolean;

		return (
			<VBox
				className="weave-app"
				{...this.props as React.HTMLAttributes}
				style={_.merge({flex: 1}, this.props.style)}
				onMouseDown={this.hideContextMenu.bind(this)}
				onClick={()=>this.setState({showContextMenu: false})}
				onContextMenu={this.showContextMenu.bind(this)}
			>
				{
					!enableMenuBar || enableMenuBar.value
					?	<WeaveMenuBar weave={this.props.weave} ref={(c:WeaveMenuBar) => this.menuBar = c}/>
					:	null
				}
				{
					<SessionHistorySlider stateLog={this.props.weave.history}/>
				}
				<WeaveComponentRenderer weave={this.props.weave} path={renderPath}/>
				{
					this.state.showContextMenu ? 
					<div ref={(element:HTMLElement) => this.contextMenu = element} onContextMenu={this.handleRightClickOnContextMenu.bind(this)}>
						{<Menu xPos={this.state.contextMenuXPos} yPos={this.state.contextMenuYPos} menu={this.state.contextMenuItems}/>}
					</div>
					: null
				}
			</VBox>
		);
	}
	
}
