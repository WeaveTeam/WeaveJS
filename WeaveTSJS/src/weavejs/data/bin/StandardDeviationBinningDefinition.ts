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

namespace weavejs.data.bin
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import NumberClassifier = weavejs.data.bin.NumberClassifier;
	import StandardLib = weavejs.util.StandardLib;
	import IBinningDefinition = weavejs.api.data.IBinningDefinition;
	
	/**
	 * StandardDeviationBinningDefinition
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.bin.StandardDeviationBinningDefinition", interfaces: [IBinningDefinition]})
	export class StandardDeviationBinningDefinition extends AbstractBinningDefinition
	{
		constructor()
		{
			super(true, false);
		}
		
		/* override */ public generateBinClassifiersForColumn(column:IAttributeColumn):void
		{
			// clear any existing bin classifiers
			this.output.removeAllObjects();
			
			var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
			var mean:number = stats.getMean();
			var stdDev:number = stats.getStandardDeviation();
			var binNumber:int = 0;
			for (var i:int = -StandardDeviationBinningDefinition.MAX_SD; i <= StandardDeviationBinningDefinition.MAX_SD; i++)
				if (i != 0)
					this.addBin(this.output, Math.abs(i), i < 0, stdDev, mean, this.getOverrideNames()[binNumber++]);
			
			// trigger callbacks now because we're done updating the output
			this.asyncResultCallbacks.triggerCallbacks();
		}
		
		private static /* readonly */ MAX_SD:int = 3;
		
		private addBin(output:ILinkableHashMap, absSDNumber:number, belowMean:boolean, stdDev:number, mean:number, overrideName:string):void
		{
			var name:string = overrideName;
			if (!name)
			{
				var nameFormat:string= (absSDNumber < StandardDeviationBinningDefinition.MAX_SD) ? "{0} - {1} SD {2} mean" : "> {0} SD {2} mean";
				name = StandardLib.substitute(nameFormat, absSDNumber - 1, absSDNumber, belowMean ? "below" : "above");
			}
			var bin:NumberClassifier = output.requestObject(name, NumberClassifier, false);
			if (belowMean)
			{
				if (absSDNumber == StandardDeviationBinningDefinition.MAX_SD)
					bin.min.value = -Infinity;
				else
					bin.min.value = mean - absSDNumber * stdDev;
				bin.max.value = mean - (absSDNumber - 1) * stdDev;
			}
			else // above mean
			{
				bin.min.value = mean + (absSDNumber - 1) * stdDev;
				if (absSDNumber == StandardDeviationBinningDefinition.MAX_SD)
					bin.max.value = Infinity;
				else
					bin.max.value = mean + absSDNumber * stdDev;
			}
			bin.minInclusive.value = true;
			bin.maxInclusive.value = true;
		}
	}
}

