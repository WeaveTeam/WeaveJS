import * as React from "react";
import * as _ from "lodash";
import VBox from "../VBox";
import Section from "./Section";
import {SectionProps} from "./Section";

export interface AccordionProps extends React.Props<Accordion> {
	title:string;
	config: SectionProps[];
	closeOthers?:boolean;
}

export interface AccordionState {
	statuses:boolean[]
}

export default class Accordion extends React.Component<AccordionProps, AccordionState> {
	
	constructor(props:AccordionProps) 
	{
		super(props);
		console.log(props.config);
		console.log(_.pluck(props.config, "open"));
		this.state = {
			statuses: _.pluck(props.config, "open") || []
		}
	}
	
	onChange(index:number)
	{
		var newState = _.clone(this.state);

		if(this.props.closeOthers) {
			// reset all the values to false except the one being clicked
			newState.statuses = newState.statuses.map((status, i, arr) => {
				if(i != index)
					return false;
				else
					return arr[i]
			});
		}

		// toggle the value
		newState.statuses[index] = !newState.statuses[index];
		this.setState(newState);
	}
	
	componentWillReceiveProps(nextProps:AccordionProps)
	{
		this.setState({
			statuses: _.pluck(nextProps.config, "open")
		});
		
	}
	
	static defaultProps():AccordionProps
	{
		return {
			title: "",
			config: [],
			closeOthers: true
		}
	}
	
	render():JSX.Element
	{
		return (
			<VBox style={{width: "100%"}} className="accordion">
				<div className="accordion-header">{this.props.title}</div>
				{
					this.props.config.map((sectionConfig:SectionProps, index:number) => {
						return <Section key={index}
										onChange={this.onChange.bind(this, index)} 
										title={sectionConfig.title}
										open={this.state.statuses[index]}
										content={sectionConfig.content}>
							   </Section>
					})
				}
			</VBox>
		);
	}
}
