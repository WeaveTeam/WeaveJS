import * as _ from "lodash";
import LinkableVariable = weavejs.core.LinkableVariable;
import * as React from "react";
import * as ReactDOM from "react-dom";

export interface StatefulCheckBoxProps extends React.HTMLProps<StatefulCheckBox> {
	style?: React.CSSProperties;
}

export interface StatefulCheckBoxState {
	checked: boolean;
}

export default class StatefulCheckBox extends React.Component<StatefulCheckBoxProps, StatefulCheckBoxState>
{
	constructor(props: StatefulCheckBoxProps) {
		super(props);
	}

	state: StatefulCheckBoxState = { checked: false };

	handleInputChange = (event: React.FormEvent): void => {
		this.setState({ checked: (event.target as HTMLInputElement).checked});
	}

	render(): JSX.Element {
		var props = _.clone(this.props);
		delete props.children;

		return (
			<input {...props as any} onChange={this.handleInputChange} type="checkbox" value="" checked={this.state.checked}/>
		);
	}
}
