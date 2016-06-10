import * as React from "react";
import ProgressBar from "../react-ui/ProgressBar";
import SmartComponent from "./SmartComponent";

export interface WeaveProgressBarProps extends React.HTMLProps<WeaveProgressBar>
{
	
}

export interface WeaveProgressBarState
{
	visible:boolean;
}

var ProgressIndicator = weavejs.WeaveAPI.ProgressIndicator;

export default class WeaveProgressBar extends SmartComponent<WeaveProgressBarProps, WeaveProgressBarState>
{
	constructor(props:WeaveProgressBarProps)
	{
		super(props);
		Weave.getCallbacks(ProgressIndicator).addGroupedCallback(this, this.forceUpdate);
		weavejs.WeaveAPI.Scheduler.frameCallbacks.addGroupedCallback(this, this.toggleVisible);
		this.state = {
			visible: false
		};
	}

	private timeBecameBusy:number = 0;
	private autoVisibleDelay:number = 2000;
	private autoHideDelay:number = 800;
	/**
	 * This will automatically toggle visibility based on the target's busy status.
	 */
	private toggleVisible():void
	{
		var busy:boolean = ProgressIndicator.getTaskCount() > 0;
		if (this.state.visible != busy)
		{
			if (this.timeBecameBusy == -1)
				this.timeBecameBusy = Date.now();

			if (Date.now() < this.timeBecameBusy + (busy ? this.autoVisibleDelay : this.autoHideDelay))
				return;

			this.setState({
				visible: busy
			});
		}
		this.timeBecameBusy = -1;
	}

	render()
	{
		return (
			<ProgressBar
				visible={this.state.visible}
				progressValue={ProgressIndicator.getNormalizedProgress()}
				{...this.props as any}
			/>
		);
	}
}
