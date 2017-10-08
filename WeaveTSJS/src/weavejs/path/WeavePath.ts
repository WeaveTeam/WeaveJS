/*
	This Source Code Form is subject to the terms of the
	Mozilla Public License, v. 2.0. If a copy of the MPL
	was not distributed with this file, You can obtain
	one at https://mozilla.org/MPL/2.0/.
*/
namespace weavejs.path
{
  import DynamicState = weavejs.api.core.DynamicState;
  import ICallbackCollection = weavejs.api.core.ICallbackCollection;
  import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
  import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
  import ILinkableObject = weavejs.api.core.ILinkableObject;
  import JS = weavejs.util.JS;
  import StandardLib = weavejs.util.StandardLib;
  import SessionState = weavejs.api.core.SessionState;
  import TypedState = weavejs.api.core.TypedState;
  import UnTypedState = weavejs.api.core.UnTypedState;
  import DynamicStateArray = weavejs.api.core.DynamicStateArray;

  export declare type Path = (string|number)[];

  /**
   * Private function for internal use.
   *
   * Converts an arguments object to an Array.
   * @param args An arguments object.
   * @param option An integer flag for special behavior.
   *   - If set to 1, it handles arguments like (...LIST) where LIST can be either an Array or multiple arguments.
   *   - If set to 2, it handles arguments like (...LIST, REQUIRED_PARAM) where LIST can be either an Array or multiple arguments.
   * @private
   */
  function _A(args:any[], option:int = 0):any[]
  {
    if (args.length == option && Weave.IS(args[0], Array))
      return [].concat(args[0], Array.prototype.slice.call(args, 1));
    return Array.prototype.slice.call(args);
  }

  export class WeavePath
  {
    /**
     * A pointer to the Weave instance.
     */
    public weave:Weave;

    protected _path:Path;
    protected _parent:WeavePath;

    /**
     * WeavePath constructor.  WeavePath objects are immutable after they are created.
     * @class WeavePath
     * @param basePath An optional Array specifying the path to an object in the session state.
     *                 A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @return A WeavePath object.
     */
    constructor(weave:Weave, basePath:Path)
    {
      this.weave = weave;

      // "private" instance variables
      this._path = _A(basePath, 1);
      this._parent = null; // parent WeavePath returned by pop()
    }

    // public chainable methods

    /**
     * Creates a new WeavePath relative to the current one.
     * @param relativePath An Array (or multiple parameters) specifying descendant names relative to the current path.
     *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @return A new WeavePath object which remembers the current WeavePath as its parent.
     */
    public push(...relativePath:any[]):WeavePath
    {
      relativePath = _A(relativePath, 1);
      var newWeavePath:WeavePath = new WeavePath(this.weave, this.getPath(relativePath));
      newWeavePath._parent = this;
      return newWeavePath;
    }

    /**
     * Returns to the previous WeavePath that spawned the current one with push().
     * @return The parent WeavePath object.
     */
    public pop():WeavePath
    {
      if (this._parent)
        return this._parent;
      else
        WeavePath._failMessage('pop', 'stack is empty');
      return null;
    }

