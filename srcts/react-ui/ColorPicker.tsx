import * as React from "react";
import ReactColorPicker from "../modules/react-color";
import ReactUtils from "../utils/ReactUtils";
import {HBox, VBox} from "../react-ui/FlexBox";

export interface ColorPickerProps extends React.Props<ColorPicker>
{
}

export interface ColorPickerState
{
	color?:string;
}

export default class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState>
{
	popup:React.ReactInstance;
	element:HTMLElement;

	constructor(props:ColorPickerProps) {
		super(props);
		this.state = {
			color: '#F17013',
		};
		this.handleClick = this.handleClick.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleClick=(event:React.MouseEvent) =>{
		if(this.popup)
		{
			this.handleClose();
		} else
		{
			var clientRect = this.element.getBoundingClientRect();
			var style:React.CSSProperties = {
				position: "absolute",
				top: clientRect.top+this.element.clientHeight,
				left: clientRect.left
			};
			this.popup = ReactUtils.openPopup(
				<HBox style={style} onClick={(event:React.MouseEvent) => {event.nativeEvent.stopImmediatePropagation()}}>
					<ReactColorPicker
						color={ this.state.color }
						position="below"
						display={ true }
						onChange={ this.handleChange }
						onClose={ this.handleClose }
						type="sketch"
					/>
				</HBox>);
			document.addEventListener("click", this.handleClose)
		}
	};

	handleClose=() => {
		if(this.popup) {
			ReactUtils.closePopup(this.popup);
			this.popup = null;
			document.removeEventListener("click", this.handleClose);
		}
	};

	handleChange=(color:any) => {
		this.setState({ color: '#' + color.hex });
	};

	render():JSX.Element {

		var swatchStyle:React.CSSProperties = {
			padding: '5px',
			background: '#fff',
			borderRadius: '1px',
			boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
			display: 'inline-block',
			cursor: 'pointer'
		};
		var colorStyle:React.CSSProperties = {
			width: '36px',
			height: '14px',
			borderRadius: '2px',
			background: this.state.color
		};

		return (
			<div>
				<div ref={(elt:Element) => this.element = elt as HTMLElement} style={swatchStyle} onClick={ this.handleClick }>
					<div style={colorStyle}></div>
				</div>
			</div>
		);
	}
}