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

namespace weavejs.geom.radviz
{
	export class ClassInfoObject
	{
		public columnMapping:Map<string, number[]> = new Map();//stores a map of columnName as key and ColumnValues as its(the key's) values
		
		public tStatisticArray:number[] = [];//stores all the t-statistics of each column for a given type
		
		public pValuesArray:number[] = [];//stores all the p-values of esch column for a given type
	}
}
