import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import HSlider from "../react-ui/RCSlider/HSlider";
import RCSlider from "../react-ui/RCSlider/RCSlider";
import {SliderOption} from "../react-ui/RCSlider/RCSlider";
import classNames from "../modules/classnames";
import CenteredIcon from "../react-ui/CenteredIcon";
import SessionStateLog = weavejs.core.SessionStateLog;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import LogEntry = weavejs.core.LogEntry;

export interface SessionHistorySliderProps extends React.Props<SessionHistorySlider>
{
	stateLog:SessionStateLog;
}

export interface SessionHistorySliderState
{
	max?:number;
	position?:number;
}

const Z_KEYCODE = 90;
const Y_KEYCODE = 89;

export default class SessionHistorySlider extends React.Component<SessionHistorySliderProps, SessionHistorySliderState>
{
	private _stateLogWatcher:LinkableWatcher = Weave.linkableChild(this, new LinkableWatcher(SessionStateLog));

	constructor(props:SessionHistorySliderProps)
	{
		super(props);
		this._stateLogWatcher.target = props.stateLog;
		this.state = {
			position: 0
		}
		Weave.getCallbacks(this._stateLogWatcher).addGroupedCallback(this, this.handleStateLogChange, true, false);
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
	private handleStateLogChange()
	{
		
		this.setState({
			position: this._stateLog.undoHistory.length,
			max: this._stateLog.undoHistory.length + this._stateLog.redoHistory.length + 1
		})
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
		// this.setState({
		// 	sliderMax: this._stateLog.undoHistory.length + this._stateLog.redoHistory.length,
		// 	sliderValue: this._stateLog.undoHistory.length
		// });

		// sliderValue = slider.maximum > slider.minimum;
		// undoButton.enabled = _stateLog.undoHistory.length > 0;
		// redoButton.enabled = _stateLog.redoHistory.length > 0;
		// // save current time as reference point
		// _lastReplayTime = getTimer();
	}

	handleKeyStroke=(event:KeyboardEvent)=>
	{
		event.preventDefault();
		// ctrl-z and cmd-z
		if((event.ctrlKey || event.metaKey) && event.keyCode == Z_KEYCODE)
			this._stateLog.undo();

		// ctrl-y and cmd-y and cmd-shift-z
		if(((event.ctrlKey || event.metaKey) && event.keyCode == Y_KEYCODE) || (event.metaKey && event.shiftKey && event.keyCode == Z_KEYCODE))
			this._stateLog.redo();
	};

	componentDidMount()
	{
		document.addEventListener("keydown", this.handleKeyStroke);
	}

	componentWillUnmount()
	{
		document.removeEventListener("keydown", this.handleKeyStroke);
	}

	play=()=>
	{
		
	};

	getPlayLabel=(a:number, b:string):string=>
	{
		return "";
	};
	
	handleSlider(selectedValue:string[])
	{
		if(!selectedValue || !selectedValue.length) {
			selectedValue = ["0"];
		}
		var delta:number = Number(selectedValue[0]) - this._stateLog.undoHistory.length;
		if (delta < 0)
			this._stateLog.undo(-delta);
		else
			this._stateLog.redo(delta);
	}
	
	private _playSpeed:number;

	render():JSX.Element
	{
		//<button ref={(c) => this.playButton = c} label={this.getPlayLabel(this._playSpeed, "")} title={Weave.lang('Replay session history')} onClick={() => {if(this.playButton.value) this.play()}}>Replay</button>
		//className="fa fa-undo fa-flip-horizontal"

		var sliderOptions:SliderOption[] = [];
		for(var i = 0; i < this.state.max; i++) {
			sliderOptions.push({
				value: i,
				label: ""
			});
		}

		return (
			<HBox style={{flex: 1, alignItems: "center", alignSelf: "stretch"}}>

				<CenteredIcon title={Weave.lang('Undo')}
							  onClick={() => this._stateLog.undo()}
							  className={classNames('weave-menubar-item', {"weave-menubar-item-disabled": !this._stateLog.undoHistory.length})}
							  iconProps={{className: "fa fa-arrow-left"}}/>

				<CenteredIcon title={Weave.lang('Redo')}
							  onClick={() => this._stateLog.redo()}
							  className={classNames('weave-menubar-item', {"weave-menubar-item-disabled": !this._stateLog.redoHistory.length})}
							  iconProps={{className:"fa fa-arrow-right"}}/>

				<div style={{alignContent: "center", paddingLeft: 10, paddingRight: 10, flex: 1}}>
					<HSlider options={sliderOptions} selectedValues={[this.state.position as any]} step={1} onChange={this.handleSlider.bind(this)} type={RCSlider.CATEGORICAL}/>
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
Weave.registerClass(SessionHistorySlider, "weavejs.editors.SessionHistorySlider");
