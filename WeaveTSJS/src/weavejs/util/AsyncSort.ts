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

namespace weavejs.util
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import DebugUtils = weavejs.util.DebugUtils;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	
	/**
	 * Asynchronous merge sort.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.util.AsyncSort"})
	export class AsyncSort<T> implements ILinkableObject
	{
		public static debug:boolean = false;
		
		private static _immediateSorter:AsyncSort<any>; // used by sortImmediately()
		
		/**
		 * This function will sort an Array (or Vector) immediately.
		 * @param array An Array (or Vector) to sort in place.
		 * @param compareFunction The function used to compare items in the array.
		 */
		public static sortImmediately<T>(array:T[], compareFunction:(a:T, b:T)=>int = null):void
		{
			if (!AsyncSort._immediateSorter)
			{
				AsyncSort._immediateSorter = new AsyncSort<T>();
				AsyncSort._immediateSorter._immediately = true;
			}
			
			// temporarily set _immediateSorter to null in case sortImmediately is called recursively.
			var sorter:AsyncSort<T> = AsyncSort._immediateSorter;
			AsyncSort._immediateSorter = null;
			
			sorter.beginSort(array, compareFunction);

			AsyncSort._immediateSorter = sorter;
		}
		
		/**
		 * This function is a wrapper for StandardLib.stringCompare(a, b, true) (case-insensitive String compare).
		 */		
		public static compareCaseInsensitive(a:string, b:string):int
		{
			return StandardLib.stringCompare(a, b, true);
		}
		
		/**
		 * Compares two primitive values.
		 * This function is faster than StandardLib.compare(), but does not do deep object compare.
		 */
		public static primitiveCompare(a:any, b:any):int
		{
			if (a === b)
				return 0;
			if (a == null)
				return 1;
			if (b == null)
				return -1;
			var typeA:string = typeof(a);
			var typeB:string = typeof(b);
			if (typeA != typeB)
				return StandardLib.stringCompare(typeA, typeB);
			if (typeA == 'boolean')
				return StandardLib.numericCompare(Number(a), Number(b));
			if (typeA == 'number')
				return StandardLib.numericCompare(a as number, b as number);
			if (typeA == 'string')
				return StandardLib.stringCompare(a as string, b as string);
			if (Weave.IS(a, Date) && Weave.IS(b, Date))
				return StandardLib.dateCompare(a as Date, b as Date);
			return 1; // not equal
		}
		
		/**
		 * This is the sorted Array (or Vector), or null if the sort operation has not completed yet.
		 */
		public get result():T[]
		{
			return this.source ? null : this.original;
		}
		
		private original:T[]; // original array
		private source:T[]; // contains sub-arrays currently being merged
		private destination:T[]; // buffer to store merged sub-arrays
		private compare:(a:T, b:T)=>int; // compares two array items
		private length:uint; // length of original array
		private subArraySize:uint; // size of sub-array
		private middle:uint; // end of left and start of right sub-array
		private end:uint; // end of right sub-array
		private iLeft:uint; // left sub-array source index
		private iRight:uint; // right sub-array source index
		private iMerged:uint; // merged destination index
		private elapsed:int; // keeps track of elapsed time inside iterate()
		private _immediately:boolean = false; // set in sortImmediately(), checked in beginSort()
		
		/**
		 * This will begin an asynchronous sorting operation on the specified Array (or Vector).
		 * Only one sort operation can be carried out at a time.
		 * Callbacks will be triggered when the sorting operation completes.
		 * The given Array (or Vector) will be modified in-place.
		 * @param arrayToSort The Array (or Vector) to sort.
		 * @param compareFunction A function that compares two items and returns -1, 0, or 1.
		 * @see mx.utils.StandardLib#compare()
		 */
		public beginSort(arrayToSort:T[], compareFunction:(a:T, b:T)=>int = null):void
		{
			// initialize
			this.compare = compareFunction || AsyncSort.primitiveCompare;
			this.original = arrayToSort || [];
			this.source = this.original;
			length = this.original.length;
			
			// make a buffer of the same type and length
			var Type:Class<T[]> = (this.source as any).constructor;
			this.destination = new Type();
			this.destination.length = length;
			
			this.subArraySize = 1;
			this.iLeft = 0;
			this.iRight = 0;
			this.middle = 0;
			this.end = 0;
			this.elapsed = 0;
			
			if (this._immediately)
			{
				this.iterate(Number.MAX_VALUE);
				this.done();
			}
			else
			{
				// high priority because many things cannot continue without sorting results or must be recalculated when sorting finishes
				WeaveAPI.Scheduler.startTask(this, this.iterate, WeaveAPI.TASK_PRIORITY_HIGH, this.done, Weave.lang("Sorting {0} items", this.original.length));
			}
		}
		
		/**
		 * Aborts the current async sort operation.
		 */
		public abort():void
		{
			this.compare = null;
			this.source = this.original = this.destination = null;
			this.length = this.subArraySize = this.iLeft = this.iRight = this.middle = this.end = this.elapsed = 0;
		}
		
		private iterate=(stopTime:int):number=>
		{
			var time:int = Date.now();
			
			while (Date.now() < stopTime)
			{
				if (this.iLeft < this.middle) // if there are still more items in the left sub-array
				{
					// copy smallest value to merge destination
					if (this.iRight < this.end && this.compare(this.source[this.iRight], this.source[this.iLeft]) < 0)
						this.destination[this.iMerged++] = this.source[this.iRight++];
					else
						this.destination[this.iMerged++] = this.source[this.iLeft++];
				}
				else if (this.iRight < this.end) // if there are still more items in the right sub-array
				{
					this.destination[this.iMerged++] = this.source[this.iRight++];
				}
				else if (this.end < this.length) // if there are still more pairs of sub-arrays to merge
				{
					// begin merging the next pair of sub-arrays
					var start:uint = this.end;
					this.middle = Math.min(start + this.subArraySize, this.length);
					this.end = Math.min(this.middle + this.subArraySize, length);
					this.iLeft = start;
					this.iRight = this.middle;
					this.iMerged = start;
				}
				else // done merging all pairs of sub-arrays
				{
					// use the merged destination as the next source
					var merged:T[] = this.destination;
					this.destination = this.source;
					this.source = merged;
					
					// start merging sub-arrays of twice the previous size
					this.end = 0;
					this.subArraySize *= 2;
					
					// stop if the sub-array includes the entire array
					if (this.subArraySize >= length)
						break;
				}
			}
			
			this.elapsed += Date.now() - time;
			
			// if one sub-array includes the entire array, we're done
			if (this.subArraySize >= length)
				return 1; // done
			
			//TODO: improve progress calculation
			return this.subArraySize / length; // not exactly accurate, but returns a number < 1
		}
		
		private done=():void=>
		{
			// source array is completely sorted
			if (this.source != this.original) // if source isn't the original
			{
				// copy the sorted values to the original
				var i:int = this.length;
				while (i--)
					this.original[i] = this.source[i];
			}
			
			// clean up so the "get result()" function knows we're done
			this.source = null;
			this.destination = null;
			
			if (AsyncSort.debug && this.elapsed > 0)
				DebugUtils.debugTrace(this,this.result.length,'in',this.elapsed/1000,'seconds');
			
			if (!this._immediately)
				Weave.getCallbacks(this).triggerCallbacks();
		}
		
		/*************
		 ** Testing **
		 *************/
		
		/*
			Built-in sort is slower when using a compare function because it uses more comparisons.
			Array.sort 50 numbers; 0.002 seconds; 487 comparisons
			Merge Sort 50 numbers; 0.001 seconds; 208 comparisons
			Array.sort 3000 numbers; 0.304 seconds; 87367 comparisons
			Merge Sort 3000 numbers; 0.111 seconds; 25608 comparisons
			Array.sort 6000 numbers; 0.809 seconds; 226130 comparisons
			Merge Sort 6000 numbers; 0.275 seconds; 55387 comparisons
			Array.sort 12000 numbers; 1.969 seconds; 554380 comparisons
			Merge Sort 12000 numbers; 0.514 seconds; 119555 comparisons
			Array.sort 25000 numbers; 9.498 seconds; 2635394 comparisons
			Merge Sort 25000 numbers; 1.234 seconds; 274965 comparisons
			Array.sort 50000 numbers; 37.285 seconds; 10238787 comparisons
			Merge Sort 50000 numbers; 2.603 seconds; 585089 comparisons
		*/
		/*
			Built-in sort is faster when no compare function is given.
			Array.sort 50 numbers; 0 seconds
			Merge Sort 50 numbers; 0.001 seconds
			Array.sort 3000 numbers; 0.003 seconds
			Merge Sort 3000 numbers; 0.056 seconds
			Array.sort 6000 numbers; 0.006 seconds
			Merge Sort 6000 numbers; 0.123 seconds
			Array.sort 12000 numbers; 0.012 seconds
			Merge Sort 12000 numbers; 0.261 seconds
			Array.sort 25000 numbers; 0.026 seconds
			Merge Sort 25000 numbers; 0.599 seconds
			Array.sort 50000 numbers; 0.058 seconds
			Merge Sort 50000 numbers; 1.284 seconds
		*/
		private static _testArrays:(string|number)[][];
		private static _testArraysSortOn:{value: string|number}[][];
		private static _testType:int = -1;
		private static initTestArrays(testType:int):void
		{
			if (testType != AsyncSort._testType)
			{
				AsyncSort._testType = testType;
				AsyncSort._testArrays = [];
				AsyncSort._testArraysSortOn = [];
				for (var n of [0,1,2,3,4,5,50,3000,6000,12000,25000,50000])
				{
					var array:(string|number)[] = [];
					var arraySortOn:{value: string|number}[] = [];
					for (var i:int = 0; i < n; i++)
					{
						var value:string|number;
						if (testType == 0) // random integers
							value = uint(Math.random()*100);
						else if (testType == 1) // random integers and NaNs
							value = Math.random() < .5 ? NaN : uint(Math.random()*100);
						else if (testType == 2) // random strings
							value = 'a' + Math.random();

						array.push(value);
						arraySortOn.push({value: value});
					}
					AsyncSort._testArrays.push(array);
					AsyncSort._testArraysSortOn.push(arraySortOn);
				}
			}
			var desc:string = ['uint', 'uint and NaN', 'string'][testType];
			console.log("testType =", testType, '(' + desc + ')');
		}
		public static test(compare:(a:string|number, b:string|number)=>int, testType:int = 0):void
		{
			AsyncSort.initTestArrays(testType);
			AsyncSort._debugCompareFunction = compare;
			for (var _array of AsyncSort._testArrays || [])
			{
				var array1 = _array.concat();
				var array2 = _array.concat();

				var start:int = Date.now();
				AsyncSort._debugCompareCount = 0;
				if (compare === null)
					array1.sort(null);
				else if (Weave.IS(compare, Function))
					array1.sort(AsyncSort._debugCompareCounter);
				else
					array1.sort(compare);
				console.log('Array.sort', array1.length, 'numbers;', (Date.now() - start) / 1000, 'seconds;', AsyncSort._debugCompareCount ? (AsyncSort._debugCompareCount+' comparisons') : '');

				start = Date.now();
				AsyncSort._debugCompareCount = 0;
				AsyncSort.sortImmediately(array2, Weave.IS(compare, Function) ? AsyncSort._debugCompareCounter : null);
				//trace('Merge Sort', n, 'numbers;', _immediateSorter.elapsed / 1000, 'seconds;',_debugCompareCount,'comparisons');
				console.log('Merge Sort', array2.length, 'numbers;', (Date.now() - start) / 1000, 'seconds;', AsyncSort._debugCompareCount ? (AsyncSort._debugCompareCount+' comparisons') : '');

				if (array2.length == 1 && StandardLib.compare(array1[0],array2[0]) != 0)
					throw new Error("sort failed on array length 1");

				AsyncSort.verifyNumbersSorted(array2 as number[]);
			}
		}
		public static testSortOn(compare:(a:string|number, b:string|number)=>int, testType:int = 0):void
		{
			AsyncSort.initTestArrays(testType);
			AsyncSort._debugCompareFunction = AsyncSort.newSortOnCompare('value', compare || AsyncSort.primitiveCompare);
			for (var _array of AsyncSort._testArraysSortOn)
			{
				var array1 = _array.concat();
				var array2 = _array.concat();
				var array3 = _array.concat();
				var array4 = _array.concat();

				var start:int;

				/*
				start = Date.now();
				_debugCompareCount = 0;
				if (compare === null)
					array1.sortOn('value', 0);
				else if (compare is Function)
					array1.sortOn('value', _debugCompareCounter);
				else
					array1.sortOn('value', compare);
				trace('Array.sortOn', array1.length, 'numbers;', (Date.now() - start) / 1000, 'seconds;', _debugCompareCount ? (_debugCompareCount+' comparisons') : '');
				*/

				start = Date.now();
				AsyncSort._debugCompareCount = 0;
				var plucked:(string|number)[] = new Array(_array.length);
				var i:int = _array.length;
				while (i--)
					plucked[i] = _array[i]['value'];
				if (compare === null)
					plucked.sort(0 as any);
				else if (Weave.IS(compare, Function))
					plucked.sort(AsyncSort._debugCompareCounter);
				else
					plucked.sort(compare);
				console.log('Pluck & sort', plucked.length, 'numbers;', (Date.now() - start) / 1000, 'seconds;', AsyncSort._debugCompareCount ? (AsyncSort._debugCompareCount+' comparisons') : '');

				start = Date.now();
				AsyncSort._debugCompareCount = 0;
				StandardLib.sortOn(array3, 'value');
				console.log('StdLib sortOn', array3.length, 'numbers;', (Date.now() - start) / 1000, 'seconds;', AsyncSort._debugCompareCount ? (AsyncSort._debugCompareCount+' comparisons') : '');

				start = Date.now();
				AsyncSort._debugCompareCount = 0;
				StandardLib.sortOn(array4, ['value']);
				console.log('StdLib sortOn[]', array4.length, 'numbers;', (Date.now() - start) / 1000, 'seconds;', AsyncSort._debugCompareCount ? (AsyncSort._debugCompareCount+' comparisons') : '');

				start = Date.now();
				AsyncSort._debugCompareCount = 0;
				AsyncSort.sortImmediately(array2 as any[], AsyncSort._debugCompareCounter);
				//trace('Merge Sort', n, 'numbers;', _immediateSorter.elapsed / 1000, 'seconds;',_debugCompareCount,'comparisons');
				console.log('Merge SortOn', array2.length, 'numbers;', (Date.now() - start) / 1000, 'seconds;', AsyncSort._debugCompareCount ? (AsyncSort._debugCompareCount+' comparisons') : '');

				if (array2.length == 1 && StandardLib.compare(array1[0],array2[0]) != 0)
					throw new Error("sort failed on array length 1");

				AsyncSort.verifyNumbersSorted(array2 as any[]);
			}

		}
		private static newSortOnCompare<T>(prop:string, compare:(a:T, b:T)=>int):(a:T, b:T)=>int
		{
			return function(a:T, b:T):int { return compare((a as any)[prop], (b as any)[prop]); };
		}
		private static verifyNumbersSorted(array:number[]):void
		{
			for (var i:int = 1; i < array.length; i++)
			{
				if (StandardLib.numericCompare(array[i - 1], array[i]) > 0)
				{
					throw new Error("ASSERTION FAIL " + array[i - 1] + ' > ' + array[i]);
				}
			}
		}
		private static _debugCompareCount:int = 0;
		private static _debugCompareFunction:(a:string|number, b:string|number)=>int = null;
		private static _debugCompareCounter(a:string|number, b:string|number):int
		{
			AsyncSort._debugCompareCount++;
			return AsyncSort._debugCompareFunction(a, b);
		}
	}
}
