import * as React from "react";
import * as weavejs from "weavejs";
import {Weave} from "weavejs";
import MenuBar = weavejs.ui.menu.MenuBar;
import WeaveProperties from "../app/WeaveProperties";
import WeaveMenus from "./WeaveMenus";
import DynamicComponent = weavejs.ui.DynamicComponent;
import SessionHistorySlider from "../editor/SessionHistorySlider";

export interface WeaveMenuBarProps extends React.HTMLProps<WeaveMenuBar>
{
	style:React.CSSProperties;
	menus:WeaveMenus;
	weave:Weave;
}

export interface WeaveMenuBarState
{

}

export default class WeaveMenuBar extends React.Component<WeaveMenuBarProps, WeaveMenuBarState>
{
	constructor(props:WeaveMenuBarProps)
	{
		super(props);
	}

	render():JSX.Element
	{
		var enableSessionHistorySlider = WeaveProperties.getProperties(this.props.weave).showSessionHistorySlider;
		var enableSessionHistoryControls = WeaveProperties.getProperties(this.props.weave).enableSessionHistoryControls;

		return (
			<MenuBar
				style={this.props.style}
				config={this.props.menus.getMenuList()}
			>
				<DynamicComponent dependencies={[enableSessionHistoryControls, enableSessionHistorySlider]} render={() => {
					return (
						enableSessionHistoryControls.value
						? <SessionHistorySlider key="historySlider" stateLog={this.props.weave.history} showSlider={enableSessionHistorySlider.value}/>
						: null
					);
				}}/>
			</MenuBar>
		);
	}
}
