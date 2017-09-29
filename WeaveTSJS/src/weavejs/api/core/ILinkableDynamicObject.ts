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
	 * This is an interface for a wrapper around a dynamically created ILinkableObject.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.api.core.ILinkableDynamicObject"})
	export class ILinkableDynamicObject extends ILinkableCompositeObject
	{
		/**
		 * This is the local or global internal object.
		 */
		internalObject:ILinkableObject;
		
		/**
		 * This is the local or global internal object.
		 * Setting this will unset the targetPath.
		 */		
		target:ILinkableObject;

		/**
		 * This is the path that is currently being watched for linkable object targets.
		 *
		 * This will set a path which should be watched for new targets.
		 * Callbacks will be triggered immediately if the path points to a new target.
		 * @param newPath The new path to watch.
		 */
		targetPath:(string|number)[];

		/**
		 * Checks if the target is currently a placeholder for an instance of an async class.
		 * @return true if the target is a placeholder.
		 * @see Weave#registerAsyncClass()
		 */
		foundPlaceholder:boolean;

		/**
		 * This function creates a global object using the given Class definition if it doesn't already exist.
		 * If the object gets disposed later, this object will still be linked to the global name.
		 * If the existing object under the specified name is locked, this function will not modify it.
		 * @param name The name of the global object to link to.
		 * @param objectType The Class used to initialize the object.
		 * @param lockObject If this is true, this object will be locked so the internal object cannot be removed or replaced.
		 * @return The global object of the requested name and type, or null if the object could not be created.
		 */
		requestGlobalObject:<T extends ILinkableObject>(name:string, objectType:Class<T> | string, lockObject?:boolean) => T;
		
		/**
		 * This function creates a local object using the given Class definition if it doesn't already exist.
		 * If this object is locked, this function does nothing.
		 * @param objectType The Class used to initialize the object.
		 * @param lockObject If this is true, this object will be locked so the internal object cannot be removed or replaced.
		 * @return The local object of the requested type, or null if the object could not be created.
		 */
		requestLocalObject:<T extends ILinkableObject>(objectType:Class<T> | string, lockObject?:boolean) => T;

		/**
		 * This function will copy the session state of an ILinkableObject to a new local internalObject of the same type.
		 * @param objectToCopy An object to copy the session state from.
		 */
		requestLocalObjectCopy:(objectToCopy:ILinkableObject) => void;

		/**
		 * This function will lock the internal object in place so it will not be removed.
		 */
		lock:() => void;

		/**
		 * This is set to true when lock() is called.
		 * Subsequent calls to setSessionState() will have no effect.
		 */
		locked:boolean;
		
		/**
		 * If the internal object is local, this will remove the object (unless it is locked).
		 * If the internal object is global, this will remove the link to it.
		 */
		removeObject:() => void;
	}
}
