import React from "react";

export default class Resizer extends React.Component {

    constructor(props) {
        super(props);
    }

    onMouseDown (event) {
        this.props.onMouseDown(event);
    }

    render() {
        var split = this.props.split;
        var classes = ["Resizer", split];
        return (
            <span className={classes.join(" ")} onMouseDown={this.onMouseDown}/>
        );
    }
}
