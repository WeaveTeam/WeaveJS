import * as React from "react";
import * as ReactDOM from "react-dom";
import $ from "../modules/jquery";
import * as _ from "lodash";
import SmartComponent from "../ui/SmartComponent";

export type ComboBoxOption = (string | { label: string, value: any });

export interface ComboBoxProps extends React.HTMLProps<ComboBox>
{
	options?:ComboBoxOption[];
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
	value: any;
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
		this.state = {
			value: this.props.value === undefined ? null : this.props.value
		}
	}
	
	private getIndexFromValue(value:any):number
	{
		let equalityFunc = this.props.valueEqualityFunc || _.isEqual;
		return this.props.options.findIndex((option) => (typeof option === "object") ? equalityFunc(option.value, value) : equalityFunc(option, value) );
	}

	private statesEqual(prevState:ComboBoxState, currentState:ComboBoxState)
	{
		//check if included elements are the same, even if in a different order
		if(this.props.type === "multiple"){
			if(prevState.value.length !== currentState.value.length)
				return false;
			prevState.value.forEach( (item:any,index:number) => {
				if(!_.includes(currentState.value,item))
					return false;
			});
			return true;
		} else {
			return _.isEqual(prevState.value, currentState.value)
		}
	}
	
	componentWillReceiveProps(nextProps: ComboBoxProps)
	{
		var value = nextProps.value;

		if (nextProps.selectFirstOnInvalid && this.getIndexFromValue(value) < 0)
		{
			let option = nextProps.options[0];
			if(option)
				this.setState({value:(typeof option === "object") ? option.value : option});
		}
		else if (value !== undefined)
		{
			this.setState({value});
		}
		else {
			this.setState({value:null});
		}
	}

	componentDidUpdate(prevProps:ComboBoxProps, prevState:ComboBoxState)
	{
		//if (!_.isEqual(prevState.value, this.state.value)) {
		if (!this.statesEqual(prevState,this.state)) {
			let selector = ($(this.element) as any);
			if (this.props.type === "multiple") {
				let indices:string[] = [];
				this.state.value.forEach((item:any) => {
					let index:number = this.getIndexFromValue(item);
					if (index >= 0)
						indices.push(String(index));
				});
				selector.dropdown('set exactly', indices)
			}
			else {
				let index = this.getIndexFromValue(this.state.value);
				if (index >= 0) {
					let option = this.props.options[index];
					selector.dropdown('set selected', (typeof option === "object") ? option.label : option);
				} else {
					selector.dropdown('clear');
				}
			}
			this.props.onChange && this.props.onChange(this.state.value);
		}
	}
	
	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		let selector = ($(this.element) as any);
		
		selector.dropdown({
			onChange: (selected:number|string, text:string) => {
				if(this.props.onNew && text &&  (Number(index) < 0) )
				{
					this.props.onNew && this.props.onNew(text);
				}
				else
				{
					if(this.props.type !== "multiple") {
						let option = this.props.options[selected as number];
						let value:any = (typeof option === "object") ? option.value : option;
						this.setState({value});
						this.props.onChange && this.props.onChange(value);
					} else {
						let indices:number[] = (selected as string).split(",").map(Number);
						let values:any[] = indices.map( (index) => {
							let option = this.props.options[index];
							return (typeof option === "object") ? option.value : option;
						});
						this.setState({value:values});
					}


				}
			},
			onClick: (index:number) => {
				this.props.onClick && this.props.onClick(null);
			},
			onAdd: (addedValue:number, addedText:string) => {
				let option = this.props.options[addedValue];
				let value:any = (typeof option === "object") ? option.value : option;
				let values:any = _.clone(this.state.value);
				if(!_.includes(values,value)) {
					values.push(value);
					this.setState({value:values});
				}
				this.props.onAdded && this.props.onAdded(value);
			},
			onRemove: (removedValue:number, removedText:string) => {
				let option = this.props.options[removedValue];
				let value:any = (typeof option === "object") ? option.value : option;
				let values:any = _.without(this.state.value,value);
				this.setState({value:values});
				this.props.onRemoved && this.props.onRemoved(value);
			},
			context: this.props.context || window,
			direction: this.props.direction || 'auto',
			allowAdditions: this.props.allowAdditions || false
		});
		let index = this.getIndexFromValue(this.state.value);
		let option = this.props.options[index];
		if(this.props.type === "multiple")
		{
			let indices:string[] = [];
			this.state.value.forEach((item:any) => {
				let index:number = this.getIndexFromValue(item);
				if (index >= 0)
					indices.push(String(index));
			});
			selector.dropdown('set exactly', indices)
		}
		else if(index >= 0)
			selector.dropdown('set selected',(typeof option === "object") ? option.label:option);
		else
			selector.dropdown('clear');
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
					this.props.options.map((option, index) => <div className="item" style={this.props.optionStyle} key={index} data-value={index}>{typeof option === "object" ? option && (option.label || option.value) : option}</div>)
				}
				</div>
			</div>
		);
	}
}
