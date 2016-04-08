import * as React from "react";
import {HBox, VBox} from "./FlexBox";
import classNames from "../modules/classnames";

export interface TabsProps extends React.Props<Tabs>
{
	labels:string[];
	activeTabIndex?:number;
	onViewChange?:(index:number) => void;
	tabs:JSX.Element[]
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
	
	changeTabView(index:number)
	{
		this.setState({
			activeTabIndex:index
		});
		this.props.onViewChange && this.props.onViewChange(index);
	}
	
	render():JSX.Element
	{
		return (
			<VBox className="weave-tab-container">
				<HBox className="weave-tab-label-container">
					{
						this.props.labels.map((label, index) => {
							return <span key={label} className={classNames("weave-tab-label", {"weave-tab-label-active": this.state.activeTabIndex == index})}
							 			 onClick={() => this.changeTabView(index)}>{label}
								  </span>
						})
					}
				</HBox>
				<div className="weave-tab-content">
					{
						this.props.tabs[this.state.activeTabIndex]
					}
				</div>
			</VBox>
		);
	}
}
