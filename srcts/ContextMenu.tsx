import * as React from "react";
import Menu from "./react-ui/Menu/Menu";
import MenuItem from "./react-ui/Menu/MenuItem";
import {MenuItemProps} from "./react-ui/Menu/MenuItem";
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
	contextMenuConfig:MenuItemProps[]
	constructor(props:ContextMenuProps)
	{
		super(props);
		this.contextMenuConfig = [
			{
				primaryText: "Create subset from selected record(s)",
				onClick: this.createSubsetFromSelectedRecords.bind(this)
			},
			{
				primaryText: "Remove selected records(s) from subset",
				onClick: this.removeSelectedRecordsFromSubet.bind(this)
			},
			{
				primaryText: "Show All Records",
				onClick: this.showAllRecords.bind(this)
			},
			{
				
			},
			{
				primaryText: "Print/Export Application Image",
				onClick: this.printExport.bind(this)
			}
		]
	}	
	
	createSubsetFromSelectedRecords()
	{
		
	}
	removeSelectedRecordsFromSubet()
	{
		
	}
	
	showAllRecords()
	{
		
	}
	
	printExport()
	{
		
	}

	render():JSX.Element 
	{
		return (
			<Menu xPos={this.props.xPos} yPos={this.props.yPos}>
				{
					this.contextMenuConfig.map((menuItemProps, index) => {
							if(menuItemProps.primaryText)
								return <MenuItem key={index} {...menuItemProps}/>
							else
								return <Divider/>
					})
				}
			</Menu>
		)
	}
}
