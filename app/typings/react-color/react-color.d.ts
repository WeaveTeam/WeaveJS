// Type definitions for react-color.js 2.0
// Project: https://github.com/casesandberg/react-color/
// Definitions by: Zachary Maybury <https://github.com/zmaybury>

///<reference path="../react/react.d.ts"/>

declare module "react-color" {
	import React = require("react");

	interface  RGBColor {
		r:number;
		g:number;
		b:number;
		a?:number;
	}

	interface HSLColor {
		h:number;
		s:number;
		l:number;
		a?:number;
	}

	interface ColorPickerProps {
		/**
		 * A string that defines the type of color picker theme to display
		 * accepted values: sketch, chrome, photoshop, slider, compact, material, swatches
		 */
			type:string;

		/**
		 * a function to call every time the color is changed. If you need to change the color once
		 * use onChangeComplete
		 */
		onChange?: (color: string | RGBColor | HSLColor) => any;

		/**
		 * a function to call once a color change is complete
		 */
		onChangeComplete?: (color: string | RGBColor | HSLColor) => any;

		/**
		 * controls the active color of the picker.
		 * accepted values: string of a hex color, or an object of rgb or hsl values with alpha
		 */
		color: string | RGBColor | HSLColor;

		/**
		 * whether the block element is visible
		 *
		 * default: always visible
		 */
		display?:boolean;

		/**
		 * a function to fire on when popup is closed
		 */
		onClose?: (color: string | RGBColor | HSLColor) => any;

		/**
		 * the position of the popup, relative to the container
		 * accepted values: left, right, any
		 */
		position?:string;

		/**
		 * css alongside display to declare a custom position for the color picker with a css object
		 */
		positionCSS?:React.CSSProperties;
	}

	type ColorPicker = React.ClassicComponent<ColorPickerProps, {}>;
	var ColorPicker: React.ClassicComponentClass<ColorPickerProps>;
}
declare var ReactColorPicker:any;