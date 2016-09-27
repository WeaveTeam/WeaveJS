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

namespace weavejs.util
{
	import DynamicState = weavejs.api.core.DynamicState;
	import ILinkableCompositeObject = weavejs.api.core.ILinkableCompositeObject;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import JS = weavejs.util.JS;

	/**
	 * Tools for debugging.
	 * 
	 * @author adufilie
	 */
	export class DebugUtils
	{
		/****************************
		 **  Object id and lookup  **
		 ****************************/
		
		private static map_id_obj = new Map<string|number, Object>();
		private static map_obj_id = new Map<Object, string|number>();
		private static _nextId:int = 0;
		
		/**
		 * This function calls trace() using debugId() on each parameter.
		 */
		public static debugTrace(...args):void
		{
			for (var i:int = 0; i < args.length; i++)
				args[i] = DebugUtils.debugId(args[i]);
			
			JS.log.apply(JS, args);
		}
		
		/**
		 * This function generates or returns a previously generated identifier for an object.
		 */
		public static debugId(object:Object):string
		{
			if (JS.isPrimitive(object))
				return String(object);
			var idString:string = DebugUtils.map_obj_id.get(object);
			if (!idString)
			{
				var idNumber:int = DebugUtils._nextId++;
				var className:string = Weave.className(object).split('.').pop();
				idString = className + '#' + idNumber;
				
				// save lookup from object to idString
				DebugUtils.map_obj_id.set(object, idString);
				// save lookup from idString and idNumber to object
				DebugUtils.map_id_obj.set(idNumber, object);
				DebugUtils.map_id_obj.set(idString, object);
			}
			return idString;
		}
		
		/**
		 * This function will look up the object corresponding to the specified debugId.
		 * @param debugId A debugId String or integer.
		 */
		public static debugLookup(debugId:string|number = undefined):Object
		{
			if (debugId === undefined)
				return DebugUtils.getAllDebugIds();
			return DebugUtils.map_id_obj.get(debugId);
		}
		
		public static getAllDebugIds():(string|number)[]
		{
			var ids:string[]|number[] = new Array(DebugUtils._nextId);
			for (var i:int = 0; i < DebugUtils._nextId; i++)
				ids[i] = DebugUtils.map_obj_id.get(DebugUtils.map_id_obj.get(i));
			return ids;
		}
		
		/**
		 * This will clear all saved ids and pointers to corresponding objects.
		 */		
		public static resetDebugIds():void
		{
			DebugUtils.map_id_obj = new Map<string|number, Object>();
			DebugUtils.map_obj_id = new Map<Object, string|number>();
			DebugUtils._nextId = 0;
		}
		
		/**************
		 ** Watching **
		 **************/
		
		private static /* readonly */ map_target_callback = new WeakMap<ILinkableObject, ()=>void>();
		
		public static watch<T extends ILinkableObject>(target:T = null, callbackReturnsString:(target:T)=>string = null):void
		{
			if (!target)
			{
				console.log('Usage: watch(target, optional_callbackReturnsString)');
				return;
			}
			
			unwatch(target);
			var callback = function():void {
				var str:string = '';
				var path = Weave.findPath(Weave.getRoot(target), target) || [];
				if (path.length)
					str += " " + JSON.stringify(path.pop());
				if (callbackReturnsString != null)
					str += ': ' + callbackReturnsString.call(target, target);
				DebugUtils.debugTrace(target, str);
			};
			DebugUtils.map_target_callback.set(target, callback);
			Weave.getCallbacks(target).addImmediateCallback(target, callback);
		}
		
		public static watchState(target:ILinkableObject = null, indent:string|number = null):void
		{
			if (!target)
			{
				console.log('Usage: watchState(target, optional_indent)');
				return;
			}
			DebugUtils.watch(target, function(object:ILinkableObject):string { return Weave.stringify(Weave.getState(object), null, indent); });
		}
		
		public static unwatch(target:ILinkableObject):void
		{
			var callback = DebugUtils.map_target_callback.get(target);
			DebugUtils.map_target_callback.delete(target);
			Weave.getCallbacks(target).removeCallback(target, callback);
		}
		
		/*********************
		 **  Miscellaneous  **
		 *********************/
		
