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

namespace weavejs.data.key
{
	import IKeySetCallbackInterface = weavejs.api.data.IKeySetCallbackInterface;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IDisposableObject = weavejs.api.core.IDisposableObject;

	/**
	 * Provides an interface for getting KeySet event-related information.
	 */
	@Weave.classInfo({id: "weavejs.data.key.KeySetCallbackInterface", interfaces:[IKeySetCallbackInterface, ICallbackCollection, IDisposableObject]})
	export class KeySetCallbackInterface extends CallbackCollection implements IKeySetCallbackInterface
	{
		constructor()
		{
			// specify the preCallback function in super() so list callback
			// variables will be set before each change callback.
			// super(this.setCallbackVariables);
			super();
			this._preCallback = () => this.setCallbackVariables()
		}
		
		private _keysAdded:IQualifiedKey[] = [];
		private _keysRemoved:IQualifiedKey[] = [];
		
		private setCallbackVariables(keysAdded:IQualifiedKey[] = null, keysRemoved:IQualifiedKey[] = null):void
		{
			this._keysAdded = keysAdded || [];
			this._keysRemoved = keysRemoved || [];
		}
		
		public flushKeys():void
		{
			if (this._keysAdded.length || this._keysRemoved.length)
				this._runCallbacksImmediately(this._keysAdded, this._keysRemoved);
			this.setCallbackVariables([], []); // reset the variables to new arrays
		}
		
		public get keysAdded():IQualifiedKey[]
		{
			return this._keysAdded;
		}
		public set keysAdded(qkeys:IQualifiedKey[])
		{
			this._keysAdded = qkeys;
		}
		
		public get keysRemoved():IQualifiedKey[]
		{
			return this._keysRemoved;
		}
		public set keysRemoved(qkeys:IQualifiedKey[])
		{
			this._keysRemoved = qkeys;
		}
	}
}
