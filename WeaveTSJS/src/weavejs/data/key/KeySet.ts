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

namespace weavejs.data.key
{
	import WeaveAPI = weavejs.WeaveAPI;
	import IKeySet = weavejs.api.data.IKeySet;
	import IKeySetCallbackInterface = weavejs.api.data.IKeySetCallbackInterface;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import JS = weavejs.util.JS;
	
	/**
	 * This class contains a set of IQualifiedKeys and functions for adding/removing keys from the set.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.key.KeySet", interfaces: [IKeySet]})
	export class KeySet extends LinkableVariable implements IKeySet
	{
		constructor()
		{
			super(Array);
			this._verifier = this.verifySessionState;
			// The first callback will update the keys from the session state.
			this.addImmediateCallback(this, this.updateKeys);
		}
		
		/**
		 * An interface for keys added and removed
		 */
		public /* readonly */ keyCallbacks:IKeySetCallbackInterface = Weave.linkableChild(this, KeySetCallbackInterface);
		
		/**
		 * Verifies that the value is a two-dimensional array or null.
		 */		
		private verifySessionState(value:any[][]):boolean
		{
			for (var row of value || [])
				if (!Weave.IS(row, Array))
					return false;
			return true;
		}
		
		/**
		 * This flag is used to avoid recursion while the keys are being synchronized with the session state.
		 */		
		private _currentlyUpdating:boolean = false;

		/**
		 * This is the first callback that runs when the KeySet changes.
		 * The keys will be updated based on the session state.
		 */
		private updateKeys():void
		{
			// avoid recursion
			if (this._currentlyUpdating)
				return;

			// each row of CSV represents a different keyType (keyType is the first token in the row)
			var newKeys:QKeyLike[]|IQualifiedKey[] = [];
			for (var row of this._sessionStateInternal || [])
				newKeys.push.apply(newKeys, WeaveAPI.QKeyManager.getQKeys(row[0], row.slice(1)));
			
			// avoid internal recursion while still allowing callbacks to cause recursion afterwards
			this.delayCallbacks();
			this._currentlyUpdating = true;
			this.replaceKeys(newKeys as IQualifiedKey[]);
			this.keyCallbacks.flushKeys();
			this._currentlyUpdating = false;
			this.resumeCallbacks();
		}
		
		/**
		 * This function will derive the session state from the IQualifiedKey objects in the keys array.
		 */		
		private updateSessionState():void
		{
			// avoid recursion
			if (this._currentlyUpdating)
				return;
			
			// from the IQualifiedKey objects, generate the session state
			var _keyTypeToKeysMap:{[keyType:string]:string[]} = {};
			for (var key of this._keys || [])
			{
				if (_keyTypeToKeysMap[key.keyType] == undefined)
					_keyTypeToKeysMap[key.keyType] = [];
				_keyTypeToKeysMap[key.keyType].push(key.localName);
			}
			// for each keyType, create a row for the CSV parser
			var keyTable:string[][] = [];
			for (var keyType in _keyTypeToKeysMap)
			{
				var newKeys:string[] = _keyTypeToKeysMap[keyType];
				newKeys.unshift(keyType);
				keyTable.push(newKeys);
			}
			
			// avoid internal recursion while still allowing callbacks to cause recursion afterwards
			this.delayCallbacks();
			this._currentlyUpdating = true;
			this.setSessionState(keyTable);
			this.keyCallbacks.flushKeys();
			this._currentlyUpdating = false;
			this.resumeCallbacks();
		}
		
		/**
		 * This object maps keys to index values
		 */
		private map_key_index = new Map<IQualifiedKey, int>();
		/**
		 * This maps index values to IQualifiedKey objects
		 */
		private _keys:IQualifiedKey[] = [];

		/**
		 * A list of keys included in this KeySet.
		 */
		public get keys():IQualifiedKey[]
		{
			return this._keys;
		}

