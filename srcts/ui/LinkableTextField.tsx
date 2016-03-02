import LinkableVariable = weavejs.core.LinkableVariable;
import * as React from "react";
import {WeaveReactSynchronizer} from "../utils/WeaveReactUtils";

export interface LinkableTextFieldProps {
	target: LinkableVariable;
	delay?: number;
	placeholder?: string;
	style?: React.CSSProperties;
}

export interface LinkableTextFieldState {
	content: string;
}

export default class LinkableTextField extends React.Component<LinkableTextFieldProps, LinkableTextFieldState>
{
	constructor(props: LinkableTextFieldProps) {
		super(props);
		this.componentWillReceiveProps();
	}

	state: LinkableTextFieldState = { content: "" };
	synchronizer: WeaveReactSynchronizer;

	componentWillReceiveProps(): void {
		if (this.synchronizer) {
			this.synchronizer.dispose()
			this.synchronizer = null;
		}
		if (this.props.target) {
			this.synchronizer = new WeaveReactSynchronizer(this, this.props.target, this, ["content"], this.props.delay);
		}
	}

	handleInputChange = (event: React.FormEvent): void=> {
		this.setState({ content: (event.target as HTMLInputElement).value || "" });
	}

	render(): JSX.Element {
		return <input style={this.props.style} placeholder={this.props.placeholder} onBlur={this.handleInputChange} onChange={this.handleInputChange} disabled={!this.props.target} type="text" value={this.state.content}/>
	}
}