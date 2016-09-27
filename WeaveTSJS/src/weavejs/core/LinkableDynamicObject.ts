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
	import DynamicState = weavejs.api.core.DynamicState;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import SessionState = weavejs.api.core.SessionState;
	import SessionStateObject = weavejs.api.core.SessionStateObject;

	/**
	 * This object links to an internal ILinkableObject.
	 * The internal object can be either a local one or a global one identified by a global name.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.core.LinkableDynamicObject", interfaces: [ILinkableDynamicObject, ICallbackCollection]})
	export class LinkableDynamicObject extends LinkableWatcher implements ILinkableDynamicObject, ICallbackCollection
	{
		/**
		 * @param typeRestriction If specified, this will limit the type of objects that can be added to this LinkableHashMap.
		 */
		constructor(typeRestriction:GenericClass = null)
		{
			super(typeRestriction);
		}
		
		// the callback collection for this object
		private cc:CallbackCollection = Weave.disposableChild(this, CallbackCollection);
		
		// when this is true, the linked object cannot be changed
		private _locked:boolean = false;
		
		private static /* readonly */ ARRAY_CLASS_NAME:string = 'Array';
		
		public get internalObject():ILinkableObject
		{
			return this.target;
		}
		
		public getSessionState():SessionState[]
		{
			var obj:ILinkableObject = this.targetPath || this.target;
			if (!obj)
				return [];
			
			var className:string = Weave.className(LinkablePlaceholder.getClass(obj));
			var sessionState:SessionState = Weave.AS(obj, Array) || Weave.getState(Weave.AS(obj, ILinkableObject));
			return [DynamicState.create(null, className, sessionState)];
		}
		
		public setSessionState(newState:SessionState[], removeMissingDynamicObjects:boolean):void
		{
			// special case - no change
			if (newState == null)
				return;
			
			try
			{
				// make sure callbacks only run once
				this.cc.delayCallbacks();
				
				// stop if there are no items
				if (!newState.length)
				{
					if (removeMissingDynamicObjects)
						this.target = null;
					return;
				}
				
				// if it's not a dynamic state array, treat it as a path
				if (!DynamicState.isDynamicStateArray(newState, true))
				{
					this.targetPath = newState as string[];
					return;
				}
				
				// if there is more than one item, it's in a deprecated format
				if (newState.length > 1)
				{
					this.handleDeprecatedSessionState(newState, removeMissingDynamicObjects);
					return;
				}
				
				var dynamicState:SessionState = newState[0];
				var className:string = (dynamicState as SessionStateObject).className;
				var objectName:string = (dynamicState as SessionStateObject).objectName;
				var sessionState:SessionState|string[] = (dynamicState as SessionStateObject).sessionState;
				
				// backwards compatibility
				if (className == 'weave.core::GlobalObjectReference' || className == 'GlobalObjectReference')
				{
					className = LinkableDynamicObject.ARRAY_CLASS_NAME;
					sessionState = [objectName];
				}
				
				if (className == LinkableDynamicObject.ARRAY_CLASS_NAME || (!className && this.targetPath))
					this.targetPath = sessionState as string[];
				else if (className == SessionManager.DIFF_DELETE)
					this.target = null;
				else
				{
					var prevTarget = this.target;
					var classDef:GenericClass = Weave.getDefinition(className);
					// if className is not specified, make no change unless removeMissingDynamicObjects is true
					if (className || removeMissingDynamicObjects)
						this.setLocalObjectType(classDef);
					
					var targetClassDef:GenericClass = LinkablePlaceholder.getClass(this.target);
					
					if ((!className && this.target) || (classDef && (targetClassDef === classDef || Weave.IS(targetClassDef.prototype, classDef))))
						Weave.setState(this.target, sessionState, prevTarget != this.target || removeMissingDynamicObjects);
				}
			}
			finally
			{
				// allow callbacks to run once now
				this.cc.resumeCallbacks();
			}
		}
		
		public set target(newTarget:ILinkableObject)
		{
			if (this._locked || this.target === newTarget)
				return;
			
			if (!newTarget)
			{
				super.target = null;
				return;
			}
			
			this.cc.delayCallbacks();
			
			// if the target can be found by a path, use the path
			var path:string[] = Weave.findPath(Weave.getRoot(this), newTarget);
			if (path)
			{
				this.targetPath = path;
			}
			else
			{
				// it's ok to assign a local object that we own or that doesn't have an owner yet
				// otherwise, unset the target
				var owner:ILinkableObject = Weave.getOwner(newTarget);
				if (owner === this || !owner)
					super.target = newTarget;
				else
					super.target = null;
			}
			
			this.cc.resumeCallbacks();
		}
		
		protected internalSetTarget(newTarget:ILinkableObject):void
		{
			// don't allow recursive linking
			if (newTarget === this || Weave.getDescendants(newTarget, LinkableDynamicObject).indexOf(this) >= 0)
				newTarget = null;
			
			super.internalSetTarget(newTarget);
		}
		
		public set targetPath(path:(string|number)[])
		{
			if (this._locked)
				return;
			super.targetPath = path;
		}
		
		private setLocalObjectType(classDef:GenericClass):void
		{
			// stop if locked
			if (this._locked)
				return;
			
			this.cc.delayCallbacks();
			
			this.targetPath = null;
			
			if ( Weave.isLinkable(classDef) && (this._typeRestriction == null || classDef === this._typeRestriction || Weave.IS(classDef.prototype, this._typeRestriction)) )
			{
				if (classDef != LinkablePlaceholder.getClass(this.target))
				{
					if (Weave.isAsyncClass(classDef))
						super.target = new LinkablePlaceholder(classDef);
					else
						super.target = new classDef();
				}
			}
			else
			{
				super.target = null;
			}
			
			this.cc.resumeCallbacks();
		}
		
		public requestLocalObject(objectType:GenericClass|string, lockObject:boolean = false):any
		{
			if (Weave.IS(objectType, String))
				objectType = Weave.getDefinition(String(objectType), true);
			
			this.cc.delayCallbacks();
			
			if (objectType)
				this.setLocalObjectType(objectType as GenericClass);
			else
				this.target = null;
			
			if (lockObject)
				this._locked = true;
			
			this.cc.resumeCallbacks();
			
			if (objectType)
				return Weave.AS(this.target, objectType as GenericClass);
			return this.target;
		}
		
		public requestGlobalObject(name:string, objectType:GenericClass|string, lockObject:boolean = false):any
		{
			if (Weave.IS(objectType, String))
				objectType = Weave.getDefinition(String(objectType), true);
			
			if (!name)
				return this.requestLocalObject(objectType, lockObject);
			
			if (!this._locked)
			{
				this.cc.delayCallbacks();
				
				this.targetPath = [name];
				Weave.getRoot(this).requestObject(name, objectType, lockObject);
				if (lockObject)
					this._locked = true;
				
				this.cc.resumeCallbacks();
			}
			
			if (objectType)
				return Weave.AS(this.target, objectType);
			return this.target;
		}
		
		public requestLocalObjectCopy(objectToCopy:ILinkableObject):void
		{
			this.cc.delayCallbacks(); // make sure callbacks only trigger once
			var classDef:GenericClass = LinkablePlaceholder.getClass(objectToCopy);
			var object:ILinkableObject = this.requestLocalObject(classDef, false);
			if (object != null && objectToCopy != null)
				Weave.copyState(objectToCopy, object);
			this.cc.resumeCallbacks();
		}
		
		/**
		 * This is the name of the linked global object, or null if the internal object is local.
		 */
		public get globalName():string
		{
			if (this._targetPath && this._targetPath.length == 1)
				return this._targetPath[0];
			return null;
		}

		/**
		 * This function will change the internalObject if the new globalName is different, unless this object is locked.
		 * If a new global name is given, the session state of the new global object will take precedence.
		 * @param newGlobalName This is the name of the global object to link to, or null to unlink from the current global object.
		 */
		public set globalName(newGlobalName:string)
		{
			if (this._locked)
				return;
			
			// change empty string to null
			if (!newGlobalName)
				newGlobalName = null;
			
			var oldGlobalName:string = this.globalName;
			if (oldGlobalName == newGlobalName)
				return;
			
			this.cc.delayCallbacks();
			
			if (newGlobalName == null)
			{
				// unlink from global object and copy session state into a local object
				this.requestLocalObjectCopy(this.internalObject);
			}
			else
			{
				// when switching from a local object to a global one that doesn't exist yet, copy the local object
				var root:ILinkableHashMap = Weave.getRoot(this);
				if (this.target && !this.targetPath && !root.getObject(newGlobalName))
					root.requestObjectCopy(newGlobalName, this.internalObject);
				
				// link to new global name
				this.targetPath = [newGlobalName];
			}
			
			this.cc.resumeCallbacks();
		}

		/**
		 * Handles backwards compatibility.
		 * @param newState An Array with two or more items.
		 * @param removeMissingDynamicObjects true when applying an absolute session state, false if applying a diff
		 * @return An Array with one item.
		 */
		private handleDeprecatedSessionState(newState:SessionState[], removeMissingDynamicObjects:boolean):void
		{
			// Loop backwards because when diffs are combined, most recent entries
			// are added last and we want to use the most recently applied diff.
			var i:int = newState.length;
			while (i--)
			{
				var item:SessionState = newState[i];
				
				// handle item as a global Array
				if (Weave.IS(item, String))
					item = DynamicState.create(null, LinkableDynamicObject.ARRAY_CLASS_NAME, [item as string]);
				
				// stop if it's not a typed state
				if (!DynamicState.isDynamicState(item))
					break;
				
				if ((item as SessionStateObject).className == SessionManager.DIFF_DELETE)
				{
					// remove object if name matches
					if (this.globalName == ((item as SessionStateObject).objectName || null)) // convert empty string to null
						this.target = null;
				}
				else
				{
					// use the first item we see that isn't a deleted object
					this.setSessionState([item as SessionState], removeMissingDynamicObjects);
					return;
				}
			}
			if (removeMissingDynamicObjects)
				this.target = null;
		}
		
		public lock():void
		{
			this._locked = true;
		}
		
		public get locked():boolean
		{
			return this._locked;
		}

		public removeObject():void
		{
			if (!this._locked)
				super.target = null;
		}
		
		public dispose():void
		{
			// explicitly dispose the CallbackCollection before anything else
			this.cc.dispose();
			super.dispose();
		}
		
		////////////////////////////////////////////////////////////////////////
		// ICallbackCollection interface included for backwards compatibility
		public addImmediateCallback(relevantContext:Object, callback:()=>void, runCallbackNow:boolean = false, alwaysCallLast:boolean = false):void { this.cc.addImmediateCallback(relevantContext, callback, runCallbackNow, alwaysCallLast); }
		public addGroupedCallback(relevantContext:Object, groupedCallback:()=>void, triggerCallbackNow:boolean = false, delayWhileBusy:boolean = true):void { this.cc.addGroupedCallback(relevantContext, groupedCallback, triggerCallbackNow, delayWhileBusy); }
		public addDisposeCallback(relevantContext:Object, callback:()=>void, allowDelay:boolean = false):void { this.cc.addDisposeCallback(relevantContext, callback, allowDelay); }
		public removeCallback(relevantContext:Object, callback:()=>void):void { this.cc.removeCallback(relevantContext, callback); }
		public get triggerCounter():uint { return this.cc.triggerCounter; }
		public triggerCallbacks():void { this.cc.triggerCallbacks(); }
		public get callbacksAreDelayed():boolean { return this.cc.callbacksAreDelayed; }
		public delayCallbacks():void { this.cc.delayCallbacks(); }
		public resumeCallbacks():void { this.cc.resumeCallbacks(); }
	}
}
