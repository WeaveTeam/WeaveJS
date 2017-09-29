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
	 * Allows dynamically creating instances of objects implementing ILinkableObject at runtime.
	 * The session state is an Array of DynamicState objects.
	 * @see weave.core.DynamicState
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.api.core.ILinkableHashMap"})
	export class ILinkableHashMap extends ILinkableCompositeObject
	{
		/**
		 * The child type restriction, or null if there is none.
		 */
		typeRestriction:GenericClass;
		
		/**
		 * This is an interface for adding and removing callbacks that will get triggered immediately
		 * when an object is added or removed.
		 * @return An interface for adding callbacks that get triggered when the list of child objects changes.
		 */
		childListCallbacks:IChildListCallbackInterface;
		
		/**
		 * This will reorder the names returned by getNames().
		 * Any names appearing in newOrder that do not appear in getNames() will be ignored.
		 * Callbacks will be called if the new name order differs from the old order.
		 * @param newOrder The new desired ordering of names.
		 */
		setNameOrder:(newOrder:string[]) => void;

		/**
		 * This function returns an ordered list of names in the LinkableHashMap.
		 * @param filter If specified, names of objects that are not of this type will be filtered out.
		 * @param filterIncludesPlaceholders If true, matching LinkablePlaceholders will be included in the results.
		 * @return A copy of the ordered list of names of objects contained in this LinkableHashMap.
		 */
		getNames:<T>(filter?:Class<T> | string, filterIncludesPlaceholders?:boolean) => string[];
		
		/**
		 * This function returns an ordered list of objects in the LinkableHashMap. 
		 * @param filter If specified, objects that are not of this type will be filtered out.
		 * @param filterIncludesPlaceholders If true, matching LinkablePlaceholders will be included in the results.
		 * @return An ordered Array of objects that correspond to the names returned by getNames(filter).
		 */
		getObjects:<T>(filter?:Class<T> | string, filterIncludesPlaceholders?:boolean) => Array<T>;

		/**
		 * This function returns an Object mapping names to objects contained in the LinkableHashMap.
		 * @param filter If specified, objects that are not of this type will be filtered out.
		 * @param filterIncludesPlaceholders If true, matching LinkablePlaceholders will be included in the results.
		 * @return An Object mapping names to objects contained in the LinkableHashMap.
		 */
		toObject:<T>(filter?:Class<T> | string, filterIncludesPlaceholders?:boolean) => {[name:string]: T};
		
		/**
		 * This function returns a Map containing the entries in the LinkableHashMap.
		 * @param filter If specified, objects that are not of this type will be filtered out.
		 * @param filterIncludesPlaceholders If true, matching LinkablePlaceholders will be included in the results.
		 * @return A Map containing the ordered entries in the LinkableHashMap.
		 */
		toMap:<T>(filter?:Class<T> | string, filterIncludesPlaceholders?:boolean) =>Map<string, T>;

		/**
		 * This function gets the name of the specified object in the LinkableHashMap.
		 * @param object An object contained in this LinkableHashMap.
		 * @return The name associated with the object, or null if the object was not found. 
		 */
		getName:(object:ILinkableObject) => string;

		/**
		 * This function gets the object associated with the specified name.
		 * @param name The name identifying an object in the LinkableHashMap.
		 * @return The object associated with the given name.
		 */
		getObject:(name:string) => ILinkableObject;
		
		/**
		 * Sets an entry in the LinkableHashMap, replacing any existing object under the same name.
		 * @param name The identifying name to associate with an object.
		 * @param lockObject If this is true, the object will be locked in place under the specified name.
		 * @return The object to be associated with the given name.
		 */
		setObject:(name:string, object:ILinkableObject, lockObject?:boolean) => void;

		/**
		 * This function creates an object in the LinkableHashMap if it doesn't already exist.
		 * If there is an existing object associated with the specified name, it will be kept if it
		 * is the specified type, or replaced with a new instance of the specified type if it is not.
		 * @param name The identifying name of a new or existing object.
		 * @param classDef The Class of the desired object type.
		 * @param lockObject If this is true, the object will be locked in place under the specified name.
		 * @return The object under the requested name of the requested type, or null if an error occurred.
		 */
		requestObject:<T>(name:string, classDef:Class<T> | string, lockObject?:boolean) => T;

		/**
		 * This function will copy the session state of an ILinkableObject to a new object under the given name in this LinkableHashMap.
		 * @param newName A name for the object to be initialized in this LinkableHashMap.
		 * @param objectToCopy An object to copy the session state from.
		 * @return The new object of the same type, or null if an error occurred.
		 */
		requestObjectCopy:<T extends ILinkableObject>(name:string, objectToCopy:T) => T;

		/**
		 * This function will rename an object by making a copy and removing the original.
		 * @param oldName The name of an object to replace.
		 * @param newName The new name to use for the copied object.
		 * @return The copied object associated with the new name, or the original object if newName is the same as oldName.
		 */
		renameObject:(oldName:string, newName:string) => ILinkableObject;
		
		/**
		 * This function will return true if the specified object was previously locked.
		 * @param name The name of an object.
		 */
		objectIsLocked:(name:string) => boolean;

		/**
		 * This function removes an object from the LinkableHashMap.
		 * @param name The identifying name of an object previously saved with setObject().
		 */
		removeObject:(name:string) => void;

		/**
		 * This function attempts to removes all objects from this LinkableHashMap.
		 * Any objects that are locked will remain.
		 */
		removeAllObjects:() => void;

		/**
		 * This will generate a new name for an object that is different from all the names of objects previously used in this LinkableHashMap.
		 * @param baseName The name to start with.  If the name is already in use, an integer will be appended to create a unique name.
		 */
		generateUniqueName:(baseName:string) => string;
	}
}
