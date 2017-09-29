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
  export declare type SessionState = _DynamicState|DynamicStateArray;
  export declare type DynamicStateArray = _DynamicState[];
  export declare type _DynamicState = string|TypedState

  export interface TypedState {
    /**
     * The name of the property containing the name assigned to the object when the session state is generated.
     */
    objectName: string,

    /**
     * The name of the property containing the qualified class name of the original object providing the session state.
     */
    className: string,

    /**
     * The name of the property containing the session state for an object of the type specified by className.
     */
    sessionState: any,
    /**
     * The name of the property used to make isDynamicState() return false in order to bypass special diff logic for dynamic state arrays.
     */
    bypassDiff?: boolean,

    [key:string]: any
  }
  /**
   * Dynamic state objects have three properties: objectName, className, sessionState
   *
   * @author adufilie
   */
  export class DynamicState
  {
    /**
     * Creates an Object having three properties: objectName, className, sessionState
     * @param objectName The name assigned to the object when the session state is generated.
     * @param className The qualified class name of the original object providing the session state.
     * @param sessionState The session state for an object of the type specified by className.
     */
    public static create(objectName:string = null, className:string = null, sessionState:any = null):TypedState
    {
      // convert empty strings ("") to null
      var obj:TypedState = {
        objectName: objectName || null,
        className: className || null,
        sessionState
      };
      return obj;
    }

    /**
     * This function can be used to detect dynamic state objects within nested, untyped session state objects.
     * This function will check if the given object has the three properties of a dynamic state object.
     * @param object An object to check.
     * @param handleBypassDiff Set this to true to allow the object to contain the optional bypassDiff property.
     * @return true if the object has all three properties and no extras (except for "bypassDiff" when the handleBypassDiff parameter is set to true).
     */
    public static isDynamicState(object:any, handleBypassDiff:boolean = false):boolean
    {
      if (typeof object !== 'object')
        return false;
      return (object as TypedState).objectName && (object as TypedState).className && (object as TypedState).sessionState && (!handleBypassDiff || (object as TypedState).bypassDiff);
    }

    /**
     * This function checks whether or not a session state is an Array containing at least one
     * object that looks like a DynamicState and has no other non-String items.
     * @param state A session state object.
     * @param handleBypassDiff Set this to true to allow dynamic state objects to contain the optional bypassDiff property.
     * @return A value of true if the Array looks like a dynamic session state or diff.
     */
    public static isDynamicStateArray(state:any, handleBypassDiff:boolean = false):boolean
    {
      var array:DynamicStateArray = Weave.AS(state, Array);
      if (!array)
        return false;
      var result:boolean = false;
      for (var item of array)
      {
        if (typeof item === 'string')
          continue; // dynamic state diffs can contain String values.
        if (DynamicState.isDynamicState(item, handleBypassDiff))
          result = true;
        else
          return false;
      }
      return result;
    }

    /**
     * Alters a session state object to bypass special diff logic for dynamic state arrays.
     * It does so by adding the "bypassDiff" property to any part for which isDynamicState(part) returns true.
     */
    public static alterSessionStateToBypassDiff(object:any):void
    {
      if (DynamicState.isDynamicState(object))
      {
        (object as TypedState).bypassDiff = true;
        object = (object as TypedState).sessionState;
      }
      if (typeof object === 'object')
        for (var key in object as {[key:string]:TypedState})
          DynamicState.alterSessionStateToBypassDiff(object[key]);
    }

    /**
     * Converts DynamicState Arrays into Objects.
     * @param state The state to convert
     * @param recursive Specifies whether or not to recursively remove types.
     *                  If this is set to false, this function will only have an effect if the given state is a DynamicState Array.
     * @return The converted state
     */
    public static removeTypeFromState(state:any, recursive:boolean = true):SessionState
    {
      if (DynamicState.isDynamicStateArray(state))
      {
        var newState:TypedState = {} as any;
        for (var typedState of state as DynamicStateArray || [])
          if (typeof typedState === 'object')
            newState[(typedState as TypedState).objectName || ''] = recursive ? DynamicState.removeTypeFromState((typedState as TypedState).sessionState, true) : (typedState as TypedState).sessionState;
        return newState;
      }

      if (recursive && typeof state === 'object')
        for (var key in state)
          state[key] = DynamicState.removeTypeFromState(state[key], true);
      return state;
    }

    /**
     * Sets or gets a value in a session state.
     * @param state The state to traverse
     * @param path The path in the state to traverse
     * @param newValue The new value, or undefined to retrieve the current value
     * @return The new or existing value
     */
    public static traverseState(state:any/*SessionState*/, path:(string|number)[], newValue:any = undefined):any
    {
      if (!path.length)
        return newValue === undefined ? state : newValue;
      if (!state)
        return undefined;

      var property:string|number = path[0];
      path = path.slice(1);
      if (DynamicState.isDynamicStateArray(state, true))
      {
        var i:int;
        if (Weave.IS(property, Number))
          i = property as number;
        else
          for (i = 0; i < (state as DynamicStateArray).length; i++)
            if ((state [i] as TypedState).objectName == property || (!property && !(state [i] as TypedState).objectName))
              break;

        var typedState:TypedState = (state as DynamicStateArray)[i] as any;
        if (!typedState)
          return undefined;
        if (path.length)
          return DynamicState.traverseState((typedState as TypedState).sessionState, path, newValue);
        return newValue === undefined ? (typedState as TypedState).sessionState : (typedState as TypedState).sessionState = newValue;
      }

      if (path.length)
        return DynamicState.traverseState(state[property], path, newValue);
      return newValue === undefined ? state[property] : state[property] = newValue;
    }
  }
}