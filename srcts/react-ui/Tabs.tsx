import * as React from "react";
import * as _ from "lodash";
import CenteredIcon from "./CenteredIcon";
import {HBox, VBox} from "./FlexBox";
import classNames from "../modules/classnames";

const TOP:"top" = "top";
const BOTTOM:"bottom" = "bottom";

export interface TabsProps extends React.Props<Tabs>
{
	labels:React.ReactChild[];
	tabs:JSX.Element[];
	location?:"top"|"bottom";
	tabBarChildren?:React.ReactChild;
	initialActiveTabIndex?:number;
	activeTabIndex?:number;
	onViewChange?:(index:number) => void;
	className?:string;
	style?:React.CSSProperties;
	tabHeaderClassName?:string;
	tabHeaderStyle?:React.CSSProperties;
	tabContentClassName?:string;
	tabContentStyle?:React.CSSProperties;
	tabLabelClassName?:string;
	tabLabelStyle?:React.CSSProperties;
	tabBarClassName?:string;
	tabBarStyle?:React.CSSProperties;
	onTabDoubleClick?:(index:number)=>void;
}

export interface TabsState
{
	activeTabIndex:number;
}

export default class Tabs extends React.Component<TabsProps, TabsState>
{
	
	constructor(props:TabsProps)
	{
		super(props);
		this.state = {
			activeTabIndex: props.initialActiveTabIndex || props.activeTabIndex || 0
		}
	}

	static defaultProps:TabsProps = {
		labels: [],
		tabs: [],
		location: "top"
	};

	componentWillReceiveProps(props:TabsProps)
	{
		if(props.activeTabIndex != null)
			this.setState({
				activeTabIndex: props.activeTabIndex
			});
	}

	changeTabView(index:number) {
		if (this.state.activeTabIndex != index)
		{
			this.setState({
				activeTabIndex:index
			});
			this.props.onViewChange && this.props.onViewChange(index);
		}
	}

	render():JSX.Element
	{
		var content = [
			<HBox key="tabs"
			      className={classNames(this.props.tabBarClassName || "weave-tab-label-container", this.props.location)}
			      style={this.props.tabBarStyle}
			>
				{
					this.props.labels.map((label, index) => {
						return (
							<HBox key={index}
							      className={classNames(this.props.tabLabelClassName || "weave-tab-label", {"active": this.state.activeTabIndex == index}, this.props.location)}
							      style={this.props.tabLabelStyle}
							      onClick={() => this.changeTabView(index)}
							      onDoubleClick={() => this.props.onTabDoubleClick && this.props.onTabDoubleClick(index)}
							>
								{label}
							</HBox>
						);
					})
				}
				{
					this.props.tabBarChildren
				}
			</HBox>,
			<VBox key="content" className={classNames(this.props.tabContentClassName || "weave-tab-content", this.props.location)} style={{flex: 1, overflow: "auto"}}>
			{
				this.props.tabs[this.state.activeTabIndex]
			}
			</VBox>
		];

		if(this.props.location === BOTTOM)
			content.reverse();

		return (
			<VBox
				className={classNames(this.props.className || "weave-tab-container", this.props.location)}
			    style={_.merge({}, this.props.style, {flex: 1})}
			>
				{content}
			</VBox>
		);
	}
}
