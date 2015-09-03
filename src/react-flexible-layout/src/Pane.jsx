import React from "react";
import VendorPrefix from "react-vendor-prefix";

export default class Pane extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {

        var split = this.props.split;
        var classes = ["Pane", split];

        var style = {
            display: "flex",
            width: "100%",
            height: "100%"
        };

        style.flex = this.state.flex;

        var prefixed = VendorPrefix.prefix({styles: style});

        return (
            <div className={classes.join(" ")} style={prefixed.styles}>
                {this.props.children}
            </div>
        );
    }
}
