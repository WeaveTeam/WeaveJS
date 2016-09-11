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
	import LinkableNumber = weavejs.core.LinkableNumber;
	import Scheduler = weavejs.core.Scheduler;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import SecondaryKeyNumColumn = weavejs.data.column.SecondaryKeyNumColumn;
	import ArrayUtils = weavejs.util.ArrayUtils;
	import AsyncSort = weavejs.util.AsyncSort;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	import IBinningDefinition = weavejs.api.data.IBinningDefinition;
	
	/**
	 * Implemented from https://gist.github.com/tmcw/4977508
	 * Also, read : http://macwright.org/2013/02/18/literate-jenks.html
	 * Other implementations from Doug Curl (javascript) and Daniel J Lewis (python implementation) and  Simon Georget (Geostats)
	 * http://www.arcgis.com/home/item.html?id=0b633ff2f40d412995b8be377211c47b
	 * http://danieljlewis.org/2010/06/07/jenks-natural-breaks-algorithm-in-python/
	 * https://github.com/simogeo/geostats/blob/master/lib/geostats.js
	 * http://danieljlewis.org/files/2010/06/Jenks.pdf
	 */
	@Weave.classInfo({id: "weavejs.data.bin.NaturalJenksBinningDefinition", interfaces: [IBinningDefinition]})
	export class NaturalJenksBinningDefinition extends AbstractBinningDefinition
	{
		constructor()
		{
			super(true, false);
		}
		
		public /* readonly */ numOfBins:LinkableNumber = Weave.linkableChild(this,new LinkableNumber(5));
		
		// reusable temporary object
		private _tempNumberClassifier:NumberClassifier = Weave.disposableChild(this, NumberClassifier);
		
		private _column:IAttributeColumn = null;
		private asyncSort:AsyncSort = Weave.disposableChild(this, AsyncSort);
		/* override */ public generateBinClassifiersForColumn(column:IAttributeColumn):void
		{
			this._column = column;
			if (column)
			{
				// BEGIN DIMENSION SLIDER HACK
				var nonWrapperColumn:IAttributeColumn = ColumnUtils.hack_findNonWrapperColumn(column);
				if (Weave.IS(nonWrapperColumn, SecondaryKeyNumColumn))
				{
					SecondaryKeyNumColumn.allKeysHack = true;
					var noChange:Boolean = (this._keys === nonWrapperColumn.keys);
					this._keys = nonWrapperColumn.keys;
					SecondaryKeyNumColumn.allKeysHack = false;
					// stop if we already did this
					if (noChange)
					{
						this.asyncResultCallbacks.triggerCallbacks();
						return;
					}
				}
				else
				// END DIMENSION SLIDER HACK
				{
					this._keys = column.keys.concat(); // make a copy so we know length won't change during async task
				}
			}
			else
			{
				this._keys = [];
			}
			
			this._sortedValues = new Array();
			this._numOfBins = this.numOfBins.value;
			this._keyCount = 0;
			this._previousSortedValues.length = 0;
			
			// clear any existing bin classifiers
			this.output.removeAllObjects();
			
			// stop any previous sort task by sorting an empty array
			this.asyncSort.beginSort(this._previousSortedValues);
			
			this._compoundIterateAll(-1); // reset compound task
			
			// high priority because not much can be done without data
			WeaveAPI.Scheduler.startTask(this.asyncResultCallbacks, this._compoundIterateAll, WeaveAPI.TASK_PRIORITY_HIGH, this._handleJenksBreaks.bind(this), Weave.lang("Computing Natural Breaks binning for {0} values", this._keys.length));
		}
		
		private _compoundIterateAll = Scheduler.generateCompoundIterativeTask(this._getValueFromKeys.bind(this), this._iterateSortedKeys.bind(this), this._iterateJenksBreaks.bind(this));
		private _numOfBins:int;
		private _keyCount:int = 0;
		private _keys:IQualifiedKey[] = [];
		private _getValueFromKeys(stopTime:int):number
		{
			var currValue:number;
			for (; this._keyCount < this._keys.length; this._keyCount++)
			{
				if (Date.now() > stopTime)
					return this._keyCount/this._keys.length;
				/*ignore NaN */
				currValue = this._column.getValueFromKey(this._keys[this._keyCount],Number);
				if (isFinite(currValue))
					this._sortedValues.push(currValue);
			}
			
			// begin sorting now
			this.asyncSort.beginSort(this._sortedValues, StandardLib.numericCompare);
			
			return 1;
		}
		
		// in the original implementation, these matrices are referred to
		// as `LC` and `OP`
		//
		// * lower_class_limits (LC): optimal lower class limits
		// * variance_combinations (OP): optimal variance combinations for all classes
		private _lower_class_limits:number[][] = [];
		private _variance_combinations:number[][] = [];
		
		private _iterateSortedKeys(returnTime:int):number
		{
			// wait for sort to complete
			if (this.asyncSort.result == null)
				return 0;
			
			// the code below runs only once - this function is not a proper iterative task
			
			ArrayUtils.copy(this._sortedValues,this._previousSortedValues);
			
			if(this._sortedValues.length == 0)
				return 1;
			
			this._lower_class_limits = [];
			this._variance_combinations = [];
			// Initialize and fill each matrix with zeroes
			for (var i:int = 0; i < this._sortedValues.length+1; i++)
			{
				var temp1:number[] = [];
				var temp2:number[] = [];
				// despite these arrays having the same values, we need
				// to keep them separate so that changing one does not change
				// the other
				for(var j:int =0; j < this._numOfBins+1; j++)
				{
					temp1.push(0);
					temp2.push(0);
				}
				this._lower_class_limits.push(temp1);
				this._variance_combinations.push(temp2);
			}
			
			for (var k:int =1; k <this._numOfBins + 1; k++)
			{
				this._lower_class_limits[1][k] = 1;
				this._variance_combinations[1][k] = 0;
				
				for (var t:int =2; t< this._sortedValues.length+1; t++)
				{
					this._variance_combinations[t][k] = Number.POSITIVE_INFINITY;
				}
			}
			
			this._variance = 0;
			this._count = 2;
			this._m = 0;

			return 1;
		}
		
		private _previousSortedValues:number[] = [];
		private _sortedValues:number[] = [];
		
		private _count:int = 2;
		private _m:number = 0;
		private _p:number = 2;
		
		// the variance, as computed at each step in the calculation
		private _variance:number = 0;
		
		// `SZ` originally. this is the sum of the values seen thus
		// far when calculating variance.
		private _sum:number = 0;
		
		// `ZSQ` originally. the sum of squares of values seen
		// thus far
		private _sum_squares:number = 0;
		// `WT` originally
		private _w:number = 0;
		
		
		private _iterateJenksBreaks(returnTime:int):number
		{
			// Compute the matrices required for Jenks breaks.
			for (; this._count < this._sortedValues.length + 1; this._count++)
			{
				if (this._m==0)
				{
					this._sum= 0;
					this._sum_squares= 0;
					this._w= 0;
					this._m =1;
				}
				for (; this._m < this._count + 1; this._m++)
				{
					if(JS.now()>returnTime)
					{
						return this._count/(this._sortedValues.length+1);
					}
					// `III` originally
					var lower_class_limit:number = this._count - this._m +1;
					var val:number = this._sortedValues[lower_class_limit-1];
					
					this._sum_squares += val * val;
					this._sum += val;
					
					// here we're estimating variance for each potential classing
					// of the data, for each potential number of classes. `w`
					// is the number of data points considered so far.
					this._w += 1;
					
					// the variance at this point in the sequence is the difference
					// between the sum of squares and the total x 2, over the number
					// of samples.					
					this._variance = this._sum_squares - (this._sum * this._sum) / this._w;
					
					var i4:number = lower_class_limit -1;
					if(i4 !=0)
					{
						this._p = 2;
						for (; this._p < this._numOfBins + 1; this._p++)
						{
							// if adding this element to an existing class
							// will increase its variance beyond the limit, break
							// the class at this point, setting the lower_class_limit
							// at this point.
							if((this._variance_combinations[this._count][this._p]) >= (this._variance + this._variance_combinations[i4][this._p-1]))
							{
								this._lower_class_limits[this._count][this._p] = lower_class_limit;
								this._variance_combinations[this._count][this._p] = this._variance + this._variance_combinations[i4][this._p-1];
							}
						}
					}
				}
				this._m = 0;
				this._lower_class_limits[this._count][1] = 1;
				this._variance_combinations[this._count][1] = this._variance;
			}
			return 1;
		}
		
		private _handleJenksBreaks():void
		{
			var k:int,
				value:number,
				data:number[] = this._sortedValues,
				kclass:number[] = [],
				countNum:int = 1;
			
			// don't attempt to generate more bins than there are distinct values
			value = data[0];
			for (k = 1; k < data.length; k++)
			{
				if (value != data[k])
				{
					value = data[k];
					countNum++;
					if (countNum >= this._numOfBins)
						break;
				}
			}
				
			// the calculation of classes will never include the upper and
			// lower bounds, so we need to explicitly set them
			kclass[countNum] = data[data.length - 1];
			kclass[0] = data[0];
			
			// the lower_class_limits matrix is used as indexes into itself
			// here: the `k` variable is reused in each iteration.
			k = data.length - 1;
			while (countNum > 1) {
				kclass[countNum - 1] = data[this._lower_class_limits[k][countNum] - 2];
				k = this._lower_class_limits[k][countNum] - 1;
				countNum--;
			}
			
			for (var iBin:int = 0; iBin < kclass.length - 1; iBin++)
			{
				var minIndex:number;
				if(iBin == 0)
				{
					minIndex = 0;
				}
				else
				{
					minIndex = this._previousSortedValues.lastIndexOf(kclass[iBin]);
					minIndex = minIndex +1;
				}
				
				this._tempNumberClassifier.min.value = this._previousSortedValues[minIndex];
				
				var maxIndex:number;
				if(iBin == this._numOfBins -1)
				{
					maxIndex = this._previousSortedValues.length -1;
				}
				else
				{
					/* Get the index of the next break */
					maxIndex = this._previousSortedValues.lastIndexOf(kclass[iBin+1]);
				}
				
				if(maxIndex == -1)
				{
					this._tempNumberClassifier.max.value = this._tempNumberClassifier.min.value;
				}
				else
				{
					this._tempNumberClassifier.max.value = this._previousSortedValues[maxIndex];
				}
				this._tempNumberClassifier.minInclusive.value = true;
				this._tempNumberClassifier.maxInclusive.value = true;
				
				if (this._tempNumberClassifier.min.value > this._tempNumberClassifier.max.value)
					continue;
				
				//first get name from overrideBinNames
				var name:string = this.getOverrideNames()[iBin];
				//if it is empty string set it from generateBinLabel
				if (!name)
					name = this._tempNumberClassifier.generateBinLabel(this._column);
				
				this.output.requestObjectCopy(name, this._tempNumberClassifier);
			}
			
			// trigger callbacks now because we're done updating the output
			this.asyncResultCallbacks.triggerCallbacks();
		}
		
		protected fixMinMaxInclusive():void
		{
			var a:NumberClassifier[] = this.output.getObjects(NumberClassifier);
			for (var i:int = 0; i < a.length; i++)
			{
				var nc1:NumberClassifier = a[i];
				var nc2:NumberClassifier = a[i+1];
				if (nc1 && nc2 && nc1.max.value == nc2.min.value)
					nc2.minInclusive.value = !(nc1.maxInclusive.value = (nc1.min.value == nc1.max.value || !nc1.minInclusive.value));
				var newName1:string = this.getOverrideNames()[i] || nc1.generateBinLabel(this._column);
				this.output.renameObject(this.output.getName(nc1), newName1);
			}
		}
		
		private getSumOfNumbers(list:number[]):number
		{
			var result:number = 0;
			try
			{
				for (var num of list || [])
				{
					result += num;
				}
			}
			catch(e)
			{
				console.error(e, "Error adding numbers in array");
				return 0;
			}
			
			return result;
		}
		
		/**
		 * Returns all the values from the column sorted in ascedning order.
		 * @param column An IattributeColumn with numeric values 
		 * */
		private  getSortedNumbersFromColumn(column:IAttributeColumn):number[]
		{
			var keys:IQualifiedKey[] = column ? column.keys : [];
			var sortedColumn:number[] = new Array(keys.length);
			for (var i:int = 0; i < keys.length; i++)
				sortedColumn[i] = Number(column.getValueFromKey(keys[i], Number));
			
			AsyncSort.sortImmediately(sortedColumn);
			return sortedColumn;
		}
		
		/* This function returns the Good Fit Value for the breaks. Not used but just in case*/
//		private function getGVF(column:IAttributeColumn):Number
//		{
//			var listMean:Number = getSumOfNumbers(_previousSortedValues);
//			
//			var SDAM:Number = 0;
//			var sqDev:Number = 0;
//			
//			for(var i:int =0; i < _previousSortedValues.length; i++)
//			{
//				sqDev = Math.pow((_previousSortedValues[i]- listMean), 2);
//				SDAM += sqDev;
//			}
//			
//			
//			var SDCM:Number = 0;
//			var preSDCM:Number;
//			var classStart:Number;
//			var classEnd:Number;
//			var classValues:Array;
//			var classMean:Number;
//			var sqDev2:Number;
//			
//			for(var j:int =0; j < numOfBins.value; j++)
//			{
//				if(_previousBreaks[j] ==0)
//				{
//					classStart = 0;
//				}
//				else
//				{
//					classStart = _previousSortedValues.indexOf(_previousBreaks[j]);
//					classStart += 1;
//				}
//				
//				classEnd = _previousSortedValues.indexOf(_previousBreaks[j+1]);
//				
//				classValues = _previousSortedValues.slice(classStart,classEnd);
//				
//				classMean = getSumOfNumbers(classValues)/classValues.length;
//				
//				for(var k:int =0; k < classValues.length; k++)
//				{
//					sqDev2 = Math.pow((classValues[k] - classMean),2);
//					preSDCM += sqDev2;
//				}
//				
//				SDCM += preSDCM;
//			}
//			
//			return (SDAM - SDCM)/SDAM;
//			
//		}
		
	}
}