		/**
		 * @param state A session state.
		 * @return An Array of Arrays, each like [path, value].
		 */
		public static flattenSessionState(state:{[key:string]:any}, pathPrefix:string[] = null, output:[string[], any][] = null):[string[], string][]
		{
			if (!pathPrefix)
				pathPrefix = [];
			if (!output)
				output = [];
			if (DynamicState.isDynamicStateArray(state))
			{
				var names:string[] = [];
				for (var key in state)
				{
					var obj = state[key];
					if (DynamicState.isDynamicState(obj))
					{
						var objectName:string = obj[DynamicState.OBJECT_NAME];
						var className:string = obj[DynamicState.CLASS_NAME];
						var sessionState:any = obj[DynamicState.SESSION_STATE];
						pathPrefix.push(objectName);
						if (className)
							output.push([pathPrefix.concat('class'), className]);
						DebugUtils.flattenSessionState(sessionState, pathPrefix, output);
						pathPrefix.pop();
						
						if (objectName)
							names.push(objectName);
					}
					else
						names.push(obj);
				}
				if (names.length)
					output.push([pathPrefix.concat(), names]);
			}
			else if (Weave.IS(state, Array))
			{
				output.push([pathPrefix.concat(), state]);
			}
			else if (typeof state === 'object' && state !== null)
			{
				for (var key:String in state)
				{
					pathPrefix.push(key);
					DebugUtils.flattenSessionState(state[key], pathPrefix, output);
					pathPrefix.pop();
				}
			}
			else
			{
				output.push([pathPrefix.concat(), state]);
			}
			
			return output;
		}
		
		/**
		 * Traverses a path in a session state using the logic used by SessionManager.
		 * @param state A full session state.
		 * @param path A path.
		 * @return The session state at the specified path.
		 */
		public static traverseStatePath(state:{[key:string]:any}, path:string[]):any
		{
			try
			{
				outerLoop: for (var i in path)
				{
					var property = path[i];
					if (DynamicState.isDynamicStateArray(state))
					{
						if (Weave.IS(property, Number))
						{
							state = state[property][DynamicState.SESSION_STATE];
						}
						else
						{
							for (var key in state)
							{
								var obj = state[key];
								if (obj[DynamicState.OBJECT_NAME] == property)
								{
									state = obj[DynamicState.SESSION_STATE];
									continue outerLoop;
								}
							}
							return undefined;
						}
					}
					else
						state = state[property];
				}
				return state;
			}
			catch (e:Error)
			{
				return undefined;
			}
		}
		
//		private static function isValidSymbolName(str:String):Boolean
//		{
//			return true; // temporary solution
//		}
//		
//		public static function historyToCSV(weave:Weave):String
//		{
//			var data:Array = Array.prototype.concat.apply([['t','path','value']], weave.history.undoHistory.map((e,t)=>flattenSessionState(e.forward).map((a,i)=>[t,'Weave'+a[0].map(n=>isValidSymbolName(n)?'.'+n:Weave.stringify([n])).join(''),Weave.stringify(a[1])])));
//			var name:String = WeaveAPI.globalHashMap.generateUniqueName("Session History");
//			var csv:CSVDataSource = WeaveAPI.globalHashMap.requestObject(name, CSVDataSource, false);
//			csv.csvData.setSessionState(data);
//			var table:TableTool = weave.root.requestObject(null, TableTool, false);
//			data[0].forEach(n=>csv.putColumnInHashMap(n, table.columns));
//		}
		
		public static replaceUnknownObjectsInState(stateToModify:{[key:string]:any}, className:string = null):{[key:string]:any}|any[]
		{
			if (DynamicState.isDynamicStateArray(stateToModify))
			{
				for (var key in stateToModify)
				{
					var obj = stateToModify[key];
					if (!DynamicState.isDynamicState(obj))
						continue;
					className = obj[DynamicState.CLASS_NAME];
					var classDef:GenericClass = Weave.getDefinition(className);
					if (!classDef)
					{
						classDef = Weave.getDefinition('LinkableHashMap');
						obj[DynamicState.CLASS_NAME] = 'LinkableHashMap';
					}
					if (Weave.IS(classDef.prototype, ILinkableCompositeObject))
						obj[DynamicState.SESSION_STATE] = DebugUtils.replaceUnknownObjectsInState(obj[DynamicState.SESSION_STATE], className);
				}
			}
			else if (!JS.isPrimitive(stateToModify))
			{
				var newState:any[] = [];
				if (className)
					newState.push(DynamicState.create("class", 'LinkableString', className));
				for (var key in stateToModify)
				{
					var value = stateToModify[key];
					var type:string = JS.isPrimitive(value) ? 'LinkableVariable' : 'LinkableHashMap';
					newState.push(DynamicState.create(key, type, DebugUtils.replaceUnknownObjectsInState(value)));
				}
				stateToModify = newState;
			}
			return stateToModify;
		}
		
		public static shiftKey(reactInstance:React.ReactInstance):boolean
		{
			return Weave.getDefinition('MouseUtils').forInstance(reactInstance).mouseEvent.shiftKey;
		}
	}
}