    /**
     * Requests that an object be created if it doesn't already exist at the current path (or relative path, if specified).
     * This function can also be used to assert that the object at the current path is of the type you expect it to be.
     * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
     *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @param objectType The name of an ActionScript class in Weave.
     * @return The current WeavePath object.
     */
    public request(...relativePath_objectType:any[]):WeavePath
    {
      var args = _A(relativePath_objectType, 2);
      if (!WeavePath._assertParams('request', args))
        return this;

      var type:string = args.pop();
      var relativePath:Path = args;

      var classDef:GenericClass;
      var className:string;
      if (JS.isClass(type))
      {
        classDef = JS.asClass(type);
        className = Weave.className(classDef);
      }
      else
      {
        className = Weave.AS(type, String) as string; // may not be full qualified class name, but useful for error messages
        classDef = Weave.getDefinition(className);
        if (!classDef)
          throw new Error(StandardLib.substitute("No class definition for {0}", className));
      }

      // stop if at root path
      var objectPath:Path = this._path.concat(relativePath);
      if (!objectPath.length)
      {
        // check for exact class match only
        if (Object(this.weave.root).constructor == classDef)
          return this;

        throw new Error("Cannot request an object at the root path");
      }

      // Get parent object first in case there is some backwards compatibility code that gets
      // executed when it is accessed (registering deprecated class definitions, for example).
      var parentPath:Path = objectPath.concat();
      var childName = parentPath.pop();
      var parent:ILinkableObject = Weave.followPath(this.weave.root, parentPath);

      // request the child object
      var hashMap:ILinkableHashMap = Weave.AS(parent, ILinkableHashMap);
      var dynamicObject:ILinkableDynamicObject = Weave.AS(parent, ILinkableDynamicObject);
      var child:Object = null;
      if (hashMap)
      {
        if (Weave.IS(childName, Number))
          childName = hashMap.getNames()[childName as number];
        child = hashMap.requestObject(childName as string, classDef, false);
      }
      else if (dynamicObject)
        child = dynamicObject.requestGlobalObject(childName as string, classDef, false);
      else
        child = Weave.followPath(this.weave.root, objectPath);

      // check for exact match only
      if (child && child.constructor == classDef)
        return this;

      throw new Error(StandardLib.substitute("Request for {0} failed at path {1}", type as string || Weave.className(type), JSON.stringify(objectPath)));
    };

    /**
     * Removes a dynamically created object.
     * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
     *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @return The current WeavePath object.
     */
    public remove(...relativePath:any[]):WeavePath
    {
      relativePath = _A(relativePath, 1);

      if (this._path.length + relativePath.length == 0)
        throw new Error("Cannot remove root object");

      var parentPath = this._path.concat(relativePath);
      var childName = parentPath.pop();
      var parent:ILinkableObject = Weave.followPath(this.weave.root, parentPath);

      var hashMap:ILinkableHashMap = Weave.AS(parent, ILinkableHashMap);
      if (hashMap)
      {
        if (Weave.IS(childName, Number))
          childName = hashMap.getNames()[childName as number];

        if (hashMap.objectIsLocked(childName as string))
          throw new Error("Object is locked and cannot be removed: " + this.push(relativePath));

        hashMap.removeObject(childName as string);
        return this;
      }

      var dynamicObject:ILinkableDynamicObject = Weave.AS(parent, ILinkableDynamicObject);
      if (dynamicObject)
      {
        if (dynamicObject.locked)
          throw new Error("Object is locked and cannot be removed: " + this.push(relativePath));

        dynamicObject.removeObject();
        return this;
      }

      if (parent)
        throw new Error("Parent object does not support dynamic children, so cannot remove child: " + this.push(relativePath));
      else
        throw new Error("No parent from which to remove a child: " + this.push(relativePath));
    };

    /**
     * Reorders the children of an ILinkableHashMap at the current path.
     * @param orderedNames An Array (or multiple parameters) specifying ordered child names.
     * @return The current WeavePath object.
     */
    public reorder(...orderedNames:string[]):WeavePath
    {
      orderedNames = _A(orderedNames, 1);
      if (WeavePath._assertParams('reorder', orderedNames))
      {
        var hashMap:ILinkableHashMap = Weave.AS(this.getObject(), ILinkableHashMap);
        if (hashMap)
        {
          // it's ok if there are no names specified, because that wouldn't accomplish anything anyway
          if (orderedNames)
            hashMap.setNameOrder(orderedNames);
        }

        WeavePath._failMessage('reorder', 'path does not refer to an ILinkableHashMap: ' + this);
      }
      return this;
    };

