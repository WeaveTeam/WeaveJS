/// <reference path="../../../typings/react/react.d.ts"/>

import * as React from "react";
import Slider from "./Slider";
import {SliderProps} from "./Slider";
import * as _ from "lodash";

interface VSliderProps extends React.Props<VSlider> {
    min:number;
    max:number;
    step:number;
    value:number;
    onChange?:React.EventHandler<React.FormEvent>;
    style?:React.CSSProperties;
    label?:string;
}

export default class VSlider extends React.Component<VSliderProps, any> {

    constructor(props:VSliderProps) {
        super(props);
    }

    render() {
        return <Slider direction={Slider.VERTICAL} {...this.props}/>;
    }
}
