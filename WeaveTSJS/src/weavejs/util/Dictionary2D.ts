/*
	This Source Code Form is subject to the terms of the
	Mozilla Public License, v. 2.0. If a copy of the MPL
	was not distributed with this file, You can obtain
	one at https://mozilla.org/MPL/2.0/.
*/
namespace weavejs.util
{
	import JS = weavejs.util.JS;
	/**
	 * This is a wrapper for a 2-dimensional Map.
	 * 
	 * @author adufilie
	 */
	export class Dictionary2D<K1,K2,V>
	{
		constructor(weakPrimaryKeys:boolean = false, weakSecondaryKeys:boolean = false, defaultType:Class<V> = null)
		{
			this.map = weakPrimaryKeys ? new WeakMap<K1, Map<K2, V>>() as any: new Map<K1, Map<K2, V>>();
			this.weak1 = weakPrimaryKeys;
			this.weak2 = weakSecondaryKeys;
			this.defaultType = defaultType;
		}
		
		/**
		 * The primary Map object.
		 */		
		public map:Map<K1, Map<K2, V>>;
		private weak1:boolean;
		private weak2:boolean; // used as a constructor parameter for nested Dictionaries
		private defaultType:Class<V>; // used for creating objects automatically via get()
		
		/**
		 * @param key1 The first map key.
		 * @param key2 The second map key.
		 * @return The value.
		 */
		public get(key1:K1, key2:K2):V
		{
			var value:V = undefined;
			var map2:Map<K2, V> = this.map.get(key1);
			if (map2)
				value = map2.get(key2);
			if (value === undefined && this.defaultType)
			{
				value = new this.defaultType();
				this.set(key1, key2, value);
			}
			return value;
		}
		
		/**
		 * This will add or replace an entry in the map.
		 * @param key1 The first map key.
		 * @param key2 The second map key.
		 * @param value The value.
		 */
		public set(key1:K1, key2:K2, value:V):void
		{
			var map2:Map<K2, V> = this.map.get(key1);
			if (map2 == null)
			{
				map2 = this.weak2 ? new WeakMap<K2, V>() as any : new Map<K2, V>();
				this.map.set(key1, map2);
			}
			map2.set(key2, value);
		}
		
		public primaryKeys():K1[]
		{
			if (this.weak1)
				throwWeakIterationError();
			return JS.mapKeys(this.map);
		}
		
		public secondaryKeys(key1:K1):K2[]
		{
			if (this.weak2)
				Dictionary2D.throwWeakIterationError();
			return JS.mapKeys(this.map.get(key1));
		}
		
		/**
		 * This removes all values associated with the given primary key.
		 * @param key1 The first dictionary key.
		 */
		public removeAllPrimary(key1:K1):void
		{
			this.map.delete(key1);
		}
		
		/**
		 * This removes all values associated with the given secondary key.
		 * @param key2 The second dictionary key.
		 * @private
		 */
		public removeAllSecondary(key2:K2):void
		{
			if (this.weak1)
				Dictionary2D.throwWeakIterationError();
			this._key2ToRemove = key2;
			this.map.forEach(this.removeAllSecondary_each, this);
		}
		private _key2ToRemove:K2;
		private removeAllSecondary_each(map2:Map<K2, V>, key1:K1):void
		{
			map2.delete(this._key2ToRemove);
		}
		
		/**
		 * This removes a value associated with the given primary and secondary keys.
		 * @param key1 The first dictionary key.
		 * @param key2 The second dictionary key.
		 * @return The value that was in the dictionary.
		 */
		public remove(key1:K1, key2:K2):V
		{
			var value:V = undefined;
			var map2:Map<K2, V> = this.map.get(key1);
			if (map2)
			{
				value = map2.get(key2);
				map2.delete(key2);
				
				// if map2 is a WeakMap or entries remain in map2, keep it
				if (this.weak2 || map2.size)
					return value;
				
				// otherwise, remove it
				this.map.delete(key1);
			}
			return value;
		}
		
		private static throwWeakIterationError():void
		{
			throw new Error("WeakMap cannot be iterated over");
		}
		
		/**
		 * Iterates over pairs of keys and corresponding values.
		 * @param key1_key2_value A function which may return true to stop iterating.
		 * @param thisArg The 'this' argument for the function.
		 */
		public forEach(key1_key2_value:(key1:K1, key2:K2, value:V) => any, thisArg:Object):void
		{
			if (this.weak1 || this.weak2)
				Dictionary2D.throwWeakIterationError();
			
			this.forEach_fn = key1_key2_value;
			this.forEach_this = thisArg;
			
			this.map.forEach(this.forEach1, this);
			
			this.forEach_fn = null;
			this.forEach_this = null;
			this.forEach_key1 = null;
			this.forEach_map2 = null;
		}
		private forEach_fn:Function;
		private forEach_this:Object;
		private forEach_key1:K1;
		private forEach_map2:Map<K2, V>;
		private forEach1(map2:Map<K2, V>, key1:K1):void
		{
			if (this.forEach_fn == null)
				return;
			this.forEach_key1 = key1;
			this.forEach_map2 = map2;
			map2.forEach(this.forEach2, this);
		}
		private forEach2(value:V, key2:K2):void
		{
			if (this.forEach_fn != null && this.forEach_fn.call(this.forEach_this, this.forEach_key1, key2, value))
				this.forEach_fn = null;
		}
	}
}
