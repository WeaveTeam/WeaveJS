import * as React from "react";
import * as _ from "lodash";
import VBox from "../VBox";
import Section from "./Section";
import {SectionProps} from "./Section";

export interface AccordionProps extends React.Props<Accordion> {
	title:string;
	closeOthers?:boolean;
	children:React.ReactElement<SectionProps>[]
}

export interface AccordionState {
	statuses:boolean[]
}

export default class Accordion extends React.Component<AccordionProps, AccordionState> {
	
	constructor(props:AccordionProps) 
	{
		super(props);
		this.state = {
			statuses: props.children.map((child) => { return child.props.open; }) || []
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
			statuses: nextProps.children.map((child) => { return child.props.open; }) || []
		});
	}
	
	static defaultProps():AccordionProps
	{
		return {
			title: "",
			closeOthers: true,
			children: []
		}
	}
	
	render():JSX.Element
	{
		return (
			<VBox style={{width: "100%"}} className="accordion">
				<div className="accordion-header">{this.props.title}</div>
				{
					this.props.children.map((child, index) => {
						var newProps:SectionProps = {
							title: child.props.title,
							open: this.state.statuses[index],
							onChange: this.onChange.bind(this, index),
							key: child.key ? child.key : index,
							ref: child.ref
						};
						newProps.onChange = this.onChange.bind(this, index)
						var newChild = React.cloneElement(child, newProps)
						return newChild;
					})
				}
			</VBox>
		);
	}
}
