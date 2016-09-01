import * as React from "react";
import * as weavejs from "weavejs";

import VBox = weavejs.ui.flexbox.VBox;
import RCSlider, {SliderOption} from "weaveapp/ui/slider/RCSlider";
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
