import React from "react";

export default class Pane extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            flex: this.props.flex
        };
        console.log(this.props);
    }

    render() {

        var split = this.props.split;
        var classes = ["Pane", split];

        var style = {
            display: "flex",
            height: "100%",
            widht: "100%"
        };

        console.log(this.state);
        if(this.state.flex) {
            style.flex = this.state.flex;
        }

        return (
            <div className={classes.join(" ")} style={style}>
                {this.props.children}
            </div>
        );
    }
}
