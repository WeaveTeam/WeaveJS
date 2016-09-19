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
	import IBinClassifier = weavejs.api.data.IBinClassifier;
	import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import DynamicBinningDefinition = weavejs.data.bin.DynamicBinningDefinition;
	import NumberClassifier = weavejs.data.bin.NumberClassifier;
	import SimpleBinningDefinition = weavejs.data.bin.SimpleBinningDefinition;
	import StandardLib = weavejs.util.StandardLib;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;

	
	/**
	 * A binned column maps a record key to a bin key.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.BinnedColumn", interfaces: [IPrimitiveColumn, IColumnWrapper, IAttributeColumn, ICallbackCollection]})
	export class BinnedColumn extends ExtendedDynamicColumn implements IPrimitiveColumn
	{
		constructor()
		{
			super();
			this.binningDefinition.requestLocalObject(SimpleBinningDefinition, false);
			this.binningDefinition.generateBinClassifiersForColumn(this.internalDynamicColumn);
			Weave.linkableChild(this, this.binningDefinition.asyncResultCallbacks);
		}

		/**
		 * This number overrides the min,max metadata values.
		 * @param propertyName The name of a metadata property.
		 * @return The value of the specified metadata property.
		 */
		/* override */ public getMetadata(propertyName:string):string
		{
			this.validateBins();
			if (this._binClassifiers && this._binClassifiers.length)
			{
				switch (propertyName)
				{
					case ColumnMetadata.MIN:
						return this.numberOfBins > 0 ? "0" : null;
					case ColumnMetadata.MAX:
						var binCount:int = this.numberOfBins;
						return binCount > 0 ? String(binCount - 1) : null;
				}
			}
			return super.getMetadata(propertyName);
		}
		
		/**
		 * This defines how to generate the bins for this BinnedColumn.
		 * This is used to generate the derivedBins.
		 */
		public /* readonly */ binningDefinition:DynamicBinningDefinition = Weave.linkableChild(this, new DynamicBinningDefinition(true));
		
		private _binNames:string[] = []; // maps a bin index to a bin name
		private _binClassifiers:IBinClassifier[] = []; // maps a bin index to an IBinClassifier
		private map_key_binIndex = new Map<IQualifiedKey, number>(); // maps a record key to a bin index
		private _binnedKeysArray:IQualifiedKey[][] = []; // maps a bin index to a list of keys in that bin
		private _binnedKeysMap:{[binName:string]:IQualifiedKey[]} = {}; // maps a bin name to a list of keys in that bin
		private _largestBinSize:uint = 0;
		private _resultTriggerCount:uint = 0;
		
		/**
		 * This function generates bins using the binning definition and the internal column,
		 * and also saves lookups for mapping between bins and keys.
		 */
		private validateBins():void
		{
			if (this._resultTriggerCount != this.binningDefinition.asyncResultCallbacks.triggerCounter)
			{
				if (WeaveAPI.SessionManager.linkableObjectIsBusy(this))
					return;
				
				this._resultTriggerCount = this.binningDefinition.asyncResultCallbacks.triggerCounter;
				// reset cached values
				this._column = this.internalDynamicColumn.getInternalColumn();
				this.map_key_binIndex = new Map<IQualifiedKey, number>();
				this._binnedKeysArray = [];
				this._binnedKeysMap = {};
				this._largestBinSize = 0;
				// save bin names for faster lookup
				this._binNames = this.binningDefinition.getBinNames();
				this._binClassifiers = this.binningDefinition.getBinClassifiers();
				// create empty key arrays
				if (this._binNames)
					for (var i:int = 0; i < this._binNames.length; i++)
						this._binnedKeysMap[this._binNames[i]] = this._binnedKeysArray[i] = []; // same Array pointer
				this._keys = this.internalDynamicColumn.keys;
				this._i = 0;
				if (StandardLib.getArrayType(this._binClassifiers) == NumberClassifier)
					this._dataType = Number;
				else
					this._dataType = String;
				// fill all mappings
				if (this._column && this._binClassifiers)
				{
					// high priority because not much can be done without data
					WeaveAPI.Scheduler.startTask(this, this._asyncIterate, WeaveAPI.TASK_PRIORITY_HIGH, this.triggerCallbacks, Weave.lang("Binning {0} records", this._keys.length));
				}
			}
		}
		
		private _dataType:GenericClass;
		private _column:IAttributeColumn;
		private _i:int;
		private _keys:IQualifiedKey[];
		private _asyncIterate(stopTime:int):number
		{
			// stop immediately if result callbacks were triggered
			if (this._resultTriggerCount != this.binningDefinition.asyncResultCallbacks.triggerCounter)
				return 1;

			for (; this._i < this._keys.length; this._i++)
			{
				if (Date.now() > stopTime)
					return this._i / this._keys.length;
				
				var key:IQualifiedKey = this._keys[this._i];
				var value:any = this._column.getValueFromKey(key, this._dataType);
				var binIndex:int = 0;
				for (; binIndex < this._binClassifiers.length; binIndex++)
				{
					if (Weave.AS(this._binClassifiers[binIndex], IBinClassifier).contains(value))
					{
						this.map_key_binIndex.set(key, binIndex);
						var array:IQualifiedKey[] = Weave.AS(this._binnedKeysArray[binIndex], Array) as IQualifiedKey[];
						if (array.push(key) > this._largestBinSize)
							this._largestBinSize = array.length;
						break;
					}
				}
			}
			return 1;
		}

		/**
		 * This is the number of bins that have been generated by
		 * the binning definition using with the internal column.
		 */
		public get numberOfBins():uint
		{
			this.validateBins();
			return this._binNames.length;
		}
		
		/**
		 * This is the largest number of records in any of the bins.
		 */		
		public get largestBinSize():uint
		{
			this.validateBins();
			return this._largestBinSize;
		}
		
		/**
		 * This function gets a list of keys in a bin.
		 * @param binIndex The index of the bin to get the keys from.
		 * @return An Array of keys in the specified bin.
		 */
		public getKeysFromBinIndex(binIndex:uint):IQualifiedKey[]
		{
			this.validateBins();
			if (binIndex < this._binnedKeysArray.length)
				return this._binnedKeysArray[binIndex];
			return null;
		}
		
		/**
		 * This function gets a list of keys in a bin.
		 * @param binIndex The name of the bin to get the keys from.
		 * @return An Array of keys in the specified bin.
		 */
		public getKeysFromBinName(binName:string):IQualifiedKey[]
		{
			this.validateBins();
			return Weave.AS(this._binnedKeysMap[binName], Array) as IQualifiedKey[];
		}
		
		public getBinIndexFromDataValue(value:any):number
		{
			this.validateBins();
			if (this._binClassifiers)
				for (var i:int = 0; i < this._binClassifiers.length; i++)
					if (Weave.AS(this._binClassifiers[i], IBinClassifier).contains(value))
						return i;
			return NaN;
		}

		/**
		 * This function returns different results depending on the dataType.
		 * Supported types:
		 *     default -> IBinClassifier that matches the given record key
		 *     Number -> bin index for the given record key
		 *     String -> bin name for the given record key
		 *     Array -> list of keys in the same bin as the given record key
		 * @param key A record identifier.
		 * @param dataType The requested return type.
		 * @return If the specified dataType is supported, a value of that type.  Otherwise, the default return value for the given record key.
		 */
		/* override */ public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):any
		{
			this.validateBins();
			
			if (!this._binClassifiers || !this._binClassifiers.length)
				return super.getValueFromKey(key, dataType);
			
			var binIndex:number = Number(this.map_key_binIndex.get(key)); // undefined -> NaN
			
			// Number: return bin index
			if (dataType == Number)
				return binIndex;
			
			// String: return bin name
			if (dataType == String)
				return isNaN(binIndex) ? '' : this._binNames[binIndex];
			
			if (isNaN(binIndex))
				return undefined;
			
			// Array: return list of keys in the same bin
			if (dataType == Array)
				return Weave.AS(this._binnedKeysArray[binIndex], Array);
			
			// default: return IBinClassifier
			return this._binClassifiers && this._binClassifiers[binIndex];
		}
		
		
		/**
		 * From a bin index, this function returns the name of the bin.
		 * @param value A bin index
		 * @return The name of the bin
		 */
		public deriveStringFromNumber(value:number):string
		{
			this.validateBins();
			
			if (!this._binClassifiers || !this._binClassifiers.length)
				return ColumnUtils.deriveStringFromNumber(this.internalDynamicColumn, value);
			
			try
			{
				return this._binNames[value];
			}
			catch (e) { } // ok to ignore Array[index] error
			
			return '';
		}
	}
}
