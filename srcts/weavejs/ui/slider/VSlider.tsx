namespace weavejs.ui.slider
{
	import RCSlider = weavejs.ui.slider.RCSlider;
	import SliderOption = weavejs.ui.slider.SliderOption;
	import HBox = weavejs.ui.flexbox.HBox;

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

	export class VSlider extends React.Component<VSliderProps, any>
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
}
