import * as React from "react";
import Menu from "./react-ui/Menu/Menu";
import MenuItem from "./react-ui/Menu/MenuItem";
import Divider from "./react-ui/Menu/Divider";

export interface ContextMenuProps extends React.Props<ContextMenu>
{
	xPos: number;
	yPos: number;
}

export interface ContextMenuState
{
	
}

export default class ContextMenu extends React.Component<ContextMenuProps, ContextMenuState>
{
	constructor(props:ContextMenuProps)
	{
		super(props);
	}	
	
	onClick()
	{
		console.log("Clicked on create subset");
	}

	render():JSX.Element 
	{
		var extendedMenu2:any = [
			<MenuItem key={1} primaryText="Create Subset" onClick={this.onClick.bind(this)}/>,
			<MenuItem key={2} primaryText="Copy" secondaryText="&#8984;C"/>
		];
		var extendedMenu:any = [
			<MenuItem key={1} primaryText="Create Subset" onClick={this.onClick.bind(this)}/>,
			<MenuItem key={2} primaryText="Copy" secondaryText="&#8984;C" menuItems={extendedMenu2}/>
		];

		return (
			<Menu xPos={this.props.xPos} yPos={this.props.yPos}>
		      <MenuItem primaryText="Create Subset" onClick={this.onClick.bind(this)}/>
		      <MenuItem primaryText="Copy" secondaryText="&#8984;C"/>
			  <Divider/>
		      <MenuItem primaryText="Paste" />
		      <MenuItem primaryText="Extended Menu" menuItems={extendedMenu} />
		    </Menu>
		);
	}
}
