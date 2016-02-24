import * as React from "react";
import VBox from "../VBox";
import * as Prefixer from "react-vendor-prefix";
import MenuItem from "./MenuItem";
import Divider from "./Divider";

export interface MenuProps extends React.Props<Menu>
{
	xPos: number;
	yPos: number;
	width?: string;
}

export interface MenuState
{
	
}

export default class Menu extends React.Component<MenuProps, MenuState>
{
	constructor(props:MenuProps)
	{
		super(props);
	}
	
	onClick() {
		
	}
	
	render():JSX.Element
	{
		var menuStyle:React.CSSProperties = {
			position: "absolute",
			boxShadow: "rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px",
			borderRadius: 2,
			backgroundColor: "#FFFFFF",
			paddingTop: 5,
			paddingBottom: 5,
			top: this.props.yPos,
			left: this.props.xPos,
			userSelect: "none",
			cursor: "pointer",
			zIndex: 2147483647, // max z-index value
			width: this.props.width
		};
		
		menuStyle = Prefixer.prefix({style: menuStyle}).style as React.CSSProperties;
	
		return (
			<VBox style={menuStyle}>
				{
					this.props.children
				}
			</VBox>
		);
	}
}
