namespace weavejs.ui
{
	import HBox = weavejs.ui.flexbox.HBox;
	import VBox = weavejs.ui.flexbox.VBox;
	import HSlider = weavejs.ui.slider.HSlider;
	import VSlider = weavejs.ui.slider.VSlider;

	export interface IMenuLayoutComponentProps
	{
		selectedItems:any;//TODO find out right typing
		options:{label:string,value:any}[];
		displayMode:string;
		onChange : (selectedValue:any[]) => void;
	}

	const LAYOUT_LIST:string = "List";
	const LAYOUT_COMBO:string = "ComboBox";
	const LAYOUT_VSLIDER:string = "VSlider";
	const LAYOUT_HSLIDER:string = "HSlider";
	const LAYOUT_CHECKBOXLIST:string = "CheckBoxList";

	export interface IMenuLayoutComponentState
	{

	}

	export class MenuLayoutComponent extends React.Component<IMenuLayoutComponentProps, IMenuLayoutComponentState>
	{
		constructor(props:IMenuLayoutComponentProps)
		{
			super(props);
		}

		render():JSX.Element
		{
			switch (this.props.displayMode)
			{
				case LAYOUT_LIST:
					return (
						<VBox>
							<List options={ this.props.options } multiple={true} onChange={ this.props.onChange } selectedValues={ this.props.selectedItems }/>
						</VBox>
					);
				case LAYOUT_HSLIDER:
					return (
						<HBox style={{ flex: 1, paddingLeft: 25, paddingRight: 25, overflow: "hidden" }}>
							<HSlider options={ this.props.options } onChange={ this.props.onChange} selectedValues={ this.props.selectedItems } type="categorical"/>
						</HBox>
					);
				case LAYOUT_VSLIDER:
					return (
						<VBox style={{ flex: 1, paddingTop: 25, paddingBottom: 25, overflow: "hidden" }}>
							<VSlider options={ this.props.options } onChange={ this.props.onChange } selectedValues={ this.props.selectedItems } type="categorical"/>
						</VBox>
					);
				case LAYOUT_CHECKBOXLIST:
					return (
						<VBox style={{flex: 1, padding: 10}}>
							<CheckBoxList options={this.props.options} selectedValues={this.props.selectedItems} onChange={this.props.onChange}/>
						</VBox>
					);
				case LAYOUT_COMBO:
					return (
						<VBox style={{flex: 1, padding: 5}}>
							<FloatingDiv useContentHeight style={{flex: 1}}>
								<ComboBox
									placeholder={(Weave.lang("Select a column"))}
									options={ this.props.options as ComboBoxOption[] }
									onChange={ this.props.onChange }
									value={ _.head(this.props.selectedItems as any[]) }
								/>
							</FloatingDiv>
						</VBox>
					);
				default:
					return null;
			}
		}
	}
}