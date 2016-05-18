import * as React from "react";
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
	onTabAdd?:React.MouseEventHandler;
	onTabClose?:(index:number, event:React.MouseEvent) => void;
	activeTabIndex?:number;
	onViewChange?:(index:number) => void;
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
			activeTabIndex: props.activeTabIndex || 0
		}
	}

	static defaultProps:TabsProps = {
		labels: [],
		tabs: [],
		location: "top"
	};

	changeTabView(index:number)
	{
		this.setState({
			activeTabIndex:index
		});
		this.props.onViewChange && this.props.onViewChange(index);
	}

	render():JSX.Element
	{
		var content = [
			<HBox key="tabs" className={classNames("weave-tab-label-container", this.props.location)}>
				{
					this.props.labels.map((label, index) => {
						return (
							<HBox key={index}
							      className={classNames("weave-padded-hbox", "weave-tab-label", {"weave-tab-label-active": this.state.activeTabIndex == index}, this.props.location)}
							      onClick={() => this.changeTabView(index)}
							>
								{label}
								{
									this.props.onTabClose
										?   <CenteredIcon className="weave-tab-icon" onClick={(event) => this.props.onTabClose(index, event)} title={Weave.lang("Close")} iconProps={{ className:"fa fa-times-circle" }}/>
										:   null
								}
							</HBox>
						);
					})
				}
				{
					this.props.onTabAdd
						?   <HBox className={classNames("weave-tab-label", this.props.location)}
						          onClick={this.props.onTabAdd}
					>
						<CenteredIcon className="weave-tab-icon" title={Weave.lang("Add New...")} iconProps={{ className: "fa fa-plus" }}/>
					</HBox>
						:   null
				}
			</HBox>,
			<VBox key="content" className={classNames("weave-tab-content", this.props.location)} style={{flex: 1, overflow: "auto"}}>
				{
					this.props.tabs[this.state.activeTabIndex]
				}
			</VBox>
		];

		if(this.props.location === BOTTOM)
			content.reverse();

		return (
			<VBox className={classNames("weave-tab-container", this.props.location)} style={{flex: 1}}>
				{content}
			</VBox>
		);
	}
}