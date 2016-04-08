import * as _ from "lodash";
import LinkableVariable = weavejs.core.LinkableVariable;
import SmartComponent from "./SmartComponent";
import * as React from "react";
import * as ReactDOM from "react-dom";

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
		if (this.props.value != nextProps.value)
		{
			this.setState({value: nextProps.value});
		}

		if (nextProps.options != this.props.options)
		{
			//console.log("Triggering change next render");
			this.triggerChangeNextRender = true;
		}
	}

	state: StatefulComboBoxState = {
        value: this.props.value
    };

	handleInputChange = (event: React.FormEvent): void => {
		let index = Number((event.target as HTMLSelectElement).value)
		let option = this.props.options[index];
		let value: any;

		value = (typeof option === "object") ? option.value : option;
		//console.log("handleInputChange", value);

		if (this.props.onChange) this.props.onChange(value);
		this.setState({value});
	}

	renderOption = (item: (string | { label: string, value: string }), index: number): JSX.Element => {
		if (typeof item === "object") {
			return <option key={index} value={index.toString()}>{item.label}</option>
		}
		else {
			return <option key={index} value={index.toString()}>{item}</option>
		}
	};

	private findOptionIndex(value:any):number
	{
		return this.props.options.findIndex(
			(option): boolean => {
				if (typeof option == "object") {
					return _.isEqual((option as any).value, value);
				}
				else {
					return _.isEqual(option, value);
				}
			}
		);
	}

	render(): JSX.Element {
		var props = _.clone(this.props);
		delete props.options;
		delete props.children;

		let index = this.findOptionIndex(this.state.value);
        //console.log("in combobox in render",this.props.value,this.state.value,index );
		let refFunc: (c: HTMLSelectElement) => void = (c: HTMLSelectElement) => { };
		if (index == -1 || this.triggerChangeNextRender)
		{
			if (this.props.selectFirstOnInvalid && index == -1) {
				index = 0;
			}
			if (props.triggerOnForcedChange && this.props.onChange) {
				let option = this.props.options[index];
				let value = (typeof option === "object") ? option.value : option;
				_.defer(this.props.onChange, value);
				this.triggerChangeNextRender = false;
			}
		}

		return (
			<select {...props as any} ref={refFunc} onChange={this.handleInputChange} value={index.toString()}>
				{this.props.options.map(this.renderOption)}
			</select>
		);
	}
}
