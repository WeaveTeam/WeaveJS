import * as React from "react";
import * as ReactDOM from "react-dom";
import $ from "../modules/jquery";
import * as _ from "lodash";

export interface CheckboxProps extends React.HTMLProps<Checkbox>
{
	type?: string;
	label?: string;
	name?: string;
	style?: React.CSSProperties;
	stopPropagation?: boolean;
}

export interface CheckboxState
{
	checked?:boolean;
}

export default class Checkbox extends React.Component<CheckboxProps, CheckboxState>
{
	element:Element;

	constructor(props:CheckboxProps)
	{
		super(props);
	}

	static defaultProps:CheckboxProps = {
		type: "toggle"
	};

	state: CheckboxState = { checked: false };

	onClick=(event:React.MouseEvent)=>
	{
		if (this.props.stopPropagation)
			event.stopPropagation();
	};

	componentDidUpdate(prevProps:CheckboxProps, prevState:CheckboxState)
	{
		if(!_.isEqual(prevState.checked,this.state.checked)) {
			let selector = ($(this.element) as any);
			if(this.state.checked)
				selector.checkbox("set checked");
		}
	}

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		let selector = ($(this.element) as any);
		let checkbox = this;

		selector.checkbox({
			onChange: () => {
				checkbox.setState({ checked: this.state.checked});
			}
		});

		if (this.state.checked) {
			selector.checkbox('set checked');
		}
	}

	render()
	{
		var props = _.clone(this.props);
		delete props.children;

		return (
			<div className={"ui " + this.props.type + " checkbox " + (this.props.className || "")}>
				<input {...props as any} onClick={this.onClick} type="checkbox" name={this.props.name}/>
				{this.props.label ? <label>{this.props.label}</label>:null}
			</div>
		);
	}
}
