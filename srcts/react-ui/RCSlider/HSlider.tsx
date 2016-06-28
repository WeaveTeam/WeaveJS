import * as React from "react";
import RCSlider from "./RCSlider";
import {SliderOption} from "./RCSlider";
import {VBox} from "../FlexBox";

export interface HSliderProps
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

    render():JSX.Element
    {
        return (
			<VBox overflow style={{flex: 1, justifyContent: "space-around"}} className="weave-hslider">
				<RCSlider {...this.props}/>
			</VBox>
		);
    }
}
