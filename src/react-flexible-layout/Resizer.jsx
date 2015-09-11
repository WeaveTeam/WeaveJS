import React from "react";
import VendorPrefix from "react-vendor-prefix";

var HORIZONTAL = "horizontal";

var resizerStyle = {};

resizerStyle.basic = {
    background: "#000",
    opacity: .1,
    zIndex: 1,
    boxSizing: "border-box",
    backgroundClip: "padding"
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

    // .Resizer.HORIZONTAL:hover {
    //     border-left: 5px solid rgba(0, 0, 0, 0.5);
    //     border-right: 5px solid rgba(0, 0, 0, 0.5);
    // }

export default class Resizer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            active: false
        };
    }

    componentDidMount () {
        let element = React.findDOMNode(this);
        element.addEventListener("mousedown", this._onMouseDown = this.onMouseDown.bind(this));
    }

    componentWillUnmount () {
        let element = React.findDOMNode(this);
        element.removeEventListener("mousedown", this._onMouseDown);
    }

    onMouseDown () {
        this.setState({
            active: true
        });
    }

    merge (into, obj) {
        for (let attr in obj) {
            into[attr] = obj[attr];
        }
    }

    render() {
        var direction = this.props.direction;
        var style = resizerStyle.basic;

        this.merge(style, resizerStyle[direction]);

        var prefixed = VendorPrefix.prefix({styles: style});
        return <span style={prefixed.styles}/>;
    }
}
