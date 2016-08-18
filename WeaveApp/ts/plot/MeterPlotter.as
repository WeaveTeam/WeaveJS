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

namespace weavejs.plot
{
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	
	/**
	 * This abstract class contains functionality common to any "meter tool" such as the thermometer and the gauge.
	 * This functionality includes the ability to select which input drives the single value shown by the tool plotter.
	 */
	export class MeterPlotter extends AbstractPlotter
	{
		//These constants are possible values of inputMode.
		public PROBE_MODE:number = 0;
		public COLUMN_AVERAGE_MODE:number = 1;
		
		//the sessioned number controlling the input mode
		private inputMode:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		
		//the column whose value drives this meter 
		public meterColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		protected meterColumnStats:IColumnStatistics = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(this.meterColumn));
		
//		private mode:number = PROBE_MODE;
		public constructor()
		{
			//this line causes only the currently probed records to be drawn.			
			this.setSingleKeySource(WeaveProperties.defaultProbeKeySet);
			this.addSpatialDependencies(this.meterColumn);
		}
	}
}



