import * as _ from "lodash";
import LinkableVariable = weavejs.core.LinkableVariable;
import {VBox, HBox} from "../react-ui/FlexBox";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ReactUtils from "../utils/ReactUtils";
import Menu from "../react-ui/Menu";
import Input from "../semantic-ui/Input";

export interface StatefulTextAreaProps extends React.HTMLProps<StatefulTextArea> {
	selectOnFocus?:boolean;
	fluid?:boolean;
}

export interface StatefulTextAreaState {
	value: string|string[];
}

export default class StatefulTextArea extends React.Component<StatefulTextAreaProps, StatefulTextAreaState>
{
	textArea:HTMLTextAreaElement;

	constructor(props: StatefulTextAreaProps) {
		super(props);
		this.state = {
			value: props.value
		};
	}

	static defaultProps:StatefulTextAreaProps = {
		fluid:true,
		disabled:false
	};

	handleSelectOnFocus = () =>
	{
		if(this.props.selectOnFocus)
		{
			this.textArea.select();
		}
	};

	handleTextAreaChange = (event: React.FormEvent): void=> {
		let value = (event.target as HTMLInputElement).value;
		this.setState({ value: value || ""});
	};

	render(): JSX.Element {
		return (
			<div className="ui form">
				<textarea rows={4}
					{...this.props as any}
					   ref={(textArea:HTMLTextAreaElement) => this.textArea = textArea}
					   onChange={this.handleTextAreaChange}
					   onBlur={this.handleTextAreaChange}
					   onSubmit={this.handleTextAreaChange}
					   onFocus={this.handleSelectOnFocus}
					   value={this.state.value}
				/>
			</div>
		);
	}
}
