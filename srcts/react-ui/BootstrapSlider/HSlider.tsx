/// <reference path="../../../typings/react/react.d.ts"/>

import * as React from "react";
import ReactBootstrapSlider from "./ReactBootstrapSlider";
import {SliderProps} from "./ReactBootstrapSlider";

interface HSliderProps extends React.Props<HSlider> {
    min:number;
    max:number;
    step:number;
    value:number;
    ticks:string[];
    tickLabels:string[];
    type:string;
    reversed:boolean;
    onChange?:React.EventHandler<React.FormEvent>;
    style?:React.CSSProperties;
    label?:string;
}

export default class HSlider extends React.Component<HSliderProps, any> {

    constructor(props:HSliderProps) {
        super(props);
    }

    render() {
        return <ReactBootstrapSlider orientation={ReactBootstrapSlider.HORIZONTAL} {...this.props}/>;
    }
}
