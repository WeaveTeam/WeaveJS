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
			value: null
		};
	}
	
	private getIndexFromValue(value:any):number
	{
		return this.props.options.findIndex((option) => _.isEqual(option, value));
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
		($(this.element) as any).dropdown("set selected", this.state.value);
		if(!_.isEqual(prevState.value,this.state.value))
			this.props.onChange && this.props.onChange(this.state.value);
	}
	
	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		
		($(this.element) as any).dropdown({
			selected: this.getIndexFromValue(this.props.value),
			onChange: (index:number) => {
				this.props.onChange && this.props.onChange(this.props.options[index])
			}
		});
	}

	render()
	{
		return (
			<div className={"ui selection dropdown " + (this.props.className || "")}>
				<input type="hidden"/>
				<i className="dropdown icon"/>
				<div className="default text">{this.props.placeholder}</div>
				<div className="menu">
				{
					this.props.options.map((option, index) => <div className="item" key={index} data-value={index}>{typeof option === "object" ? (option.label || option.value) : option}</div>)
				}
				</div>
			</div>
		);
	}
}
