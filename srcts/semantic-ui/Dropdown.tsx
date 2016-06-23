import * as React from "react";
import * as ReactDOM from "react-dom";
import Menu, {MenuItemProps} from "../react-ui/Menu";
import InteractiveTour from "../react-ui/InteractiveTour";
import classNames from "../modules/classnames";
import SmartComponent from "../ui/SmartComponent";
import Popup from "../ui/Popup";
import ReactUtils from "../utils/ReactUtils";
import values = d3.values;

export interface DropdownProps extends React.HTMLProps<Dropdown>
{
	menu?:MenuItemProps[];
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

	private element:Element;

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

	menuClickListener=(event:React.MouseEvent)=>
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

	closeMenu=()=>
	{
		Popup.close(this.menu);
		this.menu = null;
		ReactUtils.getDocument(this).removeEventListener("mousedown", this.onDocumentMouseDown);
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
				menu={this.props.menu}
				onClick={this.menuClickListener}
			/>
		);
		ReactUtils.getDocument(this).addEventListener("mousedown", this.onDocumentMouseDown)
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
				ref={(e:HTMLDivElement) => this.element = e}
				{...this.props as any}
				onClick={this.onClick}
			    onMouseEnter={this.onMouseEnter}
			    onMouseLeave={this.onMouseLeave}
			>
				{this.props.children}
			</div>
		);
	}
}