/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>
import * as React from "react";
import * as VendorPrefix from "react-vendor-prefix";
import StandardLib from "../Utils/StandardLib";
const HORIZONTAL = "horizontal";
const mouseevents = ["mouseover", "mouseout", "mouseleave"];
var resizerStyle = {};
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
;
export default class ResizerOverlay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            range: [],
            x: NaN,
            y: NaN
        };
    }
    componentDidMount() {
        document.addEventListener("mousemove", this._onMouseMove = this.onMouseMove.bind(this), true);
        mouseevents.forEach((mouseevent) => document.addEventListener(mouseevent, this._stopEventPropagation = this.stopEventPropagation.bind(this), true));
    }
    componentWillUnmount() {
        document.removeEventListener("mousemove", this._onMouseMove);
        mouseevents.forEach((mouseevent) => document.removeEventListener(mouseevent, this._stopEventPropagation));
    }
    stopEventPropagation(event) {
        if (this.state.active) {
            event.stopImmediatePropagation();
        }
    }
    onMouseMove(event) {
        if (this.state.active) {
            event.stopImmediatePropagation();
            var container = this.element.parentNode;
            var rect = container.getBoundingClientRect();
            var left = window.pageXOffset + rect.left;
            var top = window.pageYOffset + rect.top;
            var mousePos = this.props.direction === HORIZONTAL ? event.pageX : event.pageY;
            mousePos = Math.max(this.state.range[0], Math.min(mousePos, this.state.range[1]));
            if (this.props.direction === HORIZONTAL) {
                this.setState({
                    x: mousePos - left,
                    y: NaN
                });
            }
            else {
                this.setState({
                    x: NaN,
                    y: mousePos - top
                });
            }
        }
    }
    render() {
        var direction = this.props.direction;
        var style = {};
        StandardLib.merge(style, resizerStyle.basic);
        StandardLib.merge(style, resizerStyle[direction]);
        if (this.state.active) {
            style.visibility = "visible";
            style.left = this.state.x;
            style.top = this.state.y;
        }
        else {
            style.visibility = "hidden";
        }
        var prefixed = VendorPrefix.prefix({ styles: style });
        return (<span ref={(elt) => { this.element = elt; }} style={prefixed.styles}/>);
    }
}
//# sourceMappingURL=ResizerOverlay.jsx.map