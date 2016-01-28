/// <reference path="../../../typings/react/react.d.ts"/>
/// <reference path="../../../typings/bootstrap-slider/bootstrap-slider.d.ts"/>

import * as React from "react";
import BootstrapSlider from "bootstrap-slider";

export interface SliderProps {
    min:number;
    max:number;
    step:number;
    value:number;
    type:string;
    orientation:string;
    reversed?:boolean;
    ticks?:string[];
    tickLabels?:string[];
    onChange?:React.EventHandler<React.FormEvent>;
    style?:React.CSSProperties;
    label?:string;
}

export default class ReactBootstrapSlider extends React.Component<SliderProps, any> {

    private sliderOptions:SliderOptions;
    private slider:Slider;
    static VERTICAL:string = "vertical";
    static HORIZONTAL:string ="horizontal";

    static NUMERIC:string = "numeric"
    static CATEGORICAL:string = "categorical";

    constructor(props:SliderProps) {
        super(props);
    }

    // componentWillUpdate(nextProps:SliderProps) {
    //     this.slider.setValue(nextProps.value)
    // }

    componentDidMount() {
        this.sliderOptions = {
            step: this.props.step,
            value: this.props.value,
            orientation: this.props.orientation,
        };
        if(this.props.type == ReactBootstrapSlider.NUMERIC) {
            this.sliderOptions.min = this.props.min;
            this.sliderOptions.max = this.props.max;
            this.sliderOptions.range = true;
        } else {
            this.sliderOptions.min = this.props.min;
            this.sliderOptions.max = this.props.max;
            this.sliderOptions.ticks = [2001, 2002, 2003];
            this.sliderOptions.ticks_labels = ["alpha", "beta", "gamma"];
        }

        this.slider = new BootstrapSlider("#slider", this.sliderOptions);
        this.slider.on("slide", function(event:any) {
                console.log(event);
        });
    }

    componentWillUnmount() {
        this.slider.destroy();
    }

    componentDidUpdate() {
        this.slider.relayout();
    }

    render() {
        return <div style={{width: "100%", height: "100%"}} id="slider"/>;
    }
}
