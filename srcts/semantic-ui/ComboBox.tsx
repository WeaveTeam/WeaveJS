import * as React from "react";
import * as ReactDOM from "react-dom";
import ReactUtils from "../utils/ReactUtils";
import $ from "../modules/jquery";
import * as _ from "lodash";
import SmartComponent from "../ui/SmartComponent";

export type ComboBoxOption = { label: string, value: any };

export interface ComboBoxProps extends React.HTMLProps<ComboBox>
{
	options?: (string | { label: string, value: any })[];
	valueIncludesLabel?:boolean;
	value?:any;
	onChange?:(value:any)=>void;
	onNew?:(value:any)=>void;
	onRemoved?:(value:any)=>void;
	onAdded?:(value:any)=>void;
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
	value?: any; // value is always the value property of an option or an array of value property
	options?: ComboBoxOption[]; // always a {value: any, label: string} array
}

export default class ComboBox extends SmartComponent<ComboBoxProps, ComboBoxState>
{
	element:Element;
	
	static defaultProps:ComboBoxProps = {
		fluid:true
	};
	
	constructor(props:ComboBoxProps)
	{
		super(props);
		
		this.state = this.normalizeState(props);
	}
	
	normalizeState(props:ComboBoxProps):ComboBoxState
	{
		var options:ComboBoxOption[] = props.options.map(this.getOption);

		var value:any = props.value;
		if(props.valueIncludesLabel)
		{
			if(Array.isArray(props.value))
			{
				value = props.value.map((val:any) => val.value);
				options = _.uniq(_.union(props.value, options), "value")
			}
			else
			{
				value = props.value && props.value.value;
				options = _.uniq(_.union([props.value], options), "value");
			}
		}
		return {
			value: value,
			options: options
		}
	}

	getOption(option:(string | { label: string, value: any })):ComboBoxOption
	{
		if(typeof option === "object" && option)
		{
			return option;
		}
		else
		{
			return {
				label: option as string,
				value: option as string
			}
		}
	}
	
	private getIndexFromValue(value:any):number
	{
		let equalityFunc = this.props.valueEqualityFunc || _.isEqual;
		return this.state.options && this.state.options.findIndex((option) => {
			return equalityFunc(option.value, value);
		});
	}

	componentWillReceiveProps(nextProps: ComboBoxProps)
	{
		this.setState(this.normalizeState(nextProps));
	}

	componentDidMount() {
		this.forceUpdate();
	}
	
	componentDidUpdate(prevProps:ComboBoxProps, prevState:ComboBoxState) {
		this.element = ReactDOM.findDOMNode(this);
		let selector = ($(this.element) as any);
		selector.dropdown({
			onChange: (selected:string, text:string) => {
				if (this.props.onNew && text) {
					this.props.onNew && this.props.onNew(text);
				}
				else {
					if (selected !== "") {
						if (this.props.type !== "multiple") {
							let index = Number(selected.substr(2));
							let value:any = this.state.options[index] && this.state.options[index].value;
							this.setState({value});
						} else {
							let __indices:string[] = (selected as string).split(",");

							let values:any[] = __indices.map((__index) => {
								let index = Number(__index.substr(2));
								return this.state.options[index] && this.state.options[index].value;
							});
							this.setState({value: values});
						}
					}
				}
			},
			onClick: (index:number) => {
				this.props.onClick && this.props.onClick(null);
			},
			onAdd: (addedValue:string, addedText:string) => {
				let index = Number(addedValue.substr(2));
				let option = this.state.options[index];
				let value:any = option && option.value;
				let values:any = _.clone(this.state.value);
				if (ReactUtils.hasFocus(this) && !_.includes(values, value)) {
					values.push(value);
					this.setState({value: values});
					this.props.onAdded && this.props.onAdded(value);
				}
			},
			onRemove: (removedValue:string, removedText:string) => {
				let index = Number(removedValue.substr(2));
				let option = this.state.options[index];
				let value:any = option && option.value;
				if (ReactUtils.hasFocus(this)) {
					let values:any = _.without(this.state.value, value);
					this.setState({value: values});
					this.props.onRemoved && this.props.onRemoved(value);
				}
			},
			context: this.props.context || window,
			direction: this.props.direction || 'auto',
			allowAdditions: this.props.allowAdditions || false,
			match: "text"
		});

		if (this.props.type === "multiple") {
			let indices:string[] = [];
			this.state.value.forEach((item:any) => {
				let index:number = this.getIndexFromValue(item);
				if (index >= 0)
					indices.push("__"+index);
			});
			selector.dropdown('set exactly', indices);
		}
		else
		{
			//single selection
			let index = this.getIndexFromValue(this.state.value);
			if (index >= 0)
				selector.dropdown('set exactly', "__"+index);
			else {
				if (!this.props.onNew)
					selector.dropdown('clear');
			}
		}
		this.props.onChange && this.props.onChange(this.state.value);
	}

	render()
	{
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
					//We are using __ index because semantic UI will misbehave when data-value and labels collide
					this.state.options && this.state.options.map((option, index) => <div className="item" style={this.props.optionStyle} key={index} data-value={"__"+index}>{Weave.lang(option.label)}</div>)
				}
				</div>
			</div>
		);
	}
}
