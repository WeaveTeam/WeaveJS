import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import HSlider from "../react-ui/RCSlider/HSlider";
import RCSlider from "../react-ui/RCSlider/RCSlider";

import SessionStateLog = weavejs.core.SessionStateLog;
import LinkableWatcher = weavejs.core.LinkableWatcher;

export interface SessionHistorySliderProps extends React.Props<SessionHistorySlider>
{
	stateLog:SessionStateLog;
}

export interface SessionHistorySliderState
{
	sliderMin?:number;
	sliderValue?:number;
	sliderMax?:number;
}

export default class SessionHistorySlider extends React.Component<SessionHistorySliderProps, SessionHistorySliderState>
{
	private _stateLogWatcher:LinkableWatcher;

	constructor(props:SessionHistorySliderProps)
	{
		super(props);
		this.state = {
			sliderMin: 0,
			sliderValue: 0,
			sliderMax: 0
		}
		this._stateLogWatcher = Weave.linkableChild(this, new LinkableWatcher(SessionStateLog), this.handleStateLogChange, true);
		this._stateLogWatcher.target = props.stateLog;
	}
	
	componentWillReceiveProps(props:SessionHistorySliderProps)
	{
		this._stateLogWatcher.target = props.stateLog;
	}

	private get _stateLog():SessionStateLog
	{
		return this._stateLogWatcher.target as SessionStateLog;
	}

	// called when state log changes
	private handleStateLogChange=()=>
	{
		// if (objectWasDisposed(_stateLog))
		// 	return;
		// 
		// if (!parent)
		// {
		// 	callLater(handleStateLogChange);
		// 	return;
		// }
		
//		if (Weave.detectChange(handleStateLogChange, _stateLog.enableLogging))
//			menuButton.visible = menuButton.includeInLayout = _stateLog.enableLogging.value;
		
		this.setState({
			sliderMax: this._stateLog.undoHistory.length + this._stateLog.redoHistory.length,
			sliderValue: this._stateLog.undoHistory.length
		});

		// sliderValue = slider.maximum > slider.minimum;
		// undoButton.enabled = _stateLog.undoHistory.length > 0;
		// redoButton.enabled = _stateLog.redoHistory.length > 0;
		// // save current time as reference point
		// _lastReplayTime = getTimer();
	}
	
	play=()=>
	{
		
	}

	getPlayLabel=(a:number, b:string):string=>
	{
		return "";
	}
	
	handleSlider=()=>
	{
		
	}
	private _playSpeed:number;
	playButton:HTMLButtonElement;
	undoButton:HTMLButtonElement;

	render():JSX.Element
	{
//				<button ref={(c) => this.playButton = c} label={this.getPlayLabel(this._playSpeed, "")} title={Weave.lang('Replay session history')} onClick={() => {if(this.playButton.value) this.play()}}>Replay</button>
		return (
			<HBox style={{alignItems: "center", paddingTop: 5, paddingLeft: 5, paddingRight: 5, paddingBottom: 5}}>
				<button ref={(c) => this.undoButton = c} onClick={() => this._stateLog.undo()} title={Weave.lang('Undo')}>Undo</button>
				<button ref={(c) => this.undoButton = c} onClick={() => this._stateLog.redo()} title={Weave.lang('Redo')}>Redo</button>
				<div style={{alignContent: "center", paddingLeft: 10, paddingRight: 10, flex: 1}}>
					<HSlider min={0} max={this.state.sliderMax} step={1} onChange={this.handleSlider} type={RCSlider.CATEGORICAL}/>
				</div>
				{/*<MenuButton width="24" id="menuButton" toolTip="{lang('Menu')}" initialize="menuButton.data = [
					{label: lang('Clear all history'), click: _stateLog.clearHistory},
					{label: lang('Clear undo history'), click: function():void { _stateLog.clearHistory(-1); }},
					{label: lang('Clear redo history'), click: function():void { _stateLog.clearHistory(1); }},
					{label: getSquashMenuLabel, click: squash, shown: getSquashMenuLabel}
				];"/>*/}
			</HBox>
		);
	}
}
Weave.registerClass("weavejs.editors.SessionHistorySlider", SessionHistorySlider);
