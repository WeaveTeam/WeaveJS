import * as _ from "lodash";
import LinkableVariable = weavejs.core.LinkableVariable;
import SmartComponent from "./SmartComponent";
import * as React from "react";
import * as ReactDOM from "react-dom";
import Dropdown from "../semantic-ui/Dropdown";

export interface StatefulComboBoxProps extends React.HTMLProps<StatefulComboBox> {
	style?: React.CSSProperties;
	options: (string | { label: string, value: any })[];
	value?: any;
	onChange?: (selectedItem: any) => void;
	selectFirstOnInvalid?: boolean; /* If a change to the options list renders the value invalid, select the first item */
	triggerOnForcedChange?: boolean; /* Trigger the onChange callback on changes forced by the invalid selection behavior */
}

export interface StatefulComboBoxState {
	value: any;
}

export default class StatefulComboBox extends SmartComponent<StatefulComboBoxProps, StatefulComboBoxState>
{
	constructor(props: StatefulComboBoxProps) {
		super(props);
	}

	triggerChangeNextRender: boolean = false;

	componentWillReceiveProps(nextProps: StatefulComboBoxProps)
	{
		var value = nextProps.value;
		if (value && this.props.options.indexOf(value) >= 0)
		{

			this.setState({value});
		}
		else {
			if (nextProps.selectFirstOnInvalid) {
				this.setState({value: this.props.options[0]});
			}
		}
	}

	componentDidUpdate(prevProps:StatefulComboBoxProps, prevState:StatefulComboBoxState)
	{
		if(!_.isEqual(prevState.value,this.state.value))
			this.props.onChange && this.props.onChange(this.state.value);
	}

	state: StatefulComboBoxState = { value: null };

	handleInputChange = (value:any): void => {
		if (this.props.onChange) this.props.onChange(value);
		this.setState({value});
	};

	getOptions = (item: (string | { label: string, value: string }), index: number): { label?: string, value: any } => {
		if (typeof item === "object") {
			return item;
		}
		else {
			return {value: item};
		}
	};

	render(): JSX.Element {
		return (
			<Dropdown value={this.state.value} options={this.props.options.map(this.getOptions)} onChange={this.handleInputChange }/>
		);
	}
}
