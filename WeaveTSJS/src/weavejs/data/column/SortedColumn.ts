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
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import SortedKeySet = weavejs.data.key.SortedKeySet;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;

	/**
	 * This is a wrapper for another column that provides sorted keys.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.SortedColumn", interfaces: [IAttributeColumn, IColumnWrapper, ICallbackCollection]})
	export class SortedColumn extends ExtendedDynamicColumn implements IAttributeColumn
	{
		constructor()
		{
			super();
			Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(this.internalDynamicColumn));
			this.sortCopyAscending = SortedKeySet.generateSortCopyFunction([this.internalDynamicColumn], [1]);
			this.sortCopyDescending = SortedKeySet.generateSortCopyFunction([this.internalDynamicColumn], [-1]);
		}
		
		/**
		 * This is an option to sort the column in ascending or descending order.
		 */
		public /* readonly */ ascending:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));

		private _keys:IQualifiedKey[] = [];
		private _prevTriggerCounter:uint = 0;
		private sortCopyAscending:(keys:IQualifiedKey[]) => IQualifiedKey[];
		private sortCopyDescending:(keys:IQualifiedKey[]) => IQualifiedKey[];

		/**
		 * This function returns the unique strings of the internal column.
		 * @return The keys this column defines values for.
		 */
		/* override */ public get keys():IQualifiedKey[]
		{
			if (this._prevTriggerCounter != this.triggerCounter)
			{
				if (this.ascending.value)
					this._keys = this.sortCopyAscending(super.keys);
				else
					this._keys = this.sortCopyDescending(super.keys);
				this._prevTriggerCounter = this.triggerCounter;
			}
			return this._keys;
		}
	}
}
