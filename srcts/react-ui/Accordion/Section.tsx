/// <reference path="../../../typings/react/react.d.ts"/>


import * as React from "react";
import VBox from "../VBox";
import HBox from "../HBox";
import * as Prefixer from "react-vendor-prefix";

export interface SectionProps extends React.Props<Section>
{
	title: string,
	open: boolean
	onChange?: Function,
}

export default class Section extends React.Component<SectionProps, any>
{
	
	constructor(props:SectionProps) 
	{
		super(props);
	}
	
	render():JSX.Element
	{
		var bodyStyle:React.CSSProperties = {transition: "max-height 300ms"};

		var sectionStyle:React.CSSProperties = {};

		if(this.props.open)
		{
			bodyStyle.maxHeight = "100%";
		} else {
			bodyStyle.maxHeight = 0;
		}

		bodyStyle = Prefixer.prefix({styles: bodyStyle}).styles;

		return (
			<VBox className="section" style={sectionStyle}>
				<HBox style={{height: 30, justifyContent: "space-between", padding: 5}} onClick={this.props.onChange} className="section-header">
					<span style={{width:"100%", textAlign:"center", textOverflow:"ellipsis", fontWeight:700}}>{this.props.title}</span>
					{
						this.props.open ? <i className="fa fa-times"/> : <i className="fa fa-chevron-down"/>
					}
				</HBox>
				<div style={bodyStyle} className="section-body">
					{
						this.props.children
					}
				</div>
			</VBox>
		);
	}
}
