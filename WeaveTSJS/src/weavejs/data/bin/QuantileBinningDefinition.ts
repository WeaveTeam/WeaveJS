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
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import AsyncSort = weavejs.util.AsyncSort;
	import IBinningDefinition = weavejs.api.data.IBinningDefinition;
	
	/**
	 * QuantileBinningDefinition
	 * 
	 * @author adufilie
	 * @author abaumann
	 * @author sanbalagan
	 */
	@Weave.classInfo({id: "weavejs.data.bin.QuantileBinningDefinition", interfaces: [IBinningDefinition]})
	export class QuantileBinningDefinition extends AbstractBinningDefinition
	{
		constructor()
		{
			super(true, false);
		}
		
		public /* readonly */ refQuantile:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(.3));
		
		/**
		 * getBinClassifiersForColumn - implements IBinningDefinition Interface
		 * @param column 
		 * @param output
		 */
		/* override */ public generateBinClassifiersForColumn(column:IAttributeColumn):void
		{
			var name:string;
			// clear any existing bin classifiers
			this.output.removeAllObjects();
			
			var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
			var sortedColumn:number[] = this.getSortedColumn(column);
			var binMin:number;
			var binMax:number = sortedColumn[0];
			var maxInclusive:boolean;
			
			var recordCount:int = stats.getCount();
			var refBinSize:number = Math.ceil(recordCount * this.refQuantile.value);//how many records in a bin
			if (!refBinSize)
				refBinSize = recordCount;
			var numberOfBins:int = Math.ceil(recordCount / refBinSize);
			var binRecordCount:uint = refBinSize;
			
			for (var iBin:int = 0; iBin < numberOfBins; iBin++)
			{
				binRecordCount = (iBin + 1) * refBinSize;
				binMin = binMax;
				if (iBin == numberOfBins - 1)
				{
					binMax = sortedColumn[sortedColumn.length -1];
					maxInclusive = true;
				}
				else
				{
					binMax = sortedColumn[binRecordCount -1];
					maxInclusive = binMax == binMin;
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
		
		//variables for getSortedColumn method
		
		/**
		 * getSortedColumn 
		 * @param column 
		 * @return _sortedColumn array 
		 */
		private getSortedColumn(column:IAttributeColumn):number[]
		{
			var keys:IQualifiedKey[] = column ? column.keys : [];
			var _sortedColumn:number[] = new Array(keys.length);
			var i:uint = 0;
			for (var key of keys)
			{
				var n:number = column.getValueFromKey(key,Number);
				if (isFinite(n))
					_sortedColumn[i++] = n;
			}
			_sortedColumn.length = i;
			AsyncSort.sortImmediately(_sortedColumn);
			return _sortedColumn;
		}
	}
}
