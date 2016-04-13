import * as _ from "lodash";
import LinkableString = weavejs.core.LinkableString;
import * as React from "react";
import * as ReactDOM from "react-dom";
import Input from "../semantic-ui/Input";
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

	onInputFinished=(content:string):void=>{
		this.props.keyTypeProperty.value = content;
	}

	// componentDidUpdate(prevProps:DropdownProps, prevState:DropdownState)
	// {
	// 	($(this.element) as any).dropdown("set selected", this.state.value);
	// 	if(!_.isEqual(prevState.value,this.state.value))
	// 		this.props.onChange && this.props.onChange(this.state.value);
	// }
	// 
	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this.input);
		
		($(this.element) as any).dropdown()
		// {
		// 	selected: this.getIndexFromValue(this.props.value),
		// 	onChange: (index:number) => {
		// 		this.props.onChange && this.props.onChange(this.props.options[index])
		// 	}
		// });
	}

	render(): JSX.Element {
		let keyTypes = WeaveAPI.QKeyManager.getAllKeyTypes();
		
		return (
			<div>
				<Input ref={(input:Input) => this.input = input} className="dropdown" {...this.props}>
					<i className="dropdown icon"/>
				</Input>
				<div className="menu">
					{
						keyTypes.map((keyType, index) => <div className="item" key={index} data-value={keyType}>{keyType}</div>)
					}
				</div>
			</div>
		);
	}
}
