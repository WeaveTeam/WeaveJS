/* ***** BEGIN LICENSE BLOCK *****
 *
 * This file is part of Weave.
 *
 * The Initial Developer of Weave is the Institute for Visualization
 * and Perception Research at the University of Massachusetts Lowell.
 * Portions created by the Initial Developer are Copyright (C) 2008-2015
 * the Initial Developer. All Rights Reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * ***** END LICENSE BLOCK ***** */

namespace weavejs.core
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import ILinkableVariable = weavejs.api.core.ILinkableVariable;
	import ISessionManager = weavejs.api.core.ISessionManager;
	import StandardLib = weavejs.util.StandardLib;
	import SessionStateObject = weavejs.api.core.SessionStateObject;
	import JS = weavejs.util.JS;

	export interface SessionStateLogState
	{
		version: number,
		currentState: SessionStateObject,
		undoHistory: LogEntry[],
		redoHistory: LogEntry[],
		nextId: number
	}
	/**
	 * This class saves the session history of an ILinkableObject.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.core.SessionStateLog", interfaces: [ILinkableVariable, IDisposableObject]})
	export class SessionStateLog implements ILinkableVariable, IDisposableObject
	{
		public static debug:boolean = false;
		public static enableHistoryRewrite:boolean = true; // should be set to true except for debugging
		
		constructor(subject:ILinkableObject, syncDelay:uint = 0)
		{
			this._syncTime = Date.now();
			this._undoHistory = [];
			this._redoHistory = [];
			
			this._subject = subject;
			this._syncDelay = syncDelay;
			this._prevState = JS.copyObject(WeaveAPI.SessionManager.getSessionState(this._subject)); // remember the initial state
			WeaveAPI.SessionManager.registerDisposableChild(this._subject, this); // make sure this is disposed when _subject is disposed
			
			var cc:ICallbackCollection = WeaveAPI.SessionManager.getCallbackCollection(this._subject);
			cc.addImmediateCallback(this, this.immediateCallback);
			cc.addGroupedCallback(this, this.groupedCallback);
		}
		
		public dispose():void
		{
			if (this._undoHistory == null)
				throw new Error("SessionStateLog.dispose() called more than once");
			
			this._subject = null;
			this._undoHistory = null;
			this._redoHistory = null;
		}
		
		private _subject:ILinkableObject; // the object we are monitoring
		private _syncDelay:uint; // the number of milliseconds to wait before automatically synchronizing
		private _prevState:SessionStateObject = null; // the previously seen session state of the subject
		private _undoHistory:LogEntry[]; // diffs that can be undone
		private _redoHistory:LogEntry[]; // diffs that can be redone
		private _nextId:int = 0; // gets incremented each time a new diff is created
		private _undoActive:boolean = false; // true while an undo operation is active
		private _redoActive:boolean = false; // true while a redo operation is active
		
		private _syncTime:int; // this is set to getTimer() when synchronization occurs
		private _triggerDelay:int = -1; // this is set to (getTimer() - _syncTime) when immediate callbacks are triggered for the first time since the last synchronization occurred
		private _saveTime:uint = 0; // this is set to getTimer() + _syncDelay to determine when the next diff should be computed and logged
		private _savePending:boolean = false; // true when a diff should be computed
		
		/**
		 * When this is set to true, changes in the session state of the subject will be automatically logged.
		 */
		public /* readonly */ enableLogging:LinkableBoolean = WeaveAPI.SessionManager.registerLinkableChild(this, new LinkableBoolean(true), this.synchronizeNow);
		
		/**
		 * This will squash a sequence of undos or redos into a single undo or redo.
		 * @param directionalSquashCount Number of undos (negative) or redos (positive) to squash.
		 */		
		public squashHistory(directionalSquashCount:int):void
		{
			var sm:ISessionManager = WeaveAPI.SessionManager;
			var cc:ICallbackCollection = sm.getCallbackCollection(this);
			cc.delayCallbacks();
			
			this.synchronizeNow();

			var count:int = StandardLib.constrain(directionalSquashCount, -this._undoHistory.length, this._redoHistory.length);
			if (count < -1 || count > 1)
			{
				cc.triggerCallbacks();
				
				var entries:LogEntry[];
				if (count < 0)
					entries = this._undoHistory.splice(this._undoHistory.length + count, -count);
				else
					entries = this._redoHistory.splice(0, count);
				
				var entry:LogEntry;
				var squashBackward:Object = null;
				var squashForward:Object = null;
				var totalDuration:int = 0;
				var totalDelay:int = 0;
				var last:int = entries.length - 1;
				for (var i:int = 0; i <= last; i++)
				{
					entry = entries[last - i];
					squashBackward = sm.combineDiff(squashBackward, entry.backward);
					
					entry = entries[i];
					squashForward = sm.combineDiff(squashForward, entry.forward);
					
					totalDuration += entry.diffDuration;
					totalDelay += entry.triggerDelay;
				}
				
				entry = new LogEntry(this._nextId++, squashForward, squashBackward, totalDelay, totalDuration);
				if (count < 0)
					this._undoHistory.push(entry);
				else
					this._redoHistory.unshift(entry);
			}
			
			cc.resumeCallbacks();
		}
		
		/**
		 * This will clear all undo and redo history.
		 * @param directional Zero will clear everything. Set this to -1 to clear all undos or 1 to clear all redos.
		 */
		public clearHistory(directional:int = 0):void
		{
			var cc:ICallbackCollection = WeaveAPI.SessionManager.getCallbackCollection(this);
			cc.delayCallbacks();
			
			this.synchronizeNow();
			
			if (directional <= 0)
			{
				if (this._undoHistory.length > 0)
					cc.triggerCallbacks();
				this._undoHistory.length = 0;
			}
			if (directional >= 0)
			{
				if (this._redoHistory.length > 0)
					cc.triggerCallbacks();
				this._redoHistory.length = 0;
			}
			
			cc.resumeCallbacks();
		}
		
		/**
		 * This gets called as an immediate callback of the subject.
		 */		
		private immediateCallback():void
		{
			if (!this.enableLogging.value)
				return;
			
			// we have to wait until grouped callbacks are called before we save the diff
			this._saveTime = Number.MAX_VALUE;
			
			// make sure only one call to saveDiff() is pending
			if (!this._savePending)
			{
				this._savePending = true;
				this.saveDiff();
			}
			
			if (SessionStateLog.debug && (this._undoActive || this._redoActive))
			{
				var state:SessionStateObject = WeaveAPI.SessionManager.getSessionState(this._subject) as SessionStateObject;
				var forwardDiff:SessionStateObject = WeaveAPI.SessionManager.computeDiff(this._prevState, state);
				console.log('immediate diff:', forwardDiff);
			}
		}
		
		/**
		 * This gets called as a grouped callback of the subject.
		 */
		private groupedCallback():void
		{
			if (!this.enableLogging.value)
				return;
			
			// Since grouped callbacks are currently running, it means something changed, so make sure the diff is saved.
			this.immediateCallback();
			// It is ok to save a diff some time after the last time grouped callbacks are called.
			// If callbacks are triggered again before the next frame, the immediateCallback will reset this value.
			this._saveTime = Date.now() + this._syncDelay;
			
			if (SessionStateLog.debug && (this._undoActive || this._redoActive))
			{
				var state:SessionStateObject = WeaveAPI.SessionManager.getSessionState(this._subject);
				var forwardDiff:SessionStateObject = WeaveAPI.SessionManager.computeDiff(this._prevState, state);
				console.log('grouped diff:', forwardDiff);
			}
		}
		
		/**
		 * This will save a diff in the history, if there is any.
		 * @param immediately Set to true if it should be saved immediately, or false if it can wait.
		 */
		private saveDiff(immediately:boolean = false):void
		{
			if (!this.enableLogging.value)
			{
				this._savePending = false;
				return;
			}
			
			var currentTime:int = Date.now();
			
			// remember how long it's been since the last synchronization
			if (this._triggerDelay < 0)
				this._triggerDelay = currentTime - this._syncTime;
			
			if (!immediately && Date.now() < this._saveTime)
			{
				// we have to wait until the next frame to save the diff because grouped callbacks haven't finished.
				WeaveAPI.Scheduler.callLater(this, this.saveDiff);
				return;
			}
			
			var sm:ISessionManager = WeaveAPI.SessionManager;
			var cc:ICallbackCollection = sm.getCallbackCollection(this);
			cc.delayCallbacks();
			
			var state:SessionStateObject = sm.getSessionState(this._subject);
			var forwardDiff:any = JS.copyObject(sm.computeDiff(this._prevState, state));
			if (forwardDiff !== undefined)
			{
				var diffDuration:int = currentTime - (this._syncTime + this._triggerDelay);
				var backwardDiff:any = JS.copyObject(sm.computeDiff(state, this._prevState));
				var oldEntry:LogEntry;
				var newEntry:LogEntry;
				if (this._undoActive)
				{
					// To prevent new undo history from being added as a result of applying an undo, overwrite first redo entry.
					// Keep existing delay/duration.
					oldEntry = this._redoHistory[0];
					newEntry = new LogEntry(this._nextId++, backwardDiff, forwardDiff, oldEntry.triggerDelay, oldEntry.diffDuration);
					if (SessionStateLog.enableHistoryRewrite)
					{
						this._redoHistory[0] = newEntry;
					}
					else if (StandardLib.compare(oldEntry.forward, newEntry.forward) != 0)
					{
						this._redoHistory.unshift(newEntry);
					}
				}
				else
				{
					newEntry = new LogEntry(this._nextId++, forwardDiff, backwardDiff, this._triggerDelay, diffDuration);
					if (this._redoActive)
					{
						// To prevent new undo history from being added as a result of applying a redo, overwrite last undo entry.
						// Keep existing delay/duration.
						oldEntry = this._undoHistory.pop();
						newEntry.triggerDelay = oldEntry.triggerDelay;
						newEntry.diffDuration = oldEntry.diffDuration;
						
						if (!SessionStateLog.enableHistoryRewrite && StandardLib.compare(oldEntry.forward, newEntry.forward) == 0)
							newEntry = oldEntry; // keep old entry
					}
					// save new undo entry
					this._undoHistory.push(newEntry);
				}
				
				if (SessionStateLog.debug)
					this.debugHistory(newEntry);
				
				this._syncTime = currentTime; // remember when diff was saved
				cc.triggerCallbacks();
				
				// To avoid unnecessary work, only make a copy of the state if there was a diff.
				// If there was no diff, we don't need to update _prevState.
				this._prevState = JS.copyObject(state);
			}
			
			// always reset sync time after undo/redo even if there was no new diff
			if (this._undoActive || this._redoActive)
				this._syncTime = currentTime;
			this._undoActive = false;
			this._redoActive = false;
			this._savePending = false;
			this._triggerDelay = -1;
			
			cc.resumeCallbacks();
		}

		/**
		 * This function will save any pending diff in session state.
		 * Use this function only when necessary (for example, when writing a collaboration service that must synchronize).
		 */
		public synchronizeNow():void
		{
			this.saveDiff(true);
		}
		
		/**
		 * This will undo a number of steps from the saved history.
		 * @param numberOfSteps The number of steps to undo.
		 */
		public undo(numberOfSteps:int = 1):void
		{
			this.applyDiffs(-numberOfSteps);
		}
		
		/**
		 * This will redo a number of steps that have been previously undone.
		 * @param numberOfSteps The number of steps to redo.
		 */
		public redo(numberOfSteps:int = 1):void
		{
			this.applyDiffs(numberOfSteps);
		}
		
		/**
		 * This will apply a number of undo or redo steps.
		 * @param delta The number of steps to undo (negative) or redo (positive).
		 */
		private applyDiffs(delta:int):void
		{
			var stepsRemaining:int = Math.min(Math.abs(delta), delta < 0 ? this._undoHistory.length : this._redoHistory.length);
			if (stepsRemaining > 0)
			{
				var logEntry:LogEntry;
				var diff:Object;
				var debug:boolean = SessionStateLog.debug && stepsRemaining == 1;
				
				// if something changed and we're not currently undoing/redoing, save the diff now
				if (this._savePending && !this._undoActive && !this._redoActive)
					this.synchronizeNow();
				
				var sm:ISessionManager = WeaveAPI.SessionManager;
				var combine:boolean = stepsRemaining > 2;
				var baseDiff:Object = null;
				sm.getCallbackCollection(this._subject).delayCallbacks();
				// when logging is disabled, revert to previous state before applying diffs
				if (!this.enableLogging.value)
				{
					var state:Object = sm.getSessionState(this._subject);
					// baseDiff becomes the change that needs to occur to get back to the previous state
					baseDiff = sm.computeDiff(state, this._prevState);
					if (baseDiff != null)
						combine = true;
				}
				while (stepsRemaining-- > 0)
				{
					if (delta < 0)
					{
						logEntry = this._undoHistory.pop();
						this._redoHistory.unshift(logEntry);
						diff = logEntry.backward;
					}
					else
					{
						logEntry = this._redoHistory.shift();
						this._undoHistory.push(logEntry);
						diff = logEntry.forward;
					}
					if (debug)
						console.log('apply', delta < 0 ? 'undo' : 'redo', logEntry.id + ':', diff);
					
					if (stepsRemaining == 0 && this.enableLogging.value)
					{
						// remember the session state right before applying the last step so we can rewrite the history if necessary
						this._prevState = JS.copyObject(sm.getSessionState(this._subject));
					}
					
					if (combine)
					{
						baseDiff = sm.combineDiff(baseDiff, diff);
						if (stepsRemaining <= 1)
						{
							sm.setSessionState(this._subject, baseDiff, false);
							combine = false;
						}
					}
					else
					{
						sm.setSessionState(this._subject, diff, false);
					}
					
					if (debug)
					{
						var newState:Object = sm.getSessionState(this._subject);
						var resultDiff:Object = sm.computeDiff(this._prevState, newState);
						JS.log('resulting diff:', resultDiff);
					}
				}
				sm.getCallbackCollection(this._subject).resumeCallbacks();
				
				this._undoActive = delta < 0 && this._savePending;
				this._redoActive = delta > 0 && this._savePending;
				if (!this._savePending)
					this._prevState = JS.copyObject(sm.getSessionState(this._subject));
				sm.getCallbackCollection(this).triggerCallbacks();
			}
		}
		
		/**
		 * @TODO create an interface for the objects in this Array
		 */
		public get undoHistory():LogEntry[]
		{
			return this._undoHistory;
		}
		
		/**
		 * @TODO create an interface for the objects in this Array
		 */
		public get redoHistory():LogEntry[]
		{
			return this._redoHistory;
		}

		private debugHistory(logEntry:LogEntry):void
		{
			var h:LogEntry[] = this._undoHistory.concat();
			for (var i:int = 0; i < h.length; i++)
				h[i] = h[i].id;
			var f:LogEntry[] = this._redoHistory.concat();
			for (i = 0; i < f.length; i++)
				f[i] = f[i].id;
			if (logEntry)
			{
				console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
				console.log('NEW HISTORY (backward) ' + logEntry.id + ':', logEntry.backward);
				console.log("===============================================================");
				console.log('NEW HISTORY (forward) ' + logEntry.id + ':', logEntry.forward);
				console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
			}
			console.log('undo ['+h+']','redo ['+f+']');
		}
		
		/**
		 * This will generate an untyped session state object that contains the session history log.
		 * @return An object containing the session history log.
		 */		
		public getSessionState():SessionStateLogState
		{
			var cc:ICallbackCollection = WeaveAPI.SessionManager.getCallbackCollection(this);
			cc.delayCallbacks();
			this.synchronizeNow();
			
			// The "version" property can be used to detect old session state formats and should be incremented whenever the format is changed.
			var state = {
				version: 0,
				currentState: this._prevState,
				undoHistory: this._undoHistory.concat(),
				redoHistory: this._redoHistory.concat(),
				nextId: this._nextId
				// not including enableLogging
			};
			
			cc.resumeCallbacks();
			return state;
		}
		
		/**
		 * This will load a session state log from an untyped session state object.
		 * @param input The ByteArray containing the output from seralize().
		 */
		public setSessionState(state:SessionStateLogState):void
		{
			// make sure callbacks only run once while we set the session state
			var cc:ICallbackCollection = WeaveAPI.SessionManager.getCallbackCollection(this);
			cc.delayCallbacks();
			this.enableLogging.delayCallbacks();
			try
			{
				var version:number = (state as any).version;
				switch (version)
				{
					case 0:
					{
						// note: some states from version 0 may include enableLogging, but here we ignore it
						
						this._prevState = state.currentState;
						this._undoHistory = LogEntry.convertGenericObjectsToLogEntries(state.undoHistory, this._syncDelay);
						this._redoHistory = LogEntry.convertGenericObjectsToLogEntries(state.redoHistory, this._syncDelay);
						this._nextId = state.nextId;
						
						break;
					}
					default:
						throw new Error("Weave history format version " + version + " is unsupported.");
				}
				
				// reset these flags so nothing unexpected happens in later frames
				this._undoActive = false;
				this._redoActive = false;
				this._savePending = false;
				this._saveTime = 0;
				this._triggerDelay = -1;
				this._syncTime = Date.now();
			
				WeaveAPI.SessionManager.setSessionState(this._subject, this._prevState);
			}
			finally
			{
				this.enableLogging.resumeCallbacks();
				cc.triggerCallbacks();
				cc.resumeCallbacks();
			}
		}
	}
}
