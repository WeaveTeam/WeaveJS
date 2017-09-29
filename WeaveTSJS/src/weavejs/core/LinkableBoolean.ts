/*
	This Source Code Form is subject to the terms of the
	Mozilla Public License, v. 2.0. If a copy of the MPL
	was not distributed with this file, You can obtain
	one at https://mozilla.org/MPL/2.0/.
*/
namespace weavejs.core
{
  /**
   * This is a LinkableVariable which limits its session state to Boolean values.
   * @author adufilie
   * @see weave.core.LinkableVariable
   */
  export class LinkableBoolean extends LinkableVariable
  {
    constructor(defaultValue:boolean = undefined, verifier:(value:boolean)=> boolean = null, defaultValueTriggersCallbacks:boolean = true)
    {
      super(Boolean, verifier, defaultValue, defaultValueTriggersCallbacks);
    }

    public get value():boolean
    {
      if (this._sessionStateExternal === undefined)
        return false;
      return this._sessionStateExternal;
    }
    public set value(value:boolean)
    {
      this.setSessionState(value);
    }

    public getSessionState():boolean
    {
      if (this._sessionStateExternal === undefined)
        return false;
      return this._sessionStateExternal;
    }

    public setSessionState(value:boolean):void
    {
      if (Weave.IS(value, String)) // run time check
        value = (value as any === 'true');
      super.setSessionState(value ? true : false);
    }
  }
}