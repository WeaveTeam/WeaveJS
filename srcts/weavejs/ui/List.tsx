import * as React from "react";
import * as _ from "lodash";
import classNames from "../../modules/classnames";
import {HBox} from "./flexbox/FlexBox";
import {KEYCODES} from "../util/KeyboardUtils";

export type ListOption = {
	value:any,
	label?:string|JSX.Element
}

export interface IListProps extends React.Props<List>
{
	options:ListOption[];
	onChange?:(selectedValues:any[]) => void;
	selectedValues?:any[];
	allowClear?:boolean;
	multiple?:boolean;
	style?:React.CSSProperties;
	className?:string;
}

export interface IListState
{
	selectedValues?:any[];
}

export default class List extends React.Component<IListProps, IListState>
{
	private checkboxes:HTMLElement[];
	private lastIndexClicked:number;
	private values:any[];
	private labels:(string|JSX.Element)[];

	constructor(props:IListProps)
	{
		super(props);
		this.state = {
			selectedValues: props.selectedValues || []
		};
		if (props.selectedValues)
		{
			this.lastIndexClicked = props.selectedValues.length - 1;
		}
		if (this.props.options && this.props.options.length)
		{
			this.values = this.props.options.map((option:ListOption) => option.value);
			this.labels = this.props.options.map((option:ListOption) => option.label);
		}
		else
		{
			this.values = [];
			this.labels = [];
		}
	}

	static defaultProps():IListProps
	{
		return {
			options: [],
			multiple: true,
			allowClear: true
		};
	}

	componentWillReceiveProps(nextProps:IListProps)
	{
		this.values = nextProps.options.map((option:ListOption) => option.value);
		this.labels = nextProps.options.map((option:ListOption) => option.label);
		if (nextProps.selectedValues)
		{
			this.setState({
				selectedValues: nextProps.selectedValues
			});
		}
	}

	handleKeyDown = (event:React.KeyboardEvent)=>
	{
		if (event.shiftKey)
		{
			switch (event.keyCode)
			{
				case KEYCODES.UP_ARROW:
					this.addOrRemovePreviousValue();
					break;
				case KEYCODES.DOWN_ARROW:
					this.addOrRemoveNextValue();
					break;
			}
		}
		else
		{
			switch (event.keyCode)
			{
				case KEYCODES.UP_ARROW:
					this.selectPreviousValue();
					break;
				case KEYCODES.DOWN_ARROW:
					this.selectNextValue();
					break;
			}
		}
	}

	get numberOfOptions()
	{
		return this.props.options.length - 1;
	}

	get minIndex()
	{
		var selectedIndices = this.state.selectedValues.map((selectedValue) => this.values.indexOf(selectedValue));
		return _.max([_.min(selectedIndices) - 1, 0]);
	}

	get maxIndex()
	{
		var selectedIndices = this.state.selectedValues.map((selectedValue) => this.values.indexOf(selectedValue));
		return _.min([_.max(selectedIndices) + 1, this.numberOfOptions]);
	}

	addOrRemoveNextValue()
	{
		if(this.lastIndexClicked != this.numberOfOptions)
		{
			this.lastIndexClicked = _.min([this.lastIndexClicked + 1, this.numberOfOptions]);
			var nextValue = this.props.options[this.lastIndexClicked].value;
			this.addOrRemoveValue(nextValue);
		}
	}

	addOrRemovePreviousValue()
	{
		if(this.lastIndexClicked != 0)
		{
			this.lastIndexClicked = _.max([this.lastIndexClicked - 1, 0]);
			var nextValue = this.props.options[this.lastIndexClicked].value;
			this.addOrRemoveValue(nextValue);
		}
	}

	addOrRemoveValue(value:any)
	{
		// if the value is already in the list unselect it
		var selectedValues:any[];
		if (this.state.selectedValues.indexOf(value) >= 0)
		{
			var selectedValues = _.clone(this.state.selectedValues);
			selectedValues.splice(value, 1);
			this.setState({
				selectedValues
			});
		}
		// otherwise select it
		else
		{
			selectedValues = this.state.selectedValues.concat(value);
			this.setState({
				selectedValues
			});
		}
		// if (this.props.onChange)
		// 	this.props.onChange(selectedValues);
	}


	selectNextValue()
	{
		this.setState({
			selectedValues: [this.props.options[this.maxIndex].value]
		});
		this.lastIndexClicked = this.maxIndex;
	}

	selectPreviousValue()
	{
		this.setState({
			selectedValues: [this.props.options[this.minIndex].value]
		});
		this.lastIndexClicked = this.minIndex;
	}

	handleChange(value:any, event:React.MouseEvent)
	{
		var selectedValues:any[] = this.state.selectedValues.concat();
		// new state of the item in the list
		var currentIndexClicked:number = selectedValues.indexOf(value);

		// ctrl selection
		if (event.ctrlKey || event.metaKey)
		{
			if (currentIndexClicked > -1)
			{
				selectedValues.splice(currentIndexClicked, 1);
			}
			else
			{
				selectedValues.push(value);
			}
			this.lastIndexClicked = currentIndexClicked;
		}
		// multiple selection
		else if (event.shiftKey && this.props.multiple)
		{
			selectedValues = [];
			if (this.lastIndexClicked == null)
			{
				// do nothing
			}
			else
			{
				var start:number = this.lastIndexClicked;
				var end:number = this.values.indexOf(value);

				if (start > end)
				{
					let temp:number = start;
					start = end;
					end = temp;
				}

				for (var i:number = start; i <= end; i++)
				{
					selectedValues.push(this.values[i]);
				}
			}
		}
		// single selection
		else
		{
			// if there was only one record selected
			// and we are clicking on it again, then we want to
			// clear the selection unless allowClear is not enabled.
			if (selectedValues.length == 1 && selectedValues[0] == value && this.props.allowClear)
			{
				selectedValues = [];
				this.lastIndexClicked = null;
			}
			else
			{
				selectedValues = [value];
				this.lastIndexClicked = this.values.indexOf(value);
			}
		}

		if (this.props.onChange)
			this.props.onChange(selectedValues);


		this.setState({
			selectedValues
		});
	}

	render():JSX.Element
	{
		//order in merge is important as props.style is readonly and overlfow "auto" is compulsory
		let styleObj:React.CSSProperties = _.merge({}, this.props.style, {overflow: "auto"});
		let listClassName:string = "weave-list " + this.props.className ? this.props.className : "";
		return (
			<div style={styleObj} className={listClassName} tabIndex={0} onKeyDown={this.handleKeyDown}>
				{
					this.values.map((value:any, index:number) =>
					{
						var selected:boolean = this.state.selectedValues.indexOf(value) >= 0;

						var style:React.CSSProperties = {
							alignItems: "center",
							whiteSpace: "nowrap",
							textOverflow: "ellipsis",
							overflow: "hidden"
						};

						var className = classNames({
							'weave-list-item': true,
							'weave-list-item-selected': selected
						});

						return (
							<HBox key={index} style={style} className={ className }
							      onClick={this.handleChange.bind(this, value) }>
								{this.labels[index] || String(value)}
							</HBox>
						);
					})
				}
			</div>
		);
	}
}
