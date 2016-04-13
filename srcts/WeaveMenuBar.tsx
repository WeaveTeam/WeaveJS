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
	showSystemMenu?:boolean;
	showFileMenu?:boolean;
	showDataMenu?:boolean;
	showToolsMenu?:boolean;
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

	defaultState:WeaveMenuBarState = {
		showSystemMenu:false,
		showFileMenu:false,
		showDataMenu:false,
		showToolsMenu:false
	};

	constructor(props:WeaveMenuBarProps)
	{
		super(props);
		this.weave = props.weave;
		this.createObject = props.createObject;
		this.state = _.cloneDeep(this.defaultState);
	}
	
	componentDidUpdate() {
		this.toggleDropdown('system-menu', this.state.showSystemMenu ?'show':'hide');
		this.toggleDropdown('file-menu', this.state.showFileMenu ?'show':'hide');
		this.toggleDropdown('data-menu', this.state.showDataMenu ?'show':'hide');
		this.toggleDropdown('tools-menu', this.state.showToolsMenu ?'show':'hide')
	}

	componentDidMount() {
		this.element = ReactDOM.findDOMNode(this);
		($(this.element).find('.ui.dropdown') as any)
			.dropdown({
				duration: 0,
				onHide: () => {
					this.setState({
						showSystemMenu:false,
						showFileMenu: false,
						showDataMenu: false,
						showToolsMenu: false
					})
				}
			});
	}

	toggleSystemMenu = () => {
		this.setState({
			showSystemMenu:!this.state.showSystemMenu,
		});
	};

	toggleFileMenu = () => {
		this.setState({
			showFileMenu: !this.state.showFileMenu,
		});
	};

	toggleDataMenu = () => {
		this.setState({
			showDataMenu: !this.state.showDataMenu,
		});
	};

	toggleToolsMenu = () => {
		this.setState({
			showToolsMenu: !this.state.showToolsMenu
		});
	};

	toggleDropdown(className:string,action:string) {
		let selector = ($(this.element).find('.ui.dropdown.'+className) as any);
		if (className !== 'file-menu')
			selector.dropdown({
				duration: 0,
				onHide: () => {
					this.setState({
						showSystemMenu:false,
						showFileMenu: false,
						showDataMenu: false,
						showToolsMenu: false
					})
				}
			});
		selector.dropdown(action);
	}


	render():JSX.Element
	{
		return (
			<div className="ui small menu" style={_.merge(this.props.style||{}, {fontSize: "0.8em", margin: "0em", borderRadius: "0em"})}>
				<div className="ui dropdown header item system-menu" style={{borderRadius: 0, padding: "0 5 0 5"}} onClick={this.toggleSystemMenu}>
					Weave
					{this.state.showSystemMenu ?
						<SystemMenu
							ref={(c:SystemMenu) => this.systemMenu = c}
							weave={this.weave}
						/>:null
					}
				</div>
				<div className="ui dropdown item file-menu" onClick={this.toggleFileMenu}>
					File
						<FileMenu
							ref={(c:FileMenu) => this.fileMenu = c}
							weave={this.weave}
							createObject={this.createObject}
						/>
				</div>
				<div className="ui dropdown item data-menu" onClick={this.toggleDataMenu}>
					Data
					{this.state.showDataMenu ?
						<DataMenu
							ref={(c:DataMenu) => this.dataMenu = c}
							weave={this.weave}
							createObject={this.createObject}
						/>:null
					}
				</div>
				<div className="ui dropdown item tools-menu" onClick={this.toggleToolsMenu}>
					Tools
					{this.state.showToolsMenu ?
						<ToolsMenu
							ref={(c:ToolsMenu) => this.toolsMenu = c}
							weave={this.weave}
							createObject={this.createObject}
						/>:null
					}
				</div>
				<SessionHistorySlider stateLog={this.props.weave.history} style={{borderRadius: "0em"}}/>
			</div>);
	}
}