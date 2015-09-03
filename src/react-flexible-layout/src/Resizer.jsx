import React from "react";

export default class Resizer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount () {
        let element = React.findDOMNode(this);
        element.addEventListener("mousedown", this.onMouseDown.bind(this));
        element.addEventListener("mouseup", this.onMouseUp.bind(this));
    }

    onMouseDown (event) {
        this.setState({
            active: true
        });
    }

    onMouseUp (event) {
        this.setState({
            active: false
        });
    }

    render() {
        var split = this.props.split;
        var classes = ["Resizer", split];
        var styl = {
            borderColor: "green"
        };
        return (
            <span className={classes.join(" ")} style={styl}/>
        );
    }
}
