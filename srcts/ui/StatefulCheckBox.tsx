import * as _ from "lodash";
import LinkableVariable = weavejs.core.LinkableVariable;
import * as React from "react";
import * as ReactDOM from "react-dom";

export interface StatefulCheckBoxProps extends React.HTMLProps<StatefulCheckBox> {
	style?: React.CSSProperties;
	stopPropagation?: boolean;
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

	onChange=(event:React.FormEvent)=>
	{
		this.setState({ checked: (event.target as HTMLInputElement).checked });
	}

	onClick=(event:React.MouseEvent)=>
	{
		if (this.props.stopPropagation)		
			event.stopPropagation();
	}

	render(): JSX.Element {
		var props = _.clone(this.props);
		delete props.children;

		return (
			<input onClick={this.onClick} onChange={this.onChange} type="checkbox" checked={this.state.checked}/>
		);
	}
}
