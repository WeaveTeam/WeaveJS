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

	onClick=(event:React.MouseEvent)=>
	{
		this.setState({ checked: !this.state.checked });
		if (this.props.stopPropagation)
			event.stopPropagation();
	}

	render(): JSX.Element {
		var props = _.clone(this.props);
		delete props.children;

		let className = this.state.checked ? "fa fa-check-square-o fa-fw" : "fa fa-square-o fa-fw";

		return (
			<span className={className} onClick={this.onClick}/>
		);
	}
}
