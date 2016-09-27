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

namespace weavejs.api.core
{
	/**
	 * This is an interface for adding and removing callback functions, and triggering them.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.api.core.ICallbackCollection"})
	export class ICallbackCollection extends ILinkableObject
	{
		/**
		 * This adds the given function as a callback.  The function must not require any parameters.
		 * The callback function will not be called recursively as a result of it triggering callbacks recursively.
		 * @param relevantContext The 'this' argument for the callback. The callback will be removed when the relevantContext object is disposed via Weave.dispose().
		 * @param callback The function to call when callbacks are triggered.
		 * @param runCallbackNow If this is set to true, the callback will be run immediately after it is added.
		 * @param alwaysCallLast If this is set to true, the callback will be always be called after any callbacks that were added with alwaysCallLast=false.  Use this to establish the desired child-to-parent triggering order.
		 */
		addImmediateCallback:(relevantContext:Object, callback:() => void, runCallbackNow:boolean = false, alwaysCallLast:boolean = false)=>void;
		
		/**
		 * Adds a callback that will only be called during a scheduled time each frame.  Grouped callbacks use a central trigger list,
		 * meaning that if multiple ICallbackCollections trigger the same grouped callback before the scheduled time, it will behave as
		 * if it were only triggered once.  For this reason, grouped callback functions cannot have any parameters.  Adding a grouped
		 * callback to a ICallbackCollection will undo any previous effects of addImmediateCallback() or addDisposeCallback() made to the
		 * same ICallbackCollection.  The callback function will not be called recursively as a result of it triggering callbacks recursively.
		 * @param relevantContext The 'this' argument for the callback. The callback will be removed when the relevantContext object is disposed via Weave.dispose().
		 * @param groupedCallback The callback function that will only be allowed to run during a scheduled time each frame.  It must not require any parameters.
		 * @param triggerCallbackNow If this is set to true, the callback will be triggered to run during the scheduled time after it is added.
		 * @param delayWhileBusy Specifies whether to delay the callback while the object is busy.
		 *                       Once a given relevantContext/groupedCallback pair has been added with delayWhileBusy enabled,
		 *                       it will remain enabled even if the delayWhileBusy parameter is set to false in subsequent calls
		 *                       to addGroupedCallback() with the same relevantContext/groupedCallback parameters.
		 */
		addGroupedCallback:(relevantContext:Object, groupedCallback:() => void, triggerCallbackNow:boolean = false, delayWhileBusy:boolean = true)=>void;
		
		/**
		 * This will add a callback that will only be called once, when this callback collection is disposed.
		 * @param relevantContext If this is not null, then the callback will be removed when the relevantContext object is disposed via SessionManager.dispose().  This parameter is typically a 'this' pointer.
		 * @param callback The function to call when this callback collection is disposed.
		 * @param allowDelay If this is set to true, this callback will be delayed while callbacksAreDelayed is true.
		 */
		addDisposeCallback:(relevantContext:Object, callback:() => void, allowDelay:boolean = false)=>void;
		
		/**
		 * This function will remove a callback that was previously added.
		 * @param relevantContext The relevantContext parameter that was given when the callback was added.
		 * @param callback The function to remove from the list of callbacks.
		 */
		removeCallback:(relevantContext:Object, callback:() => void)=>void;

		/**
		 * This will increase the triggerCounter, run immediate callbacks, and trigger grouped callbacks to be called later.
		 * If delayCallbacks() was called, the callbacks will not be called immediately.
		 * @see #delayCallbacks()
		 */
		triggerCallbacks:()=>void;
		
		/**
		 * This counter gets incremented at the time that callbacks are triggered, before they are actually called.
		 * It is necessary in some situations to check this counter to determine if cached data should be used.
		 * @see #triggerCallbacks()
		 */
		triggerCounter:uint;
		
		/**
		 * This will delay the effects of triggerCallbacks() until a matching call is made to resumeCallbacks().
		 * Pairs of calls to delayCallbacks() and resumeCallbacks() can be nested.
		 * @see #resumeCallbacks() 
		 * @see #callbacksAreDelayed
		 */
		delayCallbacks:()=>void;

		/**
		 * This should be called after delayCallbacks() to resume the callbacks.
		 * If delayCallbacks() is called multiple times, resumeCallbacks() must be called the same number of times in order to resume the callbacks.
		 * @see #delayCallbacks()
		 * @see #callbacksAreDelayed
		 */
		resumeCallbacks:()=>void;

		/**
		 * While this is true, it means the delay count is greater than zero and the effects of
		 * triggerCallbacks() are delayed until resumeCallbacks() is called to reduce the delay count.
		 * @see #delayCallbacks()
		 * @see #resumeCallbacks()
		 */
		callbacksAreDelayed:boolean;
	}
}
