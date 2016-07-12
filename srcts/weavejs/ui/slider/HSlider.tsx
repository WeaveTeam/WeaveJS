namespace weavejs.ui.slider
{
	import VBox = weavejs.ui.flexbox.VBox;
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

	export class HSlider extends React.Component<HSliderProps, any>
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
}
