/*
	This Source Code Form is subject to the terms of the
	Mozilla Public License, v. 2.0. If a copy of the MPL
	was not distributed with this file, You can obtain
	one at https://mozilla.org/MPL/2.0/.
*/
namespace weavejs.core
{
	/**
	 * This is a LinkableVariable which limits its session state to String values.
	 * @author adufilie
	 * @see weave.core.LinkableVariable
	 */
	@Weave.classInfo({id: "weavejs.core.LinkableString"})
	export class LinkableString extends LinkableVariable
	{
		constructor(defaultValue:string = null, verifier:(value:string) => boolean = null, defaultValueTriggersCallbacks:boolean = true)
		{
			super(String, verifier, arguments.length ? defaultValue : undefined, defaultValueTriggersCallbacks);
		}

		public get value():string
		{
			if (this._sessionStateExternal === undefined)
				return null;
			return this._sessionStateExternal;
		}
		public set value(value:string)
		{
			this.setSessionState(value);
		}
		
		public setSessionState(value:string):void
		{
			super.setSessionState(value == null ? null : String(value));
		}
	}
}
