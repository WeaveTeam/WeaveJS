import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {MenuItemProps} from "../react-ui/Menu";
import InteractiveTour from "../react-ui/InteractiveTour";
import Menu from "../react-ui/Menu"
import classNames from "../modules/classnames";
import ReactUtils from "../utils/ReactUtils";
import SmartComponent from "../ui/SmartComponent";
import Popup from "../ui/Popup";

export interface DropdownProps extends React.HTMLProps<Dropdown>
{
	direction?:string;// upward
	menu?:MenuItemProps[];
	openOnMouseEnter?:boolean;
	closeOnMouseLeave?:boolean;
	onClose?:()=> void;
}

export interface DropdownState
{
}

export default class Dropdown extends SmartComponent<DropdownProps, DropdownState> {

	static defaultProps:DropdownProps = {
		open: false,
		openOnMouseEnter:false,
		closeOnMouseLeave:false
	};

	menu:Popup;

	constructor(props:DropdownProps) {
		super(props);

		this.state = {
			toggleMenu:this.props.open === undefined ? false : this.props.open,
			menuMounted:false
		};

	}

	private element:Element;

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
	}

	onMouseLeaveListener=(event:React.MouseEvent)=>
	{
		this.hideMenu();
		this.props.onMouseLeave  && this.props.onMouseLeave(event);
	};

	onMouseEnterListener=(event:React.MouseEvent)=>
	{
		this.showMenu();
		this.props.onMouseEnter  && this.props.onMouseEnter(event);
	};

	menuClickListener=(event:React.MouseEvent)=>
	{
		if(InteractiveTour.enable)
		{
			let menuID:string = typeof this.props.children == "string" ? this.props.children as string  + " menu": "menu";
			InteractiveTour.targetComponentOnClick(menuID)
		}
	};

	onClick=(event:React.MouseEvent)=>
	{
		this.toggleMenu();
	};

	hideMenu=()=>
	{
		Popup.close(this.menu);
		this.menu = null;
	}

	showMenu=()=>
	{
		var menuStyle:React.CSSProperties = {};
		var menuRect = this.element.getBoundingClientRect();
		if(this.props.direction == "upward")
		{
			menuStyle.top = - menuRect.height;
		}
		else //automate based on its position on screen
		{
			// set updward if the height overflows out of screen height
		}
		if(menuRect.top + menuRect.height >= ReactUtils.getWindow(this).innerHeight )
		{
			menuStyle.top = - menuRect.height;
		}
		// set leftward if the width overflows out of screen width
		if(menuRect.left + menuRect.width >= ReactUtils.getWindow(this).innerWidth )
		{
			menuStyle.left = - menuRect.width;
		}
		this.menu = Popup.open(this, <Menu menu={this.props.menu} style={menuStyle} ref={this.getMenuRef} onClick={this.menuClickListener}/>, true, () => this.menu = null);
	}

	toggleMenu=()=>
	{
		if(this.menu)
		{
			this.hideMenu();
		}
		else
		{
			this.showMenu();
		}
	};

	// add mouseDown listener only when menu is opened
	getMenuRef=(ele:any)=>
	{
		if(InteractiveTour.isEnabled())
		{
			let menuID:string = typeof this.props.children == "string" ? this.props.children as string  + " menu": "menu";
			let func:any = InteractiveTour.getComponentRefCallback(menuID);
			func(ele);
		}
	};

	render() {
		return (
			<div
				{...this.props as any}
				onClick={this.showMenu}
			    onMouseEnter={this.props.openOnMouseEnter ? this.onMouseEnterListener: null}
			    onMouseLeave={this.props.closeOnMouseLeave ? this.onMouseLeaveListener : null}
			    className={classNames(
							{
								"ui dropdown": true,
							},
							this.props.type,
							this.props.className
						)}
			>
				{this.props.children}
			</div>
		);
	}
}