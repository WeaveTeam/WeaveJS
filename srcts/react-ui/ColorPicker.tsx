import * as React from "react";
import ReactColorPicker from "../modules/react-color";
import ReactUtils from "../utils/ReactUtils";
import {HBox, VBox} from "./FlexBox";
import Button from "../semantic-ui/Button";

//React.props used rather than using React.HTMLProps as onChange has different signature
export interface ColorPickerProps extends React.Props<ColorPicker>
{
	hexColor?:string;
	onChange?: (hexColor:string) => void;
	onClose?: (hexColor:string) => void;
	onClick?: (hexColor:string) => void;
	buttonMode?:boolean;
	buttonLabel?:string|React.ReactChild;
	direction?:string;
	style?:React.CSSProperties, // has to mention as they are not part of React.props in typescript
	className?:string // has to mention as they are not part of React.props in typescript
}

export interface ColorPickerState
{
	hexColor?:string;
	buttonLabel?:string|React.ReactChild;
}

export default class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState>
{
	popup:React.ReactInstance;
	element:HTMLElement;

	static BOTTOM_LEFT:string = "bottom left";
	static BOTTOM_RIGHT:string = "bottom right";
	static TOP_LEFT:string = "top left";
	static TOP_RIGHT:string = "top right";

	constructor(props:ColorPickerProps)
	{
		super(props);
		this.state = {
			hexColor: props.hexColor || '#FFFFFF',
			buttonLabel:props.buttonLabel
		};
		this.handleClick = this.handleClick.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}
	
	componentWillReceiveProps(nextProps:ColorPickerProps)
	{
		if (this.props.hexColor != nextProps.hexColor)
			this.setState({hexColor: nextProps.hexColor});

		if (this.props.buttonLabel != nextProps.buttonLabel)
			this.setState({buttonLabel: nextProps.buttonLabel});
	}

	handleClick=(event:React.MouseEvent) =>
	{
		if (this.popup)
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
			if (direction == ColorPicker.BOTTOM_LEFT)
			{
				if (isAbove)
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
			else if (direction == ColorPicker.BOTTOM_RIGHT)
			{
				if (isAbove)
				{
					// 241.750 - third party colorpicker height //hacky
					style.top = clientRect.top - 241.750;
				}
				else
				{
					style.top = clientRect.bottom ; //clientRect bottom  = top + height
				}

				if (isLeft)
				{
					// 225 - third party colorpicker width //hacky
					style.left = clientRect.right - 225; // clientRect right  = left + width
				}
				else
				{
					style.left = clientRect.left;
				}


			}
			else if (direction == ColorPicker.TOP_RIGHT)
			{
				// 241.750 - third party colorpicker height //hacky
				style.top = clientRect.top - 241.750;
				if (isLeft)
				{
					// 225 - third party colorpicker width //hacky
					style.left = clientRect.right - 225; // clientRect right  = left + width
				}else
				{
					style.left = clientRect.left;
				}
			}
			else if (direction == ColorPicker.TOP_LEFT)
			{
				// 241.750 - third party colorpicker height //hacky
				style.top = clientRect.top - 241.750;
				// 225 - third party colorpicker width //hacky
				style.left = clientRect.right - 225;
			}

			this.popup = ReactUtils.openPopup(
				this,
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

			ReactUtils.getDocument(this).addEventListener("click", this.handleClose);//event listener added only when pop up is opened
			this.props.onClick && this.props.onClick(this.state.hexColor);
			this.setState({buttonLabel: "close"});
		}
	};

	handleClose=() =>
	{
		if (this.element)
		{
			this.setState({
				buttonLabel: this.props.buttonLabel ? this.props.buttonLabel  : "Add color"
			});
			ReactUtils.closePopup(this.popup);
			this.popup = null;
		}
		ReactUtils.getDocument(this).removeEventListener("click", this.handleClose);//when the popup is closed, event listener removed
		this.props.onClose && this.props.onClose(this.state.hexColor);
	};

	handleChange=(color:any) => {
		if(this.popup)
		{
			this.setState({ hexColor: '#' + color.hex });
			this.props.onChange && this.props.onChange('#' + color.hex);
		}
	};

	componentWillUnmount()
	{
		if(this.popup)//need to check if it exists or else closePopup crashes
		{
			ReactUtils.closePopup(this.popup);
			this.popup = null;
		}
		ReactUtils.getDocument(this).removeEventListener("click", this.handleClose);
	}

	render():JSX.Element
	{
		// important to set display block if color has no width & height
		// this enusres swatch size never goes zero
		var swatchStyle:React.CSSProperties = {
			padding: '4px',
			background: '#fff',
			borderRadius: '2px',
			border: "1px solid rgba(0,0,0,.1)",
			display: this.props.style && this.props.style.width && this.props.style.height ? 'inline-block' : "block",
			width: "100%",
			height: "100%",
			cursor: 'pointer'
		};
		// as color Style is child of SwatchStyle
		// the size 100% is minus padding border margin values of Swatch style
		var colorStyle:React.CSSProperties = {
			borderRadius: '2px',
			width: "100%",
			height: "100%",
			background: this.state.hexColor
		};
		let ui:JSX.Element = null;

		let styleObject:React.CSSProperties = this.props.style ? this.props.style : {};

		if (this.props.buttonMode)
		{
			// Button Size has to be the width and height, user cannot explicitly set when button mode is used
			styleObject.width =  null;
			styleObject.height = null;

			let label:string | React.ReactChild = this.state.buttonLabel ? this.state.buttonLabel  : "Add color";
			ui = <div style={ styleObject }>
					<div ref={(elt:Element) => this.element = elt as HTMLElement}>
						<Button  onClick={ this.handleClick }>{label}</Button>
					</div>
				</div>
		}
		else
		{
			// if width and height aren't specified the width and height values are passed from prev parent
			// and parent with more than one child wont split those values equally as overflow property of parent has to be considered
			// and eventually each child will take parents complete size.
			styleObject.width = styleObject.width ? styleObject.width : "30px";
			styleObject.height = styleObject.height ? styleObject.height : "20px";

			ui = <div style={ styleObject }>
					<div ref={(elt:Element) => this.element = elt as HTMLElement}
					     style={swatchStyle}
					     onClick={ this.handleClick }>
						<div style={colorStyle}></div>
					</div>
				</div>
		}

		return (ui);
	}
}
