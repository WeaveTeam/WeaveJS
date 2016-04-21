import * as _ from "lodash";
import LinkableString = weavejs.core.LinkableString;
import * as React from "react";
import * as ReactDOM from "react-dom";
import Input from "../semantic-ui/Input";
import ComboBox from "../semantic-ui/ComboBox";
import {ComboBoxOption} from "../semantic-ui/ComboBox";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import WeaveAPI = weavejs.WeaveAPI;

export interface KeyTypeInputProps extends React.HTMLProps<Input> {
	keyTypeProperty: LinkableString;
}

export interface KeyTypeInputState {

}

export default class KeyTypeInput extends React.Component<KeyTypeInputProps, KeyTypeInputState>
{
	constructor(props: KeyTypeInputProps) {
		super(props);
		props.keyTypeProperty.addGroupedCallback(this, this.forceUpdate, true);
	}
	private input:Input;
	private element:Element;

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this.input);
		
		($(this.element) as any).dropdown();
	}

	render(): JSX.Element {
		let keyTypes = WeaveAPI.QKeyManager.getAllKeyTypes();
		
		return (
			<ComboBox style={{width: "100%"}}
			          ref={linkReactStateRef(this, { value: this.props.keyTypeProperty }) }
			          options={[({label: "(None)", value: "string"} as ComboBoxOption)].concat(weavejs.WeaveAPI.QKeyManager.getAllKeyTypes().map( (keyType:string,index:number) => {
					return {label:keyType, value:keyType} as ComboBoxOption;
				}))}
			          allowAdditions={true}
			          type="search"
			          onNew={(content:string):void=>{
				    this.props.keyTypeProperty.value = content;
				 }}
			/>
		);
	}
}
