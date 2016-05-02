import * as React from "react";
import ReactColorPicker from "../modules/react-color";
import ReactUtils from "../utils/ReactUtils";
import {HBox, VBox} from "../react-ui/FlexBox";
import Button from "../semantic-ui/Button";

export interface ColorPickerProps extends React.Props<ColorPicker>
{
	hexColor?:string;
	width?:string;
	height?:string;
	onChange?: (hexColor:string) => void;
	onClose?: (hexColor:string) => void;
	onClick?: (hexColor:string) => void;
	buttonMode?:boolean;
	buttonLabel?:string|React.ReactChild;
	direction?:string;
}

export interface ColorPickerState
{
	hexColor?:string;
}

export default class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState>
{
	popup:React.ReactInstance;
	element:HTMLElement;

	static BOTTOM_LEFT:string = "bottom left";
	static BOTTOM_RIGHT:string = "bottom right";
	static TOP_LEFT:string = "top left";
	static TOP_RIGHT:string = "top right";

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
		if(this.props.hexColor != nextProps.hexColor)
			this.setState({hexColor: nextProps.hexColor});
	}

	handleClick=(event:React.MouseEvent) =>{
		if(this.popup)
		{
			this.handleClose();
		}
		else
		{
			var clientRect = this.element.getBoundingClientRect();
			var style:React.CSSProperties = {
				position: "absolute"
			};

			//:todo automate based on the mentioned container,currenlty just checks for window
			let isAbove:boolean = window.innerHeight <= clientRect.bottom + 241.750;
			let isLeft:boolean = window.innerWidth <= clientRect.left + 200;
			
			let direction:string = this.props.direction ?  this.props.direction:ColorPicker.BOTTOM_RIGHT;
			if(direction == ColorPicker.BOTTOM_LEFT)
			{
				if(isAbove)
				{
					// 241.750 - third party colorpicker height //hacky
					style.top = clientRect.top - 241.750;
				}
				else
				{
					style.top = clientRect.bottom ; //clientRect bottom  = top + height
				}

				// 225 - third party colorpicker width //hacky
				style.left = clientRect.right - 225; // clientRect right  = left + width
			}
			else if(direction == ColorPicker.BOTTOM_RIGHT)
			{
				if(isAbove)
				{
					// 241.750 - third party colorpicker height //hacky
					style.top = clientRect.top - 241.750;
				}
				else
				{
					style.top = clientRect.bottom ; //clientRect bottom  = top + height
				}

				if(isLeft)
				{
					// 225 - third party colorpicker width //hacky
					style.left = clientRect.right - 225; // clientRect right  = left + width
				}else
				{
					style.left = clientRect.left;
				}


			}
			else if(direction == ColorPicker.TOP_RIGHT)
			{
				// 241.750 - third party colorpicker height //hacky
				style.top = clientRect.top - 241.750;
				if(isLeft)
				{
					// 225 - third party colorpicker width //hacky
					style.left = clientRect.right - 225; // clientRect right  = left + width
				}else
				{
					style.left = clientRect.left;
				}
			}
			else if(direction == ColorPicker.TOP_LEFT)
			{
				// 241.750 - third party colorpicker height //hacky
				style.top = clientRect.top - 241.750;
				// 225 - third party colorpicker width //hacky
				style.left = clientRect.right - 225;
			}

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

			document.addEventListener("click", this.handleClose);
			this.props.onClick && this.props.onClick(this.state.hexColor);
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
		let ui:JSX.Element = null;

		if(this.props.buttonMode)
		{
			let label:string | React.ReactChild = this.props.buttonLabel ? this.props.buttonLabel  : "Add color";
			ui = <div style={ {position:"relative"} }>
					<div ref={(elt:Element) => this.element = elt as HTMLElement}>
						<Button  onClick={ this.handleClick }>{label}</Button>
					</div>
				</div>
		}
		else
		{
			ui = <div style={ {position:"relative"} }>
					<div ref={(elt:Element) => this.element = elt as HTMLElement} style={swatchStyle} onClick={ this.handleClick }>
						<div style={colorStyle}></div>
					</div>
				</div>
		}

		return (ui);
	}
}
