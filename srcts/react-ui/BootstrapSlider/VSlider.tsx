/// <reference path="../../../typings/react/react.d.ts"/>

import * as React from "react";
import ReactBootstrapSlider from "./ReactBootstrapSlider";
import {SliderProps} from "./ReactBootstrapSlider";

interface VSliderProps extends React.Props<VSlider> {
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

export default class VSlider extends React.Component<VSliderProps, any> {

    constructor(props:VSliderProps) {
        super(props);
    }

    render() {
        return <ReactBootstrapSlider orientation={ReactBootstrapSlider.VERTICAL} {...this.props}/>;
    }
}
