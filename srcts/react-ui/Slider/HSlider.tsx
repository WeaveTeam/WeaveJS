/// <reference path="../../../typings/react/react.d.ts"/>

import * as React from "react";
import Slider from "./Slider";
import {SliderProps} from "./Slider";

export interface HSliderProps extends React.Props<HSlider> {
    min:number;
    max:number;
    step:number;
    value:number;
    onChange?:React.EventHandler<React.FormEvent>;
    style?:React.CSSProperties;
    label?:string;
}

export default class HSlider extends React.Component<HSliderProps, any> {

    constructor(props:HSliderProps) {
        super(props);
    }

    render():JSX.Element {
        return <Slider direction={Slider.HORIZONTAL} {...this.props}/>;
    }
}
