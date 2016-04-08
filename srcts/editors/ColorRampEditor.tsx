import * as React from "react";
import {VBox, HBox} from "../react-ui/FlexBox";
import {VSpacer, HSpacer} from "../react-ui/Spacer";
import ColorRampList from "../ui/ColorRampList";
import ColorRamp = weavejs.util.ColorRamp;
import LinkableWatcher = weavejs.core.LinkableWatcher;

export interface ColorRampEditorProps extends React.Props<ColorRampEditor>
{
		colorRamp:ColorRamp;
}

export interface ColorRampEditorState 
{
	
}

// stub
export default class ColorRampEditor extends React.Component<any, any>
{
	private colorRampWatcher:LinkableWatcher = Weave.linkableChild(this, new LinkableWatcher(ColorRamp), this.handleColorRampChange, true);
	public get colorRamp():ColorRamp { return this.colorRampWatcher.target as ColorRamp; }
	public set colorRamp(value:ColorRamp) { this.colorRampWatcher.target = value; }
	
	constructor(props:ColorRampEditorProps)
	{
		super(props);
	}

	handleColorRampChange()
	{
		
	}

	render()
	{
		console.log("render");
		return (
			<VBox style={{flex: 1}}>
				<HBox style={{flex: 1}}>
					<VBox style={{flex: .7}}>
						<ColorRampList allColorRamps={ColorRamp.allColorRamps}/>
						<HBox>
							{Weave.lang("Filter")}
							<select/>
						</HBox>
					</VBox>
					<VSpacer/>
					<VBox style={{flex: .3}}>
						<label>{Weave.lang("Customize")}</label>
						<HBox style={{flex: 1}}>
							placeholder for color ramp customizer
						</HBox>
						<HBox style={{justifyContent: "space-between"}}>
							r
							<button>{Weave.lang("Add color")}</button>
						</HBox>
					</VBox>
				</HBox>
			</VBox>
		)
	}
}
Weave.registerClass("weave.editors::ColorRampEditor", ColorRampEditor);
