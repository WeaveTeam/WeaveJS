import * as React from "react";
import MenuBar from "./react-ui/MenuBar";
import SessionHistorySlider from "./editors/SessionHistorySlider";
import WeaveMenus from "./menus/WeaveMenus";
import LinkableBoolean = weavejs.core.LinkableBoolean;
import DynamicComponent from "./ui/DynamicComponent";
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import {forceUpdateWatcher} from "./utils/WeaveReactUtils";
import {getWeaveProperties} from "./ui/WeaveProperties";

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
