import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {HBox} from "./FlexBox";
import InteractiveTour from "./InteractiveTour";
import {MenuItemProps} from "./Menu";
import Dropdown from "../semantic-ui/Dropdown";
import classNames from "../modules/classnames";
import ReactUtils from "../utils/ReactUtils";
import {KEYCODES} from "../utils/KeyboardUtils";

export interface MenuBarItemProps
{
	label: string;
	menu: MenuItemProps[];
	bold?: boolean;
}

export interface MenuBarProps extends React.Props<MenuBar>
{
	config?:MenuBarItemProps[];
	style?:React.CSSProperties;
}

export interface MenuBarState
{
	activeIndex?:number;
	clickedIndex?:number;
}

export default class MenuBar extends React.Component<MenuBarProps, MenuBarState>
{
	element:Element;
	dropdownItems:Dropdown[];
	activeDropdown:Dropdown;

	constructor(props:MenuBarProps)
	{
		super(props);
		this.dropdownItems = [];
		this.state = {
			activeIndex: -1,
			clickedIndex: -1
		}
	}

	onMouseEnter(index:number)
	{
		if (this.activeDropdown)
		{
			var dropdown = ReactDOM.findDOMNode(this.dropdownItems[index]) as HTMLElement;
			if (dropdown && dropdown.focus)
				dropdown.focus();
		}
		else
		{
			this.setState({activeIndex: index});
		}

	}

	onMouseLeave=(index:number)=>
	{
		if (this.activeDropdown)
		{
			var dropdown = ReactDOM.findDOMNode(this.dropdownItems[index]) as HTMLElement;
			if (dropdown && dropdown.blur)
				dropdown.blur();
		}
		else
		{
			this.setState({activeIndex: -1});
		}
	}

	onFocus(index:number)
	{
		// allow toggling between dropdowns once the menubar has been clicked on
		if (this.activeDropdown)
			this.openNextDropdown(index);
		else
		{
			this.setState({activeIndex: index});
		}
	}

	onBlur=()=>
	{
		// clear the hover style if no dropdown is open
		if (!this.activeDropdown)
			this.setState({activeIndex: -1});
	}

	openNextDropdown(index:number)
	{
		var newDropdown = this.dropdownItems[index];
		this.openDropdown(newDropdown);
		this.setState({activeIndex: index});
	}

	openDropdown(newDropdown:Dropdown)
	{
		if (this.activeDropdown)
			this.activeDropdown.closeMenu();
		if (this.activeDropdown != newDropdown)
		{
			this.activeDropdown = newDropdown;
			this.activeDropdown.openMenu();
		}
	}

	onMouseUp=(index:number)=>
	{
		this.flickerItem(index);
	}

	onKeyUp=(index:number, event:React.KeyboardEvent)=>
	{
		if (event.keyCode == KEYCODES.SPACE || event.keyCode == KEYCODES.ENTER)
			this.flickerItem(index);
	}

	flickerItem=(index:number)=>
	{
		this.setState({
			clickedIndex: index
		}, () => {
			// small delay and disable active style
			setTimeout(() => {
				this.setState({
					clickedIndex: -1
				})
			}, 100);
		})
	}

	onDropdownOpen(index:number)
	{
		this.setState({
			activeIndex: index
		});
		this.activeDropdown = this.dropdownItems[index];
	}

	/**
	 * when the dropdown closes by itself
	 * clean up
	 */
	onDropdownClose=()=>
	{
		this.activeDropdown = null;
		this.setState({
			activeIndex: -1
		});
	}

	handleDocumentClick=(event:MouseEvent)=>
	{
		if (!(event.target as HTMLElement).contains(ReactDOM.findDOMNode(this.activeDropdown)))
			this.setState({
				activeIndex: -1
			})
	}

	handleDocumentKeyDown=(event:KeyboardEvent)=>
	{
		var nextIndex:number = -1;

		if (this.state.activeIndex >= 0 && this.state.activeIndex < this.dropdownItems.length)
		{
			if (event.keyCode == KEYCODES.LEFT_ARROW)
			{
				nextIndex = this.state.activeIndex - 1;
			}
			else if (event.keyCode == KEYCODES.RIGHT_ARROW)
			{
				nextIndex = this.state.activeIndex + 1;
			}

			var nextItem = this.dropdownItems[nextIndex];
			var nextElt:HTMLElement = null;
			if (nextItem)
				nextElt = ReactDOM.findDOMNode(nextItem) as HTMLElement;
			if (nextElt)
				nextElt.focus();
		}

		if (event.keyCode == KEYCODES.ESC)
		{
			if (this.activeDropdown)
			{
				var dropdown = ReactDOM.findDOMNode(this.activeDropdown) as HTMLElement;
				if (dropdown && dropdown.blur)
					dropdown.blur();
			}
			this.setState({activeIndex: -1});
		}
	}

	componentDidMount()
	{
		ReactUtils.getDocument(this).addEventListener("keydown", this.handleDocumentKeyDown);
		ReactUtils.getDocument(this).addEventListener("click", this.handleDocumentClick);
	}

	componentWillUnmount()
	{
		ReactUtils.getDocument(this).removeEventListener("keydown", this.handleDocumentKeyDown);
		ReactUtils.getDocument(this).removeEventListener("click", this.handleDocumentClick);
	}

	renderMenuBarItem(index:number, props:MenuBarItemProps):JSX.Element
	{
		var menuBarClass = classNames({
			"weave-menubar-item": true,
			"weave-menubar-item-hovered": this.state.activeIndex == index,
			"weave-menubar-item-clicked": this.state.clickedIndex == index,
			"weave-menubar-item-bold": !!props.bold
		});

		return (
			<Dropdown
				className={menuBarClass}
				menuGetter={() => this.props.config[index].menu}
				key={index}
				ref={(c:Dropdown) => {
					this.dropdownItems[index] = c;
					InteractiveTour.callComponentRefCallback(props.label, c);
				}}
				onMouseEnter={() => this.onMouseEnter(index)}
				onFocus={() => this.onFocus(index)}
				onBlur={this.onBlur}
				onMouseLeave={() => this.onMouseLeave(index)}
				onOpen={() => {
					this.onDropdownOpen(index);
					InteractiveTour.targetComponentOnClick(props.label)
				}}
				onClose={this.onDropdownClose}
			    onMouseUp={() => this.onMouseUp(index)}
			    onKeyUp={(event:React.KeyboardEvent) => this.onKeyUp(index, event)}
			>
				{props.label}
			</Dropdown>
		);
	}

	render():JSX.Element
	{
		var style = _.merge({alignItems: 'center'}, this.props.style);
		return (
			<HBox overflow className="weave-menubar" {...this.props as React.HTMLAttributes} style={style}>
				{
					this.props.config.map((menuBarItemProps, index) => {
						return this.renderMenuBarItem(index, menuBarItemProps)
					})
				}
				{this.props.children}
			</HBox>
		);
	}
}
