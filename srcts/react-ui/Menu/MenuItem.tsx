import * as ReactDOM from "react-dom";
import * as React from "react";
import classNames from "../../modules/classnames";
import HBox from "../HBox";
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
	
	render():JSX.Element
	{
		
		var labelClass = classNames({
			'weave-menuitem-label': true,
			'weave-menuitem-label-padding-left': !!this.props.leftIcon,
			'weave-menuitem-label-padding-right': !!this.props.rightIcon
		})

		return (
			<HBox className="weave-menuitem" onClick={this.click.bind(this)} onMouseEnter={this.onMouseEnter.bind(this)} onMouseLeave={this.onMouseLeave.bind(this)}>
				<HBox>
					<div>{this.props.leftIcon}</div>
					<HBox className={labelClass}>{this.props.label}</HBox>
					<div>{this.props.rightIcon}</div>
				</HBox>
				<span>{this.props.secondaryLabel}</span>
				{
					this.props.menu && this.state.hovered ? 
					<Menu xPos={this.element.clientWidth} yPos={this.element.offsetTop} menu={this.props.menu}/>
					: null
				}
			</HBox>
		);
	}
}
