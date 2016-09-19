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

namespace weavejs.api.data
{
	/**
	 * Constants associated with different aggregation methods.
	 * @see weave.api.data.ColumnMetadata
	 */
	export class Aggregation
	{
		public static /* readonly */ SAME:string = "same";
		public static /* readonly */ FIRST:string = "first";
		public static /* readonly */ LAST:string = "last";
		
		public static /* readonly */ MEAN:string = "mean";
		public static /* readonly */ SUM:string = "sum";
		public static /* readonly */ MIN:string = "min";
		public static /* readonly */ MAX:string = "max";
		public static /* readonly */ COUNT:string = "count";
		
		public static /* readonly */ ALL_TYPES:string[] = [Aggregation.SAME, Aggregation.FIRST, Aggregation.LAST, Aggregation.MEAN, Aggregation.SUM, Aggregation.MIN, Aggregation.MAX, Aggregation.COUNT];
		
		/**
		 * The default aggregation mode.
		 */
		public static /* readonly */ DEFAULT:string = Aggregation.SAME;
		
		/**
		 * The string displayed when data for a record is ambiguous.
		 */
		public static /* readonly */ AMBIGUOUS_DATA:string = "Ambiguous data";
		
		/**
		 * Maps an aggregation method to a short description of its behavior.
		 */
		public static /* readonly */ HELP = {
			'same': 'Keep the value only if it is the same for each record in the group.',
			'first': 'Use the first of a group of values.',
			'last': 'Use the last of a group of values.',
			'mean': 'Calculate the mean (average) from a group of numeric values.',
			'sum': 'Calculate the sum (total) from a group of numeric values.',
			'min': 'Use the minimum of a group of numeric values.',
			'max': 'Use the maximum of a group of numeric values.',
			'count': 'Count the number of values in a group.'
		};
	}
}
