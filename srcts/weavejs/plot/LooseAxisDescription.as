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
	import StandardLib = weavejs.util.StandardLib;
	
	/**
	 * code adapted from the UVP
	 * given:
	 *    info about our data
	 *    numTicksReq, dataMin, dataMax
	 * we calculate:
	 *    what our axis will look like
	 *    tickMin, tickMax, tickDelta
	 *    axisMin, axisMax,
     *    numTicks and numDigits
	 */
	export class LooseAxisDescription
	{
		public dataMin:number;
		public dataMax:number;
		public numberOfTicksRequested:number;

		public range:number;
		public tickMin:number;
		public tickMax:number;
		public tickDelta:number;
		public axisMin:number;
		public axisMax:number;
		public numberOfTicks:number;
		public numberOfDigits:number;

		public constructor(dataMin:number = NaN, dataMax:number = NaN, numTicksReq:number = 5)
		{
			if (!isNaN(dataMin) && !isNaN(dataMax))
				this.setup(dataMin,dataMax,numTicksReq);
		}
		
		public setup(dataMin:number, dataMax:number, numberOfTicksRequested:number, forceTickCount:boolean = false):void
		{
			this.dataMin = dataMin;
			this.dataMax = dataMax;
			this.numberOfTicksRequested = numberOfTicksRequested;
			
			if (forceTickCount)
			{
				this.numberOfTicks = this.numberOfTicksRequested;
				
				if (this.dataMin == this.dataMax)
				{
					this.range = 0;
					this.tickDelta = this.tickMin = this.tickMax = this.dataMin;
				}
				else
				{
					this.range = this.dataMax - this.dataMin;
					this.tickDelta = this.range / (this.numberOfTicksRequested - 1);
					this.tickMin = Math.floor(this.dataMin / this.tickDelta) * this.tickDelta;
					this.tickMax = Math.ceil(this.dataMax / this.tickDelta) * this.tickDelta;
				}
				this.axisMin = this.tickMin - (.5 * this.tickDelta);
				this.axisMax = this.tickMax + (.5 * this.tickDelta);
			}
			else
			{
				var ticks = StandardLib.getNiceNumbersInRange(dataMin, dataMax, numberOfTicksRequested);
				
				this.numberOfTicks = ticks.length;
				
				this.tickMin = ticks[0];
				this.tickMax = ticks[ticks.length - 1];
				
				this.range = this.tickMax - this.tickMin;
				
				// special case
				if (ticks.length < 2)
					this.tickDelta = 0;
				else
					this.tickDelta = ticks[1] - ticks[0];
				
				this.axisMin = this.tickMin - (.5 * this.tickDelta);
				this.axisMax = this.tickMax + (.5 * this.tickDelta);
			}
			
			this.numberOfDigits = forceTickCount ? -1 : Math.max(-Math.floor(Math.log(this.tickDelta) / Math.LN10), 0.0);
		}
	}
}

