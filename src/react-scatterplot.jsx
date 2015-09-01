import React from "react";
import $ from "jquery";
import _ from "lodash";
import d3 from "d3";
import c3 from "c3";

export default class Scatterplot extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    getConfig() {
        return {
            bindto: React.findDOMNode(this),
            data: {
               columns: [
                    ["data1", 30, 200, 100, 400, 150, 250],
                    ["data2", 50, 20, 10, 40, 15, 25]
                ],
                type: "scatter"
            },
            size: {
                width: 500,
                height: 500
            }
        };
    }

    componentDidUpdate() {

    }

    componentDidMount() {
        this.chart = c3.generate(this.getConfig());
    }

    render() {
        return <div></div>;
    }
}
