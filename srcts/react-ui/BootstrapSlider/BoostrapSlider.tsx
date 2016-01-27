/// <reference path="../../../typings/react/react.d.ts"/>
/// <reference path="../../../typings/bootstrap-slider/bootstrap-slider.d.ts"/>


import * as React from "react";
import BootstrapSlider from "bootstrap-slider";

export default class Slider extends React.Component<any, any> {

    private element:HTMLElement;

    constructor(props:any) {
        super(props);
    }

    componentDidMount() {
        console.log(BootstrapSlider);
        console.log(new BootstrapSlider("#slider", {
            // initial options object
        }));
    }

    render() {
        return <div ref={(c:HTMLElement) => { this.element = c }} style={{width: 300, height: 300}} id="slider"/>;
    }
}
