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
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IKeyFilter = weavejs.api.data.IKeyFilter;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableString = weavejs.core.LinkableString;
	
	/**
	 * This class is used to include and exclude IQualifiedKeys from a set.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.key.KeyFilter", interfaces: [IKeyFilter]})
	export class KeyFilter implements IKeyFilter, ILinkableObject
	{
		constructor()
		{
			this.includeMissingKeys.value = false;
			this.includeMissingKeyTypes.value = true;
			this.filters.childListCallbacks.addImmediateCallback(this, this.cacheValues);
		}
		
		public static /* readonly */ UNION:string = 'union';
		public static /* readonly */ INTERSECTION:string = 'intersection';
		
		// option to include missing keys or not
		public /* readonly */ includeMissingKeys:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean, this.cacheValues);
		public /* readonly */ includeMissingKeyTypes:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean, this.cacheValues);
		
		public /* readonly */ included:KeySet = Weave.linkableChild(this, KeySet, this.handleIncludeChange);
		public /* readonly */ excluded:KeySet = Weave.linkableChild(this, KeySet, this.handleExcludeChange);
		
		public /* readonly */ filters:ILinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IKeyFilter));
		public /* readonly */ filterSetOp:LinkableString = Weave.linkableChild(this, new LinkableString(KeyFilter.INTERSECTION, this.verifyFilterSetOp), this.cacheValues);
		private verifyFilterSetOp(value:string):boolean { return value === KeyFilter.UNION || value === KeyFilter.INTERSECTION; }
		
		private _includeMissingKeys:boolean;
		private _includeMissingKeyTypes:boolean;
		private _filters:IKeyFilter[];
		private _filterSetOp:string;
		private cacheValues():void
		{
			this._includeMissingKeys = this.includeMissingKeys.value;
			this._includeMissingKeyTypes = this.includeMissingKeyTypes.value;
			this._filters = this.filters.getObjects();
			this._filterSetOp = this.filterSetOp.value;
		}

		/**
		 * This replaces the included and excluded keys in the filter with the parameters specified.
		 */
		public replaceKeys(includeMissingKeys:boolean, includeMissingKeyTypes:boolean, includeKeys:IQualifiedKey[] = null, excludeKeys:IQualifiedKey[] = null):void
		{
			Weave.getCallbacks(this).delayCallbacks();
			
			this.includeMissingKeys.value = includeMissingKeys;
			this.includeMissingKeyTypes.value = includeMissingKeyTypes;

			if (includeKeys)
				this.included.replaceKeys(includeKeys);
			else
				this.included.clearKeys();

			if (excludeKeys)
				this.excluded.replaceKeys(excludeKeys);
			else
				this.excluded.clearKeys();
			
			Weave.getCallbacks(this).resumeCallbacks();
		}

		// adds keys to include list
		public includeKeys(keys:IQualifiedKey[]):void
		{
			this.included.addKeys(keys);
		}
		
		// adds keys to exclude list
		public excludeKeys(keys:IQualifiedKey[]):void
		{
			this.excluded.addKeys(keys);
		}
		
		private _includedKeyTypeMap:{[keyType:string]:boolean} = {};
		private _excludedKeyTypeMap:{[keyType:string]:boolean} = {};
		
		// removes keys from exclude list that were just added to include list
		private handleIncludeChange():void
		{
			var includedKeys:IQualifiedKey[] = this.included.keys;
			this._includedKeyTypeMap = {};
			for (var key of includedKeys || [])
				this._includedKeyTypeMap[key.keyType] = true;
			
			this.excluded.removeKeys(includedKeys);
		}

		// removes keys from include list that were just added to exclude list
		private handleExcludeChange():void
		{
			var excludedKeys:IQualifiedKey[] = this.excluded.keys;
			this._excludedKeyTypeMap = {};
			for (var key of excludedKeys || [])
				this._excludedKeyTypeMap[key.keyType] = true;
			
			this.included.removeKeys(excludedKeys);
		}
		
		/**
		 * @param key A key to test.
		 * @return true if this filter includes the key, false if the filter excludes it.
		 */
		public containsKey(key:IQualifiedKey):boolean
		{
			if (this._filterSetOp === KeyFilter.INTERSECTION)
			{
				for (var filter of this._filters || [])
					if (!filter.containsKey(key))
						return false;
			}
			else if (this._filterSetOp === KeyFilter.UNION)
			{
				var found:boolean = false;
				for (var filter of this._filters || [])
				{
					if (filter.containsKey(key))
					{
						found = true;
						break;
					}
				}
				if (!found)
					return false;
			}
			
			if (this._includeMissingKeys || (this._includeMissingKeyTypes && !this._includedKeyTypeMap[key.keyType]))
			{
				if (this.excluded.containsKey(key))
					return false;
				if (!this._includeMissingKeyTypes && this._excludedKeyTypeMap[key.keyType])
					return false;
				return true;
			}
			else // exclude missing keys
			{
				if (this.included.containsKey(key))
					return true;
				// if includeMissingKeyTypes and keyType is missing
				if (this._includeMissingKeyTypes && !this._includedKeyTypeMap[key.keyType] && !this._excludedKeyTypeMap[key.keyType])
					return true;
				return false;
			}
		}
		
		//----------------------------------------------------------
		// backwards compatibility 0.9.6
		/**
		 * @deprecated
		 */
		public set sessionedKeyType(value:string)
		{
			this.handleDeprecatedSessionedProperty('sessionedKeyType', value);
		}

		/**
		 * @deprecated replacement="included"
		 */
		public set includedKeys(value:string)
		{
			this.handleDeprecatedSessionedProperty('includedKeys', value);
		}

		/**
		 * @deprecated replacement="excluded"
		 */
		public set excludedKeys(value:string)
		{
			this.handleDeprecatedSessionedProperty('excludedKeys', value);
		}

		private handleDeprecatedSessionedProperty(propertyName:string, value:string):void
		{
			if (this._deprecatedState == null)
			{
				this._deprecatedState = {};
				WeaveAPI.Scheduler.callLater(this, this._applyDeprecatedSessionState);
			}
			this._deprecatedState[propertyName] = value;
		}
		private _deprecatedState:{sessionedKeys?:IQualifiedKey[], includedKeys?:IQualifiedKey[], excludedKeys?: IQualifiedKey[]} = null;

		private _applyDeprecatedSessionState():void
		{
			this._deprecatedState.sessionedKeys = this._deprecatedState.includedKeys;
			this.included.setSessionState(this._deprecatedState);
			this._deprecatedState.sessionedKeys = this._deprecatedState.excludedKeys;
			this.excluded.setSessionState(this._deprecatedState);
		}
	}
}
