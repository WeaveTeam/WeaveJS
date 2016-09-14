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
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import DataType = weavejs.api.data.DataType;
	import ICSVParser = weavejs.api.data.ICSVParser;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IQualifiedKeyManager = weavejs.api.data.IQualifiedKeyManager;
	import CSVParser = weavejs.data.CSVParser;
	import Dictionary2D = weavejs.util.Dictionary2D;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	import WeavePromise = weavejs.util.WeavePromise;
	/**
	 * This class manages a global list of IQualifiedKey objects.
	 * 
	 * The getQKey() function must be used to get IQualifiedKey objects.  Each QKey returned by
	 * getQKey() with the same parameters will be the same object, so IQualifiedKeys can be compared
	 * with the == operator or used as keys in a Dictionary.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.key.QKeyManager", interfaces: [IQualifiedKeyManager]})
	export class QKeyManager implements IQualifiedKeyManager
	{

		/**
		 * Maps IQualifiedKey to keyType - faster than reading the keyType property of a QKey
		 */
		public map_qkey_keyType:WeakMap<IQualifiedKey,string> = new WeakMap<IQualifiedKey,string>();
		
		/**
		 * Maps IQualifiedKey to localName - faster than reading the localName property of a QKey
		 */
		public map_qkey_localName:WeakMap<IQualifiedKey,string> = new WeakMap<IQualifiedKey,string>();
		
		/**
		 * keyType -> Object( localName -> IQualifiedKey )
		 */
		private d2d_keyType_localName_qkey:Dictionary2D<string,string,IQualifiedKey> = new Dictionary2D<string,string,IQualifiedKey>();
		
		private map_qkeyString_qkey:Map<string,IQualifiedKey> = new Map<string,IQualifiedKey>();

		private map_context_qkeyGetter:WeakMap<Object,QKeyGetter> = new WeakMap<Object,QKeyGetter>();
		
		private _keyBuffer:IQualifiedKey[]|string[] = []; // holds one key
		
		// The # sign is used in anticipation that a key type will be a URI.
		private static /* readonly */ DELIMITER:string = '#';
		private csvParser:ICSVParser;
		private array_numberToQKey:IQualifiedKey[] = [];
		
		public stringToQKey(qkeyString:string):IQualifiedKey
		{
			var qkey:IQualifiedKey = this.map_qkeyString_qkey.get(qkeyString);
			if (qkey)
				return qkey;
			
			if (!this.csvParser)
				this.csvParser = new CSVParser(false, QKeyManager.DELIMITER);
			var a:string[] = this.csvParser.parseCSVRow(qkeyString);
			if (a.length != 2)
				throw new Error("qkeyString must be formatted like " + this.csvParser.createCSVRow(['keyType', 'localName']));
			return this.getQKey(a[0], a[1])
		}
		
		public numberToQKey(qkeyNumber:number):IQualifiedKey
		{
			return this.array_numberToQKey[qkeyNumber];
		}
		
		/**
		 * Get the QKey object for a given key type and key.
		 *
		 * @return The QKey object for this type and key.
		 */
		public getQKey(keyType:string, localName:string):IQualifiedKey
		{
			this._keyBuffer[0] = localName;
			this.getQKeys_range(keyType, this._keyBuffer as string[], 0, 1, this._keyBuffer as IQualifiedKey[]);
			return Weave.AS(this._keyBuffer[0], IQualifiedKey);
		}
		
		private init_map_localName_qkey(keyType:string):Map<string, IQualifiedKey>
		{
			// key type not seen before, so initialize it
			var map_localName_qkey:Map<string, IQualifiedKey>;
			// use & prefer the same map associated with the trimmed keyType
			var trimmedKeyType:string = StandardLib.trim(keyType);
			if (trimmedKeyType != keyType)
				map_localName_qkey = this.d2d_keyType_localName_qkey.map.get(trimmedKeyType) || this.init_map_localName_qkey(trimmedKeyType);
			else
				map_localName_qkey = new Map<string, IQualifiedKey>();
			this.d2d_keyType_localName_qkey.map.set(keyType, map_localName_qkey);
			return map_localName_qkey;
		}
		
		/**
		 * @param output An output Array for IQualifiedKeys.
		 */
		public getQKeys_range(keyType:string, keyStrings:string[], iStart:uint, iEnd:uint, output:IQualifiedKey[]):void
		{
			if (!keyType)
				keyType = DataType.STRING;
			
			var map_localName_qkey:Map<string, IQualifiedKey> = this.d2d_keyType_localName_qkey.map.get(keyType);
			if (!map_localName_qkey)
				map_localName_qkey = this.init_map_localName_qkey(keyType);
			
			if (!this.csvParser)
				this.csvParser = new CSVParser(false, QKeyManager.DELIMITER);
			
			var trimmedKeyType:string = null;
			for (var i:int = iStart; i < iEnd; i++)
			{
				var localName:string = String(keyStrings[i]);
				var qkey:IQualifiedKey = map_localName_qkey.get(localName);
				if (!qkey)
				{
					if (!trimmedKeyType)
						trimmedKeyType = StandardLib.trim(keyType);
					var trimmedLocalName:string = StandardLib.trim(localName);
					qkey = map_localName_qkey.get(trimmedLocalName);
					if (!qkey)
					{
						var qkeyString:string = this.csvParser.createCSVRow([trimmedKeyType, trimmedLocalName]);
						qkey = new QKey(trimmedKeyType, trimmedLocalName, qkeyString);
						
						map_localName_qkey.set(trimmedLocalName, qkey);
						this.map_qkeyString_qkey.set(qkeyString, qkey);
						this.array_numberToQKey[qkey.toNumber()] = qkey;
						this.map_qkey_keyType.set(qkey, trimmedKeyType);
						this.map_qkey_localName.set(qkey, trimmedLocalName);
					}
					// make untrimmed localName point to QKey for trimmedLocalName to avoid calls to trim() next time
					if (localName != trimmedLocalName)
						map_localName_qkey.set(localName, qkey);
				}
				
				output[i] = qkey;
			}
		}
		
		/**
		 * Get a list of QKey objects, all with the same key type.
		 * 
		 * @return An array of QKeys.
		 */
		public getQKeys(keyType:string, keyStrings:string[]):IQualifiedKey[]
		{
			var keys:IQualifiedKey[] = new Array(keyStrings.length);
			this.getQKeys_range(keyType, keyStrings, 0, keyStrings.length, keys);
			return keys;
		}
		
		/**
		 * This will replace untyped Objects in an Array with their IQualifiedKey counterparts.
		 * Each object in the Array should have two properties: <code>keyType</code> and <code>localName</code>
		 * @param objects An Array to modify.
		 * @return The same Array that was passed in, modified.
		 */
		public convertToQKeys(objects:QKeyLike[]):IQualifiedKey[]
		{
			var i:int = objects.length;
			while (i--)
			{
				var item:QKeyLike = objects[i];
				if (!Weave.IS(item, IQualifiedKey))
					objects[i] = this.getQKey(item.keyType, item.localName);
			}
			return objects as IQualifiedKey[];
		}

		/**
		 * Get a list of QKey objects, all with the same key type.
		 * 
		 * @return An array of QKeys that will be filled in asynchronously.
		 */
		public getQKeysAsync(relevantContext:ILinkableObject, keyType:string, keyStrings:string[], asyncCallback:(keys:IQualifiedKey[])=>void, outputKeys:IQualifiedKey[]):void
		{
			var qkg:QKeyGetter = this.map_context_qkeyGetter.get(relevantContext);
			if (!qkg)
				this.map_context_qkeyGetter.set(relevantContext, qkg = new QKeyGetter(this, relevantContext));
			qkg.asyncStart(keyType, keyStrings, outputKeys, asyncCallback);
		}
		
		/**
		 * Get a list of QKey objects, all with the same key type.
		 * @param relevantContext The owner of the WeavePromise. Only one WeavePromise will be generated per owner.
		 * @param keyType The keyType.
		 * @param keyStrings An Array of localName values.
		 * @return A WeavePromise that produces an Array of IQualifiedKeys.
		 */
		public getQKeysPromise(relevantContext:Object, keyType:string, keyStrings:string[]):WeavePromise<IQualifiedKey[]>
		{
			var qkg:QKeyGetter = this.map_context_qkeyGetter.get(relevantContext);
			if (!qkg)
				this.map_context_qkeyGetter.set(relevantContext, qkg = new QKeyGetter(this, relevantContext));
			qkg.asyncStart(keyType, keyStrings);
			return qkg;
		}
		
		/**
		 * Get a list of all previoused key types.
		 *
		 * @return An array of QKeys.
		 */
		public getAllKeyTypes():string[]
		{
			return this.d2d_keyType_localName_qkey.primaryKeys();
		}
		
		/**
		 * Get a list of all referenced QKeys for a given key type
		 * @return An array of QKeys
		 */
		public getAllQKeys(keyType:string):IQualifiedKey[]
		{
			return JS.mapValues(this.d2d_keyType_localName_qkey.map.get(keyType));
		}
		
		/**
		 * This makes a sorted copy of an Array of keys.
		 * @param An Array of IQualifiedKeys.
		 * @return A sorted copy of the keys.
		 */
		public static keySortCopy(keys:IQualifiedKey[]):IQualifiedKey[]
		{
			var qkm:QKeyManager = Weave.AS(WeaveAPI.QKeyManager, QKeyManager);
			var params = [qkm.map_qkey_keyType, qkm.map_qkey_localName];
			return StandardLib.sortOn(keys, params, null, false);
		}
	}

	class QKeyGetter extends WeavePromise<IQualifiedKey[]>
	{
		constructor(manager:QKeyManager, relevantContext:Object)
		{
			super(relevantContext);
			this.manager = manager;
		}

		public asyncStart(keyType:string, keyStrings:string[], outputKeys:IQualifiedKey[] = null, asyncCallback:Function = null):QKeyGetter
		{
			if (!keyStrings)
				keyStrings = [];
			// this.manager = this.manager; TODO check this
			this.asyncCallback = asyncCallback;
			this.keyType = keyType;
			this.keyStrings = keyStrings;
			this.i = 0;
			this.outputKeys = outputKeys || new Array(keyStrings.length);

			this.outputKeys.length = keyStrings.length;
			// high priority because all visualizations depend on key sets
			WeaveAPI.Scheduler.startTask(this.relevantContext, (stopTime:int) => this.iterate(stopTime), WeaveAPI.TASK_PRIORITY_HIGH, () => this.asyncComplete(), Weave.lang("Initializing {0} record identifiers", keyStrings.length));

			return this;
		}

		private asyncCallback:Function;
		private i:int;
		private manager:QKeyManager;
		private keyType:string;
		private keyStrings:string[];
		private outputKeys:IQualifiedKey[];
		private batch:uint = 5000;

		private iterate(stopTime:int):Number
		{
			for (; this.i < this.keyStrings.length; this.i += this.batch)
			{
				if (Date.now() > stopTime)
					return this.i / this.keyStrings.length;

				this.manager.getQKeys_range(this.keyType, this.keyStrings, this.i, Math.min(this.i + this.batch, this.keyStrings.length), this.outputKeys);
			}
			return 1;
		}

		private asyncComplete():void
		{
			this.setResult(this.outputKeys);

			if (this.asyncCallback)
			{
				this.asyncCallback.call(this.relevantContext, this.outputKeys);
				this.asyncCallback = null;
			}
		}
	}
}
