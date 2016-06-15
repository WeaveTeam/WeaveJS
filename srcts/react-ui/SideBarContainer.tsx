import * as React from "react";
import ResizingDiv from "./ResizingDiv";
import SideBar from "./SideBar";
import {HBox,VBox} from "./FlexBox";
import {HDividedBox} from "./DividedBox";
import SmartComponent from "../ui/SmartComponent";

export interface SideBarContainerProps extends React.Props<SideBarContainer>
{
	barSize:number;
	mode?:"scale"|"resize";
	topChildren?:JSX.Element | JSX.Element[]; // important to support both Array and composite element
	bottomChildren?:JSX.Element | JSX.Element[];
	leftChildren?:JSX.Element | JSX.Element[];
	rightChildren?:JSX.Element | JSX.Element[];
}

export interface SideBarContainerState
{
}

/**
 * Provides a way to make elements using percentage coordinates resize properly within a div that uses flex layout.
 */
export default class SideBarContainer extends SmartComponent<SideBarContainerProps, SideBarContainerState>
{
	constructor(props:SideBarContainerProps)
	{
		super(props);
	}

	render()
	{
		var barSize:number = this.props.barSize;
		var scaleValue:number = 1;
		var transformOriginValue:string = "";
		var topOrBottomBarWidth:number = 1;

		if (this.props.leftChildren)
		{
			if (this.props.mode == "scale")
			{
				scaleValue = scaleValue - barSize;
				transformOriginValue = "right";
			}
			topOrBottomBarWidth = 1 - barSize;
		}

		if (this.props.rightChildren)
		{
			if (this.props.mode == "scale")
			{
				scaleValue = scaleValue - barSize;
				transformOriginValue = this.props.leftChildren ? "center" : "left";
			}
			topOrBottomBarWidth = topOrBottomBarWidth - barSize;
		}

		if (this.props.mode == "scale")
		{
			if (this.props.topChildren)
			{
				scaleValue = scaleValue < 1 ? scaleValue : scaleValue - barSize;
				if (transformOriginValue != "center" ) // either left or right or none is opened
				{
					if (transformOriginValue == "") //none is opened
						transformOriginValue = "bottom";
					else //left or right opened
						transformOriginValue = transformOriginValue + " bottom";
				}
			}
			if (this.props.bottomChildren)
			{
				scaleValue = this.props.topChildren ? 1 - 2 * barSize : scaleValue;

				if (transformOriginValue != "center") // either left or right or top or none is opened
				{
					if (transformOriginValue == "") //none is opened
					{
						transformOriginValue = "top";
					}
					else
					{
						if (this.props.topChildren) // top is opened
							transformOriginValue = "center";
						else //left or right opened
							transformOriginValue = transformOriginValue + " top";
					}
				}
			}
		}

		var wrapperStyle:React.CSSProperties = {
			position: this.props.mode == "scale" ? "absolute" : "relative",
			display: "flex",
			flex:1
		}

		if (this.props.mode == "scale" && scaleValue != 1)
		{
			wrapperStyle.transform =  `scale(${scaleValue})`;
			wrapperStyle.transformOrigin  = transformOriginValue;
		}

		let leftSideBar:JSX.Element = null;
		let rightSideBar:JSX.Element = null;
		let topSideBar:JSX.Element = null;
		let bottomSideBar:JSX.Element = null;
		let sideBars:JSX.Element[] = [];
		let locations:[string, JSX.Element | JSX.Element[]][] = [
			['left', this.props.leftChildren],
			['right', this.props.rightChildren],
			['top', this.props.topChildren],
			['bottom', this.props.bottomChildren]
		];
		
		locations.map(([location, children]) => {
			if (!children) // don't render if no children
				return null;

			var barStyle:React.CSSProperties = {
				position:this.props.mode == "scale" ? "absolute" : "relative"
			};

			var barPercentageSize:string = barSize * 100 + "%";

			let sideBarUI:JSX.Element = (
				<SideBar
					key={ location }
					style={ barStyle }
					open={ true }
					location={ location }
					children={ children }
				/>
			);

			if (location == "right" || location == "left")
			{
				if (this.props.mode == "resize")
					barStyle.maxWidth = barPercentageSize;
				else if (this.props.mode == "scale")
					barStyle.width = barPercentageSize;
				else
					barStyle.flex = barSize;

				//barStyle.height = "100%";
				if (this.props.mode != "scale")
				{
					if (location == "right")
						rightSideBar = sideBarUI;
					else
						leftSideBar = sideBarUI;
				}
				else
				{
					sideBars.push(sideBarUI);
				}
			}
			else if (location == "top" || location == "bottom")
			{
				barStyle.width = topOrBottomBarWidth * 100  + "%";
				if (this.props.mode == "resize")
					barStyle.maxHeight = barPercentageSize;
				else if (this.props.mode == "scale")
					barStyle.height = barPercentageSize;
				else
					barStyle.flex = barSize;
				
				barStyle.left = this.props.leftChildren ? barPercentageSize : "0";

				if (this.props.mode != "scale")
				{
					if (location == "top")
						topSideBar = sideBarUI
					else
						bottomSideBar = sideBarUI;
				}
				else
				{
					sideBars.push(sideBarUI);
				}
			}
		});

		let containerUI:JSX.Element = null;

		let containerStyle:React.CSSProperties = {
			position: "relative",
			background: "#e0e0e0",
			display:"flex"
		};

		if (this.props.mode == "scale")
		{
			// important to set " style={ {width:"100%",height:"100%"} }" ensures calculated size values are passed on
			// wrapperStyle passed the width height values here
			containerUI = (
				<ResizingDiv style={ containerStyle }>
					{sideBars}
					<div style={ wrapperStyle }>
						{this.props.children}
					</div>
				</ResizingDiv>
			);
		}
		else if (this.props.mode == "resize")
		{
			// important to set " style={ {width:"100%",height:"100%"} }" ensures calculated size values are passed on
			containerUI = (
				 <ResizingDiv style={ containerStyle }>
					<VBox style={ {width:"100%",height:"100%"} } >
						{topSideBar}
						<HDividedBox style={ {flex:1} }>
							{leftSideBar}
							<div style={ wrapperStyle }>
								{this.props.children}
							</div>
							{rightSideBar}
						</HDividedBox>
						{bottomSideBar}
					</VBox>
				</ResizingDiv>
			);
		}
		else
		{
			// important to set inner style to make sure flex chain is not broken for automated calculations
			// setting height percent dont go well with edge browser, so flex values are preferred
			// flex 1 as ResizingDiv will always have only one child, so flex values grow and shrink both can remain 1
			containerUI = (
				<ResizingDiv style={ containerStyle } innerStyle={ {display:"flex",flex:1} }>
					<VBox style={ {width:"100%"} }>
						{topSideBar}
						<HBox style={ {flex:"1 0"} }>
							{leftSideBar}
							<div style={ wrapperStyle }>
								{this.props.children}
							</div>
							{rightSideBar}
						</HBox>
						{bottomSideBar}
					</VBox>
				</ResizingDiv>
			);
		}

		return (containerUI);
	}

}
