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
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import LinkableWatcher = weavejs.core.LinkableWatcher;
	import StandardLib = weavejs.util.StandardLib;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import JS = weavejs.util.JS;

	/**
	 * This column maps a record key to the index in the list of records sorted by numeric value.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.SortedIndexColumn", interfaces: [IAttributeColumn, IPrimitiveColumn, IColumnWrapper]})
	export class SortedIndexColumn extends DynamicColumn implements IAttributeColumn, IPrimitiveColumn
	{
		constructor()
		{
			super();
			this.addImmediateCallback(this, this._updateStats);
		}
		
		private _sortedKeys:IQualifiedKey[];
		private map_key_sortIndex = new Map<IQualifiedKey, number>();
		private _column:IAttributeColumn;
		private _triggerCount:uint = 0;
		private _statsWatcher:LinkableWatcher = Weave.linkableChild(this, LinkableWatcher);
		
		private _updateStats():void
		{
			this._column = this.getInternalColumn();
			this._statsWatcher.target = this._column && WeaveAPI.StatisticsCache.getColumnStatistics(this._column);
		}
		
		private get _stats():IColumnStatistics
		{
			return Weave.AS(this._statsWatcher.target, IColumnStatistics);
		}
		
		private validate():void
		{
			if (this._column)
			{
				this.map_key_sortIndex = this._stats.getSortIndex();
				if (this.map_key_sortIndex)
					this._sortedKeys = StandardLib.sortOn(this._column.keys, this.map_key_sortIndex, null, false);
				else
					this._sortedKeys = this._column.keys;
			}
			else
			{
				this.map_key_sortIndex = null;
				this._sortedKeys = [];
			}
			
			this._triggerCount = this.triggerCounter;
		}

		/* override */ public get keys():IQualifiedKey[]
		{
			if (this._triggerCount != this.triggerCounter)
				this.validate();
			
			return this._sortedKeys;
		}
		
		/**
		 * @param key A key existing in the internal column.
		 * @param dataType A requested return type.
		 * @return If dataType is not specified, returns the index of the key in the sorted list of keys.
		 */
		/* override */ public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):any
		{
			if (this._triggerCount != this.triggerCounter)
				this.validate();
			
			if (!this._column)
				return dataType == String ? '' : undefined;
			
			if (dataType == Number)
				return this.map_key_sortIndex ? Number(this.map_key_sortIndex.get(key)) : NaN;
			
			return this._column.getValueFromKey(key, dataType);
		}
		
		/**
		 * @param index The index in the sorted keys vector.
		 * @return The key at the given index value.
		 */
		public deriveStringFromNumber(index:number):string
		{
			if (this._triggerCount != this.triggerCounter)
				this.validate();
			
			if (!this._column || index < 0 || index >= this._sortedKeys.length || int(index) != index)
				return '';
			return this._column.getValueFromKey(this._sortedKeys[index], String) as string;
		}
	}
}
