import * as _ from "lodash";
import LinkableVariable = weavejs.core.LinkableVariable;
import * as React from "react";
import * as ReactDOM from "react-dom";

export interface StatefulComboBoxProps extends React.HTMLProps<StatefulComboBox> {
	style?: React.CSSProperties;
	options: (string | { label: string, value: any })[];
	value?: any;
	onChange?: (selectedItem: any) => void;
}

export interface StatefulComboBoxState {
	value: any;
}

export default class StatefulComboBox extends React.Component<StatefulComboBoxProps, StatefulComboBoxState>
{
	constructor(props: StatefulComboBoxProps) {
		super(props);
	}

	componentWillReceiveProps(nextProps: StatefulComboBoxProps)
	{
		if (nextProps.value)
		{
			this.setState({ value: nextProps.value });
		}
	}

	state: StatefulComboBoxState = { value: null };

	handleInputChange = (event: React.FormEvent): void => {
		let index = Number((event.target as HTMLSelectElement).value)
		let option = this.props.options[index];
		let value: any;
		value = (typeof option === "object") ? option.value : option;

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
	}

	render(): JSX.Element {
		var props = _.clone(this.props);
		delete props.options;
		delete props.children;

		let index = this.props.options.findIndex(
			(option): boolean => {
				if (typeof option == "object") {
					return _.isEqual((option as any).value, this.state.value);
				}
				else {
					return _.isEqual(option, this.state.value);
				}
			}
		);

		return (
			<select {...props as any} onChange={this.handleInputChange} value={index.toString()}>
				{this.props.options.map(this.renderOption)}
			</select>
		);
	}
}
