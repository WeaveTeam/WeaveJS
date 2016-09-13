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
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;

	/**
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.NormalizedColumn", interfaces: [IColumnWrapper, IAttributeColumn, ICallbackCollection]})
	export class NormalizedColumn extends ExtendedDynamicColumn
	{
		constructor(min:number = 0, max:number = 1)
		{
			super();
			this._stats = WeaveAPI.StatisticsCache.getColumnStatistics(this.internalDynamicColumn);
			// when stats update, we need to trigger our callbacks because the values returned by getValueFromKey() will be different.
			Weave.getCallbacks(this._stats).addImmediateCallback(this, this.triggerCallbacks);
			
			this.min.value = min;
			this.max.value = max;
		}

		private _stats:IColumnStatistics;
		
		public /* readonly */ min:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		public /* readonly */ max:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		
		/**
		 * getValueFromKey
		 * @param key A key of the type specified by keyType.
		 * @return The value associated with the given key.
		 */
		/* override */ public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):any
		{
			if (dataType == null)
				dataType = Number;
			
			if (dataType == Number)
			{
				// get norm value between 0 and 1
				var norm:number = this._stats.getNorm(key);
				// return number between min and max
				return this.min.value + norm * (this.max.value - this.min.value);
			}
			
			return super.getValueFromKey(key, dataType);
		}
	}
}
