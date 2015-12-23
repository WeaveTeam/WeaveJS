import * as VendorPrefix from "react-vendor-prefix";
import * as React from "react";
import StandardLib from "../Utils/StandardLib";
const HORIZONTAL = "horizontal";
var resizerStyle = {};
resizerStyle.basic = {
    background: "#000",
    opacity: .1,
    zIndex: 1,
    boxSizing: "border-box",
    backgroundClip: "padding"
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
export default class Resizer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false
        };
    }
    componentDidMount() {
        this.element.addEventListener("mousedown", this.boundMouseDown = this.onMouseDown.bind(this));
    }
    componentWillUnmount() {
        this.element.removeEventListener("mousedown", this.boundMouseDown);
    }
    onMouseDown() {
        this.setState({
            active: true
        });
    }
    render() {
        var direction = this.props.direction;
        var style = resizerStyle.basic;
        StandardLib.merge(style, resizerStyle[direction]);
        var prefixed = VendorPrefix.prefix({ styles: style });
        return <span ref={(elt) => { this.element = elt; }} style={prefixed.styles}/>;
    }
}
//# sourceMappingURL=Resizer.jsx.map