		/**
		 * Overwrite the current set of keys.
		 * @param newKeys An Array of IQualifiedKey objects.
		 * @return true if the set changes as a result of calling this function.
		 */
		public replaceKeys(newKeys:IQualifiedKey[]):boolean
		{
			if (this._locked)
				return false;
			
			WeaveAPI.QKeyManager.convertToQKeys(newKeys);
			if (newKeys == this._keys)
				this._keys = this._keys.concat();
			
			var key:IQualifiedKey;
			var changeDetected:boolean = false;
			
			// copy the previous key-to-index mapping for detecting changes
			var prevKeyIndex = this.map_key_index;

			// initialize new key index
			this.map_key_index = new Map<IQualifiedKey, int>();
			// copy new keys and create new key index
			this._keys.length = newKeys.length; // allow space for all keys
			var outputIndex:int = 0; // index to store internally
			for (var inputIndex:int = 0; inputIndex < newKeys.length; inputIndex++)
			{
				key = newKeys[inputIndex];
				// avoid storing duplicate keys
				if (this.map_key_index.has(key))
					continue;
				// copy key
				this._keys[outputIndex] = key;
				// save key-to-index mapping
				this.map_key_index.set(key, outputIndex);
				// if the previous key index did not have this key, a change has been detected.
				if (prevKeyIndex.get(key) === undefined)
				{
					changeDetected = true;
					this.keyCallbacks.keysAdded.push(key);
				}
				// increase stored index
				outputIndex++;
			}
			this._keys.length = outputIndex; // trim to actual length
			// loop through old keys and see if any were removed
			var oldKeys:IQualifiedKey[] = JS.mapKeys(prevKeyIndex);
			for(var key of oldKeys || [])
			{
				if (!this.map_key_index.has(key)) // if this previous key is gone now, change detected
				{
					changeDetected = true;
					this.keyCallbacks.keysRemoved.push(key);
				}
			}

			if (changeDetected)
				this.updateSessionState();
			
			return changeDetected;
		}

		/**
		 * Clear the current set of keys.
		 * @return true if the set changes as a result of calling this function.
		 */
		public clearKeys():boolean
		{
			if (this._locked)
				return false;
			
			// stop if there are no keys to remove
			if (this._keys.length == 0)
				return false; // set did not change
			
			this.keyCallbacks.keysRemoved = this.keyCallbacks.keysRemoved.concat(this._keys);

			// clear key-to-index mapping
			this.map_key_index = new Map<IQualifiedKey, int>();
			this._keys = [];
			
			this.updateSessionState();

			// set changed
			return true;
		}

		/**
		 * @param key A IQualifiedKey object to check.
		 * @return true if the given key is included in the set.
		 */
		public containsKey(key:IQualifiedKey):boolean
		{
			// the key is included in the set if it is in the key-to-index mapping.
			return this.map_key_index.has(key);
		}
		
		/**
		 * Adds a vector of additional keys to the set.
		 * @param additionalKeys A list of keys to add to this set.
		 * @return true if the set changes as a result of calling this function.
		 */
		public addKeys(additionalKeys:IQualifiedKey[]):boolean
		{
			if (this._locked)
				return false;
			
			var changeDetected:boolean = false;
			WeaveAPI.QKeyManager.convertToQKeys(additionalKeys);
			for (var key of additionalKeys || [])
			{
				if (!this.map_key_index.has(key))
				{
					// add key
					var newIndex:int = this._keys.length;
					this._keys[newIndex] = key;
					this.map_key_index.set(key, newIndex);
					
					changeDetected = true;
					this.keyCallbacks.keysAdded.push(key);
				}
			}
			
			if (changeDetected)
				this.updateSessionState();

			return changeDetected;
		}

		/**
		 * Removes a vector of additional keys to the set.
		 * @param unwantedKeys A list of keys to remove from this set.
		 * @return true if the set changes as a result of calling this function.
		 */
		public removeKeys(unwantedKeys:IQualifiedKey[]):boolean
		{
			if (this._locked)
				return false;
			
			if (unwantedKeys == this._keys)
				return this.clearKeys();
			
			var changeDetected:boolean = false;
			WeaveAPI.QKeyManager.convertToQKeys(unwantedKeys);
			for (var key of unwantedKeys || [])
			{
				if (this.map_key_index.has(key))
				{
					// drop key from _keys vector
					var droppedIndex:int = this.map_key_index.get(key);
					if (droppedIndex < this._keys.length - 1) // if this is not the last entry
					{
						// move the last entry to the droppedIndex slot
						var lastKey:IQualifiedKey = this._keys[this.keys.length - 1];
						this._keys[droppedIndex] = lastKey;
						this.map_key_index.set(lastKey, droppedIndex);
					}
					// update length of vector
					this._keys.length--;
					// drop key from object mapping
					this.map_key_index.delete(key);

					changeDetected = true;
					this.keyCallbacks.keysRemoved.push(key);
				}
			}

			if (changeDetected)
				this.updateSessionState();

			return changeDetected;
		}

