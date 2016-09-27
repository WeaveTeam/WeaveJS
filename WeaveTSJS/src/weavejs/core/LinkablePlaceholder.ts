/*
	This Source Code Form is subject to the terms of the
	Mozilla Public License, v. 2.0. If a copy of the MPL
	was not distributed with this file, You can obtain
	one at https://mozilla.org/MPL/2.0/.
*/
namespace weavejs.core
{
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import SessionState = weavejs.api.core.SessionState;

	/**
	 * Represents an object that must be instantiated asynchronously.
	 */
	@Weave.classInfo({id: "weavejs.core.LinkablePlaceholder"})
	export class LinkablePlaceholder<T extends ILinkableObject> extends LinkableVariable
	{
		constructor(classDef:Class<T>)
		{
			if (!classDef)
				throw new Error("classDef cannot be null");
			this.classDef = classDef;
			this._bypassDiff = classDef as GenericClass === LinkableVariable || Weave.IS(classDef.prototype, LinkableVariable);
		}
		
		private classDef:Class<T>;
		private instance:T;
		
		public getClass():Class<T>
		{
			return this.classDef;
		}
		
		public getInstance():T
		{
			return this.instance;
		}
		
		public setInstance(instance:T):void
		{
			if (Weave.wasDisposed(this))
				throw new Error("LinkablePlaceholder was already disposed");
			
			if (!Weave.IS(instance, this.classDef))
				throw new Error("Unexpected object type");
			
			this.instance = instance;
			
			LinkablePlaceholder.replace(this, instance);
		}
		
		public setSessionState(value:T):void
		{
			super.setSessionState(value);
		}
		
		/**
		 * @return success flag
		 */
		private static replace(oldObject:ILinkableObject, newObject:ILinkableObject):void
		{
			var owner:ILinkableObject = Weave.getOwner(oldObject);
			var oldPlaceholder:LinkablePlaceholder = Weave.AS(oldObject, LinkablePlaceholder);
			var lhm:ILinkableHashMap = Weave.AS(owner, ILinkableHashMap);
			var ldo:ILinkableDynamicObject = Weave.AS(owner, ILinkableDynamicObject);
			if (!lhm && !ldo)
				throw new Error("Unable to replace object because owner is not an ILinkableHashMap or ILinkableDynamicObject");
			
			var ownerCC:ICallbackCollection = Weave.getCallbacks(owner);
			ownerCC.delayCallbacks();
			try
			{
				var sessionState:Object = undefined;
				if (Weave.getCallbacks(oldObject).triggerCounter != CallbackCollection.DEFAULT_TRIGGER_COUNT)
					sessionState = Weave.getState(oldObject);
				
				if (oldPlaceholder)
					Weave.getCallbacks(oldPlaceholder).delayCallbacks();
				
				if (lhm)
					lhm.setObject(lhm.getName(oldObject), newObject);
				else if (ldo)
					ldo.target = newObject;
				
				if (sessionState !== undefined)
					Weave.setState(newObject, sessionState);
				
				if (oldPlaceholder)
					Weave.getCallbacks(oldPlaceholder).resumeCallbacks();
			}
			finally
			{
				ownerCC.resumeCallbacks();
			}
		}
		
		/**
		 * A utility function for getting the class definition from LinkablePlaceholders as well as regular objects.
		 * @param object An object, which may be null.
		 * @return The class definition, or null if the object was null.
		 */
		public static getClass<T>(object:T| LinkablePlaceholder<T>):Class<T>
		{
			var placeholder:LinkablePlaceholder = Weave.AS(object, LinkablePlaceholder);
			if (placeholder)
				return placeholder.getClass();
			if (object)
				return (object as any).constructor;
			return null;
		}
		
		/**
		 * Replaces a LinkablePlaceholder with an instance of the expected type.
		 * @param possiblePlaceholder A LinkablePlaceholder or the instance object if it has already been placed.
		 * @param instance An instance of the type of object that the placeholder is expecting.
		 */
		public static setInstance(possiblePlaceholder:ILinkableObject, instance:ILinkableObject):void
		{
			// stop if instance has already been placed
			if (possiblePlaceholder === instance)
				return;
			
			var placeholder:LinkablePlaceholder = Weave.AS(possiblePlaceholder, LinkablePlaceholder);
			if (!placeholder)
				throw new Error("Attempted to put an instance where there was no placeholder for it.");
			
			placeholder.setInstance(instance);
		}
		
		public static replaceInstanceWithPlaceholder(instance:ILinkableObject):void
		{
			if (!instance || Weave.IS(instance, LinkablePlaceholder) || Weave.wasDisposed(instance))
				return;
			
			var placeholder:LinkablePlaceholder<ILinkableObject> = new LinkablePlaceholder(LinkablePlaceholder.getClass(instance));
			try
			{
				LinkablePlaceholder.replace(instance, placeholder);
			}
			catch (e)
			{
				Weave.dispose(placeholder);
				throw e;
			}
		}
		
		/**
		 * Calls a function after a placeholder has been replaced with an instance and the instance session state has been initialized.
		 * The onReady function will be called immediately if possiblePlaceholder is not a LinkablePlaceholder.
		 * @param relevantContext The relevantContext parameter passed to ICallbackCollection.addDisposeCallback().
		 * @param possiblePlaceholder Either a LinkablePlaceholder or another ILinkableObject.
		 * @param onReady The function to call.
		 */
		public static whenReady(relevantContext:ILinkableObject, possiblePlaceholder:ILinkableObject, onReady:(instance:ILinkableObject)=>void):void
		{
			var lp:LinkablePlaceholder = Weave.AS(possiblePlaceholder, LinkablePlaceholder);
			if (lp)
			{
				Weave.getCallbacks(lp).addDisposeCallback(relevantContext, function():void {
					var instance:ILinkableObject = lp.getInstance();
					if (instance)
						onReady(instance);
				}, true);
			}
			else if (possiblePlaceholder && !Weave.wasDisposed(relevantContext))
			{
				onReady(possiblePlaceholder);
			}
		}
	}
}
