/// <reference path="../../typings/react/react.d.ts"/>
import * as React from "react";
export default class HBox extends React.Component {
    constructor(props, state) {
        super(props);
    }
    render() {
        var style = this.props.style || {};
        var otherProps = {};
        for (var key in this.props) {
            if (key !== "style") {
                otherProps[key] = this.props[key];
            }
        }
        style = style || {};
        style.display = "flex";
        style.flexDirection = "row";
        return (<div style={style} {...otherProps}>
                {this.props.children}
            </div>);
    }
}
//# sourceMappingURL=HBox.jsx.map