    /**
     * Sets the session state of the object at the current path or relative to the current path.
     * Any existing dynamically created objects that do not appear in the new state will be removed.
     * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
     *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @param state The session state to apply.
     * @return The current WeavePath object.
     */
    public state(...relativePath_state:any[]):WeavePath
    {
      var args = _A(relativePath_state, 2);
      if (WeavePath._assertParams('state', args))
      {
        var state:Object = args.pop();
        var obj:ILinkableObject = this.getObject(args);
        if (obj)
          Weave.setState(obj, state, true);
        else
          WeavePath._failObject('state', this.getPath(args));
      }
      return this;
    };

    /**
     * Applies a session state diff to the object at the current path or relative to the current path.
     * Existing dynamically created objects that do not appear in the new state will remain unchanged.
     * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
     *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @param diff The session state diff to apply.
     * @return The current WeavePath object.
     */
    public diff(...relativePath_diff:any[]):WeavePath
    {
      var args = _A(relativePath_diff, 2);
      if (WeavePath._assertParams('diff', args))
      {
        var diff:SessionState = args.pop();
        var obj:ILinkableObject = this.getObject(args);
        if (obj)
          Weave.setState(obj, diff, false);
        else
          WeavePath._failObject('diff', this.getPath(args));
      }
      return this;
    }

    /**
     * Adds a callback to the object at the current path.
     * When the callback is called, a WeavePath object initialized at the current path will be used as the 'this' context.
     * If the same callback is added to multiple paths, only the last path will be used as the 'this' context.
     * @param relevantContext The thisArg for the function. When the context is disposed with Weave.dispose(), the callback will be disabled.
     * @param callback The callback function.
     * @param triggerCallbackNow Optional parameter, when set to true will trigger the callback now.
     * @param immediateMode Optional parameter, when set to true will use an immediate callback instead of a grouped callback.
     * @param delayWhileBusy Optional parameter, specifies whether to delay a grouped callback while the object is busy. Default is true.
     * @return The current WeavePath object.
     */
    public addCallback(relevantContext:Object, callback:Callback, triggerCallbackNow:boolean = false, immediateMode:boolean = false, delayWhileBusy:boolean = true):WeavePath
    {
      // backwards compatibility - shift arguments
      if (typeof relevantContext === 'function' && typeof callback !== 'function')
      {
        if (arguments.length > 3)
          delayWhileBusy = immediateMode;
        if (arguments.length > 2)
          immediateMode = triggerCallbackNow;
        if (arguments.length > 1)
          triggerCallbackNow = !!callback;
        if (arguments.length > 0)
          callback = relevantContext as Callback;
        relevantContext = null;
      }
      else if (!WeavePath._assertParams('addCallback', arguments as any, 2))
        return this;

      // When no context is specified, save a pointer to this WeavePath object
      // on the callback function itself where CallbackCollection looks for it.
      if (!relevantContext)
        (callback as any)['this'] = this;

      var object:ILinkableObject = this.getObject();
      if (!object)
        throw new Error("No ILinkableObject to which to add a callback: " + this);

      if (immediateMode)
        Weave.getCallbacks(object).addImmediateCallback(relevantContext, callback, triggerCallbackNow, false);
      else
        Weave.getCallbacks(object).addGroupedCallback(relevantContext, callback, triggerCallbackNow, delayWhileBusy);
      return this;
    }

    /**
     * Removes a callback from the object at the current path or from everywhere.
     * @param relevantContext The relevantContext parameter that was given when the callback was added.
     * @param callback The callback function.
     * @return The current WeavePath object.
     */
    public removeCallback(relevantContext:Object, callback:() => void):WeavePath
    {
      var object:ILinkableObject = this.getObject();
      if (!object)
        throw new Error("No ILinkableObject from which to remove a callback: " + this);

      // backwards compatibility
      if (arguments.length == 1 && typeof relevantContext === 'function')
      {
        callback = Weave.AS(relevantContext, Function) as any as Callback;
        relevantContext = null;
      }
      else if (!WeavePath._assertParams('removeCallback', arguments as any, 2))
        return this;

      Weave.getCallbacks(object).removeCallback(relevantContext || this, callback);
      return this;
    }

