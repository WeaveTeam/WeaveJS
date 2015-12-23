/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as VendorPrefix from "react-vendor-prefix";
import StandardLib from "../Utils/StandardLib";
const HORIZONTAL: string = "horizontal";

const mouseevents:string[] = ["mouseover", "mouseout", "mouseleave"];

var resizerStyle:any = {};

resizerStyle.basic = {
    background: "#000",
    opacity: .3,
    zIndex: 1,
    boxSizing: "border-box",
    backgroundClip: "padding",
    position: "absolute"
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

interface IResizerOverlayProps {
    ref: string;
    direction: string
}

interface IResizerOverlayState {
    active?: boolean;
    range?: number[];
    x?: number;
    y?: number;
};


export default class ResizerOverlay extends React.Component<IResizerOverlayProps, IResizerOverlayState> {

    private element: Element;
    public state: IResizerOverlayState;

    private _onMouseMove: EventListener;
    private _stopEventPropagation: EventListener;

    constructor(props: IResizerOverlayProps) {
        super(props)
        this.state = {
          active: false,
          range: [],
          x: NaN,
          y: NaN
        };
    }

    componentDidMount() {
        document.addEventListener("mousemove", this._onMouseMove = this.onMouseMove.bind(this), true);
        mouseevents.forEach((mouseevent: string) => document.addEventListener(mouseevent, this._stopEventPropagation = this.stopEventPropagation.bind(this), true));
    }

    componentWillUnmount() {
        document.removeEventListener("mousemove", this._onMouseMove)
        mouseevents.forEach((mouseevent) => document.removeEventListener(mouseevent, this._stopEventPropagation));
    }

    stopEventPropagation(event: Event) {
        if(this.state.active) {
            event.stopImmediatePropagation();
        }
    }

    onMouseMove(event: MouseEvent) {
        if(this.state.active) {
            event.stopImmediatePropagation();
            var container:Element = this.element.parentNode as Element;
            var rect:ClientRect = container.getBoundingClientRect();
            var left: number = window.pageXOffset + rect.left;
            var top: number = window.pageYOffset + rect.top;
            var mousePos: number = this.props.direction === HORIZONTAL ? event.pageX : event.pageY;

            mousePos = Math.max(this.state.range[0], Math.min(mousePos, this.state.range[1]));

            if (this.props.direction === HORIZONTAL) {
                this.setState({
                    x: mousePos - left,
                    y: NaN
                });
            } else {
                this.setState({
                    x: NaN,
                    y: mousePos - top
                });
            }
        }
    }

    render() {
        var direction: string = this.props.direction;
        var style:any = {};

        StandardLib.merge(style, resizerStyle.basic);
        StandardLib.merge(style, resizerStyle[direction]);

        if(this.state.active) {
            style.visibility = "visible";
            style.left = this.state.x;
            style.top = this.state.y;
        } else {
            style.visibility = "hidden";
        }

        var prefixed = VendorPrefix.prefix({ styles: style });

        return (
            <span ref={(elt:Element) => { this.element = elt; }} style={prefixed.styles}/>
        );
    }
}
