/*
	This Source Code Form is subject to the terms of the
	Mozilla Public License, v. 2.0. If a copy of the MPL
	was not distributed with this file, You can obtain
	one at https://mozilla.org/MPL/2.0/.
*/
namespace weavejs.core
{
	import WeaveAPI = weavejs.WeaveAPI;
	import DynamicState = weavejs.api.core.DynamicState;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	import ILinkableVariable = weavejs.api.core.ILinkableVariable;
	import StandardLib = weavejs.util.StandardLib;
	import JS = weavejs.util.JS;
	import SessionState = weavejs.api.core.SessionState;
	
	/**
	 * LinkableVariable allows callbacks to be added that will be called when the value changes.
	 * A LinkableVariable has an optional type restriction on the values it holds.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.core.LinkableVariable", interfaces: [ILinkableVariable, ICallbackCollection, IDisposableObject]})
	export class LinkableVariable<T> extends CallbackCollection implements ILinkableVariable, ICallbackCollection, IDisposableObject
	{
		/**
		 * This function is used to prevent the session state from having unwanted values.
		 * Function signature should be  function(value:*):Boolean
		 */		
		protected _verifier:(value:T) => boolean = null;
		
		/**
		 * This is true if the session state has been set at least once.
		 */
		protected _sessionStateWasSet:boolean = false;
		
		/**
		 * This is true if the _sessionStateType is a primitive type.
		 */
		protected _primitiveType:String|Number|Boolean = false;
		
		/**
		 * Type restriction passed in to the constructor.
		 */
		protected _sessionStateType:GenericClass = null;
		
		/**
		 * Cannot be modified externally because it is not returned by getSessionState()
		 */
		protected _sessionStateInternal:T = undefined;
		
		/**
		 * Available externally via getSessionState()
		 */
		protected _sessionStateExternal:T = undefined;
		
		/**
		 * This is set to true when lock() is called.
		 */
		protected _locked:boolean = false;
		
		/**
		 * If true, session states will be altered to bypass the diff calculation on DynamicState Arrays.
		 */
		protected _bypassDiff:boolean = true;
		
		/**
		 * If a defaultValue is specified, callbacks will be triggered in a later frame unless they have already been triggered before then.
		 * This behavior is desirable because it allows the initial value to be handled by the same callbacks that handles new values.
		 * @param sessionStateType The type of values accepted for this sessioned property.
		 * @param verifier A function that returns true or false to verify that a value is accepted as a session state or not.  The function signature should be  function(value:*):Boolean.
		 * @param defaultValue The default value for the session state.
		 * @param defaultValueTriggersCallbacks Set this to false if you do not want the callbacks to be triggered one frame later after setting the default value.
		 */
		constructor(sessionStateType:Class<T> = null, verifier:(value:T) => boolean = null, defaultValue:T = undefined, defaultValueTriggersCallbacks:boolean = true)
		{
			super();
			
			if (sessionStateType != Object)
			{
				this._sessionStateType = sessionStateType;
				this._primitiveType = this._sessionStateType == String
					|| this._sessionStateType == Number
					|| this._sessionStateType == Boolean;
			}
			
			this._verifier = verifier;
			
			if (defaultValue !== undefined)
			{
				this.setSessionState(defaultValue);
				
				// If callbacks were triggered, make sure callbacks are triggered again one frame later when
				// it is possible for other classes to have a pointer to this object and retrieve the value.
				if (defaultValueTriggersCallbacks && this.triggerCounter > LinkableVariable.DEFAULT_TRIGGER_COUNT)
					WeaveAPI.Scheduler.callLater(this, this._defaultValueTrigger);
			}
		}
		
		/**
		 * @private
		 */		
		private _defaultValueTrigger=():void=>
		{
			// unless callbacks were triggered again since the default value was set, trigger callbacks now
			if (!this.wasDisposed && this.triggerCounter == LinkableVariable.DEFAULT_TRIGGER_COUNT + 1)
				this.triggerCallbacks();
		}
		
