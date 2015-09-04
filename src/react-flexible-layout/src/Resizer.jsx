import React from "react";
import VendorPrefix from "react-vendor-prefix";


var resizerStyle = {};

resizerStyle.basic = {
    background: "#000",
    opacity: .2,
    zIndex: 1,
    boxSizing: "border-box",
    backgroundClip: "padding"
};

// var Resizer:hover {
//         -webkit-transition: all 2s ease;
//         transition: all 2s ease;
//     }

resizerStyle.vertical = {
    height: "11px",
    margin: "-5px 0",
    borderTop: "5px solid rgba(255, 255, 255, 0)",
    borderBottom: "5px solid rgba(255, 255, 255, 0)",
    cursor: "row-resize",
    width: "100%"
};

    // .Resizer.vertical:hover {
    //     border-top: 5px solid rgba(0, 0, 0, 0.5);
    //     border-bottom: 5px solid rgba(0, 0, 0, 0.5);
    // }

resizerStyle.horizontal = {
    width: "11px",
    margin: "0 -5px",
    borderLeft: "5px solid rgba(255, 255, 255, 0)",
    borderRight: "5px solid rgba(255, 255, 255, 0)",
    cursor: "col-resize",
    height: "100%"
};

    // .Resizer.horizontal:hover {
    //     border-left: 5px solid rgba(0, 0, 0, 0.5);
    //     border-right: 5px solid rgba(0, 0, 0, 0.5);
    // }

export default class Resizer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount () {
        let element = React.findDOMNode(this);
        element.addEventListener("mousedown", this.onMouseDown.bind(this));
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
        var split = this.props.split;
        var style = resizerStyle.basic;
        this.merge(style, resizerStyle[split]);

        var prefixed = VendorPrefix.prefix({styles: style});

        return (
            <span style={prefixed.styles}/>
        );
    }
}
