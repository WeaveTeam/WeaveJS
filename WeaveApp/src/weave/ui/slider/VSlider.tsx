import * as React from "react";
import * as weavejs from "weavejs";

import HBox = weavejs.ui.flexbox.HBox;
import RCSlider, {SliderOption} from "./RCSlider";

export interface VSliderProps
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

export default class VSlider extends React.Component<VSliderProps, any>
{
	constructor(props:VSliderProps)
	{
		super(props);
	}

	render():JSX.Element
	{
		return (
			<HBox overflow style={{flex: 1, justifyContent: "space-around"}} className="weave-vslider">
				<RCSlider vertical={true} {...this.props}/>
			</HBox>
		);
	}
}
