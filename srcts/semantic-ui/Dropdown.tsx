import * as React from "react";
import * as ReactDOM from "react-dom";
import $ from "../modules/jquery";
import * as _ from "lodash";
import SmartComponent from "../ui/SmartComponent";
import {MenuItemProps} from "../react-ui/Menu";
import Menu from "../react-ui/Menu"
import classNames from "../modules/classnames";

export interface DropdownProps extends React.HTMLProps<Dropdown>
{
	value?:any;
	onChange?:(value:any)=>void;
	context?:Element;
	direction?:string;
	valueEqualityFunc?: (valueA:any,valueB:any)=>boolean;
	type?:string;
	action?:string;
	header?:React.ReactChild
	optionStyle?:React.CSSProperties;
	menu?:MenuItemProps[];
	on?:string;
	duration?: number;
	open?:boolean;
}

export interface DropdownState
{
	value: any;
}

export default class Dropdown extends SmartComponent<DropdownProps, DropdownState> {
	element:Element;

	static defaultProps:DropdownProps = {
		type: "",
		on: "click",
		duration: 200,
		open: false
	};

	constructor(props:DropdownProps) {
		super(props);
		this.state = {
			value: this.props.value === undefined ? null : this.props.value
		}
	}

	componentWillReceiveProps(nextProps:DropdownProps) {
		var value = nextProps.value;

		if (value !== undefined) {
			this.setState({value});
		}
	}

	componentDidUpdate(prevProps:DropdownProps, prevState:DropdownState) {
		if (!_.isEqual(prevState.value, this.state.value)) {
			if (this.state.value)
				this.props.onChange && this.props.onChange(this.state.value);
		}
		($(this.element) as any).dropdown('refresh');
	}

	componentDidMount() {
		this.element = ReactDOM.findDOMNode(this);
		let selector = ($(this.element) as any);

		selector.dropdown({
			onChange: (selected:number, text:string) => {
			},
			onClick: (index:number) => {
				this.props.onClick && this.props.onClick(null);
			},
			context: this.props.context || window,
			direction: this.props.direction || 'auto',
			action: this.props.action || 'activate',
			on: this.props.on || 'click',
			duration: this.props.duration
		});

		if(this.props.open)
			selector.dropdown('show');
	}

	componentWillUnmount() {
		let selector = ($(this.element) as any);
		selector.dropdown('hide');
	}

	render() {
		var dropdownClass = classNames(
			{
				"ui dropdown": true,
			},
			this.props.type,
			this.props.className
		);

		return (
			<div onClick={this.props.onClick}
			     onMouseEnter={this.props.onMouseEnter}
			     onMouseLeave={this.props.onMouseLeave}
			     className={dropdownClass}
			     style={this.props.style}>
				{this.props.children}
				<Menu menu={this.props.menu}/>
			</div>
		);
	}

}