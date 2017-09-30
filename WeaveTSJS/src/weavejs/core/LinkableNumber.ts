/*
	This Source Code Form is subject to the terms of the
	Mozilla Public License, v. 2.0. If a copy of the MPL
	was not distributed with this file, You can obtain
	one at https://mozilla.org/MPL/2.0/.
*/
namespace weavejs.core
{
	import StandardLib = weavejs.util.StandardLib;

	/**
	 * This is a LinkableVariable which limits its session state to Number values.
	 * @author adufilie
	 * @see weave.core.LinkableVariable
	 */
	@Weave.classInfo({id: "weavejs.core.LinkableNumber"})
	export class LinkableNumber extends LinkableVariable
	{
		constructor(defaultValue:number = NaN, verifier:(value:number)=>boolean = null, defaultValueTriggersCallbacks:boolean = true)
		{
			// Note: Calling super() will set all the default values for member variables defined in the super class,
			// which means we can't set _sessionStateInternal = NaN here.
			super(Number, verifier, arguments.length ? defaultValue : undefined, defaultValueTriggersCallbacks);
		}

		public get value():number
		{
			return Number(this._sessionStateExternal);
		}
		public set value(value:number)
		{
			this.setSessionState(value);
		}
		
		public getSessionState():number
		{
			return Number(this._sessionStateExternal);
		}

		public setSessionState(value:number)
		{
			if (!Weave.IS(value, Number)) // run time check
				value = StandardLib.asNumber(value);
			super.setSessionState(value);
		}

		protected sessionStateEquals(otherSessionState:number):boolean
		{
			// We must check for null here because we can't set _sessionStateInternal = NaN in the constructor.
			if (this._sessionStateInternal == null)
				this._sessionStateInternal = this._sessionStateExternal = NaN;
			if (isNaN(this._sessionStateInternal) && isNaN(otherSessionState))
				return true;
			return this._sessionStateInternal == otherSessionState;
		}
	}
}
