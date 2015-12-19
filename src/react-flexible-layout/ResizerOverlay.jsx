import React from "react";
import VendorPrefix from "react-vendor-prefix";

var resizerStyle = {};

var HORIZONTAL = "horizontal";

var mousevents = ["mouseover", "mouseout", "mouseleave"];

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

class ResizerOverlay extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            active: false
        };
    }

    componentDidMount() {
        document.addEventListener("mousemove", this._onMouseMove = this.onMouseMove.bind(this), true);
        this.element = React.findDOMNode(this);
        mousevents.forEach( (mouseevent) => document.addEventListener(mouseevent, this._stopEventPropagation = this.stopEventPropagation.bind(this), true));
    }

    componentWillUnmount() {
        document.removeEventListener("mousemove", this._onMouseMove);
        mousevents.forEach( (mouseevent) => document.removeEventListener(mouseevent, this._stopEventPropagation));
    }

    stopEventPropagation(event) {
        if(this.state.active) {
            event.stopImmediatePropagation();
        }
    }

    onMouseMove (event) {
        if(this.state.active) {
            event.stopImmediatePropagation();
            var container = this.element.parentNode;
            var rect = container.getBoundingClientRect();
            var left = window.pageXOffset + rect.left;
            var top = window.pageYOffset + rect.top;
            var mousePos = this.props.direction === HORIZONTAL ? event.pageX : event.pageY;

            mousePos = Math.max(this.state.range[0], Math.min(mousePos, this.state.range[1]));

            if(this.props.direction === HORIZONTAL) {
                this.setState({
                    x: mousePos - left,
                    y: undefined
                });
            } else {
                this.setState({
                    x: undefined,
                    y: mousePos - top
                });
            }
        }
    }

    merge (into, obj) {
        for (let attr in obj) {
            into[attr] = obj[attr];
        }
    }

    render() {
        var direction = this.props.direction;
        var style = {};

        this.merge(style, resizerStyle.basic);
        this.merge(style, resizerStyle[direction]);

        if(this.state.active) {
            style.visibility = "visible";
            style.left = this.state.x;
            style.top = this.state.y;
        } else {
            style.visibility = "hidden";
        }

        var prefixed = VendorPrefix.prefix({styles: style});

        return (
            <span style={prefixed.styles}/>
        );
    }
}

export default ResizerOverlay;
