import * as React from "react";
import * as ReactDOM from "react-dom";
import $ from "../modules/jquery";
import * as _ from "lodash";

export interface DropdownProps extends React.HTMLProps<Dropdown>
{
	options: (string | { label: string, value: any })[];
	value?:any;
	onChange?:(value:any)=>void;
	selectFirstOnInvalid?:boolean;
}

export interface DropdownState
{
	value: any;
}

export default class Dropdown extends React.Component<DropdownProps, DropdownState>
{
	element:Element;
	
	constructor(props:DropdownProps)
	{
		super(props);
		this.state = {
			value: this.props.value || null
		}
	}
	
	private getIndexFromValue(value:any):number
	{
		return this.props.options.findIndex((option) => (typeof option === "object") ? _.isEqual(option.value, value) : _.isEqual(option, value) );
	}
	
	componentWillReceiveProps(nextProps: DropdownProps)
	{
		var value = nextProps.value;
		if (value &&  this.getIndexFromValue(value) >= 0)
		{
			this.setState({value});
		}
		else {
			if (nextProps.selectFirstOnInvalid) {
				this.setState({value: this.props.options[0]});
			}
		}
	}

	componentDidUpdate(prevProps:DropdownProps, prevState:DropdownState)
	{
		if(prevState.value && this.state.value && !_.isEqual(prevState.value, this.state.value)) {
			this.props.onChange && this.props.onChange(this.state.value);
			let selector = ($(this.element) as any);
			let option = this.props.options[this.getIndexFromValue(this.state.value)];
			selector.dropdown("set value", this.state.value);
			selector.dropdown("set text", (typeof option === "object") ? option.label : option);
		}
	}
	
	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		let selector = ($(this.element) as any);
		
		selector.dropdown({
			onChange: (index:number) => {
				let option = this.props.options[index];
				let value:any = (typeof option === "object") ? option.value : option;
				this.setState({value})
			}
		});

		let option = this.props.options[this.getIndexFromValue(this.state.value)];
		selector.dropdown("set value", this.state.value);
		selector.dropdown("set text", (typeof option === "object") ? option.label : option);
	}

	render()
	{
		return (
			<div className={"ui selection dropdown " + (this.props.className || "")} style={this.props.style}>
				<input type="hidden"/>
				<i className="dropdown icon"/>
				<div className="default text">{this.props.placeholder}</div>
				<div className="menu">
				{
					this.props.options.map((option, index) => <div className="item" key={index} data-value={index}>{typeof option === "object" ? option && (option.label || option.value) : option}</div>)
				}
				</div>
			</div>
		);
	}
}
