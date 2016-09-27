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
	import DynamicState = weavejs.api.core.DynamicState;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IChildListCallbackInterface = weavejs.api.core.IChildListCallbackInterface;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import SessionState = weavejs.api.core.SessionState;
	import SessionStateObject = weavejs.api.core.SessionStateObject;

	/**
	 * Allows dynamically creating instances of objects implementing ILinkableObject at runtime.
	 * The session state is an Array of DynamicState objects.
	 * @see weave.core.DynamicState
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.core.LinkableHashMap", interfaces: [ILinkableHashMap]})
	export class LinkableHashMap extends CallbackCollection implements ILinkableHashMap
	{
		/**
		 * Constructor.
		 * @param typeRestriction If specified, this will limit the type of objects that can be added to this LinkableHashMap.
		 */
		constructor(typeRestriction:GenericClass = null)
		{
			super();
			this._typeRestriction = typeRestriction;
		}
		
		private _childListCallbacks:ChildListCallbackInterface = Weave.linkableChild(this, ChildListCallbackInterface);
		private _orderedNames:string[] = []; // an ordered list of names appearing in _nameToObjectMap
		private _nameToObjectMap:{[name:string]:ILinkableObject} = {}; // maps an identifying name to an object
		private _map_objectToNameMap = new WeakMap<ILinkableObject, string>(); // maps an object to an identifying name
		private _nameIsLocked:{[name:string]:boolean} = {}; // maps an identifying name to a value of true if that name is locked.
		private _previousNameMap:{[name:string]:boolean} = {}; // maps a previously used name to a value of true.  used when generating unique names.
		private _typeRestriction:GenericClass; // restricts the type of object that can be stored
		
		public get typeRestriction():GenericClass
		{
			return this._typeRestriction;
		}
		
		public get childListCallbacks():IChildListCallbackInterface
		{
			return this._childListCallbacks;
		}

		public getNames(filter:GenericClass = null, filterIncludesPlaceholders:boolean = false):string[]
		{
			return this.getList(false, filter, filterIncludesPlaceholders) as string[];
		}
		
		public getObjects(filter:GenericClass = null, filterIncludesPlaceholders:boolean = false):ILinkableObject[]
		{
			return this.getList(true, filter, filterIncludesPlaceholders);
		}
		
		public toObject<T>(filter:Class<T> | string = null, filterIncludesPlaceholders:boolean = false):{[name:string]: T & ILinkableObject}
		{
			var obj:{[name:string]: T & ILinkableObject} = {};
			for (var name of this.getList(false, filter, filterIncludesPlaceholders) || [])
				obj[name] = this._nameToObjectMap[name];
			return obj;
		}
		
		public toMap<T>(filter:Class<T> | string = null, filterIncludesPlaceholders:boolean = false):Map<string, T & ILinkableObject>
		{
			var map:Map<string, T & ILinkableObject> = new Map();
			for (var name of this.getList(false, filter, filterIncludesPlaceholders) || [])
				map.set(name, this._nameToObjectMap[name]);
			return map;
		}
		
		private getList(listObjects:boolean, filter:GenericClass|string, filterIncludesPlaceholders:boolean):string[]|ILinkableObject[]
		{
			if (Weave.IS(filter, String))
				filter = Weave.getDefinition(String(filter as string), true);
			
			var result:string[]|ILinkableObject[] = [];
			for (var i:int = 0; i < this._orderedNames.length; i++)
			{
				var name:string = this._orderedNames[i];
				var object:ILinkableObject = this._nameToObjectMap[name];
				if (!filter)
				{
					result.push(listObjects ? object : name)
				}
				else if (Weave.IS(object, filter))
				{
					result.push(listObjects ? object : name);
				}
				else if (filterIncludesPlaceholders)
				{
					var placeholder:LinkablePlaceholder = Weave.AS(object, LinkablePlaceholder);
					if (!placeholder)
						continue;
					var classDef:Class = placeholder.getClass();
					if (classDef === filter || Weave.IS(classDef.prototype, filter))
						result.push(listObjects ? object : name);
				}
			}
			return result;
		}
		
		public getObject(name:string):ILinkableObject
		{
			return this._nameToObjectMap[name];
		}
		
		public setObject(name:string, object:ILinkableObject, lockObject:boolean = false):void
		{
			if (this._nameIsLocked[name] || this._nameToObjectMap[name] === object)
				return;
			
			var className:string = Weave.className(object);
			if (!className)
				throw new Error("Cannot get class name from object");
			if (Weave.getDefinition(className) != object['constructor'])
				throw new Error("The Class of the object is not registered");
			if (Weave.getOwner(object))
				throw new Error("LinkableHashMap cannot accept an object that is already registered with an owner.");
			
			if (object)
			{
				// if no name is specified, generate a unique one now.
				if (!name)
					name = this.generateUniqueName(className.split('::').pop().split('.').pop());
				
				this.delayCallbacks();
				
				// register the object as a child of this LinkableHashMap
				Weave.linkableChild(this, object);
				// replace existing object
				var oldObject:ILinkableObject = this._nameToObjectMap[name];
				this._nameToObjectMap[name] = object;
				this._map_objectToNameMap.set(object, name);
				if (this._orderedNames.indexOf(name) < 0)
					this._orderedNames.push(name);
				if (lockObject)
					this._nameIsLocked[name] = true;
				// remember that this name was used in case there was no previous object
				this._previousNameMap[name] = true;
				
				// make callback variables signal that the object was replaced or added
				this._childListCallbacks.runCallbacks(name, object, oldObject);
				
				// dispose the object AFTER the callbacks know that the object was removed
				Weave.dispose(oldObject);
				
				this.resumeCallbacks();
			}
			else
			{
				this.removeObject(name);
			}
		}
		
		public getName(object:ILinkableObject):string
		{
			return this._map_objectToNameMap.get(object);
		}
		
		public setNameOrder(newOrder:string[]):void
		{
			var changeDetected:boolean = false;
			var name:string;
			var i:int;
			var originalNameCount:int = this._orderedNames.length; // remembers how many names existed before appending
			var haveSeen:{[name:string]:boolean} = {}; // to remember which names have been seen in newOrder
			// append each name in newOrder to the end of _orderedNames
			for (i = 0; i < newOrder.length; i++)
			{
				name = newOrder[i];
				// ignore bogus names and append each name only once.
				if (this._nameToObjectMap[name] == undefined || haveSeen[name] != undefined)
					continue;
				haveSeen[name] = true; // remember that this name was appended to the end of the list
				this._orderedNames.push(name); // add this name to the end of the list
			}
			// Now compare the ordered appended items to the end of the original list.
			// If the order differs, set _nameOrderChanged to true.
			// Meanwhile, set old name entries to null so they will be removed in the next pass.
			var appendedCount:int = this._orderedNames.length - originalNameCount;
			for (i = 0; i < appendedCount; i++)
			{
				var newIndex:int = originalNameCount + i;
				var oldIndex:int = this._orderedNames.indexOf(this._orderedNames[newIndex]);
				if (newIndex - oldIndex != appendedCount)
					changeDetected = true;
				this._orderedNames[oldIndex] = null;
			}
			// remove array items that have been set to null
			var out:int = 0;
			for (i = 0; i < this._orderedNames.length; i++)
				if (this._orderedNames[i] != null)
					this._orderedNames[out++] = this._orderedNames[i];
			this._orderedNames.length = out;
			// if the name order changed, run child list callbacks
			if (changeDetected)
				this._childListCallbacks.runCallbacks(null, null, null);
		}
		
		public requestObject<T>(name:string, classDef:Class<T>|string, lockObject:boolean = false):T
		{
			if (Weave.IS(classDef, String))
				classDef = Weave.getDefinition(String(classDef), true);
			
			var className:string = classDef ? Weave.className(classDef) : null;
			var result:T = this.initObjectByClassName(name, className, lockObject);
			return classDef ? Weave.AS(result, classDef as Class<T>) : null;
		}
		
		public requestObjectCopy<T>(name:string, objectToCopy:T):T
		{
			if (objectToCopy == null)
			{
				this.removeObject(name);
				return null;
			}
			
			this.delayCallbacks(); // make sure callbacks only trigger once
			var classDef:Class<T> = LinkablePlaceholder.getClass(objectToCopy);
			var sessionState = Weave.getState(objectToCopy);
			//  if the name refers to the same object, remove the existing object so it can be replaced with a new one.
			if (name == this.getName(objectToCopy))
				this.removeObject(name);
			this.requestObject(name, classDef, false);
			var object:ILinkableObject = this.getObject(name);
			if (classDef == LinkablePlaceholder.getClass(object))
				Weave.setState(object, sessionState);
			this.resumeCallbacks();
			
			return object;
		}
		
		public renameObject(oldName:string, newName:string):ILinkableObject
		{
			if (oldName != newName)
			{
				this.delayCallbacks();
				
				// prepare a name order that will put the new name in the same place the old name was
				var newNameOrder:string[] = this._orderedNames.concat();
				var index:int = newNameOrder.indexOf(oldName);
				if (index >= 0)
					newNameOrder.splice(index, 1, newName);
				
				this.requestObjectCopy(newName, this.getObject(oldName));
				this.removeObject(oldName);
				this.setNameOrder(newNameOrder);
				
				this.resumeCallbacks();
			}
			return this.getObject(newName);
		}
		
		/**
		 * If there is an existing object associated with the specified name, it will be kept if it
		 * is the specified type, or replaced with a new instance of the specified type if it is not.
		 * @param name The identifying name of a new or existing object.  If this is null, a new one will be generated.
		 * @param className The qualified class name of the desired object type.
		 * @param lockObject If this is set to true, lockObject() will be called on the given name.
		 * @return The object associated with the given name, or null if an error occurred.
		 */
		private initObjectByClassName(name:string, className:string, lockObject:boolean = false):ILinkableObject
		{
			if (className)
			{
				var classDef:GenericClass = Weave.getDefinition(className);
				if (Weave.isLinkable(classDef)
					&& (this._typeRestriction == null || classDef === this._typeRestriction || Weave.IS(classDef.prototype, this._typeRestriction)) )
				{
					// if no name is specified, generate a unique one now.
					if (!name)
					{
						var baseName:string = className.split('::').pop().split('.').pop();
						if (name == '')
							baseName = WeaveAPI.ClassRegistry.getDisplayName(classDef) || baseName;
						name = this.generateUniqueName(baseName);
					}
					
//					try
//					{
						// If this name is not associated with an object of the specified type,
						// associate the name with a new object of the specified type.
						var object = this._nameToObjectMap[name];
						if (classDef != LinkablePlaceholder.getClass(object))
							this.createAndSaveNewObject(name, classDef, lockObject);
						else if (lockObject)
							this.lockObject(name);
//					}
//					catch (e:Error)
//					{
//						reportError(e);
//						enterDebugger();
//					}
				}
				else
				{
					this.removeObject(name);
				}
			}
			else
			{
				this.removeObject(name);
			}
			return this._nameToObjectMap[name || ''];
		}
		
		/**
		 * (private)
		 * @param name The identifying name to associate with a new object.
		 * @param classDef The Class definition used to instantiate a new object.
		 */
	    private createAndSaveNewObject(name:string, classDef:GenericClass, lockObject:boolean):void
	    {
	    	if (this._nameIsLocked[name])
	    		return;
			try
			{
				this.delayCallbacks();
				
				// remove any object currently using this name
				this.removeObject(name);
				// create a new object
				var object:ILinkableObject;
				if (Weave.isAsyncClass(classDef))
					object = new LinkablePlaceholder(classDef);
				else
					object = new classDef();
				// register the object as a child of this LinkableHashMap
				Weave.linkableChild(this, object);
				// save the name-object mappings
				this._nameToObjectMap[name] = object;
				this._map_objectToNameMap.set(object, name);
				// add the name to the end of _orderedNames
				this._orderedNames.push(name);
				// remember that this name was used.
				this._previousNameMap[name] = true;
				
				if (lockObject)
					this.lockObject(name);
	
				// make sure the callback variables signal that the object was added
				this._childListCallbacks.runCallbacks(name, object, null);
			}
			finally
			{
				this.resumeCallbacks();
			}
	    }
		
		/**
		 * This function will lock an object in place for a given identifying name.
		 * If there is no object using the specified name, this function will have no effect.
		 * @param name The identifying name of an object to lock in place.
		 */
	    private lockObject(name:string):void
	    {
	    	if (name != null && this._nameToObjectMap[name] != null)
		    	this._nameIsLocked[name] = true;
	    }
		
		public objectIsLocked(name:string):boolean
		{
			return this._nameIsLocked[name] ? true : false;
		}
		
		public removeObject(name:string):void
		{
			if (!name || this._nameIsLocked[name])
				return;
			
			var object:ILinkableObject = this._nameToObjectMap[name];
			if (object == null)
				return; // do nothing if the name isn't mapped to an object.
			
			this.delayCallbacks();
			
			//trace(LinkableHashMap, "removeObject",name,object);
			// remove name & associated object
			delete this._nameToObjectMap[name];
			this._map_objectToNameMap.delete(object);
			var index:int = this._orderedNames.indexOf(name);
			this._orderedNames.splice(index, 1);

			// make sure the callback variables signal that the object was removed
			this._childListCallbacks.runCallbacks(name, null, object);

			// dispose the object AFTER the callbacks know that the object was removed
			Weave.dispose(object);
			
			this.resumeCallbacks();
		}

		public removeAllObjects():void
		{
			this.delayCallbacks();
			var names:string[] = this._orderedNames.concat(); // iterate over a copy of the list
			for (var name of names || [])
				this.removeObject(name);
			this.resumeCallbacks();
		}
		
		/**
		 * This function removes all objects from this LinkableHashMap.
		 */
		public dispose():void
		{
			super.dispose();
			
			// first, remove all objects that aren't locked
			this.removeAllObjects();
			
			// remove all locked objects
			var names:string[] = this._orderedNames.concat(); // iterate over a copy of the list
			for (var name of names || [])
			{
				this._nameIsLocked[name] = undefined; // make sure removeObject() will carry out its action
				this.removeObject(name);
			}
		}

		public generateUniqueName(baseName:string):string
		{
			var count:int = 1;
			var name:string = baseName;
			while (this._previousNameMap[name] != undefined)
				name = baseName + (++count);
			this._previousNameMap[name] = true;
			return name;
		}

		public getSessionState():SessionState[]
		{
			var result:SessionState[] = new Array(this._orderedNames.length);
			for (var i:int = 0; i < this._orderedNames.length; i++)
			{
				var name:string = this._orderedNames[i];
				var object:ILinkableObject = this._nameToObjectMap[name];
				result[i] = DynamicState.create(
						name,
						Weave.className(LinkablePlaceholder.getClass(object)),
						Weave.getState(object)
					);
			}
			//trace(LinkableHashMap, "getSessionState LinkableHashMap " + ObjectUtil.toString(result));
			return result;
		}
		
		public setSessionState(newStateArray:SessionState[], removeMissingDynamicObjects:boolean):void
		{
			// special case - no change
			if (newStateArray == null)
				return;
			
			this.delayCallbacks();
			
			//trace(LinkableHashMap, "setSessionState "+setMissingValuesToNull, ObjectUtil.toString(newState.qualifiedClassNames), ObjectUtil.toString(newState));
			// first pass: make sure the types match and sessioned properties are instantiated.
			var i:int;
			var delayed:Array = [];
			var callbacks:ICallbackCollection;
			var objectName:string;
			var className:string;
			var typedState:SessionState;
			var remainingObjects:{[name:string]:boolean} = removeMissingDynamicObjects ? {} : null; // maps an objectName to a value of true
			var newObjects:{[name:string]:boolean} = {}; // maps an objectName to a value of true if the object is newly created as a result of setting the session state
			var newNameOrder:string[] = []; // the order the object names appear in the array
			if (newStateArray != null)
			{
				// first pass: delay callbacks of all children
				for (objectName of this._orderedNames || [])
				{
					callbacks = Weave.getCallbacks(this._nameToObjectMap[objectName]);
					delayed.push(callbacks)
					callbacks.delayCallbacks();
				}
				
				// initialize all the objects before setting their session states because they may refer to each other.
				for (i = 0; i < newStateArray.length; i++)
				{
					typedState = newStateArray[i];
					if (!DynamicState.isDynamicState(typedState, true))
						continue;
					objectName = (typedState as SessionStateObject).objectName;
					className = (typedState as SessionStateObject).className;
					// ignore objects that do not have a name because they may not load the same way on different application instances.
					if (objectName == null)
						continue;
					// if className is not specified, make no change
					if (className == null)
						continue;
					// initialize object and remember if a new one was just created
					if (this._nameToObjectMap[objectName] != this.initObjectByClassName(objectName, className))
						newObjects[objectName] = true;
				}
				
				// next pass: delay callbacks of all children (again, because there may be new children)
				for (objectName of this._orderedNames || [])
				{
					callbacks = Weave.getCallbacks(this._nameToObjectMap[objectName]);
					delayed.push(callbacks)
					callbacks.delayCallbacks();
				}
				
				// next pass: copy the session state for each property that is defined.
				// Also remember the ordered list of names that appear in the session state.
				for (i = 0; i < newStateArray.length; i++)
				{
					typedState = newStateArray[i];
					if (typeof typedState === 'string')
					{
						objectName = String(typedState);
						if (removeMissingDynamicObjects)
							remainingObjects[objectName] = true;
						newNameOrder.push(objectName);
						continue;
					}
					
					if (!DynamicState.isDynamicState(typedState, true))
						continue;
					objectName = (typedState as SessionStateObject).objectName;
					if (objectName == null)
						continue;
					var object:ILinkableObject = this._nameToObjectMap[objectName];
					if (object == null)
						continue;
					// if object is newly created, we want to apply an absolute session state
					Weave.setState(object, (typedState as SessionStateObject).sessionState, newObjects[objectName] || removeMissingDynamicObjects);
					if (removeMissingDynamicObjects)
						remainingObjects[objectName] = true;
					newNameOrder.push(objectName);
				}
			}
			if (removeMissingDynamicObjects)
			{
				// third pass: remove objects based on the Boolean flags in remainingObjects.
				var names:string[] = this._orderedNames.concat(); // iterate over a copy of the list
				for (objectName of names || [])
				{
					if (remainingObjects[objectName] !== true)
					{
						//trace(LinkableHashMap, "missing value: "+objectName);
						this.removeObject(objectName);
					}
				}
			}
			// update name order AFTER objects have been added and removed.
			this.setNameOrder(newNameOrder);
			
			// final pass: resume all callbacks
			
			// next pass: delay callbacks of all children
			for (callbacks of delayed || [])
				if (!Weave.wasDisposed(callbacks))
					callbacks.resumeCallbacks();
			
			this.resumeCallbacks();
		}
	}
}
