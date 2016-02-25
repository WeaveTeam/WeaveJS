import * as ReactDOM from "react-dom";
import * as React from "react";
import HBox from "../HBox";
import MiscUtils from "../../utils/MiscUtils";
import Menu from "./Menu";
import {DividerProps} from "./Divider";

export interface MenuItemProps extends React.Props<MenuItem>
{
	primaryText?:string;
	leftIcon?:React.ReactElement<any>;
	rightIcon?:React.ReactElement<any>;
	secondaryText?:string;
	onClick?:Function;
	menuItems?:React.ReactElement<MenuItemProps>|React.ReactElement<DividerProps>
}

export interface MenuItemState
{
	hovered?:boolean;
	extendedMenuPos?: {xPos: number, yPos: number}
}

export default class MenuItem extends React.Component<MenuItemProps, MenuItemState>
{
	element:HTMLElement;
	hoverOnChild:boolean;
	subMenu:Menu;

	constructor(props:MenuItemProps)
	{
		super(props);

		this.state = {
			hovered: false,
			extendedMenuPos: {
				xPos: 0,
				yPos: 0
			}
		}
	}
	
	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this) as HTMLElement;
	}
	
	onMouseOver()
	{
		this.setState({
			hovered:true
		});
	}

	onMouseOut(event:React.MouseEvent)
	{
		var elt = event.relatedTarget;

		while( elt != null)
		{
			if(elt == this.element) {
				return;
			}
			elt = (elt as HTMLElement).parentNode;
		}

		this.setState({
			hovered:false
		});

	}
	
	onClick()
	{
		if(!this.props.menuItems && this.props.onClick)
			this.props.onClick()
	}
	
	render():JSX.Element
	{
		
		var menuItemStyle:React.CSSProperties = {
			paddingLeft: 20,
			paddingRight: 20,
			backgroundColor: this.state.hovered ? MiscUtils.rgba(153, 214, 255, 0.4) : MiscUtils.rgba(255, 255, 255, 1),
			justifyContent: "space-between"
		};
		
		var primaryTextStyle:React.CSSProperties = {
			paddingLeft: this.props.leftIcon ? 5 : 0,
			paddingRight: this.props.rightIcon ? 5 : 0,
		}

		var secondaryTextStyle = {
		}

		return (
			<HBox style={menuItemStyle} onClick={this.onClick.bind(this)} onMouseOver={this.onMouseOver.bind(this)} onMouseOut={this.onMouseOut.bind(this)}>
				<HBox>
					<div>{this.props.leftIcon}</div>
					<span style={primaryTextStyle}>{this.props.primaryText}</span>
					<div>{this.props.rightIcon}</div>
				</HBox>
				<span style={secondaryTextStyle}>{this.props.secondaryText}</span>
				{
					this.props.menuItems && this.state.hovered ? 
					<Menu xPos={this.element.clientWidth} yPos={this.element.offsetTop} width="100%">{this.props.menuItems}</Menu> 
					: null
				}
			</HBox>
		);
	}
}
