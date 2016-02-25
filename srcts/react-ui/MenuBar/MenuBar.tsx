import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import HBox from "../HBox";
import MenuBarItem from "./MenuBarItem";
import {MenuBarItemProps} from "./MenuBarItem";
import {MenuItemProps} from "../Menu/MenuItem";
import ContextMenu from "../../ContextMenu";


export interface MenuBarState
{
	xPos?:number;
	yPos?:number;
	showContextMenu?:boolean;
	menuItems?:MenuItemProps[]
}

export default class MenuBar extends React.Component<any, MenuBarState>
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
		while( elt != null)
		{
			if(elt == this.element) {
				return;
			}
			elt = (elt as HTMLElement).parentNode;
		}
		// this.setState({
		// 	showContextMenu:false
		// })
	}
	
	onClick(index:number, event:React.MouseEvent)
	{
		var menuBarItemElt = ReactDOM.findDOMNode(this.refs[index]) as HTMLElement;
		this.setState({
			showContextMenu:true,
			xPos: menuBarItemElt.clientLeft,
			yPos: menuBarItemElt.offsetTop,
			menuItems: (this.refs[index] as MenuBarItem).props.menuItems
		});
	}

	render():JSX.Element
	{
		return (
			<HBox {...this.props}>
				{
					(this.props.children as React.ReactElement<MenuBarItemProps>[]).map((child, index) => {
						var props = _.cloneDeep(child.props);
						props.key = child.key ? child.key : index;
						props.ref = child.ref || index as any;
						props.onClick = this.onClick.bind(this, index)
						return React.cloneElement(
							child,
							props
						);
					})
				}
				{
					this.state.showContextMenu ?
					<ContextMenu config={this.state.menuItems} xPos={this.state.xPos} yPos={this.state.yPos}/>
					:
					null
				}
			</HBox>
		)
	}
}
