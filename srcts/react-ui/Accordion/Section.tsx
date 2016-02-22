/// <reference path="../../../typings/react/react.d.ts"/>


import * as React from "react";
import VBox from "../VBox";
import HBox from "../HBox";

export interface SectionProps extends React.Props<Section> 
{
	title: string,
	onClick: Function,
	content: string | React.ReactElement<any>,
	open: boolean
}

export interface SectionState 
{
	open:boolean,
}

export default class Section extends React.Component<SectionProps, SectionState>
{
	
	constructor(props:SectionProps) 
	{
		super(props);
		this.state = {
			open: false
		};
	}
	
	componentWillReceiveProps(nextProps:SectionProps) {
		this.setState({
			open: nextProps.open
		});
	}

	render():JSX.Element
	{
		var bodyStyle:React.CSSProperties = {};
	
		if(this.state.open)
		{
			bodyStyle.flex = 1;
			bodyStyle.display = "block";
		} else {
			bodyStyle.height = 0;
			bodyStyle.display = "none";
		}

		return (
			<VBox className="section">
				<HBox style={{height: 30}} onClick={() => { this.setState({ open: !this.state.open }) }} className="section-header">
					{
						this.props.title
					}
				</HBox>
				<div style={bodyStyle} className="section-body">
					{
						this.props.content
					}
				</div>
			</VBox>
		);
	}
}
