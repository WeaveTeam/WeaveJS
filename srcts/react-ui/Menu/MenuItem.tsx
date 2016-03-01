import * as ReactDOM from "react-dom";
import * as React from "react";
import HBox from "../HBox";
import MiscUtils from "../../utils/MiscUtils";
import Menu from "./Menu";
import {DividerProps} from "./Divider";

export interface MenuItemProps extends React.Props<MenuItem>
{
	label?:string|JSX.Element;
	leftIcon?:React.ReactElement<any>;
	rightIcon?:React.ReactElement<any>;
	secondaryLabel?:string;
	click?:Function;
	menu?:MenuItemProps[]
}

export interface MenuItemState
{
	hovered?:boolean;
	mouseIsDown?:boolean;
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
	
	onMouseEnter()
	{
		this.setState({
			hovered:true
		});
	}

	onMouseLeave(event:React.MouseEvent)
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
	
	click()
	{
		if(!this.props.menu && this.props.click)
			this.props.click()
	}
	
	onMouseDown()
	{
		this.setState({
			mouseIsDown: true
		});		
	}
	
	render():JSX.Element
	{
		
		var menuItemStyle:React.CSSProperties = {
			paddingLeft: 20,
			paddingRight: 20,
			backgroundColor: this.state.hovered ? MiscUtils.rgba(153, 214, 255, 0.4) : MiscUtils.rgba(255, 255, 255, 1),
			justifyContent: "space-between"
		};
		
			// if(this.state.mouseIsDown)
			//menuItemStyle.backgroundColor = "#80CCFF";
			
		var labelStyle:React.CSSProperties = {
			whiteSpace: "nowrap",
			paddingLeft: this.props.leftIcon ? 5 : 0,
			paddingRight: this.props.rightIcon ? 5 : 0,
		};

		var secondaryLabelStyle = {
		};
		
		return (
			<HBox style={menuItemStyle} onClick={this.click.bind(this)} onMouseEnter={this.onMouseEnter.bind(this)} onMouseLeave={this.onMouseLeave.bind(this)}>
				<HBox>
					<div>{this.props.leftIcon}</div>
					<HBox style={labelStyle}>{this.props.label}</HBox>
					<div>{this.props.rightIcon}</div>
				</HBox>
				<span style={secondaryLabelStyle}>{this.props.secondaryLabel}</span>
				{
					this.props.menu && this.state.hovered ? 
					<Menu xPos={this.element.clientWidth} yPos={this.element.offsetTop} menu={this.props.menu}/>
					: null
				}
			</HBox>
		);
	}
}
