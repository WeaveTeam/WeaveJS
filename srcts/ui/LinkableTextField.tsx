import LinkableVariable = weavejs.core.LinkableVariable;
import * as React from "react";

export interface LinkableTextFieldProps {
	style?: React.CSSProperties;
	placeholder?: string;
}

export interface LinkableTextFieldState {
	content: string;
}

export default class LinkableTextField extends React.Component<LinkableTextFieldProps, LinkableTextFieldState>
{
	constructor(props: LinkableTextFieldProps) {
		super(props);
	}

	state: LinkableTextFieldState = { content: "" };

	handleInputChange = (event: React.FormEvent): void=> {
		this.setState({ content: (event.target as HTMLInputElement).value || "" });
	}

	render(): JSX.Element {
		return <input style={this.props.style} placeholder={this.props.placeholder} onBlur={this.handleInputChange} onChange={this.handleInputChange} type="text" value={this.state.content}/>
	}
}