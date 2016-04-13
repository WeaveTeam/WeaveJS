import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import MenuBar from "./react-ui/MenuBar";
import * as FileSaver from "filesaver.js";
import FileInput from "./react-ui/FileInput";
import PopupWindow from "./react-ui/PopupWindow";
import {HBox, VBox} from "./react-ui/FlexBox";
import SystemMenu from "./menus/SystemMenu";
import FileMenu from "./menus/FileMenu";
import DataMenu from './menus/DataMenu';
import ToolsMenu from './menus/ToolsMenu';
import SessionHistorySlider from "./editors/SessionHistorySlider";


export interface WeaveMenuBarProps extends React.HTMLProps<WeaveMenuBar>
{
	style:React.CSSProperties;
	weave:Weave;
	createObject:(type:new(..._:any[])=>any)=>void;
}

export interface WeaveMenuBarState
{

}

export default class WeaveMenuBar extends React.Component<WeaveMenuBarProps, WeaveMenuBarState>
{
	element:Element;
	systemMenu:SystemMenu;
	fileMenu:FileMenu;
	dataMenu:DataMenu;
	toolsMenu:ToolsMenu;
	private weave:Weave;
	private createObject:(type:new(..._:any[])=>any)=>void;
	constructor(props:WeaveMenuBarProps)
	{
		super(props);
		this.weave = props.weave;
		this.createObject = props.createObject;
	}
	
	componentDidUpdate() {
		($(this.element).find('.ui.dropdown') as any)
			.dropdown('refresh');
	}

	componentDidMount() {
		this.element = ReactDOM.findDOMNode(this);
		($(this.element).find('.ui.dropdown') as any)
			.dropdown();
	}


	render():JSX.Element
	{
		return (
			<div className="ui small menu" style={_.merge(this.props.style||{}, {fontSize: "0.8em", margin: "0em", borderRadius: "0em"})}>
				<div className="ui dropdown header item" style={{borderRadius: 0, padding: "0 5 0 5"}}>
					Weave
					<SystemMenu
						ref={(c:SystemMenu) => this.systemMenu = c}
						weave={this.weave}
					/>
				</div>
				<div className="ui dropdown item" onClick={() => this.fileMenu.forceUpdate()}>
					File
					<FileMenu
						ref={(c:FileMenu) => this.fileMenu = c}
						weave={this.weave}
						createObject={this.createObject}
					/>
				</div>
				<div className="ui dropdown item">
					Data
					<DataMenu
						ref={(c:DataMenu) => this.dataMenu = c}
						weave={this.weave}
						createObject={this.createObject}
					/>
				</div>
				<div className="ui dropdown item">
					Tools
					<ToolsMenu
						ref={(c:ToolsMenu) => this.toolsMenu = c}
						weave={this.weave}
						createObject={this.createObject}
					/>
				</div>
				<SessionHistorySlider stateLog={this.props.weave.history} style={{borderRadius: "0em"}}/>
			</div>);
	}
}