import prefixer from "../VendorPrefixer";
import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {HORIZONTAL, VERTICAL, Direction} from "./Layout"

const STYLE_BASE = {
    boxSizing: "border-box",
    backgroundClip: "padding-box"
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
		var className:string = this.props.direction === HORIZONTAL ? "weave-resizer-horizontal": "weave-resizer-vertical";
		
		// makes a copy
		style = prefixer(style);
		
		if(this.props.spacing)
		{
			if (this.props.direction === HORIZONTAL)
				style.width = this.props.spacing;
			else
				style.height = this.props.spacing;
		}


		return <span className={className} style={style}/>;
	}
}
