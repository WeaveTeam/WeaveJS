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
	showContextMenu?:boolean;
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
			showContextMenu: false
			
		};
		this.hideContextMenu = this.hideContextMenu.bind(this);
	}
	
	componentDidMount()
	{
		document.addEventListener("click", this.hideContextMenu)
		this.element = ReactDOM.findDOMNode(this);
	}
	
	componentWillUnmount()
	{
		document.removeEventListener("click", this.hideContextMenu)
		
	}
	
	hideContextMenu(event:MouseEvent)
	{
		var elt = event.target;
		// while( elt != null)
		// {
		// 	if(elt == this.element) {
		// 		return;
		// 	}
		// 	elt = (elt as HTMLElement).parentNode;
		// }
		// this.setState({
		// 	showContextMenu:false
		// })
	}
	
	onClick(index:number, event:React.MouseEvent)
	{
		var menuBarItemElt = ReactDOM.findDOMNode(this.refs[index]) as HTMLElement;
		this.setState({
			showContextMenu:true,
			xPos: menuBarItemElt.offsetLeft,
			yPos: menuBarItemElt.offsetTop + menuBarItemElt.clientHeight,
			menu: (this.refs[index] as MenuBarItem).props.menu
		});
	}

	render():JSX.Element
	{
		return (
			<HBox {...this.props}>
				{
					(this.props.children as React.ReactElement<MenuBarItemProps>[]).map((child, index) => {
						var props = _.cloneDeep(child.props);
						props.key = index;
						props.ref = index as any;
						props.onClick = this.onClick.bind(this, index)
						return React.cloneElement(
							child,
							props
						);
					})
				}
				{
					this.state.showContextMenu ?
					<Menu menu={this.state.menu} xPos={this.state.xPos} yPos={this.state.yPos}/>
					:
					null
				}
			</HBox>
		)
	}
}
