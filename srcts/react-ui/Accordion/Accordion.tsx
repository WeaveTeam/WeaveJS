/// <reference path="../../../typings/react/react.d.ts"/>

import * as React from "react";
import VBox from "../VBox";
import Section from "./Section";
import {SectionProps} from "./Section";

export interface AccordionProps extends React.Props<Accordion> {
	title:string;
	contents: SectionProps[];
	closeOthers?:boolean;
}

export interface AccordionState {
	
}

export default class Accordion extends React.Component<AccordionProps, AccordionState> {
	
	constructor(props:AccordionProps) 
	{
		super(props);
	}
	
	static defaultProps():AccordionProps
	{
		return
		{
			title: "",
			contents: [],
			closeOthers: true
		}
	}
	
	render():JSX.Element
	{
		return (
			<VBox style={{width: "100%"}}>
				<div>{this.props.title}</div>
				{
					this.props.contents.map((sectionConfig:SectionProps) => {
						return <Section {...sectionConfig}></Section>
					})
				}
			</VBox>
		);
	}
}
