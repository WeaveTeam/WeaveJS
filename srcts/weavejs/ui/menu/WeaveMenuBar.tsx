import * as React from "react";
import MenuBar from "./MenuBar";
import SessionHistorySlider from "../../editor/SessionHistorySlider";
import WeaveMenus from "../../menu/WeaveMenus";
import DynamicComponent from "../DynamicComponent";
import {getWeaveProperties} from "../../app/WeaveProperties";
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableWatcher = weavejs.core.LinkableWatcher;

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
		var enableSessionHistorySlider = getWeaveProperties(this.props.weave).showSessionHistorySlider;
		var enableSessionHistoryControls = getWeaveProperties(this.props.weave).enableSessionHistoryControls;

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
