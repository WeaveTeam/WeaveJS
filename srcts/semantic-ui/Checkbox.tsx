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
		type: ""
	};
	
	componentWillReceiveProps(nextProps:CheckboxProps)
	{
		this.setState({
			value: !!nextProps.value
		});
	}

	componentDidUpdate(prevProps:CheckboxProps, prevState:CheckboxState)
	{
		if(this.state.value)
			($(this.element) as any).checkbox("set checked")
		else
			($(this.element) as any).checkbox("set unchecked")
	}
	
	handleChange=(event:React.MouseEvent)=>
	{
		if (this.props.stopPropagation)
			event.stopPropagation();

		this.setState({
			value: !this.state.value
		})

		this.props.onChange && this.props.onChange(!this.state.value);
	}

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		($(this.element) as any).checkbox();
		if(this.state.value)
			($(this.element) as any).checkbox("set checked")
		else
			($(this.element) as any).checkbox("set unchecked")
	}

	render()
	{
		var props = _.clone(this.props);
		delete props.children;

		return (
			<div className={"ui " + this.props.type + " checkbox " + (this.props.className || "")} onClick={this.handleChange}>
				<input {...props as any} type="checkbox" value={String(this.state.value)} title={this.props.title} name={this.props.name}/>
				{this.props.label ? <label>{this.props.label}</label>:null}
			</div>
		);
	}
}
