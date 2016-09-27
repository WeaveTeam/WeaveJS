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
	/**
	 * Manages callbacks that rely on event-related data.
	 */
	@Weave.classInfo({id: "weavejs.core.EventCallbackCollection"})
	export class EventCallbackCollection<T> extends CallbackCollection
	{
		constructor()
		{
			// specify the preCallback function in super() so data will be set before each callback.
			super(this._setData);
		}
	
		// This variable is set before each callback runs
		private _data:T = null;
		
		private _setData(data:T = null):void
		{
			this._data = data;
		}
		
		/**
		 * This is the data that was dispatched.
		 */
		public get data():T
		{
			return this._data;
		}
		
		/**
		 * This function will run callbacks immediately, setting the data variable before each one.
		 * @param data
		 */	
		public dispatch(data:T):void
		{
			// remember previous value so it can be restored in case external code caused us to interrupt something else
			var oldValue:T = this._data;
			this._runCallbacksImmediately(data);
			this._setData(oldValue);
		}
	}
}
