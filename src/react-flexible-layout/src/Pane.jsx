import React from "react";
import VendorPrefix from "react-vendor-prefix";

export default class Pane extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        var split = this.props.split;
        var classes = ["Pane", split];

        var style = {
            display: "flex",
            border: "solid",
            width: "100%",
            height: "100%"
        };

        style.flex = this.props.flex || 100;

        console.log(style.flex);

        const prefixed = VendorPrefix.prefix({styles: style});

        return (
            <div className={classes.join(" ")} style={prefixed.styles}>
                {this.props.children}
            </div>
        );
    }
}
