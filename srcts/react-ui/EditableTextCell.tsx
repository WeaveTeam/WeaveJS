/*this component displays text that is editable on a double click*/
import * as React from "react";
import * as ReactDOM from "react-dom";
import Input from '../semantic-ui/Input';
import SmartComponent from '../ui/SmartComponent';
import {VBox} from "./FlexBox";
import ReactUtils from "../utils/ReactUtils";

export interface IEditableTextCellProps
{

}

export interface IEditableTextCellState
{
	editMode?:Boolean
	textContent?:string
}

export default class EditableTextCell extends SmartComponent<IEditableTextCellProps, IEditableTextCellState>
{
	constructor(props:IEditableTextCellProps)
	{
		super(props);
		this.state = {
			editMode: false,
			textContent: null
		}
	}

	private element:HTMLElement;
	private inputElement:HTMLInputElement;
	
	handleEditableContent =(event:any):void =>
	{
		let textEntered = event.target.value as string;
		this.setState({
			textContent : textEntered
		});
	};

	enableEditMode =():void =>
	{
		this.setState({
			editMode : true
		}, () => {
			if(this.inputElement)
				this.inputElement.focus();
				this.inputElement.select();
		});


	};

	disableEditMode =(event:MouseEvent):void =>
	{
		if(!ReactDOM.findDOMNode(this).contains(event.target as HTMLElement) && this.state.editMode)//dont disable anywhere but component itself)
		{
			this.setState({
				editMode :false
			});
		}
	};

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this) as HTMLElement;
		document.addEventListener('mousedown', this.disableEditMode);

	}

	componentWillUnmount()
	{
		document.removeEventListener('mousedown', this.disableEditMode);
	}

	//TODO fix styles
	render():JSX.Element
	{
		return(
			<VBox style={ {height: '30px', backgroundColor:'aqua'} } onDoubleClick={ this.enableEditMode }>
				{ (this.state.editMode) ?
				<Input
					value={ this.state.textContent }
					onChange={ this.handleEditableContent }
					/*ref={(c:Input) => {
								if(c && c.inputElement)
								{
									console.log("selecting");
									this.inputElement = c.inputElement;
								}
							}}*/
				/>

				: this.state.textContent

				}
			</VBox>
		);
	}
}