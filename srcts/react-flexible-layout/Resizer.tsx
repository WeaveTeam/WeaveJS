import prefixer from "../react-ui/VendorPrefixer";
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
    cursor: "col-resize"
}, STYLE_BASE);

const STYLE_VERTICAL = _.merge({
    cursor: "row-resize"
}, STYLE_BASE);

export interface IResizerProps extends React.Props<Resizer>
{
	direction: Direction;
	spacing?: number;
}

export interface IResizerState
{
	active?: boolean;
}

export default class Resizer extends React.Component<IResizerProps, IResizerState>
{
	static DEFAULT_SPACING = 4;
	
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
		var style:React.CSSProperties = this.props.direction === HORIZONTAL ? STYLE_HORIZONTAL : STYLE_VERTICAL;
		
		// makes a copy
		style = prefixer(style);
		
		var spacing = this.props.spacing || Resizer.DEFAULT_SPACING;
		if (this.props.direction === HORIZONTAL)
			style.width = spacing;
		else
			style.height = spacing;

		return <span style={style}/>;
	}
}
