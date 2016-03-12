import * as ReactDOM from "react-dom";
import * as React from "react";
import * as _ from "lodash";
import {HBox, VBox} from "./FlexBox";
import classNames from "../modules/classnames";

export interface MenuItemProps
{
	label?:string /*|JSX.Element*/;
	leftIcon?:React.ReactElement<any>;
	rightIcon?:React.ReactElement<any>;
	secondaryLabel?:string;
	click?:Function;
	enabled?:boolean;
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

const REACT_COMPONENT = "reactComponent";
const GET_MENU_ITEMS = "getMenuItems";

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
	
	static registerMenuSource(component:React.Component<any, any>)
	{
		(ReactDOM.findDOMNode(component) as any)[REACT_COMPONENT] = component;
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
		if(this.element.style.visibility == "hidden")
			this.forceUpdate();
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
		var enabled = props.enabled != false; // default undefined -> true
		
		var labelClass = classNames({
			'weave-menuitem-label': true,
			'weave-menuitem-label-padding-left': !!props.leftIcon,
			'weave-menuitem-label-padding-right': !!props.rightIcon
		});

		var menuItemClass = classNames({
			'weave-menuitem': true,
			'weave-menuitem-disabled': !enabled
		});
		
		var click = () => {
			if(!props.menu && props.click && enabled)
				props.click()
		};

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

		var menuStyle:React.CSSProperties = _.merge({
			position: "absolute",
			top: this.props.yPos,
			left: this.props.xPos,
			visibility: "hidden"
		}, menuStyle);

		if(this.element) {
			menuStyle.visibility = null;
			var bottomOverflow:number = this.props.yPos + this.element.clientHeight - window.innerHeight;
			if (bottomOverflow > 0) {
				menuStyle.top = menuStyle.top - this.element.clientHeight;
			}

			if (weavejs.WeaveAPI.Locale.reverseLayout) {
				menuStyle.left = menuStyle.left - this.element.clientWidth;
				if (menuStyle.left < 0) {
					menuStyle.left = this.props.xPos;
				}
			}
			else {
				var rightOverflow:number = this.props.xPos + this.element.clientWidth - window.innerWidth;
				if (rightOverflow > 0) {
					menuStyle.left = menuStyle.left - this.element.clientWidth;
				}
			}
		}

		return (
			<VBox className="weave-menu" style={_.merge(menuStyle, this.props.style)} onMouseEnter={() => this.setState({hovered: -1})} {...otherProps}>
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
