import * as React from "react";

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
		return <div/>;
	}
}
Weave.registerClass("weave.editors::ColorRampEditor", ColorRampEditor);
