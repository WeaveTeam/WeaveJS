/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts"/>
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>

import * as VendorPrefix from "react-vendor-prefix";
import * as React from "react";
import * as ReactDOM from "react-dom";

import StandardLib from "../Utils/StandardLib";

const HORIZONTAL: string = "horizontal";

var resizerStyle: any = {};

resizerStyle.basic = {
	background: "#000",
    opacity: .1,
    zIndex: 1,
    boxSizing: "border-box",
    backgroundClip: "padding"
};

resizerStyle.vertical = {
    height: "4px",
    cursor: "row-resize",
    width: "100%"
};

resizerStyle.horizontal = {
    width: "4px",
    cursor: "col-resize",
    height: "100%"
};

interface IResizerProps extends React.Props<Resizer> {
	ref: string;
	key: number;
	direction: string;
	pane1: string;
	pane2: string;
}

interface IResizerState {
	active?: boolean;
}

export default class Resizer extends React.Component<IResizerProps, IResizerState> {

		private element:Element;

		private boundMouseDown:any;

		constructor(props:IResizerProps) {
			super(props);
			this.state = {
				active: false
			};
		}

		componentDidMount () {
			this.element.addEventListener("mousedown", this.boundMouseDown = this.onMouseDown.bind(this));
		}

		componentWillUnmount () {
			this.element.removeEventListener("mousedown", this.boundMouseDown);
		}

		onMouseDown () {
			this.setState({
				active:true
			});
		}

		render() {
			var direction:string = this.props.direction;
			var style:any = resizerStyle.basic;

			StandardLib.merge(style, resizerStyle[direction]);

			var prefixed = VendorPrefix.prefix({styles: style});
			return <span ref={(elt:Element) => { this.element = elt }} style={prefixed.styles}/>;
		}
}