    /**
     * Evaluates an ActionScript expression using the current path, vars, and libs.
     * The 'this' context within the script will be the object at the current path.
     * @param script_or_function Either a String containing JavaScript code, or a Function.
     * @param callback Optional callback function to be passed the result of evaluating the script or function. The 'this' argument will be the current WeavePath object.
     * @return The current WeavePath object.
     */
    public exec(script_or_function:string|Function, callback:() => void = null):WeavePath
    {
      if (WeavePath._assertParams('exec', arguments as any))
      {
        var result = this.getValue(script_or_function);
        if (callback != null)
          callback.call(this, result);
      }
      return this;
    }

    /**
     * Calls a function using the current WeavePath object as the 'this' value.
     * @param func The function to call.
     * @param args An optional list of arguments to pass to the function.
     * @return The current WeavePath object.
     */
    public call(func:Function, ...args:any[]):WeavePath
    {
      if (!func)
        WeavePath._assertParams('call', []);
      else
        func.apply(this, args);
      return this;
    }

    /**
     * Applies a function to each item in an Array or an Object.
     * @param items Either an Array or an Object to iterate over.
     * @param visitorFunction A function to be called for each item in items. The function will be called using the current
     *                        WeavePath object as the 'this' value and will receive three parameters:  item, key, items.
     *                        If items is an Array, the key will be an integer. If items is an Object, the key will be a String.
     * @return The current WeavePath object.
     */
    public forEach(items:Object, visitorFunction:Function):WeavePath
    {
      if (WeavePath._assertParams('forEach', arguments as any, 2))
      {
        if (Weave.IS(items, Array) && Array.prototype.forEach)
          (items as any[]).forEach(visitorFunction as any, this);
        else
          for (var key in items) visitorFunction.call(this, (items as any)[key], key, items);
      }
      return this;
    }

    /**
     * Calls a function for each child of the current WeavePath or the one specified by a relativePath. The function receives child names.
     * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
     *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @param visitorFunction A function to be called for each child object. The function will be called using the current
     *                        WeavePath object as the 'this' value and will receive three parameters:  name, index, names.
     * @return The current WeavePath object.
     */
    public forEachName(...relativePath_visitorFunction:any[]):WeavePath
    {
      var args = _A(relativePath_visitorFunction, 2);
      if (WeavePath._assertParams('forEachName', args))
      {
        var visitorFunction = Weave.AS(args.pop(), Function);
        this.getNames(args).forEach(visitorFunction as any, this);
      }
      return this;
    }

    /**
     * Calls a function for each child of the current WeavePath or the one specified by a relativePath. The function receives child WeavePath objects.
     * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
     *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @param visitorFunction A function to be called for each child object. The function will be called using the current
     *                        WeavePath object as the 'this' value and will receive three parameters:  child, index, children.
     * @return The current WeavePath object.
     */
    public forEachChild(...relativePath_visitorFunction:any[]):WeavePath
    {
      var args = _A(relativePath_visitorFunction, 2);
      if (WeavePath._assertParams('forEachChild', args))
      {
        var visitorFunction:Function = args.pop();
        this.getChildren(args).forEach(visitorFunction as any, this);
      }
      return this;
    }

    /**
     * Calls weaveTrace() in Weave to print to the log window.
     * @param args A list of parameters to pass to weaveTrace().
     * @return The current WeavePath object.
     */
    public trace(...args:any[]):WeavePath
    {
      console.log.apply(Weave, _A(args));
      return this;
    }


    // non-chainable methods

    /**
     * Returns a copy of the current path Array or the path Array of a descendant object.
     * @param relativePath An optional Array (or multiple parameters) specifying descendant names to be appended to the result.
     * @return An Array of successive child names used to identify an object in a Weave session state.
     */
    public getPath(...relativePath:any[]):any[]
    {
      return this._path.concat(_A(relativePath, 1));
    }

