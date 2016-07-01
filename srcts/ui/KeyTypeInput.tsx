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

	changeListener=(content:string):void =>
	{
		this.props.keyTypeProperty.value = content;
	};

	render(): JSX.Element {
		let options = weavejs.WeaveAPI.QKeyManager.getAllKeyTypes().map( (keyType:string,index:number) =>
						{
							if(keyType == "string")
							{
								return null
							}
							return {label:keyType, value:keyType} as ComboBoxOption;
						}).filter((option:ComboBoxOption)=> option?true:false);

		// none option value should be null, while generating metadata if its null, datasource sets to "string"
		return (
			<ComboBox style={{width: "100%"}}
			          noneOption={{label:"(None)", value:null}}
			          ref={linkReactStateRef(this, { value: this.props.keyTypeProperty }) }
			          options={options}
			          allowAdditions={true}
			          searchable={true}
			          onChange={this.changeListener}
			/>
		);
	}
}
