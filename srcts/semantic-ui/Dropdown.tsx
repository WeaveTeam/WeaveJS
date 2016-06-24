import * as React from "react";
import * as ReactDOM from "react-dom";
import Menu, {MenuItemProps} from "../react-ui/Menu";
import InteractiveTour from "../react-ui/InteractiveTour";
import classNames from "../modules/classnames";
import SmartComponent from "../ui/SmartComponent";
import Popup from "../ui/Popup";
import ReactUtils from "../utils/ReactUtils";
import values = d3.values;
import {KEYCODES} from "../utils/KeyboardUtils";

export interface DropdownProps extends React.HTMLProps<Dropdown>
{
	menuGetter?:() => MenuItemProps[];
	openOnMouseEnter?:boolean;
	closeOnMouseLeave?:boolean;
	onClose?:()=> void;
	onOpen?:()=> void;
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

	onMouseLeave=(event:React.MouseEvent)=>
	{
		if(this.props.closeOnMouseLeave)
			this.closeMenu();
		this.props.onMouseLeave  && this.props.onMouseLeave(event);
	};

	onMouseEnter=(event:React.MouseEvent)=>
	{
		if(this.props.openOnMouseEnter)
			this.openMenu();
		this.props.onMouseEnter  && this.props.onMouseEnter(event);
	};

	onMenuMouseUp=(event:React.MouseEvent)=>
	{
		if(InteractiveTour.enable)
		{
			let menuID:string = typeof this.props.children == "string" ? this.props.children as string  + " menu": "menu";
			InteractiveTour.targetComponentOnClick(menuID)
		}
		// close the menu once an item has been clicked
		this.closeMenu();
	};

	onClick=(event:React.MouseEvent)=>
	{
		this.toggleMenu();
		if(this.props.onClick)
			this.props.onClick(event);
	};

	onKeyUp=(event:React.KeyboardEvent)=>
	{
		if(event.keyCode == KEYCODES.SPACE)
		{
			this.toggleMenu();
			event.preventDefault();
		}
		if(this.props.onKeyUp)
			this.props.onKeyUp(event);
	}

	closeMenu=()=>
	{
		Popup.close(this.menu);
		this.menu = null;
		var document = ReactUtils.getDocument(this);
		document.removeEventListener("mousedown", this.onDocumentMouseDown);
		document.removeEventListener("keydown", this.onDocumentKeyDown);
		document.removeEventListener("keyup", this.onDocumentKeyUp);
		if(this.props.onClose) this.props.onClose();
	}

	onDocumentMouseDown=(event:MouseEvent)=>
	{
		// close the menu when you mousedown anywhere except the
		// dropdown item and the menu
		var menuElt = ReactDOM.findDOMNode(this.menu);
		var dropDownElt = ReactDOM.findDOMNode(this);
		var targetElt = event.target as HTMLElement;
		if (menuElt && menuElt.contains(targetElt) || dropDownElt.contains(targetElt))
			return;
		else
			this.closeMenu();
	}

	onDocumentKeyDown=(event:KeyboardEvent)=>
	{
		// close the menu if key down on space
		if(event.keyCode == KEYCODES.ESC)
			this.closeMenu();
	}

	onDocumentKeyUp=(event:KeyboardEvent)=>
	{
		// close the menu if key up on space
		if(event.keyCode == KEYCODES.SPACE)
			this.closeMenu();
	}

	openMenu=()=>
	{
		// var menuStyle:React.CSSProperties= {};
		// if(this.props.upward)
		// {
		// 	var rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
		// 	var menuStyle = {
		// 		top: rect.top + rect.height
		// 	}
		// }

		this.menu = Popup.open(
			this,
			<Menu
				opener={this}
				ref={this.getMenuRef}
				menu={this.props.menuGetter()}
				onMouseUp={this.onMenuMouseUp}
			/>
		);
		var document = ReactUtils.getDocument(this);
		document.addEventListener("mousedown", this.onDocumentMouseDown);
		document.addEventListener("keydown", this.onDocumentKeyDown);
		document.addEventListener("keyup", this.onDocumentKeyUp);
		if(this.props.onOpen) this.props.onOpen();
	}

	toggleMenu=()=>
	{
		if(this.menu)
			this.closeMenu();
		else
			this.openMenu();
	};

	getMenuRef=(ele:any)=>
	{
		if(InteractiveTour.enable)
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
				className={classNames("weave-dropdown", this.props.className)}
				tabIndex={0}
				role="button"
				onKeyUp={this.onKeyUp}
				onMouseDown={this.onClick}
			    onMouseEnter={this.onMouseEnter}
			    onMouseLeave={this.onMouseLeave}
			>
				{this.props.children}
			</div>
		);
	}
}