    private _getChildNames(...relativePath:any[]):string[]
    {
      relativePath = _A(relativePath, 1);
      var object:ILinkableObject = this.getObject(relativePath);
      if (object)
      {
        if (Weave.IS(object, ILinkableHashMap))
          return (object as ILinkableHashMap).getNames();
        if (Weave.IS(object, ILinkableDynamicObject))
          return [null];
        return WeaveAPI.SessionManager.getLinkablePropertyNames(object, true);
      }

      throw new Error("No ILinkableObject for which to get child names at " + this);
    }

    /**
     * Gets an Array of child names under the object at the current path or relative to the current path.
     * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
     *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @return An Array of child names.
     */
    public getNames(...relativePath:any[]):string[]
    {
      relativePath = _A(relativePath, 1);
      return this._getChildNames(relativePath)
    }

    /**
     * Gets an Array of child WeavePath objects under the object at the current path or relative to the current path.
     * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
     *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @return An Array of child WeavePath objects.
     */
    public getChildren(...relativePath:any[]):WeavePath[]
    {
      relativePath = _A(relativePath, 1);
      return this._getChildNames(relativePath)
        .map(function(name:string):WeavePath { return this.push(relativePath.concat(name)); }, this);
    }

    /**
     * Gets the type (qualified class name) of the object at the current path or relative to the current path.
     * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
     *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @return The qualified class name of the object at the current or descendant path, or null if there is no object.
     */
    public getType(...relativePath:any[]):string
    {
      relativePath = _A(relativePath, 1);
      var object:ILinkableObject = this.getObject(relativePath);
      if (Weave.IS(object, ILinkableHashMap) && this.getType('class'))
        return Weave.AS(this.getState('class'), String) as any as string;
      return Weave.className(object);
    }

    /**
     * Gets the simple type (unqualified class name) of the object at the current path or relative to the current path.
     * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
     *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @return The unqualified class name of the object at the current or descendant path, or null if there is no object.
     */
    public getSimpleType(...relativePath:any[]):string
    {
      relativePath = _A(relativePath, 1);
      var type:string = Weave.className(this.getObject(relativePath));
      return type && type.split('.').pop().split(':').pop();
    }

    /**
     * Gets the session state of an object at the current path or relative to the current path.
     * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
     *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @return The session state of the object at the current or descendant path.
     */
    public getState(...relativePath:any[]):SessionState
    {
      relativePath = _A(relativePath, 1);
      var obj:ILinkableObject = this.getObject(relativePath);
      if (obj)
        return Weave.getState(obj);
      else
        console.error("Warning: No ILinkableObject from which to get session state at " + this.push(relativePath));
      return null;
    }

    public getTypedState(...relativePath:any[]):TypedState
    {
      relativePath = _A(relativePath, 1);
      return WeaveAPI.SessionManager.getTypedStateTree(this.getObject(relativePath));
    }

    public getUntypedState(...relativePath:Path):UnTypedState
    {
      relativePath = _A(relativePath, 1);
      var state = JS.copyObject(this.getState(relativePath));
      return DynamicState.removeTypeFromState(state);
    }

    /**
     * Gets the changes that have occurred since previousState for the object at the current path or relative to the current path.
     * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
     *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @param previousState The previous state for comparison.
     * @return A session state diff.
     */
    public getDiff(...relativePath_previousState:any[]):Object
    {
      var args = _A(relativePath_previousState, 2);
      if (WeavePath._assertParams('getDiff', args))
      {
        var previousState:SessionState = args.pop();
        var obj:ILinkableObject = this.getObject(args);
        if (obj)
          return Weave.computeDiff(previousState, Weave.getState(obj));
        else
          console.error("Warning: No ILinkableObject from which to get diff at " + this.push(args));
      }
      return null;
    }

