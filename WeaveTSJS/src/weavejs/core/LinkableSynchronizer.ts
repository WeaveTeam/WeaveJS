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
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import LinkableFunction = weavejs.core.LinkableFunction;
	import LinkableWatcher = weavejs.core.LinkableWatcher;
	import JS = weavejs.util.JS;
	
	@Weave.classInfo({id: "weavejs.core.LinkableSynchronizer", interfaces: [ILinkableObject]})
	export class LinkableSynchronizer implements ILinkableObject
	{
		public static /* readonly */ VAR_STATE:string = 'state';
		public static /* readonly */ VAR_PRIMARY:string = 'primary';
		public static /* readonly */ VAR_SECONDARY:string = 'secondary';
		public static /* readonly */ ARG_VARS:string[] = [LinkableSynchronizer.VAR_STATE, LinkableSynchronizer.VAR_PRIMARY, LinkableSynchronizer.VAR_SECONDARY];
		
		public constructor()
		{
			this._callbacks = Weave.getCallbacks(this);
			this._callbacks.addImmediateCallback(null, this.selfCallback);
		}
		
		public /* readonly */ primaryPath:LinkableVariable = Weave.linkableChild(this, new LinkableVariable(Array), this.setPrimaryPath);
		public /* readonly */ secondaryPath:LinkableVariable = Weave.linkableChild(this, new LinkableVariable(Array), this.setSecondaryPath);
		
		public /* readonly */ primaryTransform:LinkableFunction = Weave.linkableChild(this, new LinkableFunction(null, false, LinkableSynchronizer.ARG_VARS), this.handlePrimaryTransform);
		public /* readonly */ secondaryTransform:LinkableFunction = Weave.linkableChild(this, new LinkableFunction(null, false, LinkableSynchronizer.ARG_VARS), this.handleSecondaryTransform);
		
		private setPrimaryPath():void
		{
			this.primaryWatcher.targetPath = Weave.AS(this.primaryPath.getSessionState(), Array);
		}
		private setSecondaryPath():void
		{
			this.secondaryWatcher.targetPath = Weave.AS(this.secondaryPath.getSessionState(), Array);
		}
		
		private _callbacks:ICallbackCollection;
		private _delayedSynchronize:boolean = false;
		private _primary:ILinkableObject;
		private _secondary:ILinkableObject;
		
		private selfCallback=()=>
		{
			if (this._delayedSynchronize)
				this.synchronize();
		}
		
		private synchronize=()=>
		{
			if (this._callbacks.callbacksAreDelayed)
			{
				this._delayedSynchronize = true;
				return;
			}
			this._delayedSynchronize = false;
			
			var primary:ILinkableObject = this.primaryWatcher.target;
			var secondary:ILinkableObject = this.secondaryWatcher.target;
			if (this._primary != primary || this._secondary != secondary)
			{
				// check objects individually since one may have been disposed
				if (this._primary)
					Weave.getCallbacks(this._primary).removeCallback(this, this.primaryCallback);
				if (this._secondary)
					Weave.getCallbacks(this._secondary).removeCallback(this, this.secondaryCallback);
				
				this._primary = primary;
				this._secondary = secondary;
				
				if (primary && secondary)
				{
					Weave.getCallbacks(this._secondary).addImmediateCallback(this, this.secondaryCallback);
					Weave.getCallbacks(this._primary).addImmediateCallback(this, this.primaryCallback);
					
					// if primaryTransform is not given but secondaryTransform is, call secondaryCallback.
					// otherwise, call primaryCallback.
					if (!this.primaryTransform.value && this.secondaryTransform.value)
						this.secondaryCallback();
					else
						this.primaryCallback();
				}
			}
		}

		/* These need to go *after* this.synchronize is defined, otherwise no callback is attached. */
		private primaryWatcher:LinkableWatcher = Weave.disposableChild(this, new LinkableWatcher(null, this.synchronize));
		private secondaryWatcher:LinkableWatcher = Weave.disposableChild(this, new LinkableWatcher(null, this.synchronize));
		
		private handlePrimaryTransform():void
		{
			// if callbacks are delayed, it means we're loading a session state, so we don't want to apply the transform.
			if (!this._callbacks.callbacksAreDelayed && this._primary && this._secondary)
				this.primaryCallback();
		}
		
		private handleSecondaryTransform():void
		{
			// if callbacks are delayed, it means we're loading a session state, so we don't want to apply the transform.
			if (!this._callbacks.callbacksAreDelayed && this._primary && this._secondary)
				this.secondaryCallback();
		}
		
		private primaryCallback():void
		{
			if (this._callbacks.callbacksAreDelayed)
			{
				this._delayedSynchronize = true;
				this._callbacks.triggerCallbacks();
				return;
			}
			
			if (this.primaryTransform.value)
			{
				try
				{
					var state = Weave.getState(this._primary);
					var transformedState = this.primaryTransform.apply(null, [state, this._primary, this._secondary]);
					Weave.setState(this._secondary, transformedState, true);
				}
				catch (e)
				{
					JS.error("Error evaluating primaryTransform", e);
				}
			}
			else if (!this.secondaryTransform.value)
			{
				Weave.copyState(this._primary, this._secondary);
			}
		}
		private secondaryCallback():void
		{
			if (this._callbacks.callbacksAreDelayed)
			{
				this._delayedSynchronize = true;
				this._callbacks.triggerCallbacks();
				return;
			}
			
			if (this.secondaryTransform.value)
			{
				try
				{
					var state:Object = Weave.getState(this._secondary);
					var transformedState:Object = this.secondaryTransform.apply(null, [state, this._primary, this._secondary]);
					Weave.setState(this._primary, transformedState, true);
				}
				catch (e)
				{
					JS.error("Error evaluating secondaryTransform", e);
				}
			}
			else if (!this.primaryTransform.value)
			{
				Weave.copyState(this._secondary, this._primary);
			}
		}
	}
}
