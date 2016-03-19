import * as _ from "lodash";
import LinkableVariable = weavejs.core.LinkableVariable;
import * as React from "react";

export interface StatefulTextFieldProps extends React.HTMLProps<StatefulTextField> {
	style?: React.CSSProperties;
	suggestions?: string[];
	selectOnFocus?: boolean;
}

export interface StatefulTextFieldState {
	content: string;
}

export default class StatefulTextField extends React.Component<StatefulTextFieldProps, StatefulTextFieldState>
{
	constructor(props: StatefulTextFieldProps) {
		super(props);
	}

	inputGuid = weavejs.util.StandardLib.guid();
	listGuid = weavejs.util.StandardLib.guid();

	state: StatefulTextFieldState = { content: "" };

	handleInputChange = (event: React.FormEvent): void=> {
		this.setState({ content: (event.target as HTMLInputElement).value || "" });
	}

	onFocus=(event:React.FormEvent):void=>{
		let input = (event.target as HTMLInputElement)
		if (this.props.selectOnFocus)
			input.setSelectionRange(0, input.value.length);
	}

	render(): JSX.Element {
		var props = _.clone(this.props);
		delete props.children;
		if (this.props.suggestions && this.props.suggestions.length > 0)
		{

			let listId: string = weavejs.util.StandardLib.guid();
			let inputElement = <input style={this.props.style}
				onFocus={this.onFocus} onBlur={this.handleInputChange} onChange={this.handleInputChange}
				type="text" value={this.state.content}
				{...props as any}
				list={listId}
				/>;

			let list = <datalist id={listId}>{this.props.suggestions.map(key => <option key={key} value={key}/>)}</datalist>;

			return <div>
				{[inputElement, list]}
			</div>;
		}
		else
		{
			return (
				<input
					{...props as any}
					style={_.merge({width: "100%"}, this.props.style)}
					type="text"
					onFocus={this.onFocus}
					onBlur={this.handleInputChange}
					onChange={this.handleInputChange}
					value={this.state.content}
				/>
			);
		}
	}
}