import * as React from "react";
import * as ReactDOM from "react-dom";
import $ from "../modules/jquery";
import * as _ from "lodash";
import SmartComponent from "../ui/SmartComponent";
import {MenuItemProps} from "../react-ui/Menu";
import Menu from "../react-ui/Menu"

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
}

export interface DropdownState
{
	value: any;
}

export default class Dropdown extends SmartComponent<DropdownProps, DropdownState> {
	element:Element;

	static defaultProps:DropdownProps = {
		type: ""
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
			action: this.props.action || 'activate'
		});
	}

	render() {
		return (
			<div onClick={this.props.onClick}
			     className={"ui " + (this.props.type || "") +" dropdown" + (this.props.className || "")}
			     style={this.props.style}>
				{this.props.children}
				<Menu menu={this.props.menu}/>
			</div>
		);
	}

}