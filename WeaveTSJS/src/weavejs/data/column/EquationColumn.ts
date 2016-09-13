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

namespace weavejs.data.column
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IKeySet = weavejs.api.data.IKeySet;
	import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import EquationColumnLib = weavejs.data.EquationColumnLib;
	import ArrayUtils = weavejs.util.ArrayUtils;
	import Dictionary2D = weavejs.util.Dictionary2D;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	
	/**
	 * This is a column of data derived from an equation with variables.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.EquationColumn", interfaces: [IAttributeColumn, IPrimitiveColumn, ICallbackCollection]})
	export class EquationColumn extends AbstractAttributeColumn implements IPrimitiveColumn
	{
		public static debug:boolean = false;
		
		constructor()
		{
			super();
			this.setMetadataProperty(ColumnMetadata.TITLE, "Untitled Equation");
			//setMetadataProperty(AttributeColumnMetadata.DATA_TYPE, DataType.NUMBER);
			
			this.variables.childListCallbacks.addImmediateCallback(this, this.handleVariableListChange);
		}
		
		private handleVariableListChange():void
		{
			// make callbacks trigger when statistics change for listed variables
			var newColumn:IAttributeColumn = Weave.AS(this.variables.childListCallbacks.lastObjectAdded, IAttributeColumn);
			if (newColumn)
				Weave.getCallbacks(WeaveAPI.StatisticsCache.getColumnStatistics(newColumn)).addImmediateCallback(this, this.triggerCallbacks);
		}
		
		/**
		 * This is all the keys in all the variables columns
		 */
		private _allKeys:IQualifiedKey[] = null;
		private map_allKeys:WeakMap<IQualifiedKey, boolean>;
		private _allKeysTriggerCount:uint = 0;
		/**
		 * This is a cache of metadata values derived from the metadata session state.
		 */		
		private _cachedMetadata:IColumnMetadata = {};
		private _cachedMetadataTriggerCount:uint = 0;
		/**
		 * This is the Class corresponding to dataType.value.
		 */		
		private _defaultDataType:GenericClass = null;
		/**
		 * This is the function compiled from the equation.
		 */
		private compiledEquation:Function = null;
		/**
		 * This is the last error thrown from the compiledEquation.
		 */		
		private _lastError:string;
		/**
		 * This is a mapping from keys to cached data values.
		 */
		private d2d_key_dataType_value:Dictionary2D<IQualifiedKey, GenericClass, any> = new Dictionary2D<IQualifiedKey, GenericClass, any>();
		/**
		 * This is used to determine when to clear the cache.
		 */		
		private _cacheTriggerCount:uint = 0;
		/**
		 * This is used as a placeholder in d2d_key_dataType_value.
		 */		
		private static /* readonly */ UNDEFINED:Object = {};
		
		
		/**
		 * This is the equation that will be used in getValueFromKey().
		 */
		public /* readonly */ equation:LinkableString = Weave.linkableChild(this, LinkableString);
		/**
		 * This is a list of named variables made available to the compiled equation.
		 */
		public /* readonly */ variables:LinkableHashMap = Weave.linkableChild(this, LinkableHashMap);
		
		/**
		 * This holds the metadata for the column.
		 */
		public /* readonly */ metadata:LinkableVariable = Weave.linkableChild(this, new LinkableVariable(null, this.verifyMetadata));
		
		private verifyMetadata(value:IColumnMetadata):boolean
		{
			return typeof value == 'object';
		}

		/**
		 * Specify whether or not we should filter the keys by the column's keyType.
		 */
		public /* readonly */ filterByKeyType:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		/**
		 * This function intercepts requests for dataType and title metadata and uses the corresponding linkable variables.
		 * @param propertyName A metadata property name.
		 * @return The requested metadata value.
		 */
		/* override */ public getMetadata(propertyName:string):string
		{
			if (this._cachedMetadataTriggerCount != this.triggerCounter)
			{
				this._cachedMetadata = {};
				this._cachedMetadataTriggerCount = this.triggerCounter;
			}
			
			if (this._cachedMetadata.hasOwnProperty(propertyName))
				return Weave.AS(this._cachedMetadata[propertyName], String) as string;
			
			this._cachedMetadata[propertyName] = undefined; // prevent infinite recursion
			
			var value:string = this.metadata.state ? Weave.AS((this.metadata.state as IColumnMetadata)[propertyName], String) as string : null;
			if (value != null)
			{
				if (value.charAt(0) == '{' && value.charAt(value.length - 1) == '}')
				{
					try
					{
						var func:Function = JS.compile(value);
						value = func.apply(this, arguments);
					}
					catch (e)
					{
						this.errorHandler(e);
					}
				}
			}
			else if (propertyName == ColumnMetadata.KEY_TYPE)
			{
				var cols:IAttributeColumn[] = this.variables.getObjects(IAttributeColumn);
				if (cols.length)
					value = Weave.AS(cols[0], IAttributeColumn).getMetadata(propertyName);
			}
			
			this._cachedMetadata[propertyName] = value;
			return value;
		}
		
		private errorHandler(e:Error):void
		{
			var str:string = Weave.IS(e, Error) ? e.message : String(e);
			if (this._lastError != str)
			{
				this._lastError = str;
				console.error(e);
			}
		}
		
		/* override */ public setMetadata(value:IColumnMetadata):void
		{
			this.metadata.setSessionState(value);
		}
		
		/* override */ public getMetadataPropertyNames():string[]
		{
			return Object.keys(this.metadata.getSessionState());
		}

		/**
		 * This function will store an individual metadata value in the metadata linkable variable.
		 * @param propertyName
		 * @param value
		 */
		public setMetadataProperty(propertyName:string, value:string):void
		{
			value = StandardLib.trim(value);
			var _metadata:IColumnMetadata = this.metadata.state || {};
			_metadata[propertyName] = value;
			this.metadata.state = _metadata; // this triggers callbacks
		}
		
		/**
		 * This function creates an object in the variables LinkableHashMap if it doesn't already exist.
		 * If there is an existing object associated with the specified name, it will be kept if it
		 * is the specified type, or replaced with a new instance of the specified type if it is not.
		 * @param name The identifying name of a new or existing object.
		 * @param classDef The Class of the desired object type.
		 * @return The object associated with the requested name of the requested type, or null if an error occurred.
		 */
		public requestVariable(name:string, classDef:GenericClass, lockObject:boolean = false):any
		{
			return this.variables.requestObject(name, classDef, lockObject);
		}

		/**
		 * @return The keys associated with this EquationColumn.
		 */
		/* override */ public get keys():IQualifiedKey[]
		{
			// return all the keys of all columns in the variables list
			if (this._allKeysTriggerCount != this.variables.triggerCounter)
			{
				this._allKeys = null;
				this.map_allKeys = new WeakMap<IQualifiedKey, boolean>();
				this._allKeysTriggerCount = this.variables.triggerCounter; // prevent infinite recursion

				var variableColumns:IKeySet[] = this.variables.getObjects(IKeySet);

				this._allKeys = ArrayUtils.union.apply(ArrayUtils, ArrayUtils.pluck(variableColumns, 'keys'));

				if (this.filterByKeyType.value && (this._allKeys.length > 0))
				{
					var keyType:string = this.getMetadata(ColumnMetadata.KEY_TYPE);
					this._allKeys = this._allKeys.filter((key:IQualifiedKey):boolean => {
						return key.keyType == keyType;
					});
				}
				for (var key of this._allKeys || [])
					this.map_allKeys.set(key, true);
			}
			return this._allKeys || [];
		}

		/**
		 * @param key A key to test.
		 * @return true if the key exists in this IKeySet.
		 */
		/* override */ public containsKey(key:IQualifiedKey):boolean
		{
			return this.keys && this.map_allKeys.has(key);
		}
		
		/**
		 * Compiles the equation if it has changed, and returns any compile error message that was thrown.
		 */
		public validateEquation():string
		{
			if (this._cacheTriggerCount == this.triggerCounter)
				return this._compileError;
			
			this._cacheTriggerCount = this.triggerCounter;
			this._compileError = null;
			
			try
			{
				this.compiledEquation = JS.compile(this.equation.value, ['key', 'dataType'].concat(this.variables.getNames()));
				this.d2d_key_dataType_value = new Dictionary2D<IQualifiedKey, GenericClass, any>(); // create a new cache
			}
			catch (e)
			{
				// if compiling fails
				this.compiledEquation = () =>  undefined as Function;
				this._compileError = e.message;
			}
			
			return this._compileError;
		}
		
		private _compileError:string;
		
		/**
		 * @return The result of the compiled equation evaluated at the given record key.
		 * @see weave.api.data.IAttributeColumn
		 */
		/* override */ public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):any
		{
			// reset cached values if necessary
			if (this._cacheTriggerCount != this.triggerCounter)
				this.validateEquation();
			
			// if dataType not specified, use default type specified in metadata
			if (dataType == null)
				dataType = Array;
			
			// check the cache
			var value:any = this.d2d_key_dataType_value.get(key, dataType);
			// define cached value if missing
			if (value === undefined)
			{
				// prevent recursion caused by compiledEquation
				this.d2d_key_dataType_value.set(key, dataType, EquationColumn.UNDEFINED);
				
				// prepare EquationColumnLib static parameter before calling the compiled equation
				var prevKey:IQualifiedKey = EquationColumnLib.currentRecordKey;
				EquationColumnLib.currentRecordKey = key;
				try
				{
					var args:any[] = this.variables.getObjects();
					args.unshift(key, dataType);
					value = this.compiledEquation.apply(this, args);
					if (EquationColumn.debug)
						console.log(this,this.getMetadata(ColumnMetadata.TITLE),key.keyType,key.localName,dataType,value);
				}
				catch (e)
				{
					if (this._lastError != e.message)
					{
						this._lastError = e.message;
						console.error(e);
					}
					//value = e;
				}
				finally
				{
					EquationColumnLib.currentRecordKey = prevKey;
				}
				
				// save value in cache
				if (value !== undefined)
					this.d2d_key_dataType_value.set(key, dataType, value);
				//trace('('+equation.value+')@"'+key+'" = '+value);
			}
			else if (value === EquationColumn.UNDEFINED)
			{
				value = undefined;
			}
			else if (EquationColumn.debug)
				console.log('>',this,this.getMetadata(ColumnMetadata.TITLE),key.keyType,key.localName,dataType,value);
			
			if (dataType == IQualifiedKey)
			{
				if (!Weave.IS(value, IQualifiedKey))
				{
					if (!Weave.IS(value, String))
						value = StandardLib.asString(value);
					value = WeaveAPI.QKeyManager.getQKey(this.getMetadata(ColumnMetadata.DATA_TYPE), value);
				}
			}
			else if (dataType != null)
			{
				value = EquationColumnLib.cast(value, dataType);
			}
			
			return value;
		}
		
		private _numberToStringFunction:(value:number)=>string = null;
		private deriveStringFromNumberObserver = {};
		public deriveStringFromNumber(number:number):string
		{
			if (Weave.detectChange(this.deriveStringFromNumberObserver, this.metadata))
			{
				try
				{
					this._numberToStringFunction = StandardLib.formatNumber;
					var n2s:string = this.getMetadata(ColumnMetadata.STRING);
					if (n2s)
						this._numberToStringFunction = JS.compile(n2s, ['number']) as (value:number)=>string;
				}
				catch (e)
				{
					this.errorHandler(e);
				}
			}
			
			if (this._numberToStringFunction != null)
			{
				try
				{
					var string:string = this._numberToStringFunction.apply(this, arguments);
					if (EquationColumn.debug)
						console.log(this, this.getMetadata(ColumnMetadata.TITLE), 'deriveStringFromNumber', number, string);
					return string;
				}
				catch (e)
				{
					this.errorHandler(e);
				}
			}
			return '';
		}
	}
}