		/**
		 * This function sets the session state for the KeySet.
		 * @param value A CSV-formatted String where each row is a keyType followed by a list of key strings of that keyType.
		 */
		/* override */ public setSessionState(value:string|string[][]|{[key:string]:string}):void
		{
			// backwards compatibility 0.9.6
			if (!Weave.IS(value, String) && !Weave.IS(value, Array) && value != null)
			{
				var keysProperty:string = 'sessionedKeys';
				var keyTypeProperty:string = 'sessionedKeyType';
				if ((value as {[key:string]:string}).hasOwnProperty(keysProperty) && (value as {[key:string]:string}).hasOwnProperty(keyTypeProperty))
					if ((value as {[key:string]:string})[keyTypeProperty] != null && (value as {[key:string]:string})[keysProperty] != null)
						value = WeaveAPI.CSVParser.createCSVRow([(value as {[key:string]:string})[keyTypeProperty]]) + ',' + (value as {[key:string]:string})[keysProperty];
			}
			// backwards compatibility -- parse CSV String
			if (Weave.IS(value, String))
				value = WeaveAPI.CSVParser.parseCSV(value as string);
			
			// expecting a two-dimensional Array at this point
			super.setSessionState(value);
		}
		
		//---------------------------------------------------------------------------------
		// test code
		// { test(); }
		private static test():void
		{
			var k:KeySet = new KeySet();
			var k2:KeySet = new KeySet();
			k.addImmediateCallback(null, function():void { this.traceKeySet(k); });
			
			KeySet.testFunction(k, k.replaceKeys, 'create k', 't', ['a','b','c'], 't', ['a', 'b', 'c']);
			KeySet.testFunction(k, k.addKeys, 'add', 't', ['b','c','d','e'], 't', ['a','b','c','d','e']);
			KeySet.testFunction(k, k.removeKeys, 'remove', 't', ['d','e','f','g'], 't', ['a','b','c']);
			KeySet.testFunction(k, k.replaceKeys, 'replace', 't', ['b','x'], 't', ['b','x']);
			
			k2.replaceKeys(WeaveAPI.QKeyManager.getQKeys('t', ['a','b','x','y']));
			console.log('copy k2 to k');
			WeaveAPI.SessionManager.copySessionState(k2, k);
			KeySet.assert(k, WeaveAPI.QKeyManager.getQKeys('t', ['a','b','x','y']));
			
			console.log('test deprecated session state');
			WeaveAPI.SessionManager.setSessionState(k, {sessionedKeyType: 't2', sessionedKeys: 'a,b,x,y'}, true);
			KeySet.assert(k, WeaveAPI.QKeyManager.getQKeys('t2', ['a','b','x','y']));

			KeySet.testFunction(k, k.replaceKeys, 'replace k', 't', ['1'], 't', ['1']);
			KeySet.testFunction(k, k.addKeys, 'add k', 't2', ['1'], 't', ['1'], 't2', ['1']);
			KeySet.testFunction(k, k.removeKeys, 'remove k', 't', ['1'], 't2', ['1']);
			KeySet.testFunction(k, k.addKeys, 'add k', 't2', ['1'], 't2', ['1']);
			
			for (var t of WeaveAPI.QKeyManager.getAllKeyTypes() || [])
				console.log('all keys ('+t+'):', KeySet.getKeyStrings(WeaveAPI.QKeyManager.getAllQKeys(t)));
		}
		private static getKeyStrings(qkeys:IQualifiedKey[]):string[]
		{
			var keyStrings:string[] = [];
			for (var key of qkeys || [])
				keyStrings.push(key.keyType + '#' + key.localName);
			return keyStrings;
		}
		private static traceKeySet(keySet:KeySet):void
		{
			console.log(' ->', KeySet.getKeyStrings(keySet.keys));
			console.log('   ', Weave.stringify(WeaveAPI.SessionManager.getSessionState(keySet)));
		}
		private static testFunction(keySet:KeySet, func:Function, comment:string, keyType:string, keys:string[], expectedResultKeyType:string, expectedResultKeys:string[], expectedResultKeyType2:string = null, expectedResultKeys2:string[] = null):void
		{
			console.log(comment, keyType, keys);
			func(WeaveAPI.QKeyManager.getQKeys(keyType, keys));
			var keys1:IQualifiedKey[] = expectedResultKeys ? WeaveAPI.QKeyManager.getQKeys(expectedResultKeyType, expectedResultKeys) : [];
			var keys2:IQualifiedKey[] = expectedResultKeys2 ? WeaveAPI.QKeyManager.getQKeys(expectedResultKeyType2, expectedResultKeys2) : [];
			KeySet.assert(keySet, keys1, keys2);
		}
		private static assert(keySet:KeySet, expectedKeys1:IQualifiedKey[], expectedKeys2:IQualifiedKey[] = null):void
		{
			var qkey:IQualifiedKey;
			var map_key= new Map<IQualifiedKey, boolean>();
			for (var keys of [expectedKeys1, expectedKeys2])
			{
				for (qkey of keys || [])
				{
					if (!keySet.containsKey(qkey))
						throw new Error("KeySet does not contain expected keys");
					map_key.set(qkey, true);
				}
			}
			
			for (qkey of keySet.keys || [])
				if (!map_key.has(qkey))
					throw new Error("KeySet contains unexpected keys");
		}
	}
}
