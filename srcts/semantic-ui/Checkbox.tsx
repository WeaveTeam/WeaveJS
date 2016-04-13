import * as React from "react";
import * as ReactDOM from "react-dom";
import $ from "../modules/jquery";
import * as _ from "lodash";
import SmartComponent from "../ui/SmartComponent";

export interface CheckboxProps extends React.Props<Checkbox>
{
	type?: string;
	label?: string;
	name?: string;
	style?: React.CSSProperties;
	stopPropagation?: boolean;
	onChange?: (value:boolean) => void;
	className?:string;
	value?:boolean;
	title?:string;
}

export interface CheckboxState
{
	value?:boolean;
}

export default class Checkbox extends SmartComponent<CheckboxProps, CheckboxState>
{
	element:Element;

	constructor(props:CheckboxProps)
	{
		super(props);
		this.state = {
			value: !!props.value
		}
	}

	static defaultProps:CheckboxProps = {
		type: "toggle"
	};

	onClick=(event:React.MouseEvent)=>
	{
		if (this.props.stopPropagation)
			event.stopPropagation();
	};
	
	componentWillReceiveProps(nextProps:CheckboxProps)
	{
		this.setState({
			value: !!nextProps.value
		});
	}

	componentDidUpdate(prevProps:CheckboxProps, prevState:CheckboxState)
	{
		if(!_.isEqual(prevState.value, this.state.value)) {
			let selector = ($(this.element) as any);
			if(this.state.value)
				selector.checkbox("set checked");
			else
				selector.checkbox("set unchecked");
			this.props.onChange && this.props.onChange(this.state.value);
		}
	}

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		let selector = ($(this.element) as any);
		let checkbox = this;
		selector.checkbox({
			onChecked: () => {
				checkbox.setState({ value: true});
			},
			onUnchecked: () => {
				checkbox.setState({ value: false});
			}
		});
		if(this.state.value)
			selector.checkbox('set checked', !!this.state.value);
		else
			selector.checkbox('set unchecked')
	}

	render()
	{
		var props = _.clone(this.props);
		delete props.children;

		return (
			<div className={"ui " + this.props.type + " checkbox " + (this.props.className || "")}>
				<input {...props as any} onClick={this.onClick} type="checkbox" title={this.props.title} name={this.props.name}/>
				{this.props.label ? <label>{this.props.label}</label>:null}
			</div>
		);
	}
}
