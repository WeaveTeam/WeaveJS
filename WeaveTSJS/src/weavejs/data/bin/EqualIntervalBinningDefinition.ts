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
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import StandardLib = weavejs.util.StandardLib;
	import IBinningDefinition = weavejs.api.data.IBinningDefinition;
	
	/**
	 * EqualIntervalBinningDefinition
	 * 
	 * @author adufilie
	 * @author abaumann
	 * @author sanbalagan
	 */
	@Weave.classInfo({id: "weavejs.data.bin.EqualIntervalBinningDefinition", interfaces: [IBinningDefinition]})
	export class EqualIntervalBinningDefinition extends AbstractBinningDefinition
	{
		constructor()
		{
			super(true, true);
		}
		
		public /* readonly */ dataInterval:LinkableNumber = Weave.linkableChild(this, new LinkableNumber());
		
		/* override */ public generateBinClassifiersForColumn(column:IAttributeColumn):void
		{
			var name:string;
			// clear any existing bin classifiers
			this.output.removeAllObjects();
			
			//var integerValuesOnly:Boolean = column is StringColumn;
			var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
			var dataMin:number = isFinite(this.overrideInputMin.value) ? this.overrideInputMin.value : stats.getMin();
			var dataMax:number = isFinite(this.overrideInputMax.value) ? this.overrideInputMax.value : stats.getMax();
			var binMin:number;
			var binMax:number = dataMin;
			var maxInclusive:boolean;
			//var valuesPerBin:int = Math.ceil((dataMax - dataMin + 1) / dataInterval.value);
			var numberOfBins:int = Math.ceil((dataMax - dataMin) / this.dataInterval.value);
			if (!isFinite(numberOfBins))
				numberOfBins = 1;
			for (var iBin:int = 0; iBin < numberOfBins; iBin++)
			{
				
					// classifiers use min <= value < max,
					// except for the final one, which uses min <= value <= max
					binMin = binMax;
					if (iBin == numberOfBins - 1)
					{
						binMax = dataMax;
						maxInclusive = true;
					}
					else
					{
						maxInclusive = false;
						
						//****binMax = dataMin + (iBin + 1) * (dataMax - dataMin) / numberOfBins.value;
						binMax = binMin + this.dataInterval.value;
						// TEMPORARY SOLUTION -- round bin boundaries
						binMax = StandardLib.roundSignificant(binMax, 4);
					}
					
					// TEMPORARY SOLUTION -- round bin boundaries
					if (iBin > 0)
						binMin = StandardLib.roundSignificant(binMin, 4);
					
					// skip bins with no values
					if (binMin == binMax && !maxInclusive)
						continue;
				this.tempNumberClassifier.min.value = binMin;
				this.tempNumberClassifier.max.value = binMax;
				this.tempNumberClassifier.minInclusive.value = true;
				this.tempNumberClassifier.maxInclusive.value = maxInclusive;
				
				//first get name from overrideBinNames
				name = this.getOverrideNames()[iBin];
				//if it is empty string set it from generateBinLabel
				if(!name)
					name = this.tempNumberClassifier.generateBinLabel(column);
				this.output.requestObjectCopy(name, this.tempNumberClassifier);
			}
			
			// trigger callbacks now because we're done updating the output
			this.asyncResultCallbacks.triggerCallbacks();
		}
		
		// reusable temporary object
		private tempNumberClassifier:NumberClassifier = Weave.disposableChild(this, NumberClassifier);
	}
}
