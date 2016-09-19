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
	import ILinkableObject = weavejs.api.core.ILinkableObject;

	/**
	 * This is an interface for getting cached numerical statistics on a column.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.api.data.IColumnStatistics"})
	export class IColumnStatistics extends ILinkableObject
	{
		//TODO(?): range,coefficient of variance,midrange
		
		/**
		 * Gets the numeric value for a given key normalized between 0 and 1.
		 * @param key
		 * @return A number between 0 and 1, or NaN 
		 */		
		getNorm:(key:IQualifiedKey)=>number;
		
		/**
		 * Gets the minimum numeric value defined in the column.
		 */
		getMin:()=>number;
		
		/**
		 * Gets the maximum numeric value defined in the column.
		 */
		getMax:()=>number;
		
		/**
		 * Gets the count of the records having numeric values defined in the column.
		 */
		getCount:()=>number;
		
		/**
		 * Gets the sum of all the numeric values defined in the column.
		 */
		getSum:()=>number;
		
		/**
		 * Gets the sum of the squared numeric values defined in the column.
		 */
		getSquareSum:()=>number;
		
		/**
		 * Gets the mean value of all the numeric values defined in the column.
		 */
		getMean:()=>number;
		
		/**
		 * Gets the variance of the numeric values defined in the column.
		 */
		getVariance:()=>number;
		
		/**
		 * Gets the standard deviation of the numeric values defined in the column.
		 */
		getStandardDeviation:()=>number;
		
		/**
		 * Gets the median value of all the numeric values defined in the column.
		 */
		getMedian:()=>number;
		
		/**
		 * Gets a Dictionary mapping IQualifiedKeys to sort indices derived from sorting the numeric values in the column.
		 */
		getSortIndex:()=>Map<IQualifiedKey, number>;
		
		/**
		 * TEMPORARY SOLUTION - Gets a Dictionary mapping IQualifiedKey to Numeric data.
		 */
		hack_getNumericData:()=>Map<IQualifiedKey, number>;
	}
}
