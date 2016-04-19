import * as React from "react";
import Slider from "rc-slider";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";

export type SliderOption = {
	value: any,
	label: string
};

export interface SliderProps
{
    min?:number;
    max?:number;
    step?:number;
    options?:SliderOption[];
    selectedValues:any[];
    onChange:Function;
	vertical:boolean
}

export default class RCSlider extends React.Component<any, any>
{
    static VERTICAL:string = "vertical";
    static HORIZONTAL:string ="horizontal";

    static NUMERIC:string = "numeric"
    static CATEGORICAL:string = "categorical";
    static NUMERIC_DISCRETE:string = "numeric-discrete";

    private options:number[];
    private indexToValue:Map<number, any> = new Map();
    private valueToIndex:Map<any, number> = new Map();

    private indexToLabel:{[index:number]: string};

    private min:number;
    private max:number;

    private element:Element;
    private step:number;

    constructor(props:SliderProps)
    {
        super(props);
        this.step = 1;
		this.onChange = _.debounce(this.onChange.bind(this), 30);
    }

    componentDidMount()
    {
        this.element = ReactDOM.findDOMNode(this);
    }
	
    componentWillUpdate()
    {
        // if (this.props.type == RCSlider.NUMERIC && this.element && this.element.clientWidth && this.max && this.min)
        // {
        //     this.step = (this.max - this.min) / this.element.clientWidth || 1;
        // }
    }

    onChange(value:any)
    {
        if (this.props.type == RCSlider.CATEGORICAL)
		{
            let selectedValues:any[] = [this.indexToValue.get(value)];
            this.props.onChange(selectedValues);
        }

        if (this.props.type == RCSlider.NUMERIC) 
		{
			// TODO put try catch block
            let selectedValues:any[] = [{
                min: value[0],
                max: value[1]
            }];
            this.props.onChange(selectedValues);
        }

        if (this.props.type == RCSlider.NUMERIC_DISCRETE)
		{
			// TODO put try catch block
            let selectedValues:Object[] = [{
                min: this.indexToValue.get(value[0]),
                max: this.indexToValue.get(value[1])
            }];
            this.props.onChange(selectedValues);
        }
    }

    render():JSX.Element
    {
        this.options = [];
        this.indexToValue.clear();
        this.valueToIndex.clear();
        this.indexToLabel = {};
		
		if(!this.props.options)
		{
			this.options = [];
		}
		else
		{
			this.props.options.forEach((option:SliderOption, index:number) => {
				this.options.push(index);
				this.indexToValue.set(index, option.value);
				this.indexToLabel[index] = option.label;
				this.valueToIndex.set(option.value, index);
			});
		}

        if (this.props.type == RCSlider.CATEGORICAL)
        {
            return <Slider min={0}
                           max={this.options.length ? this.options.length - 1 : 0}
                           step={null}
                           marks={this.indexToLabel}
                           value={this.valueToIndex.get((this.props.selectedValues || [])[0])}
                           onChange={this.onChange}
						   vertical={this.props.vertical}
                    />;

        }

		var value:{ min:number, max:number } = Object((this.props.selectedValues || [])[0]);
		
        if (this.props.type == RCSlider.NUMERIC)
        {
            let valueToLabel:{[value:number]: string} = {};
            this.options = this.props.options.map((option:SliderOption) => {
                valueToLabel[option.value] = option.label;
                return option.value;
            });

			if(this.options.length) 
			{
				this.min = Math.min.apply(null, this.options);
				this.max = Math.max.apply(null, this.options);
			}
			else
			{
				this.min = 0; 
				this.max = 1;
			}


			if (isNaN(value.min))
				value.min = this.min;
			if (isNaN(value.max))
				value.max = this.max;
			
			let marks:{[value:number]: string} = {};
			marks[this.min] = valueToLabel[this.min] || "0";
			marks[this.max] = valueToLabel[this.max] || "1";
            let stepCount:number = (this.max - this.min)/1024;

            //todo - needs better handling ? for step count 0
            return <Slider range={true}
		                   step={stepCount > 0 ? stepCount :1}
		                   min={this.min}
		                   max={this.max}
		                   marks={marks}
		                   value={[value.min, value.max]}
		                   onChange={this.onChange}
						   vertical={this.props.vertical}
            		/>;



        }

        if (this.props.type == RCSlider.NUMERIC_DISCRETE)
        {
			var min:number = 0;
			var max:number = 1;
			if(this.options.length > 0)
				max = Math.max(0, this.options.length - 1);

			if (isNaN(value.min))
				value.min = min;
			if (isNaN(value.max))
				value.max = max;
			
            return <Slider range={true}
                           min={min}
                           max={max}
                           step={null}
                           marks={this.indexToLabel}
                           value={[this.valueToIndex.get(value.min), this.valueToIndex.get(value.max)]}
                           onChange={this.onChange}
						   vertical={this.props.vertical}
                    />
        }
    }
}
