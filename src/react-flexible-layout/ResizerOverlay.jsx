import React from "react";
import VendorPrefix from "react-vendor-prefix";

var resizerStyle = {};

var HORIZONTAL = "horizontal";

resizerStyle.basic = {
    background: "#000",
    opacity: .3,
    zIndex: 1,
    boxSizing: "border-box",
    backgroundClip: "padding",
    position: "absolute"
};

// var Resizer:hover {
//         -webkit-transition: all 2s ease;
//         transition: all 2s ease;
//     }

resizerStyle.vertical = {
    height: "4px",
    cursor: "row-resize",
    width: "100%"
};

    // .Resizer.vertical:hover {
    //     border-top: 5px solid rgba(0, 0, 0, 0.5);
    //     border-bottom: 5px solid rgba(0, 0, 0, 0.5);
    // }

resizerStyle.horizontal = {
    width: "4px",
    cursor: "col-resize",
    height: "100%"
};

    // .Resizer.horizontal:hover {
    //     border-left: 5px solid rgba(0, 0, 0, 0.5);
    //     border-right: 5px solid rgba(0, 0, 0, 0.5);
    // }

export default class ResizerOverlay extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            active: false
        };
    }

    componentDidMount() {
        this.element = React.findDOMNode(this);
        document.addEventListener("mousemove", this._onMouseMove = this.onMouseMove.bind(this), true);
    }

    componentWillUnmount() {
        document.removeEventListener("mousemove", this._onMouseMove);
    }

    onMouseMove (event) {

        if(this.state.active) {
            console.log("stpfa0");
            event.stopPropagation();
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
