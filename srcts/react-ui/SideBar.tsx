import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import ReactUtils from "../utils/ReactUtils";
import IconButton from "./IconButton";
import SmartComponent from "../ui/SmartComponent";

export interface SideBarProps extends React.HTMLProps<SideBar>
{
	onClose?:(open:boolean)=>void;
	location:string;
	open:boolean; //ensures side bar can be closed by external componenets
	enableClose?:boolean;
}

export interface SideBarState
{
	open:boolean // this ensures sidebar can act as on its own 
}

export default class SideBar extends SmartComponent<SideBarProps, SideBarState>
{
	constructor(props:SideBarProps)
	{
		super(props);

		this.state = {
			open:this.props.open === undefined? false:this.props.open
		};

		// we ned to bind this once for the component
		this.onCloseClick = this.onCloseClick.bind(this);
	}

	//todo make it toggle open rather close
	private onCloseClick=():void=>
	{
		this.setState({
			open: !this.state.open
		});
		if (this.props.onClose)
			this.props.onClose(!this.state.open);
	}

	componentWillReceiveProps(nextProps:SideBarProps)
	{
		if (this.props.open != nextProps.open)
		{
			this.setState({
				open:nextProps.open
			});
		}
	}

	render()
	{
		//if side bar is part of sidebar container through this.props.onClose this section wont get rendered
		if (!this.state.open) // empty div will be rendered only when it act as stand alone component outside sidebarcontainer
			return <div/>;

		var defaultStyle:React.CSSProperties = {
			background:"#f4f4f4",
			display:"flex"
		};


		var closeButtonStyle:React.CSSProperties = {
			alignSelf:"flex-end",
			paddingRight:"8px"
		};
		
		var closeIconStyle:React.CSSProperties = {
			justifyContent: (this.props.location == "right" || this.props.location == "bottom") ? "flex-start" : "flex-end"
		}

		if (this.props.location == "left" || this.props.location == "right" || !this.props.location)
		{
			defaultStyle.flexDirection = "column";
			if (this.props.location == "right")
			{
				defaultStyle.right= 0;
				defaultStyle.borderLeft = "1px solid lightGrey";
				closeButtonStyle.alignSelf = "flex-start";
			}
			else
			{
				defaultStyle.left= 0;
				defaultStyle.borderRight= "1px solid lightGrey";
				closeButtonStyle.alignSelf = "flex-end";
			}
		}
		else if (this.props.location == "top" || this.props.location == "bottom")
		{
			defaultStyle.flexDirection = "row-reverse"; // this makes close icon on right
			
			if (this.props.location == "top")
			{
				defaultStyle.top = 0;
				defaultStyle["borderBottom"] = "1px solid lightGrey";
				closeButtonStyle.alignSelf = "flex-end";
			}
			else
			{
				defaultStyle.bottom = 0;
				defaultStyle.borderTop = "1px solid lightGrey";
				closeButtonStyle.alignSelf = "flex-end";
			}
		}

		// this ensures default style overrides user defined style, to make sure layout style in not changed
		var style:React.CSSProperties = _.merge({flex: 1}, this.props.style, defaultStyle);

		let closeButtonUI:JSX.Element = null;
		if (this.props.enableClose)
		{
			closeButtonUI = (
				<div style={closeButtonStyle}>
					<IconButton
						clickHandler={ this.onCloseClick }
						iconName="&#x2715"
						style={ {fontSize: "16px"} }
						mouseOverStyle={ {color: "red", background: "none"} }
						toolTip="Close"
					/>
				</div>
			);
		}

		return (
			<div className={this.props.className} style={style}>
				{closeButtonUI}
				<div style={ {display: "flex", flexDirection: "inherit", flex: 1, overflow: "auto"} }>
					{this.props.children}
				</div>
			</div>
		);
	}
}
