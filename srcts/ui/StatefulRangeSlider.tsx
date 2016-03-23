import * as _ from "lodash";
import LinkableVariable = weavejs.core.LinkableVariable;
import * as React from "react";
import * as ReactDOM from "react-dom";

export interface StatefulRangeSliderProps extends React.HTMLProps<StatefulRangeSlider> {
	style?: React.CSSProperties;
}

export interface StatefulRangeSliderState {
	value: number;
}

export default class StatefulRangeSlider extends React.Component<StatefulRangeSliderProps, StatefulRangeSliderState>
{
	constructor(props: StatefulRangeSliderProps) {
		super(props);
	}

	state: StatefulRangeSliderState = { value: 0 };

	handleInputChange = (event: React.FormEvent): void => {
		this.setState({ value: Number((event.target as HTMLInputElement).value)});
	}

	render(): JSX.Element {
		var props = _.clone(this.props);
		delete props.children;

		return (
			<input {...props as any} onChange={this.handleInputChange} type="range" value={this.state.value !== undefined && this.state.value.toString()}/>
		);
	}
}
