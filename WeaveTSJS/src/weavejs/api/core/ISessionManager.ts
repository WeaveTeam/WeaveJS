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
	 * Session manager contains core functions for Weave related to session state.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.api.core.ISessionManager"})
	export class ISessionManager
	{
		/**
		 * This function gets the ICallbackCollection associated with an ILinkableObject.
		 * If there is no ICallbackCollection defined for the object, one will be created.
		 * This ICallbackCollection is used for reporting changes in the session state
		 * @param linkableObject An ILinkableObject to get the associated ICallbackCollection for.
		 * @return The ICallbackCollection associated with the given object.
		 */
		getCallbackCollection:(linkableObject:ILinkableObject) => ICallbackCollection;
		
		/**
		 * This function gets the ILinkableObject associated with an ICallbackCollection.
		 */
		getLinkableObjectFromCallbackCollection:(callbackCollection:ICallbackCollection) => ILinkableObject
		
		/**
		 * This function will create a new instance of the specified child class and register it as a child of the parent.
		 * If a callback function is given, the callback will be added to the child and cleaned up when the parent is disposed.
		 * 
		 * Example usage:   public const foo:LinkableNumber = newLinkableChild(this, LinkableNumber, handleFooChange);
		 * 
		 * @param linkableParent A parent ILinkableObject to create a new child for.
		 * @param linkableChildType The class definition that implements ILinkableObject used to create the new child.
		 * @param callback A callback with no parameters that will be added to the child that will run before the parent callbacks are triggered, or during the next ENTER_FRAME event if a grouped callback is used.
		 * @param useGroupedCallback If this is true, addGroupedCallback() will be used instead of addImmediateCallback().
		 * @return The new child object.
		 * @see #registerLinkableChild()
		 */
		newLinkableChild:<T extends ILinkableObject>(linkableParent:Object, linkableChildType:Class<T>, callback?:() => void, useGroupedCallback?:boolean) => T;
		
		/**
		 * This function tells the SessionManager that the session state of the specified child should appear in the
		 * session state of the specified parent, and the child should be disposed when the parent is disposed.
		 * 
		 * There is one other requirement for the child session state to appear in the parent session state -- the child
		 * must be accessible through a public variable of the parent or through an accessor function of the parent.
		 * 
		 * This function will add callbacks to the sessioned children that cause the parent callbacks to run.
		 * 
		 * If a callback function is given, the callback will be added to the child and cleaned up when the parent is disposed.
		 * 
		 * Example usage:   public const foo:LinkableNumber = registerLinkableChild(this, someLinkableNumber, handleFooChange);
		 * 
		 * @param linkableParent A parent ILinkableObject that the child will be registered with.
		 * @param linkableChild The child ILinkableObject to register as a child.
		 * @param callback A callback with no parameters that will be added to the child that will run before the parent callbacks are triggered, or during the next ENTER_FRAME event if a grouped callback is used.
		 * @param useGroupedCallback If this is true, addGroupedCallback() will be used instead of addImmediateCallback().
		 * @return The linkableChild object that was passed to the function.
		 * @see #newLinkableChild()
		 */
		registerLinkableChild:<T extends ILinkableObject>(linkableParent:Object, linkableChild:T, callback?:() => void, useGroupedCallback?:boolean) => T;

		/**
		 * This function will create a new instance of the specified child class and register it as a child of the parent.
		 * The child will be disposed when the parent is disposed.
		 * Use this function when a child object can be disposed but you do not want to link the callbacks or either object is not an ILinkableObject.
		 * 
		 * Example usage:   public const foo:LinkableNumber = newDisposableChild(this, LinkableNumber);
		 * 
		 * @param disposableParent A parent ILinkableObject to create a new child for.
		 * @param disposableChildType The class definition that implements ILinkableObject used to create the new child.
		 * @return The new child object.
		 * @see #registerDisposableChild()
		 */
		newDisposableChild:<T extends ILinkableObject>(disposableParent:Object, disposableChildType:Class<T>) => T;
		
		/**
		 * This will register a child of a parent and cause the child to be disposed when the parent is disposed.
		 * Use this function when a child object can be disposed but you do not want to link the callbacks or either object is not an ILinkableObject.
		 * 
		 * Example usage:   public const foo:LinkableNumber = registerDisposableChild(this, someLinkableNumber);
		 * 
		 * @param disposableParent A parent disposable object that the child will be registered with.
		 * @param disposableChild The disposable object to register as a child of the parent.
		 * @return The linkableChild object that was passed to the function.
		 * @see #newDisposableChild()
		 */
		registerDisposableChild:<T extends ILinkableObject>(disposableParent:Object, disposableChild:Object) => T;

		/**
		 * This function gets the owner of an object.  The owner of an object is defined as its first registered parent.
		 * @param child An Object that was registered as a child of another Object.
		 * @return The owner of the child object (the first parent that was registered with the child), or null if the child has no owner.
		 */
		getOwner:(child:Object) => Object;
		
		/**
		 * This function gets the owner of a linkable object.  The owner of an object is defined as its first registered parent.
		 * @param child An ILinkableObject that was registered as a child of another ILinkableObject.
		 * @return The owner of the child object (the first parent that was registered with the child), or null if the child has no linkable owner.
		 * @see #getLinkableDescendants()
		 */
		getLinkableOwner:(child:ILinkableObject) => ILinkableObject;

		/**
		 * This function will return all the descendant objects that implement ILinkableObject.
		 * If the filter parameter is specified, the results will contain only those objects that extend or implement the filter class.
		 * @param root A root object to get the descendants of.
		 * @param filter An optional Class definition which will be used to filter the results.
		 * @return An Array containing a list of descendant objects.
		 * @see #getLinkableOwner()
		 */
		getLinkableDescendants:<T>(root:ILinkableObject, filter?:Class<T>) => Array<T & ILinkableObject>;

    /**
     * This function gets a list of sessioned property names so accessor functions for non-sessioned properties do not have to be called.
     * @param linkableObject An object containing sessioned properties.
     * @param filtered If set to true, filters out excluded properties.
     * @return An Array containing the names of the sessioned properties of that object class.
     */
    getLinkablePropertyNames:(linkableObject:ILinkableObject, filtered?:boolean) => Array<string>;

    getTypedStateTree:(root:ILinkableObject) => TypedState;

		/**
		 * This will assign an asynchronous task to a linkable object so that <code>linkableObjectIsBusy(busyObject)</code>
		 * will return true until all assigned tasks are unassigned using <code>unassignBusyTask(taskToken)</code>.
		 * @param taskToken A token representing an asynchronous task.  If this is an AsyncToken, a responder will be added that will automatically call unassignBusyTask(taskToken) on success or failure.
		 * @param busyObject The object that is busy waiting for the task to complete.
		 * @see weave.api.core.IProgressIndicator#addTask()
		 * @see #unassignBusyTask()
		 * @see #linkableObjectIsBusy()
		 */
		assignBusyTask:(taskToken:Object, busyObject:ILinkableObject) => void;
		
		/**
		 * This will unassign an asynchronous task from all linkable objects it has been previously assigned to.
		 * If the task was previously registered with WeaveAPI.ProgressManager, this will call WeaveAPI.ProgressManager.removeTask().
		 * @param taskToken A token representing an asynchronous task.
		 * @see weave.api.core.IProgressIndicator#removeTask()
		 * @see #assignBusyTask()
		 * @see #linkableObjectIsBusy()
		 */
		unassignBusyTask:(taskToken:Object) => void;
		
		/**
		 * This checks if any asynchronous tasks have been assigned to a linkable object or any of its registered descendants.
		 * @param linkableObject The object to check.
		 * @return A value of true if any asynchronous tasks have been assigned to the object.
		 * @see #assignBusyTask()
		 * @see #unassignBusyTask()
		 */
		linkableObjectIsBusy:(linkableObject:ILinkableObject) => boolean;

    /**
     * Sets the session state of an ILinkableObject.
     * @param linkableObject An object containing sessioned properties (sessioned objects may be nested).
     * @param newState An object containing the new values for sessioned properties in the sessioned object.
     * @param removeMissingDynamicObjects If true, this will remove any properties from an ILinkableCompositeObject that do not appear in the session state.
     * @see #getSessionState()
     */
    setSessionState:(linkableObject:ILinkableObject, newState:Object, removeMissingDynamicObjects?:boolean) => void;

    /**
     * Gets the session state of an ILinkableObject.
     * @param linkableObject An object containing sessioned properties (sessioned objects may be nested).
     * @return An object containing the values from the sessioned properties.
     * @see #setSessionState()
     */
    getSessionState:(linkableObject:ILinkableObject) => Object;

    /**
		 * This function computes the diff of two session states.
		 * @param oldState The source session state.
		 * @param newState The destination session state.
		 * @return A patch that generates the destination session state when applied to the source session state, or undefined if the two states are equivalent.
		 * @see #combineDiff()
		 */
		computeDiff:(oldState:Object, newState:Object) => Object;
		
		/**
		 * This modifies an existing diff to include an additional diff.
		 * @param baseDiff The base diff which will be modified to include an additional diff.
		 * @param diffToAdd The diff to add to the base diff.  This diff will not be modified.
		 * @return The modified baseDiff, or a new diff object if baseDiff is a primitive value.
		 * @see #computeDiff()
		 */
		combineDiff:(baseDiff:Object, diffToAdd:Object) => Object;

    /**
     * This function will copy the session state from one sessioned object to another.
     * If the two objects are of different types, the behavior of this function is undefined.
     * @param source A sessioned object to copy the session state from.
     * @param destination A sessioned object to copy the session state to.
     * @see #getSessionState()
     * @see #setSessionState()
     */
    copySessionState:(source:ILinkableObject, destination:ILinkableObject) => void;

		/**
		 * This function should be called when an ILinkableObject or IDisposableObject is no longer needed.
		 * @param object An ILinkableObject or an IDisposableObject to clean up.
		 * @see #objectWasDisposed()
		 */
		disposeObject:(object:Object) => void;

		/**
		 * This function checks if an object has been disposed by the ISessionManager.
		 * @param object An object to check.
		 * @return A value of true if disposeObject() was called for the specified object.
		 * @see #disposeObject()
		 */
		objectWasDisposed:(object:Object) => boolean;
		
		/**
		 * Gets the path of names in the session state tree of the root object.
		 * @param root The root object used to generate a session state tree.
		 * @param child The descendant object to find in the session state tree.
		 * @return The path from root to descendant, or null if the descendant does not appear in the session state.
		 * @see #getObject()
		 */
		getPath:(root:ILinkableObject, descendant:ILinkableObject)=>string[];
		
		/**
		 * This function returns a pointer to an ILinkableObject appearing in the session state.
		 * @param root The root object used to find a descendant object.
		 * @param path A sequence of child names used to refer to an object appearing in the session state.
		 *             A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
		 * @return A pointer to the object referred to by objectPath.
		 * @see #getPath()
		 */
		getObject:(root:ILinkableObject, path:string[]) => ILinkableObject;
	}
}
