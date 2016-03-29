import * as _ from "lodash";
import LinkableVariable = weavejs.core.LinkableVariable;
import {VBox, HBox} from "../react-ui/FlexBox";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ReactUtils from "../utils/ReactUtils";
import Menu from "../react-ui/Menu";

export interface StatefulTextFieldProps extends React.HTMLProps<StatefulTextField> {
	style?: React.CSSProperties;
	suggestions?: string[];
	selectOnFocus?: boolean;
	noneLabel?: string;
}

export interface StatefulTextFieldState {
	content: string;
}

export default class StatefulTextField extends React.Component<StatefulTextFieldProps, StatefulTextFieldState>
{
	constructor(props: StatefulTextFieldProps) {
		super(props);
	}

	state: StatefulTextFieldState = { content: ""};
	private element: HTMLElement;

	handleInputChange = (event: React.FormEvent): void=> {
		this.setState({ content: (event.target as HTMLInputElement).value || ""});
	}

	onFocus=(event:React.FormEvent):void=>{
		let input = (event.target as HTMLInputElement)
		if (this.props.selectOnFocus)
			input.setSelectionRange(0, input.value.length);
	}

	componentDidMount() {
		this.element = ReactDOM.findDOMNode(this) as HTMLElement;
	}

	renderItem(item: string, index: number): JSX.Element {
		let label = item;
		let style: React.CSSProperties = {};
		if (item === null) {
			item = "";
			label = this.props.noneLabel || " ";
			style = { fontStyle: "italic", whiteSpace: "pre" };
		}
		let onClick = (event: React.MouseEvent): void => {
			this.setState({ content: item });
			this.closePopup();
		};
		return <div style={style} className="weave-menuitem" key={index} onClick={onClick}>{label}</div>;
	}

	private popupInstance: React.ReactInstance;

	openPopup=()=>
	{
		let clientRect: ClientRect;
		let width = 0;
		if (this.element) {
			clientRect = this.element.getBoundingClientRect();
			width = this.element.offsetWidth;
		}
		else {
			clientRect = new ClientRect();
		}

		this.popupInstance = ReactUtils.openPopup(<div className="weave-menu" style={{position: "absolute", top: clientRect.bottom, left: clientRect.left, minWidth:width}}>
			{
				this.props.suggestions.map(this.renderItem, this)
			}
		</div>, true);
	}

	closePopup=()=>
	{
		if (this.popupInstance)
		{
			ReactUtils.closePopup(this.popupInstance);
			this.popupInstance = null;
		}
	}

	render(): JSX.Element {
		var props = _.clone(this.props);
		delete props.children;

		if (this.element) {
			var [height, width] = [this.element.clientHeight, this.element.clientWidth];
			var [top, left] = [this.element.clientTop, this.element.clientLeft];
		}
		else {
			var [height, width, top, left] = [0, 0, 0, 0];
		}

		if (this.props.suggestions && this.props.suggestions.length > 0)
		{
			return <HBox style={this.props.style}>
				<input style={{ flex: 1 }}
					onFocus={this.onFocus} onBlur={this.handleInputChange} onChange={this.handleInputChange}
					type="text" value={this.state.content} placeholder={this.state.content || this.props.noneLabel}
					{...props as any}
					/>
				<i onClick={this.openPopup} className="fa fa-caret-down weave-icon"/>
			</HBox>;
		}
		else
		{
			return (
				<HBox style={this.props.style}>
					<input
						type="text"
						{...props as any}
						style={{ flex: 1 }}
						onFocus={this.onFocus}
						onBlur={this.handleInputChange}
						onChange={this.handleInputChange}
						value={this.state.content}
					/>
				</HBox>
			);
		}
	}
}
