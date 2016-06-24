import * as React from "react";
import RCSlider from "./RCSlider";
import {SliderOption} from "./RCSlider";
import {HBox} from "../FlexBox";

export interface VSliderProps extends React.Props<VSlider>
{
	min?:number;
    max?:number;
    step?:number;
    options?:SliderOption[];
	selectedValues?:any[];
    type:string;
    reversed?:boolean;
    onChange?:(selectedValue:[string]) => void;
}

export default class VSlider extends React.Component<VSliderProps, any>
{
    constructor(props:VSliderProps)
    {
        super(props);
    }

    render()
    {
        return (
			<HBox overflow style={{flex: 1, justifyContent: "space-around"}} className="weave-vslider">
				<RCSlider vertical={true} {...this.props}/>
			</HBox>
		);
    }
}
