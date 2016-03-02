import * as ReactDOM from "react-dom";
import * as React from "react";
import * as _ from "lodash";
import HBox from "./HBox";
import VBox from "./VBox";
import MiscUtils from "../utils/MiscUtils";
import classNames from "../modules/classnames";

export interface MenuItemProps
{
	label?:string /*|JSX.Element*/;
	leftIcon?:React.ReactElement<any>;
	rightIcon?:React.ReactElement<any>;
	secondaryLabel?:string;
	click?:Function;
	disabled?:boolean;
	menu?:MenuItemProps[]
}

export interface MenuProps extends React.HTMLProps<Menu>
{
	xPos: number;
	yPos: number;
	menu:MenuItemProps[]
}

export interface MenuState
{
	hovered: number;
}

export const REACT_COMPONENT = "reactComponent";
export const GET_MENU_ITEMS = "getMenuItems";

export interface IGetMenuItems
{
	getMenuItems():MenuItemProps[];
}

const renderDivider = function(index:number):JSX.Element
{
	return (
		<hr key={index} className="weave-menu-divider"/>
	);
}

export default class Menu extends React.Component<MenuProps, MenuState>
{
	element:HTMLElement;

	constructor(props:MenuProps)
	{
		super(props);
		this.state = {
			hovered: -1,
		};
	}	
	
	static getMenuItems(element:HTMLElement):MenuItemProps[]
	{
		//var elt = element as any;
		while(element != null)
		{
			let elt = element as any;
			if(elt[REACT_COMPONENT] && elt[REACT_COMPONENT][GET_MENU_ITEMS])
			{
				return elt[REACT_COMPONENT][GET_MENU_ITEMS]() as MenuItemProps[];
			}
			else
			{
				element = element.parentElement;
			}
		}
		return [];
	}
	
	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this) as HTMLElement;
	}

	onMouseEnter(index:number)
	{
		this.setState({
			hovered: index
		});
	}

	onMouseLeave(index:number, event:React.MouseEvent)
	{
		// var elt = event.relatedTarget as Node;
		// 
		// if(elt as any == window)
		// 	return;
		// 
		// if(this.element.contains(elt))
		// 	return;
		// 
		// this.setState({
		// 	hovered: -1
		// })
	}
	
	renderMenuItem(index:number, props:MenuItemProps):JSX.Element
	{
		var labelClass = classNames({
			'weave-menuitem-label': true,
			'weave-menuitem-label-padding-left': !!props.leftIcon,
			'weave-menuitem-label-padding-right': !!props.rightIcon
		});

		var menuItemClass = classNames({
			'weave-menuitem': true,
			'weave-menuitem-disabled': props.disabled
		});
		
		var click = () => {
			if(!props.menu && props.click && !props.disabled)
				props.click()
		}

		return (
			<HBox key={index} className={menuItemClass} onClick={click} onMouseEnter={this.onMouseEnter.bind(this, index)} onMouseLeave={this.onMouseLeave.bind(this, index)}>
				<HBox>
					<div>{props.leftIcon}</div>
					<HBox className={labelClass}>{props.label}</HBox>
					<div>{props.rightIcon}</div>
				</HBox>
				<span>{props.secondaryLabel}</span>
				{
					props.menu && this.state.hovered == index && this.element ?
					<Menu xPos={this.element.clientWidth} yPos={this.element.offsetTop} menu={props.menu}/>
					: null
				}
			</HBox>
		);
	}
	
	render():JSX.Element 
	{
		var menuStyle = this.props.style;
        var otherProps:any = {};

        for (var key in this.props)
        {
            if (key !== "style")
            {
                otherProps[key] = (this.props as any)[key];
            }
        }
		
		var menuStyle:React.CSSProperties = MiscUtils.merge({
			position: "absolute",
			top: this.props.yPos,
			left: this.props.xPos
		}, menuStyle);
	
		return (
			<VBox className="weave-menu" style={MiscUtils.merge(menuStyle, this.props.style)} onMouseEnter={() => this.setState({hovered: -1})} {...otherProps}>
				{
					this.props.menu.map((menuItem, index) => {
							if(_.isEqual(menuItem, {}))
								return renderDivider(index);
							else
							{
								return this.renderMenuItem(index, menuItem);
							}
					})
				}
			</VBox>
		)
	}
}
