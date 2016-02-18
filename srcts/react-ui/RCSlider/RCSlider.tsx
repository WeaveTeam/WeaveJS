/// <reference path="../../../typings/react/react.d.ts"/>
/// <reference path="../../../typings/rc-slider/rc-slider.d.ts"/>
/// <reference path="../../../typings/react/react-dom.d.ts"/>

import * as React from "react";
import Slider from "rc-slider";
import * as ReactDOM from "react-dom";

export interface SliderProps
{
    min?:number;
    max?:number;
    step?:number;
    values?:string[] | { value: number, label: string }[];
    selectedValues:string[];
    onChange:Function
}

export default class RCSlider extends React.Component<any, any>
{
    static VERTICAL:string = "vertical";
    static HORIZONTAL:string ="horizontal";

    static NUMERIC:string = "numeric"
    static CATEGORICAL:string = "categorical";
    static NUMERIC_DISCRETE:string = "numeric-discrete";

    private options:number[];
    private indexToValue:{[index:number]: string};
    private valueToIndex:{[value:string]: number};

    private indexToLabel:{[index:number]: string};

    private min:number;
    private max:number;

    private element:Element;
    private step:number;

    constructor(props:SliderProps)
    {
        super(props);
        this.step = 1;
    }

    componentDidMount()
    {
        this.element = ReactDOM.findDOMNode(this);
    }
    componentWillUpdate()
    {
        if (this.props.type == RCSlider.NUMERIC && this.element && this.element.clientWidth && this.max && this.min)
        {
            this.step = (this.max - this.min) / this.element.clientWidth || 1;
        }
    }

    onChange(value:number|number[])
    {
        if (this.props.type == RCSlider.CATEGORICAL)
        {
            let selectedValues:string[] = [this.indexToValue[value as number]];
            this.props.onChange(selectedValues);
        }

        if (this.props.type == RCSlider.NUMERIC)
        {
            let selectedValues:Object[] = [{
                min: (value as number[])[0],
                max: (value as number[])[1]
            }];
            this.props.onChange(selectedValues);
        }

        if (this.props.type == RCSlider.NUMERIC_DISCRETE)
        {
            let selectedValues:Object[] = [{
                min: this.indexToValue[(value as number[])[0]],
                max: this.indexToValue[(value as number[])[1]]
            }];
            this.props.onChange(selectedValues);
        }
    }

    render()
    {
        this.options = [];
        this.indexToValue = {};
        this.valueToIndex = {};
        this.indexToLabel = {};

        this.props.values.forEach((option:{ value: string, label: string}, index:number) => {
            this.options.push(index);
            this.indexToValue[index] = option.value;
            this.indexToLabel[index] = option.label;
            this.valueToIndex[option.value] = index;
        });

        if (this.props.type == RCSlider.CATEGORICAL)
        {
            return <Slider min={0}
                           max={this.options.length ? this.options.length - 1 : 0}
                           step={null}
                           marks={this.indexToLabel}
                           value={this.valueToIndex[this.props.selectedValues[0]]}
                           onChange={this.onChange.bind(this)}
                    />;

        }

        if (this.props.type == RCSlider.NUMERIC)
        {
            let valueToLabel:{[value:number]: string} = {};
            this.options = this.props.values.map((option:{ value: number, label: string}) => {
                valueToLabel[option.value] = option.label;
                return option.value;
            });

            this.min = this.options.length ? Math.min.apply(null, this.options) : 0;
            this.max = this.options.length ? Math.max.apply(null, this.options) : 0;

            let marks:{[value:number]: string} = {};
            marks[this.min] = valueToLabel[this.min];
            marks[this.max] = valueToLabel[this.max];

            return  <Slider range={true}
                            step={this.step}
                            min={this.min}
                            max={this.max}
                            marks={marks}
                            value={[this.props.selectedValues[0]["min"], this.props.selectedValues[0]["max"]]}
                            onChange={this.onChange.bind(this)}
                    />
        }

        if (this.props.type == RCSlider.NUMERIC_DISCRETE)
        {
            return <Slider range={true}
                           min={0}
                           max={this.options.length ? this.options.length - 1 : 0}
                           step={null}
                           marks={this.indexToLabel}
                           value={[this.valueToIndex[this.props.selectedValues[0]["min"]], this.valueToIndex[this.props.selectedValues[0]["max"]]]}
                           onChange={this.onChange.bind(this)}
                    />
        }
    }
}
