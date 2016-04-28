import * as React from "react";
import ReactColorPicker from "../modules/react-color";
import ReactUtils from "../utils/ReactUtils";
import {HBox, VBox} from "../react-ui/FlexBox";

export interface ColorPickerProps extends React.Props<ColorPicker>
{
	hexColor?:string;
	width?:string;
	height?:string;
	onChange?: (hexColor:string) => void;
	onClose?: (hexColor:string) => void;
}

export interface ColorPickerState
{
	hexColor?:string;
}

export default class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState>
{
	popup:React.ReactInstance;
	element:HTMLElement;

	constructor(props:ColorPickerProps) {
		super(props);
		this.state = {
			hexColor: props.hexColor || '#FFFFFF',
		};
		this.handleClick = this.handleClick.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}
	
	componentWillReceiveProps(nextProps:ColorPickerProps)
	{
		if(nextProps.hexColor)
			this.setState({hexColor: nextProps.hexColor});
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
						color={ this.state.hexColor }
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
		this.props.onClose && this.props.onClose(this.state.hexColor);
	};

	handleChange=(color:any) => {
		this.setState({ hexColor: '#' + color.hex });
		this.props.onChange && this.props.onChange('#' + color.hex);
	};

	render():JSX.Element {

		// important to set display block if color has no width & height
		// this enusres swatch size never goes zero
		var swatchStyle:React.CSSProperties = {
			padding: '5px',
			background: '#fff',
			borderRadius: '1px',
			boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
			display: this.props.width && this.props.height ? 'inline-block' : "block",
			cursor: 'pointer'
		};
		var colorStyle:React.CSSProperties = {
			width: this.props.width ? this.props.width:"100%",
			height: this.props.height ? this.props.height:"100%",
			borderRadius: '2px',
			background: this.state.hexColor
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
