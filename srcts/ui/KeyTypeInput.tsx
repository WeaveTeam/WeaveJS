import * as _ from "lodash";
import LinkableString = weavejs.core.LinkableString;
import * as React from "react";
import * as ReactDOM from "react-dom";
import {StatefulTextFieldProps} from "./StatefulTextField";
import StatefulTextField from "./StatefulTextField";
import WeaveAPI = weavejs.WeaveAPI;

export interface KeyTypeInputProps extends StatefulTextFieldProps {
	keyTypeProperty: LinkableString;
}

export interface KeyTypeInputState {

}

export default class KeyTypeInput extends React.Component<KeyTypeInputProps, KeyTypeInputState>
{
	constructor(props: KeyTypeInputProps) {
		super(props);
		this.componentWillReceiveProps(props);
	}

	componentWillReceiveProps(nextProps: KeyTypeInputProps)
	{
		if (this.props && this.props.keyTypeProperty)
		{
			this.props.keyTypeProperty.removeCallback(this, this.updateStatefulTextField);
		}
		if (nextProps && nextProps.keyTypeProperty)
		{
			nextProps.keyTypeProperty.addGroupedCallback(this, this.updateStatefulTextField, true);
		}
	}

	updateStatefulTextField=()=>
	{
		if (!this.textField) 
		{
			console.error("textfield not ready, calling update later.");
			WeaveAPI.Scheduler.callLater(this, this.updateStatefulTextField);
			return;
		}
		this.textField.setState({ content: this.props.keyTypeProperty.value });
	}

	onInputFinished=(content:string):void=>{
		this.props.keyTypeProperty.value = content;
	}

	private textField: StatefulTextField;

	render(): JSX.Element {
		var props = _.clone(this.props);
		delete props.children;
		delete props.suggestions;
		let keyTypes = WeaveAPI.QKeyManager.getAllKeyTypes();
		if (this.props.suggestions)
			keyTypes = this.props.suggestions.concat(keyTypes);
		
		/* make selectOnFocus the default behavior for keyType fields */
		let selectOnFocus: boolean = this.props.selectOnFocus;
		if (selectOnFocus === undefined)
		{
			selectOnFocus = true;
		}

		return (
			<StatefulTextField {...props as any} selectOnFocus={selectOnFocus} ref={(c: StatefulTextField) => this.textField = c} onInputFinished={this.onInputFinished} suggestions={keyTypes}/>
		);
	}
}
