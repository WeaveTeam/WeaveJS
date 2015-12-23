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
        style.display = "flex";
        style.flexDirection = "column";
        return (<div style={style} {...otherProps}>
                {this.props.children}
            </div>);
    }
}
//# sourceMappingURL=VBox.jsx.map