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

namespace weavejs.data
{
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IStatisticsCache = weavejs.api.data.IStatisticsCache;
	import JS = weavejs.util.JS;
	
	/**
	 * This is an all-static class containing numerical statistics on columns and functions to access the statistics.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.StatisticsCache", interfaces: [IStatisticsCache]})
	export class StatisticsCache implements IStatisticsCache
	{
		/**
		 * @param column A column to get statistics for.
		 * @return A Map that maps a IQualifiedKey to a running total numeric value, based on the order of the keys in the column.
		 */
		public getRunningTotals(column:IAttributeColumn):Map<IQualifiedKey, number>
		{
			return Weave.AS(this.getColumnStatistics(column), ColumnStatistics).getRunningTotals();
		}

		private map_column_stats = new WeakMap<IAttributeColumn, IColumnStatistics>();
		
		public getColumnStatistics(column:IAttributeColumn):IColumnStatistics
		{
			if (column == null)
				throw new Error("getColumnStatistics(): Column parameter cannot be null.");
			
			if (Weave.wasDisposed(column))
			{
				this.map_column_stats.delete(column);
				throw new Error("Invalid attempt to retrieve statistics for a disposed column.");
			}

			var stats:IColumnStatistics = this.map_column_stats.get(column);
			if (!stats)
			{
				stats = new ColumnStatistics(column);
				
				// when the column is disposed, the stats should be disposed
				this.map_column_stats.set(column, Weave.disposableChild(column, stats));
			}
			return stats;
		}
	}
}
