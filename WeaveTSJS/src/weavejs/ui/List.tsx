namespace weavejs.ui
{
	import HBox = weavejs.ui.flexbox.HBox;
	import KeyboardUtils = weavejs.util.KeyboardUtils;
	import ReactUtils = weavejs.util.ReactUtils;

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

	export class List extends React.Component<IListProps, IListState>
	{
		private lastSelectedIndex:number;
		private values:any[];
		private labels:(string|JSX.Element)[];

		private listContainer:HTMLElement;
		private listItems:HTMLElement[] = [];

		constructor(props:IListProps)
		{
			super(props);
			this.state = {
				selectedValues: props.selectedValues || []
			};
			if (props.selectedValues)
			{
				this.lastSelectedIndex = props.selectedValues.length - 1;
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

		get numberOfOptions()
		{
			return this.props.options.length - 1;
		}

		componentDidMount()
		{
			this.listContainer = ReactDOM.findDOMNode(this) as HTMLElement;
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

		handleKeyDown=(event:React.KeyboardEvent)=>
		{
			if (event.keyCode == KeyboardUtils.KEYCODES.UP_ARROW || event.keyCode == KeyboardUtils.KEYCODES.DOWN_ARROW)
			{
				event.preventDefault();
				if (event.keyCode == KeyboardUtils.KEYCODES.UP_ARROW)
				{
					this.focusPreviousItem();
				}
				else if (event.keyCode == KeyboardUtils.KEYCODES.DOWN_ARROW)
				{
					this.focusNextItem();
				}
			}
		}

		handleKeyDownOnListItem=(value:any, event:React.KeyboardEvent)=>
		{
			if(event.keyCode == KeyboardUtils.KEYCODES.SPACE)
			{
				event.preventDefault();
				this.handleChange(value, event);
			}
		}

		focusNextItem()
		{
			var index = _.min([this.listItems.indexOf(ReactUtils.getDocument(this).activeElement as HTMLElement) + 1, this.numberOfOptions]);
			this.focusItem(index);
		}

		focusPreviousItem()
		{
			var index = _.max([this.listItems.indexOf(ReactUtils.getDocument(this).activeElement as HTMLElement) - 1, 0]);
			this.focusItem(index);
		}

		focusItem(index:number)
		{
			this.listItems[index].focus();
		}

		handleChange=(value:any, event:React.MouseEvent|React.KeyboardEvent)=>
		{
			var selectedValues:any[] = this.state.selectedValues.concat();
			// new state of the item in the list
			var currentIndexClicked:number = selectedValues.indexOf(value);

			// ctrl selection
			if ((event.ctrlKey || event.metaKey) && this.props.multiple)
			{
				if (currentIndexClicked > -1)
				{
					selectedValues.splice(currentIndexClicked, 1);
				}
				else
				{
					selectedValues.push(value);
				}
				this.lastSelectedIndex = currentIndexClicked;
			}
			// multiple selection
			else if (event.shiftKey && this.props.multiple)
			{
				selectedValues = [];
				if (this.lastSelectedIndex == null)
				{
					// do nothing
				}
				else
				{
					var start:number = this.lastSelectedIndex;
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
					this.lastSelectedIndex = null;
				}
				else
				{
					selectedValues = [value];
					this.lastSelectedIndex = this.values.indexOf(value);
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
				<div style={styleObj} aria-role="listbox" className={listClassName} tabIndex={0} onKeyDown={this.handleKeyDown}>
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
								<HBox
									key={index}
									ref={(c:HBox) => {
										this.listItems[index] = ReactDOM.findDOMNode(c) as HTMLElement
									}}
									aria-role="option"
									style={style}
									tabIndex={0}
									onMouseEnter={() => this.listItems[index].focus()}
									onMouseLeave={() => this.listItems[index].blur()}
									className={ className }
								    onClick={(event:React.MouseEvent) => this.handleChange(value, event) }
									onKeyDown={(event:React.KeyboardEvent) => this.handleKeyDownOnListItem(value, event)}
								>
									{this.labels[index] || String(value)}
								</HBox>
							);
						})
					}
				</div>
			);
		}
	}
}
