import * as React from "react";
import Input from "./Input";
import ComboBox, {ComboBoxOption} from "./ComboBox";
import {linkReactStateRef} from "../util/WeaveReactUtils";
import LinkableString = weavejs.core.LinkableString;
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
							if (keyType == "string")
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
