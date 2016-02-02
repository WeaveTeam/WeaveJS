/// <reference path="../../../typings/react/react.d.ts"/>
/// <reference path="../../../typings/rc-slider/rc-slider.d.ts"/>

import * as React from "react";
import Slider from "rc-slider";

export interface SliderProps {
    min?:number;
    max?:number;
    step?:number;
    values?:string[];
    selectedValues:string[];
    onChange:Function
}

export default class RCSlider extends React.Component<any, any> {

    static VERTICAL:string = "vertical";
    static HORIZONTAL:string ="horizontal";

    static NUMERIC:string = "numeric"
    static CATEGORICAL:string = "categorical";

    private options:number[];
    private indexToValues:{[index:number]: string};
    private valueToIndex:{[value:string]: number};

    constructor(props:SliderProps) {
        super(props);
    }

    onChange(value:number|number[]) {
        if(this.props.type == RCSlider.CATEGORICAL) {
            let selectedValues:string[] = [this.indexToValues[value as number]];
            this.props.onChange(selectedValues);
        }

        if(this.props.type == RCSlider.NUMERIC) {
            let selectedValues:Object[] = [{
                min: value[0],
                max: value[1]
            }];
            this.props.onChange(selectedValues);
        }
    }

    render() {
        this.options = [];
        this.indexToValues = {};
        this.valueToIndex = {};

        if(this.props.type == RCSlider.CATEGORICAL) {

            this.props.values.forEach((value:string, index:number) => {
                this.options.push(index);
                this.indexToValues[index] = value;
                this.valueToIndex[value] = index;
            });

            return <Slider
                           min={0}
                           max={this.options.length}
                           step={null}
                           marks={this.indexToValues}
                           value={this.valueToIndex[this.props.selectedValues[0]]}
                           onChange={this.onChange.bind(this)}
                    />;

        }

        if(this.props.type == RCSlider.NUMERIC) {
            return <Slider
                           min={this.props.min}
                           max={this.props.max}
                           step={null}
                           value={[this.props.selectedValues[0]["min"], this.props.selectedValues[0]["max"]]}
                           onChange={this.onChange.bind(this)}
                    />
        }
    }
}
