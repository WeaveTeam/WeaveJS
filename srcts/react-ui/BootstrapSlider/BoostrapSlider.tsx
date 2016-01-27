/// <reference path="../../../typings/react/react.d.ts"/>
/// <reference path="../../../typings/bootstrap-slider/bootstrap-slider.d.ts"/>


import * as React from "react";
import BootstrapSlider from "bootstrap-slider";

interface SliderProps {
    min:number;
    max:number;
    step:number;
    value:number;
    orientation:string;
    onChange?:React.EventHandler<React.FormEvent>;
    style?:React.CSSProperties;
    label?:string;
}

export default class Slider extends React.Component<SliderProps, any> {

    private element:HTMLElement;
    private sliderOptions:BootstrapSlider.SliderOptions;

    constructor(props:SliderProps) {
        super(props);
    }

    componentDidUpdate() {
        console.log(BootstrapSlider);
        this.sliderOptions = {
            min: this.props.min,
            max: this.props.max,
            step: this.props.step,
            orientation: this.props.orientation,
        };
        console.log(new BootstrapSlider("#slider", {
            // initial options object
        }));
    }

    render() {
        return <div ref={(c:HTMLElement) => { this.element = c }} style={{width: 300, height: 300}} id="slider"/>;
    }
}
