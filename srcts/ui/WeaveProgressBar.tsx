import * as React from "react";
import * as ReactDOM from "react-dom";
import ProgressBar from "../react-ui/ProgressBar";
import {ProgressBarProps} from "../react-ui/ProgressBar";

export interface WeaveProgressBarProps extends React.HTMLProps<WeaveProgressBar>
{
	
}

export interface WeaveProgressBarState
{
	
}

var ProgressIndicator = weavejs.WeaveAPI.ProgressIndicator;

export default class WeaveProgressBar extends React.Component<WeaveProgressBarProps, WeaveProgressBarState>
{
	constructor(props:WeaveProgressBarProps)
	{
		super(props);
		Weave.getCallbacks(ProgressIndicator).addGroupedCallback(this, this.forceUpdate);
	}
	
	private _maxProgressBarValue:number = 0;
	
	render()
	{
		var pendingCount:number = ProgressIndicator.getTaskCount();
		var tempString:String = pendingCount + " Background Task" + (pendingCount == 1 ? '' : 's');
		var progressBarProps:ProgressBarProps = {};
		if (pendingCount == 0) // hide progress bar and text area
		{
			progressBarProps.visible = false;
			progressBarProps.total = 1; // reset progress bar
			this._maxProgressBarValue = 0;
		}
		else // display progress bar and text area
		{
			if (pendingCount > this._maxProgressBarValue)
				this._maxProgressBarValue = pendingCount;
			
			progressBarProps.progressValue = ProgressIndicator.getNormalizedProgress(); // progress between 0 and 1
			progressBarProps.visible = true;
		}

		return (
			<ProgressBar {...progressBarProps} {...this.props as any}/>
		)
	}
}