		/**
		 * This function will verify if a given value is a valid session state for this linkable variable.
		 * @param value The value to verify.
		 * @return A value of true if the value is accepted by this linkable variable.
		 */
		private verifyValue(value:T):boolean
		{
			return this._verifier == null || this._verifier(value);
		}
		
		/**
		 * The type restriction passed in to the constructor.
		 */
		public getSessionStateType():Class<T>
		{
			return this._sessionStateType;
		}

		public getSessionState():T
		{
			if (this._sessionStateExternal === undefined)
				return null;
			return this._sessionStateExternal;
		}
		
		public setSessionState(value:T):void
		{
			if (this._locked)
				return;

			// cast value now in case it is not the appropriate type
			if (this._sessionStateType != null)
				value = Weave.AS(value, this._sessionStateType);
			
			// stop if verifier says it's not an accepted value
			if (this._verifier != null && !this._verifier(value))
				return;
			
			var wasCopied:boolean = false;
			var type:string = null;
			if (value == null)
			{
				value = null; // converts undefined to null
			}
			else
			{
				type = typeof(value);
				if (type == 'object' && value.constructor != Object && value.constructor != Array)
				{
					// convert to dynamic Object prior to sessionStateEquals comparison
					value = JS.copyObject(value);
					wasCopied = true;
				}
			}
			
			// If this is the first time we are calling setSessionState(), including
			// from the constructor, don't bother checking sessionStateEquals().
			// Otherwise, stop if the value did not change.
			if (this._sessionStateWasSet && this.sessionStateEquals(value))
				return;
			
			// If the value is a dynamic object, save a copy because we don't want
			// two LinkableVariables to share the same object as their session state.
			if (type == 'object')
			{
				if (!wasCopied)
					value = JS.copyObject(value);
				
				if (this._bypassDiff)
					DynamicState.alterSessionStateToBypassDiff(value);
				
				// save external copy, accessible via getSessionState()
				this._sessionStateExternal = value;
				
				// save internal copy
				this._sessionStateInternal = JS.copyObject(value);
			}
			else
			{
				// save primitive value
				this._sessionStateExternal = this._sessionStateInternal = value;
			}
			
			// remember that we have set the session state at least once.
			this._sessionStateWasSet = true;
			
			this.triggerCallbacks();
		}
		
		/**
		 * This function is used in setSessionState() to determine if the value has changed or not.
		 * Classes that extend this class may override this function.
		 */
		protected sessionStateEquals(otherSessionState:T):boolean
		{
			if (this._primitiveType)
				return this._sessionStateInternal == otherSessionState;
			
			return StandardLib.compare(this._sessionStateInternal, otherSessionState, this.objectCompare) == 0;
		}
		
		private objectCompare(a:T&SessionState, b:T&SessionState):number
		{
			if (DynamicState.isDynamicState(a, true) &&
				DynamicState.isDynamicState(b, true) &&
				a.className == b.className &&
				a.objectName == b.objectName)
			{
				return StandardLib.compare(a.sessionState, b.sessionState, this.objectCompare);
			}
			return NaN;
		}
		
		/**
		 * This function may be called to detect change to a non-primitive session state in case it has been modified externally.
		 */
		public detectChanges():void
		{
			if (!this.sessionStateEquals(this._sessionStateExternal))
				this.triggerCallbacks();
		}

		/**
		 * Call this function when you do not want to allow any more changes to the value of this sessioned property.
		 */
		public lock():void
		{
			this._locked = true;
		}
		
		/**
		 * This is set to true when lock() is called.
		 * Subsequent calls to setSessionState() will have no effect.
		 */
		public get locked():boolean
		{
			return this._locked;
		}

		public get state():T
		{
			return this.getSessionState();
		}
		public set state(value:T)
		{
			this.setSessionState(value);
		}

		public dispose():void
		{
			super.dispose();
			this._sessionStateInternal = undefined;
			this._sessionStateExternal = undefined;
		}
	}
}
