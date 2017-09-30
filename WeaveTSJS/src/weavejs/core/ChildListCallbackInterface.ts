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
	import IChildListCallbackInterface = weavejs.api.core.IChildListCallbackInterface;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	
	/**
	 * @private
	 * Implementation of IChildListCallbackInterface for use with LinkableHashMap.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.core.ChildListCallbackInterface", interfaces: [IChildListCallbackInterface]})
	export class ChildListCallbackInterface extends CallbackCollection implements IChildListCallbackInterface
	{
		constructor()
		{
			// specify the preCallback function in super() so list callback
			// variables will be set before each change callback.
			super();
			super(this.setCallbackVariables);
		}
	
		// these are the "callback variables" that get set before each callback runs.
		private _lastNameAdded:string = null; // returned by public getter
		private _lastObjectAdded:ILinkableObject = null; // returned by public getter
		private _lastNameRemoved:string = null; // returned by public getter
		private _lastObjectRemoved:ILinkableObject = null; // returned by public getter
		
		/**
		 * This function will set the list callback variables:
		 *     lastNameAdded, lastObjectAdded, lastNameRemoved, lastObjectRemoved, childListChanged
		 * @param name This is the name of the object that was just added or removed from the hash map.
		 * @param objectAdded This is the object that was just added to the hash map.
		 * @param objectRemoved This is the object that was just removed from the hash map.
		 */
		private setCallbackVariables(name:string = null, objectAdded:ILinkableObject = null, objectRemoved:ILinkableObject = null):void
		{
			this._lastNameAdded = objectAdded ? name : null;
			this._lastObjectAdded = objectAdded;
			this._lastNameRemoved = objectRemoved ? name : null;
			this._lastObjectRemoved = objectRemoved;
		}
		
		/**
		 * This function will run callbacks immediately, setting the list callback variables before each one.
		 * @param name
		 * @param objectAdded
		 * @param objectRemoved
		 */	
		public runCallbacks(name:string, objectAdded:ILinkableObject, objectRemoved:ILinkableObject):void
		{
			// remember previous values
			var _name:string = this._lastNameAdded || this._lastNameRemoved;
			var _added:ILinkableObject = this._lastObjectAdded;
			var _removed:ILinkableObject = this._lastObjectRemoved;
			
			this._runCallbacksImmediately(name, objectAdded, objectRemoved);
			
			// restore previous values (in case an external JavaScript popup caused us to interrupt something else)
			this.setCallbackVariables(_name, _added, _removed);
		}
	
		/**
		 * This is the name of the object that was added prior to running callbacks.
		 */
		public get lastNameAdded():string
		{
			return this._lastNameAdded;
		}
	
		/**
		 * This is the object that was added prior to running callbacks.
		 */
		public get lastObjectAdded():ILinkableObject
		{
			return this._lastObjectAdded;
		}
	
		/**
		 * This is the name of the object that was removed prior to running callbacks.
		 */
		public get lastNameRemoved():string
		{
			return this._lastNameRemoved;
		}
	
		/**
		 * This is the object that was removed prior to running callbacks.
		 */
		public get lastObjectRemoved():ILinkableObject
		{
			return this._lastObjectRemoved;
		}
	}
}
