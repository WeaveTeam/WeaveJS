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
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataTypes = weavejs.api.data.DataTypes;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import StandardLib = weavejs.util.StandardLib;
	import IBinningDefinition = weavejs.api.data.IBinningDefinition;
	
	/**
	 * Divides a data range into a number of equally spaced bins.
	 * 
	 * @author adufilie
	 * @author abaumann
	 */
	@Weave.classInfo({id: "weavejs.data.bin.SimpleBinningDefinition", interfaces: [IBinningDefinition]})
	export class SimpleBinningDefinition extends AbstractBinningDefinition
	{
		constructor()
		{
			super(true, true);
		}
		
		/**
		 * The number of bins to generate when calling deriveExplicitBinningDefinition().
		 */
		public /* readonly */ numberOfBins:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(5));

		/**
		 * From this simple definition, derive an explicit definition.
		 */
		/* override */ public generateBinClassifiersForColumn(column:IAttributeColumn):void
		{
			var name:string;
			// clear any existing bin classifiers
			this.output.removeAllObjects();
			
			var integerValuesOnly:boolean = false;
			var nonWrapperColumn:IAttributeColumn = ColumnUtils.hack_findNonWrapperColumn(column);
			if (nonWrapperColumn)
			{
				var dataType:string = nonWrapperColumn.getMetadata(ColumnMetadata.DATA_TYPE);
				if (dataType && dataType != DataTypes.NUMBER)
					integerValuesOnly = true;
			}
			var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
			var dataMin:number = isFinite(this.overrideInputMin.value) ? this.overrideInputMin.value : stats.getMin();
			var dataMax:number = isFinite(this.overrideInputMax.value) ? this.overrideInputMax.value : stats.getMax();

			// stop if there is no data
			if (isNaN(dataMin))
			{
				this.asyncResultCallbacks.triggerCallbacks();
				return;
			}
		
			var binMin:number;
			var binMax:number = dataMin;
			var maxInclusive:boolean;
			
			for (var iBin:int = 0; iBin < this.numberOfBins.value; iBin++)
			{
				if (integerValuesOnly)
				{
					maxInclusive = true;
					if (iBin == 0)
						binMin = dataMin;
					else
						binMin = binMax + 1;
					if (iBin == this.numberOfBins.value - 1)
						binMax = dataMax;
					else
						binMax = Math.floor(dataMin + (iBin + 1) * (dataMax - dataMin) / this.numberOfBins.value);
					// skip empty bins
					if (binMin > binMax)
						continue;
				}
				else
				{
					// classifiers use min <= value < max,
					// except for the final one, which uses min <= value <= max
					binMin = binMax;
					if (iBin == this.numberOfBins.value - 1)
					{
						binMax = dataMax;
						maxInclusive = true;
					}
					else
					{
						maxInclusive = false;
						binMax = dataMin + (iBin + 1) * (dataMax - dataMin) / this.numberOfBins.value;
						// TEMPORARY SOLUTION -- round bin boundaries
						binMax = StandardLib.roundSignificant(binMax, 4);
					}
					
					// TEMPORARY SOLUTION -- round bin boundaries
					if (iBin > 0)
						binMin = StandardLib.roundSignificant(binMin, 4);
	
					// skip bins with no values
					if (binMin == binMax && !maxInclusive)
						continue;
				}
				this.tempNumberClassifier.min.value = binMin;
				this.tempNumberClassifier.max.value = binMax;
				this.tempNumberClassifier.minInclusive.value = true;
				this.tempNumberClassifier.maxInclusive.value = maxInclusive;
				
				//first get name from overrideBinNames
				name = this.getOverrideNames()[iBin];
				//if it is empty string set it from generateBinLabel
				if (!name)
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
