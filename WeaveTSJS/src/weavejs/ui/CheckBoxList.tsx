namespace weavejs.ui
{
	import HBox = weavejs.ui.flexbox.HBox;
	import VBox = weavejs.ui.flexbox.VBox;
	export type CheckBoxOption = {
		value:any, 
		label:string
	}

	export interface ICheckBoxListProps extends React.Props<CheckBoxList>
	{
		options:CheckBoxOption[];
		onChange?:(selectedValues:any[]) => void;
		selectedValues?:any[];
		labelPosition?:string;
	}

	export interface ICheckBoxListState
	{
		checkboxStates:boolean[];
	}

	export class CheckBoxList extends React.Component<ICheckBoxListProps, ICheckBoxListState>
	{
		private checkboxes:HTMLElement[];
		
		private values:any[] = [];
		private labels:string[] = [];

		constructor(props:ICheckBoxListProps)
		{
			super(props);

			if (!props.options)
			{
				this.state = {
					checkboxStates: []
				};
			}
			else
			{
				if (props.selectedValues)
				{
					this.state = {
						checkboxStates: props.options.map((option) => {
							return props.selectedValues.indexOf(option.value) >= 0;
						})
					}
				}
				else
				{
					this.state = {
						checkboxStates: props.options.map(() => {
							return false;
						})
					}
				}
			}
			this.values = _.pluck(this.props.options, "value");
			this.labels = _.pluck(this.props.options, "label");
		}

		componentWillReceiveProps(nextProps:ICheckBoxListProps)
		{
			this.values = _.pluck(this.props.options, "value");
			this.labels = _.pluck(this.props.options, "label");
			
			if (!nextProps.options)
			{
				this.setState({
					checkboxStates: []
				});
			}
			else
			{
				if (nextProps.selectedValues)
				{
					var checkboxStates:boolean[] = nextProps.options.map((option) => {
						return nextProps.selectedValues.indexOf(option.value) >= 0;
					});
					this.setState({
						checkboxStates
					});
				}
			}
		}

		handleChange(checkboxState:boolean, index:number)
		{
			var checkboxStates:boolean[] = this.state.checkboxStates.concat();
			checkboxStates[index] = checkboxState;

			var selectedValues:string[] = [];
			checkboxStates.forEach((checkboxState:boolean, index:number) => {
				if (checkboxState)
				{
					selectedValues.push(this.props.options[index].value);
				}
			});

			if (this.props.onChange)
				this.props.onChange(selectedValues);

			this.setState({
				checkboxStates
			});
		}

		render():JSX.Element
		{
			var labelPosition:string = this.props.labelPosition || "right";

			return (
				<div style={{flex: 1, alignItems: "center", overflow: "auto"}} className="weave-checkbox-list">
					{
						this.state.checkboxStates.map((checkBoxState:boolean, index:number) => {
							var label = this.labels[index];
							var checkbox = (
								<Checkbox
									value={checkBoxState}
									onChange={(value:boolean) => this.handleChange(value, index)}
									label={labelPosition == "right" ? label : " "}
								/>
							);
							return (
								<HBox key={index} style={{height: 30, paddingLeft: 10}} className="weave-checkbox-list-item">
									{ labelPosition == "right" ? checkbox : [label, checkbox] }
								</HBox>
							);
						})
					}
				</div>
			);
		}
	}
}
