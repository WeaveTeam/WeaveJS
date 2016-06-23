import * as ReactDOM from "react-dom";
import * as React from "react";
import * as _ from "lodash";
import {HBox, VBox} from "./FlexBox";
import classNames from "../modules/classnames";
import ReactUtils from "../utils/ReactUtils";

export interface MenuItemProps
{
	label?:React.ReactChild;
	leftIcon?:React.ReactElement<any>;
	rightIcon?:React.ReactElement<any>;
	secondaryLabel?:string;
	click?:Function;
	enabled?:boolean;
	shown?:boolean;
	menu?:MenuItemProps[];
	itemStyleOverride?:React.CSSProperties;
}

export interface MenuProps extends React.HTMLProps<Menu>
{
	menu:MenuItemProps[];
	opener: React.ReactInstance;
	upward?:boolean; // change to direction if more directions are needed
	header?:React.ReactChild;
}

export interface MenuState
{
	hovered: number;
}

const REACT_COMPONENT = "reactComponent";
const GET_MENU_ITEMS = "getMenuItems";
const SEPARATOR = {};

export interface IGetMenuItems
{
	getMenuItems():MenuItemProps[];
}

const renderDivider = function(index:number):JSX.Element
{
	return (
		<div key={index} className="divider weave-menu-divider"/>
	);
};

export default class Menu extends React.Component<MenuProps, MenuState>
{
	element:HTMLElement;
	opener:HTMLElement;
	window:Window;

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
		while (element != null)
		{
			let elt = element as any;
			if (elt[REACT_COMPONENT] && elt[REACT_COMPONENT][GET_MENU_ITEMS])
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
		// we could get these elements in the ref function
		// but it's safer here
		this.element = ReactDOM.findDOMNode(this) as HTMLElement;
		this.opener = ReactDOM.findDOMNode(this.props.opener) as HTMLElement;
		this.window = ReactUtils.getWindow(this);
		this.forceUpdate();
	}

	renderMenuItems(menu:MenuItemProps[])
	{
		var filteredMenu:MenuItemProps[] = [];

		// remove hidden menu elements
		filteredMenu = menu.filter(menuItem => menuItem.hasOwnProperty('shown') ? !!menuItem.shown : true);

		// remove redundant separators
		filteredMenu = filteredMenu.filter((menuItem, index, array) => {
			var item = menuItem;
			var next_item = array[index + 1];
			return !(_.isEqual(item, SEPARATOR) && _.isEqual(next_item, SEPARATOR));
		});

		// remove the first item if it is a separator
		if(_.isEqual(filteredMenu[0], SEPARATOR))
			filteredMenu.shift();

		// remove the last item if it is a separtor
		if(_.isEqual(filteredMenu[filteredMenu.length - 1], SEPARATOR))
			filteredMenu.pop();

		return filteredMenu.map((menuItem, index) => {
			if(_.isEqual(menuItem, SEPARATOR))
				return renderDivider(index);
			else
				return this.renderMenuItem(index, menuItem)
		});
	}

	renderMenuItem(index:number, props:MenuItemProps):JSX.Element
	{
		var enabled = props.hasOwnProperty('enabled') ? !!props.enabled : true; // default true

		var labelClass = classNames({
			'weave-menuitem-label': true,
			'weave-menuitem-label-padding-left': !!props.leftIcon,
			'weave-menuitem-label-padding-right': !!props.rightIcon
		});

		var menuItemClass = classNames({
			'item': true,
			'disabled': !enabled,
			'weave-menuitem': true
		});

		var click = () => {
			if (!props.menu && props.click && enabled)
				props.click()
		};

		return (
			<div className={menuItemClass}
				onClick={click}
				key={index}
			     style={props.itemStyleOverride}
			>
				<HBox>
					<div>{props.leftIcon}</div>
					<HBox className={labelClass}>{props.label}</HBox>
					<div>{props.rightIcon}</div>
				</HBox>
				<span>{props.secondaryLabel}</span>
				{
					props.menu
					?	<Menu opener={this} menu={props.menu}/>
					:	null
				}
			</div>
		);
	}

	render():JSX.Element
	{
		var menuStyle:React.CSSProperties = _.clone(this.props.style) || {};
		menuStyle.position = "absolute";
		if(this.opener)
		{
			// this logic should be generic to the menu.
			var parentRect = this.opener.getBoundingClientRect();

			// place the menu under the opener
			menuStyle.top = parentRect.bottom;
			menuStyle.left = parentRect.left;

			if(this.props.upward)
				menuStyle.top = -parentRect.height;

			else
			{
				if(parentRect.top + parentRect.height >= this.window.innerHeight )
					menuStyle.top = - parentRect.height;

				// set leftward if the width overflows out of screen width
				if(parentRect.left + parentRect.width >= this.window.innerWidth )
				{
					menuStyle.left = - parentRect.width;
				}
			}
		}
		if (this.element && weavejs.WeaveAPI.Locale.reverseLayout)
		{
			var menuRect = this.element.getBoundingClientRect();
			menuStyle.left = 0 - this.element.clientWidth;
			if(menuRect.left - menuStyle.left < 0)
				menuStyle.left = 0;
		}
		return (
			<div className="menu" {...this.props as any} style={menuStyle}>
				{this.props.header ? (<div className="header">{this.props.header}</div>):null}
				{this.renderMenuItems(this.props.menu)}
			</div>
		);
	}
}
