/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import * as VendorPrefix from "react-vendor-prefix";
import {HORIZONTAL, VERTICAL, Direction} from "./Layout"
import MiscUtils from "../utils/MiscUtils";

const mouseevents:string[] = ["mouseover", "mouseout", "mouseleave"];

const STYLE_BASE = {
    background: "#000",
    opacity: .3,
    zIndex: 1,
    boxSizing: "border-box",
    backgroundClip: "padding",
    position: "absolute"
};

const THICKNESS = 4;

const STYLE_HORIZONTAL = _.merge({
    width: THICKNESS + "px",
    cursor: "col-resize",
    height: "100%"
}, STYLE_BASE);

const STYLE_VERTICAL = _.merge({
    height: THICKNESS + "px",
    cursor: "row-resize",
    width: "100%"
}, STYLE_BASE);

export interface IResizerOverlayProps extends React.Props<ResizerOverlay>
{
    direction: Direction
}

export interface IResizerOverlayState
{
    active?: boolean;
    range?: number[];
    x?: number;
    y?: number;
};


export default class ResizerOverlay extends React.Component<IResizerOverlayProps, IResizerOverlayState>
{
    constructor(props: IResizerOverlayProps)
    {
        super(props)
        this.state = {
          active: false,
          range: [],
          x: NaN,
          y: NaN
        };
    }

    componentDidMount():void
    {
        document.addEventListener("mousemove", this.onMouseMove, true);
        mouseevents.forEach(mouseevent => document.addEventListener(mouseevent, this.stopEventPropagation, true));
    }

    componentWillUnmount():void
    {
        document.removeEventListener("mousemove", this.onMouseMove)
        mouseevents.forEach(mouseevent => document.removeEventListener(mouseevent, this.stopEventPropagation));
    }

    stopEventPropagation=(event:Event):void=>
	{
        if (this.state.active)
        {
            event.stopImmediatePropagation();
        }
    }

    onMouseMove=(event:MouseEvent):void=>
	{
        if (this.state.active)
        {
            event.stopImmediatePropagation();
            var container:HTMLElement = ReactDOM.findDOMNode(this).parentNode as HTMLElement;
			var offsetPoint = MiscUtils.getOffsetPoint(container, event);
            var mousePos: number = this.props.direction === HORIZONTAL ? offsetPoint.x : offsetPoint.y;

            mousePos = Math.max(this.state.range[0], Math.min(mousePos, this.state.range[1]));

            if (this.props.direction === HORIZONTAL)
            {
                this.setState({
                    x: mousePos - THICKNESS / 2,
                    y: NaN
                });
            }
            else
            {
                this.setState({
                    x: NaN,
                    y: mousePos - THICKNESS / 2
                });
            }
        }
    }

    render():JSX.Element
    {
        var direction: string = this.props.direction;
        var style:React.CSSProperties = _.merge({}, direction === HORIZONTAL ? STYLE_HORIZONTAL : STYLE_VERTICAL);

        if (this.state.active)
        {
            style.visibility = "visible";
            style.left = !isNaN(this.state.x) ? this.state.x : undefined;
            style.top = !isNaN(this.state.y) ? this.state.y : undefined;
        }
        else
        {
            style.visibility = "hidden";
        }

        style = VendorPrefix.prefix({ styles: style }).styles;

        return <span style={style}/>;
    }
}
