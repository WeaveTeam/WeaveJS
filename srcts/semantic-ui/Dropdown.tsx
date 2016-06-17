import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {MenuItemProps} from "../react-ui/Menu";
import Menu from "../react-ui/Menu"
import classNames from "../modules/classnames";
import ReactUtils from "../utils/ReactUtils";
import SmartComponent from "../ui/SmartComponent";

export interface DropdownProps extends React.HTMLProps<Dropdown>
{
	direction?:string;// upward
	menu?:MenuItemProps[];
	open?:boolean;
	openOnMouseEnter?:boolean;
	closeOnMouseLeave?:boolean;
	onClose?:()=> void;
}

export interface DropdownState
{
	toggleMenu?:boolean;
	menuMounted?:boolean; // set after menu is mounted on screen
}

export default class Dropdown extends SmartComponent<DropdownProps, DropdownState> {


	static defaultProps:DropdownProps = {
		open: false,
		openOnMouseEnter:false,
		closeOnMouseLeave:false
	};

	constructor(props:DropdownProps) {
		super(props);

		this.state = {
			toggleMenu:this.props.open === undefined ? false : this.props.open
		};

	}

	componentWillReceiveProps(nextProps:DropdownProps)
	{
		if (this.props.open !== nextProps.open && this.state.toggleMenu != nextProps.open)
		{
			this.setState({
				toggleMenu:nextProps.open
			});
		}
	}

	// saved to add docuemnt mousedown listener
	private element:Element;

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
	}

	onDocumentMouseDown=(event:MouseEvent)=>
	{
		// if mousedown event happens on it or its child ,ignore
		if(this.element.contains(event.target as HTMLElement))
		{
			return;
		}

		// close the menu
		if(this.state.toggleMenu) {
			this.setState({
				toggleMenu: false
			});
		}
		this.props.onClose && this.props.onClose();

	};

	onMouseLeaveListener=(event:React.MouseEvent)=>
	{
		this.setState({
			toggleMenu:false
		});
		this.props.onMouseLeave  && this.props.onMouseLeave(event);
	};

	onMouseEnterListener=(event:React.MouseEvent)=>
	{
		this.setState({
			toggleMenu:true
		});
		this.props.onMouseEnter  && this.props.onMouseEnter(event);
	};

	clickListener=(event:React.MouseEvent)=>
	{
		// toggle menu mounting for click event
		this.setState({
			toggleMenu:!this.state.toggleMenu
		});

		this.props.onClick && this.props.onClick(event);
	};

	private menuRef:any = null;

	// add mouseDown listener only when menu is opened
	getMenuRef=(ele:any)=>
	{
		this.menuRef = ele;
		if(this.menuRef)
		{
			ReactUtils.getDocument(this).addEventListener("mousedown", this.onDocumentMouseDown);
			this.setState({
				menuMounted:true
			});
		}
		else
		{
			ReactUtils.getDocument(this).removeEventListener("mousedown", this.onDocumentMouseDown);
			this.setState({
				menuMounted:false
			});
		}

	};

	render() {
		var dropdownClass = classNames(
			{
				"ui dropdown": true,
			},
			this.props.type,
			this.props.className
		);

		let menuUI:JSX.Element = null;

		if(this.state.toggleMenu)
		{
			let menuStyle:React.CSSProperties={};

			if(this.state.menuMounted) // this ensures menu component is mounted
			{
				let menuDOMNode = ReactDOM.findDOMNode(this.menuRef as any);
				let menuRect:ClientRect = menuDOMNode.getBoundingClientRect();

				if(this.props.direction == "upward")
				{
					menuStyle.top = - menuRect.height;
				}
				else //automate based on its position on screen
				{
					// set updward if the height overflows out of screen height
					if(menuRect.top + menuRect.height >= window.innerHeight )
					{
						menuStyle.top = - menuRect.height;
					}
				}
			}
			menuUI = <Menu ref={this.getMenuRef} menu={this.props.menu} style={menuStyle}/>;
		}

		let styleObject:React.CSSProperties = _.merge({},this.props.style,{
			position:"relative" // important to be relative so that menu is positioned based on this element
		});

		return (
			<div onClick={this.clickListener}
			     onMouseEnter={this.props.openOnMouseEnter ? this.onMouseEnterListener: null}
			     onMouseLeave={this.props.closeOnMouseLeave ? this.onMouseLeaveListener : null}
			     className={dropdownClass}
			     style={styleObject}>
				{this.props.children}
				{menuUI}
			</div>
		);
	}
	

}