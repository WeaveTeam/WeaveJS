import * as React from "react";
import * as _ from "lodash";
import ReactCodeMirror from "weaveapp/modules/react-codemirror";

import * as weavejs from "weavejs";
import {Weave} from "weavejs";

import SmartComponent = weavejs.ui.SmartComponent;

export interface JSONEditorProps
{
	style?: React.CSSProperties
}

export interface JSONEditorState
{
	value?:any,
	error?:Error
}

export default class JSONEditor extends SmartComponent<JSONEditorProps, JSONEditorState>
{
	json:string;
	parsed:any;

	constructor(props:JSONEditorProps)
	{
		super(props);
	}

	onFocusChange=(focused:boolean):void=>
	{
		if (!focused && this.state.error)
		{
			this.json = null;
			this.parsed = null;
			this.setState({error: null});
		}
	}

	handleJSON=(json:string):void=>
	{
		try
		{
			this.json = json;
			this.parsed = JSON.parse(json);
			this.setState({
				value: this.parsed,
				error: null
			});
		}
		catch (error)
		{
			this.parsed = null;
			this.setState({error});
		}
	}

	render():JSX.Element
	{
		if (!this.state.error && !_.isEqual(this.state.value, this.parsed))
		{
			this.json = Weave.stringify(this.state.value, null, '\t', true);
			this.parsed = this.state.value;
		}

		return (
			<ReactCodeMirror
				className={this.state.error ? 'weave-error-border' : 'weave-normal-border'}
				onFocusChange={this.onFocusChange}
				options={{
					mode: "javascript",
					lineNumbers: false,
					lineWrapping: false,
					smartIndent: false,
					//matchBrackets: true,
					theme: "eclipse",
					readOnly: false
				}}
				value={this.json}
				onChange={this.handleJSON}
			/>
		);
	}
}
