import * as React from "react";
import * as ReactDOM from "react-dom";
import $ from "../modules/jquery";
import * as _ from "lodash";
import SmartComponent from "../ui/SmartComponent";

export type ComboBoxOption = (string | { label: any, value: any });

export interface ComboBoxProps extends React.HTMLProps<ComboBox>
{
	options?:ComboBoxOption[];
	value?:any;
	onChange?:(value:any)=>void;
	onAdd?:(value:any)=>void;
	selectFirstOnInvalid?:boolean;
	context?:Element;
	direction?:string;
	valueEqualityFunc?: (valueA:any,valueB:any)=>boolean;
	allowAdditions?:boolean;
	type?:string;
	fluid?:boolean;
	header?:React.ReactChild
	optionStyle?:React.CSSProperties;
}

export interface ComboBoxState
{
	value: any;
}

export default class ComboBox extends SmartComponent<ComboBoxProps, ComboBoxState>
{
	element:Element;
	labelsHTML:HTMLDivElement[] = [];
	
	static defaultProps:ComboBoxProps = {
		fluid:true
	};

	constructor(props:ComboBoxProps)
	{
		super(props);
		this.state = {
			value: this.props.value === undefined ? null : this.props.value
		}
	}
	
	private getIndexFromValue(value:any):number
	{
		let equalityFunc = this.props.valueEqualityFunc || _.isEqual;
		return this.props.options.findIndex((option) => (typeof option === "object") ? equalityFunc(option.value, value) : equalityFunc(option, value) );
	}
	
	componentWillReceiveProps(nextProps: ComboBoxProps)
	{
		var value = nextProps.value;

		if (nextProps.selectFirstOnInvalid && this.getIndexFromValue(value) < 0)
		{
			this.setState({value}); // TODO this is incorrect
		}
		else if (value !== undefined)
		{
			this.setState({value});
		}
	}

	componentDidUpdate(prevProps:ComboBoxProps, prevState:ComboBoxState)
	{
		if (!_.isEqual(prevState.value, this.state.value))
		{
			if(this.state.value)
				this.props.onChange && this.props.onChange(this.state.value);
			let selector = ($(this.element) as any);
			let index = this.getIndexFromValue(this.state.value);
			let option = this.props.options[index];
			selector.dropdown("set value", index);
			selector.dropdown("set text", (typeof option === "object") ?  this.labelsHTML[index] : option);
		}
	}
	
	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		let selector = ($(this.element) as any);
		
		selector.dropdown({
			onChange: (selected:number, text:string) => {
				if(this.props.onAdd && text &&  (Number(index) < 0) )
				{
					this.props.onAdd && this.props.onAdd(text);
				}
				else
				{
					let option = this.props.options[selected];
					let value:any = (typeof option === "object") ? option.value : option;
					this.setState({value});
					this.props.onChange && this.props.onChange(value);
				}
			},
			onClick: (index:number) => {
				this.props.onClick && this.props.onClick(null);
			},
			context: this.props.context || window,
			direction: this.props.direction || 'auto',
			allowAdditions: this.props.allowAdditions || false
		});
		let index = this.getIndexFromValue(this.state.value);
		let option = this.props.options[index];
		selector.dropdown("set value", index);
		selector.dropdown("set text", (typeof option === "object") ? this.labelsHTML[index] : option);
	}

	render()
	{
		let index = this.getIndexFromValue(this.state.value);
		let option = this.props.options[index];

		return (
			<div onClick={this.props.onClick} className={"ui " + (this.props.type || "") + (this.props.fluid ? " fluid":"") +" selection dropdown " + (this.props.className || "")} style={this.props.style}>
				<input type="hidden"/>
				<i className="dropdown icon"/>
				<div className="default text">{this.props.placeholder}</div>
				<div className="menu">
				{
					this.props.header ? 
					<div className="header">{this.props.header}</div>
					: null
				}
				{
					this.props.options.map((option, index) => <div className="item" style={this.props.optionStyle} ref={(ref) => this.labelsHTML[index] = ref} key={index} data-value={index}>{typeof option === "object" ? option && (option.label || option.value) : option}</div>)
				}
				</div>
			</div>
		);
	}
}
