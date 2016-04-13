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
	context?:Element;
	direction?:string;
	valueEqualityFunc?: (valueA:any,valueB:any)=>boolean;
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
		let equalityFunc = this.props.valueEqualityFunc || _.isEqual;
		return this.props.options.findIndex((option) => (typeof option === "object") ? equalityFunc(option.value, value) : equalityFunc(option, value) );
	}
	
	componentWillReceiveProps(nextProps: DropdownProps)
	{
		var value = nextProps.value;

		if (nextProps.selectFirstOnInvalid && this.getIndexFromValue(value) < 0)
		{
			this.setState({value});
		}
		else if (value !== undefined)
		{
			this.setState({value});
		}
	}

	componentDidUpdate(prevProps:DropdownProps, prevState:DropdownState)
	{
		if (!_.isEqual(prevState.value, this.state.value)) {
			if(this.state.value)
				this.props.onChange && this.props.onChange(this.state.value);
			let selector = ($(this.element) as any);
			let index = this.getIndexFromValue(this.state.value);
			let option = this.props.options[index];
			selector.dropdown("set value", index);
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
			},
			onClick: (index:number) => {
				this.props.onClick && this.props.onClick(null);
			},
			context: this.props.context || null,
			direction: this.props.direction || 'auto'
		});
		let index = this.getIndexFromValue(this.state.value);
		let option = this.props.options[index];
		selector.dropdown("set value", index);
		selector.dropdown("set text", (typeof option === "object") ? option.label : option);
	}

	render()
	{
		return (
			<div onClick={this.props.onClick} className={"ui selection dropdown " + (this.props.className || "")} style={this.props.style}>
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
