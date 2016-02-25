import * as ReactDOM from "react-dom";
import * as React from "react";
import HBox from "../HBox";
import MiscUtils from "../../utils/MiscUtils";
import Menu from "./Menu";
import {DividerProps} from "./Divider";

export interface MenuItemProps extends React.Props<MenuItem>
{
	label?:string;
	leftIcon?:React.ReactElement<any>;
	rightIcon?:React.ReactElement<any>;
	secondaryLabel?:string;
	click?:Function;
	childItems?:React.ReactElement<MenuItemProps>|React.ReactElement<DividerProps>
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
		var elt = event.currentTarget;
		var subMenuElement = ReactDOM.findDOMNode(this.subMenu);
		console.log(subMenuElement);
		if( elt == subMenuElement)
		{
			console.log("here");
			return;
		}

		this.setState({
			hovered:false
		});

	}
	
	click()
	{
		if(!this.props.childItems && this.props.click)
			this.props.click()
	}
	
	render():JSX.Element
	{
		
		var menuItemStyle:React.CSSProperties = {
			paddingLeft: 20,
			paddingRight: 20,
			backgroundColor: this.state.hovered ? MiscUtils.rgba(153, 214, 255, 0.4) : MiscUtils.rgba(255, 255, 255, 1),
			justifyContent: "space-between"
		};
		
		var labelStyle:React.CSSProperties = {
			paddingLeft: this.props.leftIcon ? 5 : 0,
			paddingRight: this.props.rightIcon ? 5 : 0,
		}

		var secondaryLabelStyle = {
		}

		return (
			<HBox style={menuItemStyle} onClick={this.click.bind(this)} onMouseOver={this.onMouseOver.bind(this)} onMouseOut={this.onMouseOut.bind(this)}>
				<HBox>
					<div>{this.props.leftIcon}</div>
					<span style={labelStyle}>{this.props.label}</span>
					<div>{this.props.rightIcon}</div>
				</HBox>
				<span style={secondaryLabelStyle}>{this.props.secondaryLabel}</span>
				{
					this.props.childItems && this.state.hovered ? 
					<Menu xPos={this.element.clientWidth} ref={(c:Menu) => { console.log(c); this.subMenu = c}} yPos={this.element.offsetTop} width="100%">{this.props.childItems}</Menu> 
					: null
				}
			</HBox>
		);
	}
}
