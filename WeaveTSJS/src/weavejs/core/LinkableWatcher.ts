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
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	import ILinkableCompositeObject = weavejs.api.core.ILinkableCompositeObject;
	import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import Dictionary2D = weavejs.util.Dictionary2D;
	import StandardLib = weavejs.util.StandardLib;
	
	/**
	 * This is used to dynamically attach a set of callbacks to different targets.
	 * The callbacks of the LinkableWatcher will be triggered automatically when the
	 * target triggers callbacks, changes, becomes null or is disposed.
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.core.LinkableWatcher", interfaces: [ILinkableObject, IDisposableObject]})
	export class LinkableWatcher implements ILinkableObject, IDisposableObject
	{
		/**
		 * Instead of calling this constructor directly, consider using one of the global functions
		 * newLinkableChild() or newDisposableChild() to make sure the watcher will get disposed automatically.
		 * @param typeRestriction Optionally restricts which type of targets this watcher accepts.
		 * @param immediateCallback A function to add as an immediate callback.
		 * @param groupedCallback A function to add as a grouped callback.
		 * @see weave.api.core.newLinkableChild()
		 * @see weave.api.core.newDisposableChild()
		 */
		constructor(typeRestriction:GenericClass = null, immediateCallback:()=>void = null, groupedCallback:()=>void = null)
		{
			this._typeRestriction = typeRestriction;
			
			if (immediateCallback != null)
				Weave.getCallbacks(this).addImmediateCallback(null, immediateCallback);
			
			if (groupedCallback != null)
				Weave.getCallbacks(this).addGroupedCallback(null, groupedCallback);
		}
		
		protected _typeRestriction:GenericClass;
		private _root:ILinkableObject; // the root object to which targetPath is relative
		private _target:ILinkableObject; // the current target or ancestor of the to-be-target
		private _foundRoot:boolean = false; // false until Weave.getWeave() or Weave.getRoot(this) returns non-null
		private _foundTarget:boolean = true; // false when _target is not the desired target
		protected _targetPath:Array<string|number>; // the path that is being watched
		private _pathDependencies = new Dictionary2D<ILinkableCompositeObject, string, ILinkableObject>(); // (ILinkableCompositeObject, String) -> child object
		private _warned:boolean = false; // true after warning has been shown
		
		/**
		 * This is the root object to which targetPath is relative.
		 */
		public get root():ILinkableObject
		{
			if (!this._root)
			{
				var weave:Weave = Weave.getWeave(this);
				this._root = weave ? weave.root : Weave.getRoot(this);
				
				if (this._root && !this._foundRoot && !this._foundTarget)
					this.handlePath();
			}
			return this._root;
		}
		public set root(object:ILinkableObject)
		{
			if (this.root != object)
			{
				var cc:ICallbackCollection = Weave.getCallbacks(this);
				cc.delayCallbacks();
				
				this._root = object;
				if (this._targetPath)
				{
					this.resetPathDependencies();
					this.handlePath();
				}
				cc.triggerCallbacks();
				
				cc.resumeCallbacks();
			}
		}
		
		/**
		 * This is the linkable object currently being watched.
		 * Setting this will unset the targetPath.
		 */
		public get target():ILinkableObject
		{
			if (!this._foundRoot && !this._foundTarget)
				this.handlePath();
			return this._foundTarget ? this._target : null;
		}
		public set target(newTarget:ILinkableObject)
		{
			var cc:ICallbackCollection = Weave.getCallbacks(this);
			cc.delayCallbacks();
			this.targetPath = null;
			this.internalSetTarget(newTarget);
			cc.resumeCallbacks();
		}
		
		/**
		 * Checks if the target is currently a placeholder for an instance of an async class.
		 * @return true if the target is a placeholder.
		 * @see Weave#registerAsyncClass()
		 */
		public get foundPlaceholder():boolean
		{
			return Weave.IS(this._target, LinkablePlaceholder);
		}
		
		/**
		 * This sets the new target to be watched without resetting targetPath.
		 * Callbacks will be triggered immediately if the new target is different from the old one.
		 */
		protected internalSetTarget(newTarget:ILinkableObject):void
		{
			if (newTarget && this._foundTarget && this._typeRestriction)
			{
				var classDef = LinkablePlaceholder.getClass(newTarget);
				if (!(classDef === this._typeRestriction || Weave.IS(classDef.prototype, this._typeRestriction)))
					newTarget = null;
			}
			
			// do nothing if the targets are the same.
			if (this._target == newTarget)
				return;
			
			// unlink from old target
			if (this._target)
			{
				Weave.getCallbacks(this._target).removeCallback(this, this._handleTargetTrigger);
				Weave.getCallbacks(this._target).removeCallback(this, this._handleTargetDispose);
				
				// if we own the previous target, dispose it
				if (Weave.getOwner(this._target) == this)
					Weave.dispose(this._target);
				else
					(WeaveAPI.SessionManager as SessionManager).unregisterLinkableChild(this, this._target);
			}
			
			this._target = newTarget;
			
			// link to new target
			if (this._target)
			{
				// we want to register the target as a linkable child (for busy status)
				Weave.linkableChild(this, this._target);
				// we don't want the target triggering our callbacks directly
				Weave.getCallbacks(this._target).removeCallback(this, Weave.getCallbacks(this).triggerCallbacks);
				Weave.getCallbacks(this._target).addImmediateCallback(this, this._handleTargetTrigger, false, true);
				// we need to know when the target is disposed
				Weave.getCallbacks(this._target).addDisposeCallback(this, this._handleTargetDispose);
			}
			
			if (this._foundTarget)
				this._handleTargetTrigger();
		}
		
		private _handleTargetTrigger():void
		{
			if (this._foundTarget)
				Weave.getCallbacks(this).triggerCallbacks();
			else
				this.handlePath();
		}
		
		private _handleTargetDispose():void
		{
			if (this._targetPath)
			{
				this.handlePath();
			}
			else
			{
				this._target = null;
				Weave.getCallbacks(this).triggerCallbacks();
			}
		}
		
		/**
		 * This is the path that is currently being watched for linkable object targets.
		 */
		public get targetPath():Array<string|number>
		{
			return this._targetPath ? this._targetPath.concat() : null;
		}
		
		/**
		 * This will set a path which should be watched for new targets.
		 * Callbacks will be triggered immediately if the path changes or points to a new target.
		 */
		public set targetPath(path:Array<string|number>)
		{
			// do not allow watching the root object
			if (path && path.length == 0)
				path = null;
			if (StandardLib.compare(this._targetPath, path) != 0)
			{
				var cc:ICallbackCollection = Weave.getCallbacks(this);
				cc.delayCallbacks();
				
				this.resetPathDependencies();
				this._targetPath = path;
				this.handlePath();
				cc.triggerCallbacks();
				
				cc.resumeCallbacks();
			}
		}
		
		private handlePath():void
		{
			if (!this._targetPath)
			{
				this._foundTarget = true;
				this.internalSetTarget(null);
				return;
			}
			
			this._foundRoot = this.root != null;
			if (!this._foundRoot && !this._warned)
			{
				var error:Error = new Error("LinkableWatcher has a targetPath but no root");
				WeaveAPI.Scheduler.callLater(this, ():void=> {
					if (!this._foundRoot && !this.root)
						console.error("Warning:", error);
				});
				this._warned = true;
			}
			var node:ILinkableObject = Weave.followPath(this._root, this._targetPath);
			if (!node)
			{
				// traverse the path, finding ILinkableDynamicObject path dependencies along the way
				node = this._root;
				var subPath:(string|number)[]  = [];
				for (var name of this._targetPath || [])
				{
					if (Weave.IS(node, ILinkableCompositeObject))
						this.addPathDependency(Weave.AS(node, ILinkableCompositeObject), name as any as string);
					
					subPath[0] = name;
					var child:ILinkableObject = Weave.followPath(node, subPath);
					if (child)
					{
						node = child;
					}
					else
					{
						// the path points to an object that doesn't exist yet
						if (Weave.IS(node, ILinkableHashMap))
						{
							// watching childListCallbacks instead of the hash map accomplishes two things:
							// 1. eliminate unnecessary calls to handlePath()
							// 2. avoid watching the root hash map (and registering the root as a child of the watcher)
							node = Weave.AS(node, ILinkableHashMap).childListCallbacks;
						}
						if (Weave.IS(node, ILinkableDynamicObject))
						{
							// path dependency code will detect changes to this node, so we don't need to set the target
							node = null;
						}
						
						var lostTarget:boolean = this._foundTarget;
						this._foundTarget = false;
						
						this.internalSetTarget(node);
						
						// must trigger here when we lose the target because internalSetTarget() won't trigger when _foundTarget is false
						if (lostTarget)
							Weave.getCallbacks(this).triggerCallbacks();
						
						return;
					}
				}
			}
			
			// we found a desired target if there is no type restriction or the object fits the restriction
			this._foundTarget = !this._typeRestriction || Weave.IS(node, this._typeRestriction);
			this.internalSetTarget(node);
		}
		
		private addPathDependency(parent:ILinkableCompositeObject, pathElement:string):void
		{
			// if parent is an ILinkableHashMap and pathElement is a String, we don't need to add the dependency
			var lhm:ILinkableHashMap = Weave.AS(parent, ILinkableHashMap);
			if (lhm && Weave.IS(pathElement, String))
				return;
			
			var ldo:ILinkableDynamicObject = Weave.AS(parent, ILinkableDynamicObject);
			if (ldo)
				pathElement = null;
			
			if (!this._pathDependencies.get(parent, pathElement))
			{
				var child:ILinkableObject = Weave.followPath(parent, [pathElement]);
				this._pathDependencies.set(parent, pathElement, child);
				var dependencyCallbacks:ICallbackCollection = this.getDependencyCallbacks(parent);
				dependencyCallbacks.addImmediateCallback(this, this.handlePathDependencies);
				dependencyCallbacks.addDisposeCallback(this, this.handlePathDependencies);
			}
		}
		
		private getDependencyCallbacks(parent:ILinkableObject):ICallbackCollection
		{
			var lhm:ILinkableHashMap = Weave.AS(parent, ILinkableHashMap);
			if (lhm)
				return lhm.childListCallbacks;
			return Weave.getCallbacks(parent);
		}
		
		private handlePathDependencies():void
		{
			this._pathDependencies.forEach(this.handlePathDependencies_each, this);
		}
		private handlePathDependencies_each(parent:ILinkableObject, pathElement:string, child:ILinkableObject):boolean
		{
			var newChild:ILinkableObject = Weave.followPath(parent, [pathElement]);
			if (Weave.wasDisposed(parent) || child != newChild)
			{
				this.resetPathDependencies();
				this.handlePath();
				return true; // stop iterating
			}
			return false; // continue iterating
		}
		
		private resetPathDependencies():void
		{
			this._pathDependencies.map.forEach(this.resetPathDependencies_each, this);
			this._pathDependencies = new Dictionary2D<ILinkableCompositeObject, string, ILinkableObject>();
		}
		private resetPathDependencies_each(map_child:Object, parent:ILinkableObject):void
		{
			this.getDependencyCallbacks(parent).removeCallback(this, this.handlePathDependencies);
		}
		
		public dispose():void
		{
			this._targetPath = null;
			this._target = null;
			this._root = null;
			// everything else will be cleaned up automatically
		}
		
		/*
			// JavaScript test code for path dependency case
			var lhm = weave.path('lhm').remove().request('LinkableHashMap');
			
			var a = lhm.push('a').request('LinkableDynamicObject').state(lhm.getPath('b', null));
			
			a.addCallback(function () {
			if (a.getType(null))
			console.log('a.getState(null): ', JSON.stringify(a.getState(null)));
			else
			console.log('a has no internal object');
			}, false, true);
			
			var b = lhm.push('b').request('LinkableDynamicObject').state(lhm.getPath('c'));
			
			// a has no internal object
			
			var c = lhm.push('c').request('LinkableDynamicObject').request(null, 'LinkableString').state(null, 'c value');
			
			// a.getState(null): []
			// a.getState(null): [{"className":"weave.core::LinkableString","objectName":null,"sessionState":null}]
			// a.getState(null): [{"className":"weave.core::LinkableString","objectName":null,"sessionState":"c value"}]
			
			b.remove(null);
			
			// a has no internal object
			
			b.request(null, 'LinkableString').state(null, 'b value');
			
			// a.getState(null): null
			// a.getState(null): "b value"
		*/
	}
}
