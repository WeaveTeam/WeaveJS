import * as React from "react";
import RCSlider from "./RCSlider";
import {SliderOption} from "./RCSlider";
import {HBox} from "../FlexBox";

export interface HSliderProps extends React.Props<HSlider>
{
    min?:number;
    max?:number;
    step?:number;
    options?:SliderOption[];
	selectedValues?:any[];
    type:string;
    reversed?:boolean;
    onChange?:(selectedValue:[string]) => void;
	style?:React.CSSProperties;
	className?:string;
}

export default class HSlider extends React.Component<HSliderProps, any>
{
    constructor(props:HSliderProps)
    {
        super(props);
    }

    render()
    {
        return <HBox style={{flex: 1}} className="weave-hslider"><RCSlider {...this.props}/></HBox>;
    }
}
