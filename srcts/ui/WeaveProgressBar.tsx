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
	private timeBecameBusy:number = 0;
	private autoVisibleDelay:number = 2000;
	private visible:boolean = false;

	/**
	 * This will automatically toggle visibility based the target's busy status.
	 */
	private toggleVisible(busy:boolean):void
	{
		if (this.visible != busy)
		{
			if (busy)
			{
				if (this.timeBecameBusy == -1)
					this.timeBecameBusy = Date.now();
				if (Date.now() < this.timeBecameBusy + this.autoVisibleDelay)
					return;
			}
			
			this.visible = busy;
		}
		this.timeBecameBusy = -1;
	}

	render()
	{
		var pendingCount:number = ProgressIndicator.getTaskCount();
		var tempString:String = pendingCount + " Background Task" + (pendingCount == 1 ? '' : 's');
		var progressBarProps:ProgressBarProps = {};
		
		this.toggleVisible(pendingCount > 0);
		
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
			progressBarProps.visible = this.visible;
		}

		return (
			<ProgressBar {...progressBarProps} {...this.props as any}/>
		)
	}
}
