import * as React from "react";
import MenuBar from "./react-ui/MenuBar";
import SessionHistorySlider from "./editors/SessionHistorySlider";
import WeaveMenus from "./menus/WeaveMenus";

export interface WeaveMenuBarProps extends React.HTMLProps<WeaveMenuBar>
{
	style:React.CSSProperties,
	weave:Weave,
	menus:WeaveMenus;
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
		return (
			<MenuBar
				style={this.props.style}
				config={this.props.menus.getMenuList()}
				children={
					[<SessionHistorySlider key="historySlider" stateLog={this.props.weave.history}/>]
				}
			/>
		);
	}
}
