/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts"/>
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>

import * as VendorPrefix from "react-vendor-prefix";
import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {HORIZONTAL, VERTICAL, Direction} from "./Layout"

const STYLE_BASE = {
	background: "#000",
    opacity: .1,
    zIndex: 1,
    boxSizing: "border-box",
    backgroundClip: "padding"
};

const STYLE_HORIZONTAL = _.merge({
    width: "4px",
    cursor: "col-resize",
    height: "100%"
}, STYLE_BASE);

const STYLE_VERTICAL = _.merge({
    height: "4px",
    cursor: "row-resize",
    width: "100%"
}, STYLE_BASE);

export interface IResizerProps extends React.Props<Resizer>
{
	direction: Direction;
}

export interface IResizerState
{
	active?: boolean;
}

export default class Resizer extends React.Component<IResizerProps, IResizerState>
{
	constructor(props:IResizerProps)
	{
		super(props);
		this.state = {
			active: false
		};
	}

	componentDidMount()
	{
		ReactDOM.findDOMNode(this).addEventListener("mousedown", this.onMouseDown);
	}

	componentWillUnmount()
	{
		ReactDOM.findDOMNode(this).removeEventListener("mousedown", this.onMouseDown);
	}

	onMouseDown=(event:MouseEvent)=>
	{
		this.setState({
			active: true
		});
	}

	render():JSX.Element
	{
		var style = this.props.direction === HORIZONTAL ? STYLE_HORIZONTAL : STYLE_VERTICAL;
		return <span style={VendorPrefix.prefix({styles: style}).styles}/>;
	}
}
