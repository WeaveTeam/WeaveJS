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
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import ILinkableVariable = weavejs.api.core.ILinkableVariable;
	import JS = weavejs.util.JS;

	/**
	 * Facilitates the creation of dynamic trees.
	 */
	export class WeaveTreeItem
	{
		/**
		 * Initializes an Array of WeaveTreeItems using an Array of objects to pass to the constructor.
		 * Any Arrays passed in will be flattened.
		 * @param WeaveTreeItem_implementation The implementation of WeaveTreeItem to use.
		 * @param items Item descriptors.
		 */
		public static createItems<T>(WeaveTreeItem_implementation:new(params?:Object)=>WeaveTreeItem, items:Object[]):WeaveTreeItem[]
		{
			// flatten
			var n:int = 0;
			while (n != items.length)
			{
				n = items.length;
				items = Array.prototype.concat.apply([], items);
			}

			return items
				.map(function(item) {
					return WeaveTreeItem._mapItem(WeaveTreeItem_implementation || WeaveTreeItem, item);
				})
				.filter(WeaveTreeItem._filterItemsRemoveNulls);
		}

		/**
		 * Used for mapping an Array of params objects to an Array of WeaveTreeItem objects.
		 * @param WeaveTreeItem_implementation The implementation of WeaveTreeItem to use.
		 * @param items Item descriptors.
		 */
		protected static _mapItem(WeaveTreeItem_implementation:Class<WeaveTreeItem>, item:string|Object|Class<WeaveTreeItem>):WeaveTreeItem
		{
			// If the item is a Class definition, create an instance of that Class.
			if (JS.isClass(item))
				return new (item as GenericClass)();

			// If the item is a String or an Object, we can pass it to the constructor.
			if (Weave.IS(item, String) || (item != null && Object(item).constructor == Object))
			{
				return new WeaveTreeItem_implementation(item as string|Object);
			}

			// If the item is any other type, return the original item.
			return item as WeaveTreeItem;
		};

		/**
		 * Filters out null items.
		 */
		private static _filterItemsRemoveNulls(item:Object):boolean
		{
			return item != null;
		}

		//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----

		/**
		 * Constructs a new WeaveTreeItem.
		 * @param params An Object containing property values to set on the WeaveTreeItem.
		 *               If params is a String, both <code>label</code> and <code>data</code> will be set to that String.
		 */
		public WeaveTreeItem(params:string|string[] = null)
		{
			if (Weave.IS(params, String))
			{
				this.label = params as string;
				this.data = params as string;
			}
			else
				for (var key in params)
					this[key] = params[key];
		}

		/**
		 * Set this to change the constructor used for initializing child items.
		 * This variable is intentionally uninitialized to avoid overwriting the value set by an extending class in its constructor.
		 */
		protected childItemClass:Class<WeaveTreeItem>; // IMPORTANT - no initial value
		protected _recursion:{[recursionName:string]:boolean} = {}; // recursionName -> Boolean
		protected _label:string = "";
		protected _children:any = null;
		protected _dependency:ILinkableObject = null;

		/**
		 * Cached values that get invalidated when the source triggers callbacks.
		 */
		protected _cache:{[key:string]:any} = {};

		/**
		 * Maps a property name to a Boolean which enables or disables caching for that property.
		 */
		public cacheSettings:{[key:string]:any};

		/**
		 * Cached values of getCallbackCollection(source).triggerCounter.
		 */
		protected _counter:{[key:string]:int} = {};

		//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----

		/**
		 * Computes a Boolean value from various structures
		 * @param param Either a Boolean, and Object like {not: param}, a Function, an ILinkableVariable, or an Array of those objects.
		 * @param recursionName A name used to keep track of recursion.
		 * @return A Boolean value derived from the param, or the param itself if called recursively.
		 */
		protected getBoolean(param:any, recursionName:string):any
		{
			if (!this._recursion[recursionName])
			{
				try
				{
					this._recursion[recursionName] = true;

					if (this.isSimpleObject(param, 'not'))
						param = !this.getBoolean(param['not'], "not_" + recursionName);
					if (this.isSimpleObject(param, 'or'))
						param = this.getBoolean(param['or'], "or_" + recursionName);
					if (Weave.IS(param, Function))
						param = this.evalFunction(param as Function);
					if (Weave.IS(param, ILinkableVariable))
						param = (param as ILinkableVariable).getSessionState();
					if (Weave.IS(param, Array))
					{
						var breakValue:boolean = recursionName.indexOf("or_") == 0;
						for (param of param || [])
						{
							param = this.getBoolean(param, "item_" + recursionName);
							if (param ? breakValue : !breakValue)
								break;
						}
					}
					param = param ? true : false;
				}
				finally
				{
					this._recursion[recursionName] = false;
				}
			}
			return param;
		}

		/**
		 * Checks if an object has a single specified property.
		 */
		protected isSimpleObject(object:{[key:string]:any}, singlePropertyName:string):boolean
		{
			var found:boolean = false;
			for (var key in object)
			{
				if (found)
					return false; // two or more properties

				if (key !== singlePropertyName)
					return false; // not the desired property

				found = true; // found the desired property
			}
			return found;
		}

		/**
		 * Gets a String value from a String or Function.
		 * @param param Either a String or a Function.
		 * @param recursionName A name used to keep track of recursion.
		 * @return A String value derived from the param, or the param itself if called recursively.
		 */
		protected getString(param:string|Function, recursionName:string):any
		{
			if (!this._recursion[recursionName])
			{
				try
				{
					this._recursion[recursionName] = true;

					if (Weave.IS(param, Function))
						param = this.evalFunction(param as Function);
					else
						param = param || '';
				}
				finally
				{
					this._recursion[recursionName] = false;
				}
			}
			return param;
		}

		/**
		 * Evaluates a function to get an Object or just returns the non-Function Object passed in.
		 * @param param Either an Object or a Function.
		 * @param recursionName A name used to keep track of recursion.
		 * @return An Object derived from the param, or the param itself if called recursively.
		 */
		protected getObject(param:{[key:string]:any}|Function, recursionName:string):{[key:string]:any}|Function
		{
			if (!this._recursion[recursionName])
			{
				try
				{
					this._recursion[recursionName] = true;

					if (Weave.IS(param, Function))
						param = this.evalFunction(param as Function);
				}
				finally
				{
					this._recursion[recursionName] = false;
				}
			}
			return param;
		}

		/**
		 * First tries calling a function with no parameters.
		 * If an ArgumentError is thrown, the function will called again, passing this WeaveTreeItem as the first parameter.
		 */
		protected evalFunction(func:Function):any
		{
			try
			{
				return func.call(this, this);
			}
			catch (e)
			{
				console.error(e);
			}
		}

		//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----

		/**
		 * Checks if cached value is valid.
		 * Always returns false if the source property is not set.
		 * @param id A string identifying a property.
		 * @return true if the property value has been cached.
		 */
		protected isCached(id:string):boolean
		{
			if (this.cacheSettings && this.cacheSettings.hasOwnProperty(id) && !this.cacheSettings[id])
				return false;
			if (this._dependency && Weave.wasDisposed(this._dependency))
				this.dependency = null;
			return this._dependency && this._counter[id] === Weave.getCallbacks(this._dependency).triggerCounter;
		}

		/**
		 * Retrieves or updates a cached value for a property.
		 * Does not cache the value if the source property is not set.
		 * @param id A string identifying a property.
		 * @param newValue Optional new value to cache for the property.
		 * @return The new or existing value for the property.
		 */
		protected cache(id:string, newValue:any = undefined):any
		{
			if (arguments.length == 1)
				return this._cache[id];

			if (this._dependency && Weave.wasDisposed(this._dependency))
				this.dependency = null;
			if (this._dependency)
			{
				this._counter[id] = Weave.getCallbacks(this._dependency).triggerCounter;
				this._cache[id] = newValue;
			}
			return newValue;
		}

		//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----//----

		/**
		 * This can be set to either a String or a Function.
		 * This property is checked by Flex's default data descriptor.
		 * If this property is not set, the <code>data</code> property will be used as the label.
		 */
		public get label():string
		{
			var id:string = 'label';
			if (this.isCached(id))
				return this._cache[id];

			var str:string = this.getString(this._label, id);
			if (!str && Weave.IS(data, String))
				str = this.data as string;
			return this.cache(id, str);
		}
		public set label(value:string)
		{
			this._counter['label'] = undefined;
			this._label = value;
		}

		/**
		 * Gets the Array of child menu items and modifies it in place if necessary to create nodes from descriptors or remove null items.
		 * If this tree item specifies a dependency, the Array can be filled asynchronously.
		 * This property is checked by Flex's default data descriptor.
		 */
		public get children():any[]
		{
			var id:string = 'children';

			var items:WeaveTreeItem[];
			if (this.isCached(id))
				items = this._cache[id];
			else
				items = this.getObject(this._children, id) as any[];

			if (items)
			{
				// overwrite original array to support filling it asynchronously
				var iOut:int = 0;
				for (var i:int = 0; i < items.length; i++)
				{
					var item = WeaveTreeItem._mapItem(this.childItemClass, items[i]);
					if (item != null)
						items[iOut++] = item;
				}
				items.length = iOut;
			}

			return this.cache(id, items);
		}

		/**
		 * This can be set to either an Array or a Function that returns an Array.
		 * The function can be like function():void or function(item:WeaveTreeItem):void.
		 * The Array can contain either WeaveTreeItems or Objects, each of which will be passed to the WeaveTreeItem constructor.
		 */
		public set children(value:any)
		{
			this._counter['children'] = undefined;
			this._children = value;
		}

		/**
		 * A pointer to the ILinkableObject that created this node.
		 * This is used to determine when to invalidate cached values.
		 */
		public get dependency():ILinkableObject
		{
			if (this._dependency && Weave.wasDisposed(this._dependency))
				this.dependency = null;
			return this._dependency;
		}
		public set dependency(value:ILinkableObject)
		{
			if (this._dependency != value)
				this._counter = {};
			this._dependency = value;
		}

		/**
		 * This can be any data associated with this tree item.
		 * For example, it can be used to store state information if the tree is populated asynchronously.
		 */
		public data:{[key:string]:any}|string = null;
	}
}
