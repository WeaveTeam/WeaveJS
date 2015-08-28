import React from "react";
import $ from "jquery";
import _ from "lodash";
import d3 from "d3";
import c3 from "c3";

export default class Scatterplot extends React.Component {

    constructor(props) {
        super(props);
    }

    getConfig() {
        console.log(this.props);
        console.log(this.state);
        this.props.config.bindTo = $(React.findDOMNode(this)[0]);
        return this.props.config;
    }

    componentDidUpdate() {

    }

    componentDidMount() {
        setTimeout(() => {
            c3.generate(this.getConfig());
        }, 100);
    }

    render() {
        return <div></div>;
    }
}