    /**
     * Gets the changes that would have to occur to get to another state for the object at the current path or relative to the current path.
     * @param relativePath An optional Array (or multiple parameters) specifying descendant names relative to the current path.
     *                     A child index number may be used in place of a name in the path when its parent object is a LinkableHashMap.
     * @param otherState The other state for comparison.
     * @return A session state diff.
     */
    public getReverseDiff(...relativePath_otherState:any[]):Object
    {
      var args = _A(relativePath_otherState, 2);
      if (WeavePath._assertParams('getReverseDiff', args))
      {
        var otherState:Object = args.pop();
        var obj:ILinkableObject = this.getObject(args);
        if (obj)
          return Weave.computeDiff(Weave.getState(obj), otherState);
        else
          console.error("Warning: No ILinkableObject from which to get reverse diff at " + this.push(args));
      }
      return null;
    }

    /**
     * Returns the value of an ActionScript expression or variable using the current path as the 'this' argument.
     * @param script_or_function Either a String containing JavaScript code, or a Function.
     * @return The result of evaluating the script or function.
     */
    public getValue(script_or_function:string|Function, ...args:any[]):Object
    {
      if (!script_or_function)
        WeavePath._assertParams('getValue', []);

      if (Weave.IS(script_or_function, String))
        script_or_function = JS.compile(script_or_function as string);

      return (script_or_function as Function).apply(this.getObject(), args);
    }

    public getObject(...relativePath:any[]):ILinkableObject
    {
      relativePath = _A(relativePath, 1);
      return Weave.followPath(this.weave.root, this.getPath(relativePath));
    }

    /**
     * Provides a human-readable string containing the path.
     */
    public toString():string
    {
      return "WeavePath(" + JSON.stringify(this._path) + ")";
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // helper functions
    protected static _assertParams(methodName:string, args:any[], minLength:int = 1):boolean
    {
      if (!minLength)
        minLength = 1;
      if (args.length < minLength)
      {
        var min_params:string = (minLength == 1) ? 'one parameter' : (minLength + ' parameters');
        WeavePath._failMessage(methodName, 'requires at least ' + min_params);
        return false;
      }
      return true;
    }

    protected static _failPath(methodName:string, path:Path):void
    {
      WeavePath._failMessage(methodName, 'command failed', path);
    }

    protected static _failObject(methodName:string, path:Path):void
    {
      WeavePath._failMessage(methodName, 'object does not exist', path);
    }

    protected static _failMessage(methodName:string, message:string, path:Path = null):void
    {
      var str:string = 'WeavePath.' + methodName + '(): ' + message;
      if (path)
        str += ' (path: ' + JSON.stringify(path) + ')';
      throw new Error(str);
    }

    public static migrate(source:WeavePath, destination:Weave):void
    {
      var typedState:Object = source.getValue("WeaveAPI.SessionManager.getTypedStateTree(this)");
      var delayed:ICallbackCollection[] = [];
      WeavePath._setTypedState(destination.path(), typedState, delayed);
      // resume in reverse order
      for (var i:int = delayed.length - 1; i >= 0; i--)
      {
        var cc:ICallbackCollection = delayed[i];
        cc.resumeCallbacks();
      }
    }

    private static _setTypedState(path:WeavePath, typedState:SessionState, delayedCallbacks:ICallbackCollection[]):void
    {
      var type:string = (typedState as TypedState).className;
      var state = (typedState as TypedState).sessionState;
      var hasChildren:boolean = DynamicState.isDynamicStateArray(state);
      var def:GenericClass = Weave.getDefinition(type);
      if (def)
        path.request(def);
      else if (hasChildren)
        path.request(WeaveAPI.ClassRegistry.getImplementations(ILinkableHashMap)[0]).push('class').request('LinkableString').state(type);
      else
        path.request('LinkableVariable');

      // delay callbacks before setting state
      var cc:ICallbackCollection = Weave.getCallbacks((path as any)['this'].getObject());
      cc.delayCallbacks();
      delayedCallbacks.push(cc);

      if (hasChildren)
      {
        for (typedState of state as DynamicStateArray)
        {
          type = (typedState as TypedState).className;
          if (type === "Array")
            path.state((typedState as TypedState).sessionState);
          else
            WeavePath._setTypedState(path.push((typedState as TypedState).objectName), typedState, delayedCallbacks);
        }
      }
      else
      {
        path.state(state);
      }
    }
  }
}