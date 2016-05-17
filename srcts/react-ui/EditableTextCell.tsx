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
		});
	};

	disableEditMode =(event:MouseEvent):void =>
	{
		//check if the click target is not within the element and the editable mode is on
		if(!ReactDOM.findDOMNode(this).contains(event.target as HTMLElement) && this.state.editMode)
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
			<VBox onDoubleClick={ this.enableEditMode }>
				{ (this.state.editMode) ?
				<Input value={ this.state.textContent } onChange={ this.handleEditableContent }/>

				:
				<div style={ {border:'1px solid #C0C0C0', padding:'10', minHeight:'30px'} }>
					{ this.state.textContent }
				</div>
				}
			</VBox>
		);
	}
}