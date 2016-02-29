import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import HBox from "../HBox";
import MenuBarItem from "./MenuBarItem";
import {MenuBarItemProps} from "./MenuBarItem";
import {MenuItemProps} from "../Menu/MenuItem";
import Menu from "../Menu/Menu";


export interface MenuBarState
{
	xPos?:number;
	yPos?:number;
	showMenu?:boolean;
	menu?:MenuItemProps[]
}

export default class MenuBar extends React.Component<React.HTMLProps<MenuBar>, MenuBarState>
{
	element:Element;
	constructor(props:any)
	{
		super(props);
		this.state = {
			xPos: 0,
			yPos: 0,
			showMenu: false
			
		};
		this.hideMenu = this.hideMenu.bind(this);
	}
	
	componentDidMount()
	{
		document.addEventListener("click", this.hideMenu);
		// TODO Add touch events for mobile
		this.element = ReactDOM.findDOMNode(this);
	}
	
	componentWillUnmount()
	{
		document.removeEventListener("click", this.hideMenu);
	}
	
	hideMenu(event:MouseEvent)
	{
		var elt = event.target;
		
		while( elt != null)
		{
			if(elt == this.element) {
				return;
			}
			elt = (elt as HTMLElement).parentNode;
		}
		
		this.setState({
			showMenu:false
		})
	}
	
	onClick(index:number, event:React.MouseEvent)
	{
		var menuBarItemElt = ReactDOM.findDOMNode(this.refs[index]) as HTMLElement;
		this.setState({
			showMenu:true,
			xPos: menuBarItemElt.offsetLeft,
			yPos: menuBarItemElt.offsetTop + menuBarItemElt.clientHeight,
			menu: (this.refs[index] as MenuBarItem).props.menu
		});
	}
	
	onMouseEnter(index:number, event:React.MouseEvent)
	{
		if(this.state.showMenu)
		{
			var menuBarItemElt = ReactDOM.findDOMNode(this.refs[index]) as HTMLElement;
			this.setState({
				xPos: menuBarItemElt.offsetLeft,
				yPos: menuBarItemElt.offsetTop + menuBarItemElt.clientHeight,
				menu: (this.refs[index] as MenuBarItem).props.menu
			});
		}
	}

	render():JSX.Element
	{
		return (
			<HBox {...this.props}>
				{
					/*<MenuBarItem>*/
					(this.props.children as React.ReactElement<MenuBarItemProps>[]).map((child, index) => {
						var props = _.cloneDeep(child.props);
						props.key = index;
						props.ref = index as any;
						props.onClick = this.onClick.bind(this, index);
						props.onMouseEnter = this.onMouseEnter.bind(this, index);
						return React.cloneElement(
							child,
							props
						);
					})
					/*</MenuBarItem>*/
				}
				{
					this.state.showMenu ?
					<Menu menu={this.state.menu} xPos={this.state.xPos} yPos={this.state.yPos}/>
					:
					null
				}
			</HBox>
		)
	}
}
