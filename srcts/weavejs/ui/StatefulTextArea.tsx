namespace weavejs.ui
{
	import LinkableVariable = weavejs.core.LinkableVariable;
	import HBox = weavejs.ui.flexbox.HBox;
	import VBox = weavejs.ui.flexbox.VBox;
	import ReactUtils = weavejs.util.ReactUtils;
	import Menu = weavejs.ui.menu.Menu;

	export interface StatefulTextAreaProps extends React.HTMLProps<StatefulTextArea> {
		selectOnFocus?:boolean;
		fluid?:boolean;
	}

	export interface StatefulTextAreaState {
		value: string|string[];
	}

	export class StatefulTextArea extends React.Component<StatefulTextAreaProps, StatefulTextAreaState>
	{
		textArea:HTMLTextAreaElement;

		constructor(props: StatefulTextAreaProps) {
			super(props);
			this.state = {
				value: props.value
			};
		}

		static defaultProps:StatefulTextAreaProps = {
			fluid:true,
			disabled:false
		};

		handleSelectOnFocus = () =>
		{
			if (this.props.selectOnFocus)
			{
				this.textArea.select();
			}
		};

		handleTextAreaChange = (event: React.FormEvent): void=> {
			let value = (event.target as HTMLInputElement).value;
			this.setState({ value: value || ""});
		};

		render(): JSX.Element {
			return (
				<div className="ui form">
					<textarea rows={4}
						{...this.props as any}
						   ref={(textArea:HTMLTextAreaElement) => this.textArea = textArea}
						   onChange={this.handleTextAreaChange}
						   onBlur={this.handleTextAreaChange}
						   onSubmit={this.handleTextAreaChange}
						   onFocus={this.handleSelectOnFocus}
						   value={this.state.value}
					/>
				</div>
			);
		}
	}
}
