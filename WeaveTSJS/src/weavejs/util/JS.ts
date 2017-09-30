namespace weavejs.util
{
	export class JS
	{
		/**
		 * AS->JS Language helper to get the global scope
		 */
		private static /* readonly */ unnamedFunctionRegExp:RegExp = /^\s*function\s*\([^\)]*\)\s*\{[^]*\}\s*$/m;
		
		/**
		 * Compiles a script into a function with optional parameter names.
		 * @param script A String containing JavaScript code.
		 * @param paramNames A list of parameter names for the generated function, so that these variable names can be used in the script.
		 * @param errorHandler A function that handles errors.
		 */
		public static compile(script:string, paramNames:string[] = null, errorHandler:(e:Error)=>void = null):Function
		{
			try
			{
				// normalize line endings
				script = StandardLib.replace(script, '\r\n', '\n', '\r', '\n');
				
				var isFunc:boolean = JS.unnamedFunctionRegExp.test(script);
				if (isFunc)
					script = "(" + StandardLib.trim(script) + ")";
				// first try wrapping the script in "return eval(script)" to support scripts like "2+2"
				var args:string[] = (paramNames || []).concat("return eval(" + JSON.stringify(script) + ");");
				var func:Function = Function['apply'](null, args);
				// if it's a function definition, make func that function definition
				if (isFunc)
					func = func();
				return function():any {
					try
					{
						return func.apply(this, arguments);
					}
					catch (e)
					{
						// will get SyntaxError if script uses a return statement outside a function like "return 2+2"
						if (Weave.IS(e, SyntaxError))
						{
							args.pop();
							args.push(script);
							try
							{
								// overwrite func with original script
								func = Function['apply'](null, args);
							}
							catch (e2)
							{
								// on syntax error, overwrite func with one that does nothing so we don't get an error next time
								if (Weave.IS(e2, SyntaxError))
									func = (Function as any)['apply']();
								
								return JS.handleScriptError(e2, 'compiling', script, paramNames, errorHandler);
							}
							
							try
							{
								return func.apply(this, arguments);
							}
							catch (e3)
							{
								return JS.handleScriptError(e3, 'evaluating', script, paramNames, errorHandler);
							}
						}
						return JS.handleScriptError(e, 'evaluating', script, paramNames, errorHandler);
					}
				};
			}
			catch (e)
			{
				// always throw when initial compile fails
				JS.handleScriptError(e, 'compiling', script, paramNames, errorHandler);
				throw e;
			}
		}
		
		private static handleScriptError(e:Error, doingWhat:string, script:string, paramNames:string[], errorHandler:(e:Error)=>void):void
		{
			script = StandardLib.replace(script, '\n','\n\t');
			script = StandardLib.trim(script);
			var paramsStr:String = paramNames && paramNames.length ? ' with params (' + paramNames.join(', ') + ')' : '';
			e.message = StandardLib.substitute('Error {0} script{1}:\n\t{2}\n{3}', doingWhat, paramsStr, script, e.message);
			if (errorHandler != null)
				return errorHandler(e);
			else
				throw e;
		}
		
		/**
		 * AS->JS Language helper for getting an Array of Map keys.
		 */
		public static mapKeys<K,V>(map:Map<K,V>):Array<K>
		{
			return map ? JS.toArray(map.keys()) : [];
		}
		
		/**
		 * AS->JS Language helper for getting an Array of Map values.
		 */
		public static mapValues<K,V>(map:Map<K,V>):Array<V>
		{
			return map ? JS.toArray(map.values()) : [];
		}
		
		/**
		 * AS->JS Language helper for getting an Array of Map entries.
		 */
		public static mapEntries<K,V>(map:Map<K,V>):Array<[K,V]>
		{
			return map ? JS.toArray(map.entries()) : [];
		}
		
		/**
		 * Tests if an object can be iterated over. If this returns true, then toArray()
		 * can be called to get all the values from the iterator as an Array.
		 */
		public static isIterable(value:any):boolean
		{
			return value && typeof value[Symbol.iterator] === 'function';
		}
		
		/**
		 * AS->JS Language helper for converting array-like objects to Arrays
		 * Extracts an Array of values from an Iterator object.
		 * Converts Arguments object to an Array.
		 */
		public static toArray(value:any):any[]
		{
			if (Weave.IS(value, Array))
				return value;
			
			// special case for iterable object
			if (value && typeof value[Symbol.iterator] === 'function')
			{
				var iterator = value[Symbol.iterator]();
				var values:any[] = [];
				while (true)
				{
					var next = iterator.next();
					if (next.done)
						break;
					values.push(next.value);
				}
				return values;
			}
			
			// special case for Arguments
			if (Object.prototype.toString.call(value) === '[object Arguments]')
				return Array.prototype.slice.call(value);
			
			return null;
		}
		
		/**
		 * Tests if a value is of a primitive type.
		 */
		public static isPrimitive(value:any):boolean
		{
			return value === null || typeof value !== 'object';
		}
		
		/**
		 * Makes a deep copy of an object.
		 * @param allowNonPrimitiveRefs If allowNonPrimitiveRefs is true, references to non-primitive objects will be allowed.
		 *                              If allowNonPrimitiveRefs is false, an error will be thrown if a non-primitive object is found.
		 */
		public static copyObject<T>(object:T, allowNonPrimitiveRefs:boolean = false):T
		{
			// check for primitive values
			if (object === null || typeof object !== 'object')
				return object;
			
			var copy:any;
			
			if (Weave.IS(object, Array))
			{
				copy = [] as any;
			}
			else if (Object['getPrototypeOf'](Object['getPrototypeOf'](object)))
			{
				if (allowNonPrimitiveRefs)
					copy = object;
				else
					throw new Error("copyObject() cannot copy non-primitive Objects");
			}
			else
			{
				copy = {} as any;
			}
			
			for (var key in object as any)
				copy[key] = JS.copyObject((object as any)[key], allowNonPrimitiveRefs);
			
			return copy;
			
			//return JSON.parse(JSON.stringify(object));
		}
		
		/**
		 * AS->JS Language helper for binding class instance functions
		 */
		private static bindAll<T>(instance:T):T
		{
			var proto:{[key:string]:any} = Object['getPrototypeOf'](instance);
			for (var key in proto)
			{
				var prop = proto[key];
				if (typeof prop === 'function' && key !== 'constructor')
					(instance as any)[key] = prop.bind(instance);
			}
			return instance;
		}
		
		/**
		 * Implementation of "classDef is Class"
		 */
		public static isClass(classDef:Object):boolean
		{
			return typeof classDef === 'function'
				&& (classDef as GenericClass).prototype
				&& (classDef as GenericClass).prototype.constructor === classDef;
		}
		
		/**
		 * Implementation of "classDef as Class"
		 */
		public static asClass<T>(classDef:any):GenericClass
		{
			return JS.isClass(classDef) ? classDef : null;
		}
		
		/**
		 * Similar to Object.hasOwnProperty(), except it also checks prototypes.
		 */
		public static hasProperty(object:Object, prop:string):boolean
		{
			while (object != null && !Object['getOwnPropertyDescriptor'](object, prop))
				object = Object['getPrototypeOf'](object);
			return object != null;
		}
		
		/**
		 * Similar to Object.getOwnPropertyNames(), except it also checks prototypes.
		 */
		public static getPropertyNames(object:Object, useCache:boolean):string[]
		{
			if (object == null || object === Object.prototype)
				return [];
			
			if (!JS.map_obj_names)
			{
				JS.map_obj_names = new WeakMap<Object, string[]>();
				JS.map_prop_skip = new Map<string, number>();
			}
			
			if (useCache && JS.map_obj_names.has(object))
				return JS.map_obj_names.get(object);
			
			var names:string[] = JS.getPropertyNames(Object['getPrototypeOf'](object), useCache);
			// if the names array is in the cache, make a copy
			if (useCache)
				names = names.concat();
			
			// prepare to skip duplicate names
			++JS.skip_id;
			for (var name in names)
				JS.map_prop_skip.set(name, JS.skip_id);
			
			// add own property names
			var ownNames:string[] = Object['getOwnPropertyNames'](object);
			for (name in ownNames)
			{
				// skip duplicate names
				if (JS.map_prop_skip.get(name) !== JS.skip_id)
				{
					JS.map_prop_skip.set(name, JS.skip_id);
					names.push(name);
				}
			}
			
			// save in cache
			JS.map_obj_names.set(object, names);
			return names;
		}
		
		private static map_obj_names:WeakMap<Object, string[]>;
		private static map_prop_skip:Map<string, number>;
		private static skip_id:int = 0;
	}
}