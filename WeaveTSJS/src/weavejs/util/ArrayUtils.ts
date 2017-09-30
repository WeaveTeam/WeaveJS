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
	/**
	 * This class contains static functions that manipulate Arrays.
	 * 
	 * @author adufilie
	 */
	export class ArrayUtils
	{
		private static map_primitive_lookup = new Map<any, any>();
		private static map_object_lookup= new WeakMap<any, any>();
		private static _lookupId:int = 0;
		private static _getLookup(key:any):any
		{
			var lookup = key === null || typeof key !== 'object' ? ArrayUtils.map_primitive_lookup : ArrayUtils.map_object_lookup;
			return lookup.get(key);
		}
		private static _setLookup(key:any, value:any):void
		{
			var lookup = key === null || typeof key !== 'object' ? ArrayUtils.map_primitive_lookup : ArrayUtils.map_object_lookup;
			lookup.set(key, value);
		}
		
		/**
		 * Computes the union of the items in a list of Arrays. Can also be used to get a list of unique items in an Array.
		 * @param arrays A list of Arrays.
		 * @return The union of all the unique items in the Arrays in the order they appear.
		 */
		public static union<T>(...arrays:T[][]):T[]
		{
			var result:T[] = [];
			ArrayUtils._lookupId++;
			for (var array of arrays || [])
			{
				for (var item of array || [])
				{
					if (ArrayUtils._getLookup(item) !== ArrayUtils._lookupId)
					{
            ArrayUtils._setLookup(item, ArrayUtils._lookupId);
						result.push(item);
					}
				}
			}
			return result;
		}
		
		
		/**
		 * Computes the intersection of the items in a list of two or more Arrays.
		 * @return The intersection of the items appearing in all Arrays, in the order that they appear in the first Array.
		 */
		public static intersection<T>(firstArray:T[], secondArray:T[], ...moreArrays:T[][]):T[]
		{
			moreArrays.unshift(secondArray);
			
			var result:T[] = [];
			var item:T;
			var lastArray:T[] = moreArrays.pop();

			ArrayUtils._lookupId++;
			for (item of lastArray || [])
				ArrayUtils._setLookup(item, ArrayUtils._lookupId);
			
			for (var array of moreArrays || [])
			{
				for (item of array || [])
					if (ArrayUtils._getLookup(item) === ArrayUtils._lookupId)
						ArrayUtils._setLookup(item, ArrayUtils._lookupId + 1);
				ArrayUtils._lookupId++;
			}
			
			for (item of firstArray || [])
				if (ArrayUtils._getLookup(item) === ArrayUtils._lookupId)
					result.push(item);
			
			return result;
		}
		
		/**
		 * Removes items from an Array.
		 * @param array An Array of items.
		 * @param itemsToRemove An Array of items to skip when making a copy of the array.
		 * @return A new Array containing the items from the original array except those that appear in itemsToRemove.
		 */
		public static subtract<T>(array:T[], itemsToRemove:T[]):T[]
		{
			var item:T;
			ArrayUtils._lookupId++;
			for (item of itemsToRemove || [])
				ArrayUtils._setLookup(item, ArrayUtils._lookupId);
			var result:T[] = [];
			var i:int = 0;
			for (item of array || [])
				if (ArrayUtils._getLookup(item) !== ArrayUtils._lookupId)
					result[i++] = item;
			return result;
		}
		
		/**
		 * This function copies the contents of the source to the destination.
		 * Either parameter may be either an Array.
		 * @param source An Array-like object.
		 * @param destination An Array.
		 * @return A pointer to the destination Array
		 */
		public static copy<T>(source:T[], destination:T[] = null):T[]
		{
			if (!destination)
				destination = [];
			destination.length = source.length;
			for (var i in source)
				destination[i] = (source as T[])[i];
			return destination;
		}
		/**
		 * Fills an Object with the keys from an Array.
		 */
		public static fillKeys(output:{[key:string]:boolean}, keys:string[]):void
		{
			for (var key of keys || [])
				output[key] = true;
		}

        /** 
         * If there are any properties of the Object, return false; else, return true.
         * @param hashMap The Object to test for emptiness.
         * @return A boolean which is true if the Object is empty, false if it has at least one property.
         */
        public static isEmpty(object:{[key:string]:any}):boolean
        {
            for (var key in object)
                return false;
            return true;
        }
		
		/**
		 * Efficiently removes duplicate adjacent items in a pre-sorted Array.
		 * @param sorted The sorted Array
		 */
		public static removeDuplicatesFromSortedArray(sorted:any[]):void
		{
			var n:int = sorted.length;
			if (n == 0)
				return;
			var write:int = 0;
			var prev:any = sorted[0] === undefined ? null : undefined;
			for (var read:int = 0; read < n; ++read)
			{
				var item:any = sorted[read];
				if (item !== prev)
					sorted[write++] = prev = item;
			}
			sorted.length = write;
		}
		/**
		 * randomizes the order of the elements in the Array in O(n) time by modifying the given array.
		 * @param array the array to randomize
		 */
		public static randomSort(array:any[]):void
		{
			var i:int = array.length;
			while (i)
			{
				// randomly choose index j
				var j:int = Math.floor(Math.random() * i--);
				// swap elements i and j
				var temp:any = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
		}
		
		/**
		 * See http://en.wikipedia.org/wiki/Quick_select#Partition-based_general_selection_algorithm
		 * @param list An Array to be re-organized
		 * @param firstIndex The index of the first element in the list to partition.
		 * @param lastIndex The index of the last element in the list to partition.
		 * @param pivotIndex The index of an element to use as a pivot when partitioning.
		 * @param compareFunction A function that takes two array elements a,b and returns -1 if a&lt;b, 1 if a&gt;b, or 0 if a==b.
		 * @return The index the pivot element was moved to during the execution of the function.
		 */
		private static partition<T>(list:T[], firstIndex:int, lastIndex:int, pivotIndex:int, compareFunction:(a:T, b:T)=>int):int
		{
			var temp:any;
			var pivotValue:any = list[pivotIndex];
			// Move pivot to end
			temp = list[pivotIndex];
			list[pivotIndex] = list[lastIndex];
			list[lastIndex] = temp;
			
			var storeIndex:int = firstIndex;
			for (var i:int = firstIndex; i < lastIndex; i++)
			{
				if (compareFunction(list[i], pivotValue) < 0)
				{
					if (storeIndex != i)
					{
						// swap elements at storeIndex and i
						temp = list[storeIndex];
						list[storeIndex] = list[i];
						list[i] = temp;
					}
					
					storeIndex++;
				}
			}
			if (storeIndex != lastIndex)
			{
				// Move pivot to its final place
				temp = list[storeIndex];
				list[storeIndex] = list[lastIndex];
				list[lastIndex] = temp;
			}
			// everything to the left of storeIndex is < pivot element
			// everything to the right of storeIndex is >= pivot element
			return storeIndex;
		}
		
		//testPartition()
		private static testPartition():void
		{
			var list:int[] = [3,7,5,8,2];
			var pivotIndex:int = ArrayUtils.partition(list, 0, list.length - 1, list.length/2, StandardLib.compare);
			
			for (var i:int = 0; i < list.length; i++)
				if (i < pivotIndex != list[i] < list[pivotIndex])
					throw new Error('assertion fail');
		}
		
		/**
		 * See http://en.wikipedia.org/wiki/Quick_select#Partition-based_general_selection_algorithm
		 * @param list An Array to be re-organized.
		 * @param compareFunction A function that takes two array elements a,b and returns -1 if a&lt;b, 1 if a&gt;b, or 0 if a==b.
		 * @param firstIndex The index of the first element in the list to calculate a median from.
		 * @param lastIndex The index of the last element in the list to calculate a median from.
		 * @return The index the median element.
		 */
		public static getMedianIndex<T>(list:T[], compareFunction:(a:T, b:T)=>int, firstIndex:int = 0, lastIndex:int = -1):int
		{
			var left:int = firstIndex;
			var right:int = (lastIndex >= 0) ? (lastIndex) : (list.length - 1);
			if (left >= right)
				return left;
			var medianIndex:int = int((left + right) / 2);
			while (true)
			{
				var pivotIndex:int = ArrayUtils.partition(list, left, right, int((left + right) / 2), compareFunction);
				if (medianIndex == pivotIndex)
					break;
				if (medianIndex < pivotIndex)
					right = pivotIndex - 1;
				else
					left = pivotIndex + 1;
			}
			return medianIndex;
		}

		/**
		 * Merges two previously-sorted arrays.
		 * @param sortedInputA The first sorted array.
		 * @param sortedInputB The second sorted array.
		 * @param mergedOutput An array to store the merged arrays.
		 * @param comparator A function that takes two parameters and returns -1 if the first parameter is less than the second, 0 if equal, or 1 if the first is greater than the second.
		 */		
		public static mergeSorted<T>(sortedInputA:T[], sortedInputB:T[], mergedOutput:T[], comparator:(a:T, b:T)=>number):void
		{
			var indexA:int = 0;
			var indexB:int = 0;
			var indexOut:int = 0;
			var lengthA:int = sortedInputA.length;
			var lengthB:int = sortedInputB.length;
			while (indexA < lengthA && indexB < lengthB)
				if (comparator(sortedInputA[indexA], sortedInputB[indexB]) < 0)
					mergedOutput[indexOut++] = sortedInputA[indexA++];
				else
					mergedOutput[indexOut++] = sortedInputB[indexB++];
			
			while (indexA < lengthA)
				mergedOutput[indexOut++] = sortedInputA[indexA++];
			
			while (indexB < lengthB)
				mergedOutput[indexOut++] = sortedInputB[indexB++];

			mergedOutput.length = indexOut;
		}

		/**
		 * This will flatten an Array of Arrays into a flat Array.
		 * Items will be appended to the destination Array.
		 * @param source A multi-dimensional Array to flatten.
		 * @param destination An Array to append items to.  If none specified, a new one will be created.
		 * @return The destination Array with all the nested items in the source appended to it.
		 */
		public static flatten<T>(source:T[]|T, destination:T[] = null):T[]
		{
			if (destination == null)
				destination = [];
			if (source == null)
				return destination;

			for (var i:int = 0; i < (source as T[]).length; i++)
				if (Weave.IS((source as T[])[i], Array))
					ArrayUtils.flatten((source as T[])[i], destination);
				else
					destination.push((source as T[])[i]);
			return destination;
		}
		
		public static flattenObject(input:{[key:string]:any}, output:{[key:string]:any} = null, prefix:string = ''):{[key:string]:any}
		{
			if (output == null)
				output = {};
			if (input == null)
				return output;
			
			for (var key in input)
				if (typeof input[key] == 'object')
					ArrayUtils.flattenObject(input[key], output, prefix + key + '.');
				else
					output[prefix + key] = input[key];
			return output;
		}
		
		/**
		 * This will take an Array of Arrays of String items and produce a single list of String-joined items.
		 * @param arrayOfArrays An Array of Arrays of String items.
		 * @param separator The separator String used between joined items.
		 * @param includeEmptyItems Set this to true to include empty-strings and undefined items in the nested Arrays.
		 * @return An Array of String-joined items in the same order they appear in the nested Arrays.
		 */
		public static joinItems(arrayOfArrays:string[][], separator:string, includeEmptyItems:boolean):string[]
		{
			var maxLength:int = 0;
			for (var itemList of arrayOfArrays || [])
				maxLength = Math.max(maxLength, itemList.length);
			
			var result:string[] = [];
			for (var itemIndex:int = 0; itemIndex < maxLength; itemIndex++)
			{
				var joinedItem:string[] = [];
				for (var listIndex:int = 0; listIndex < arrayOfArrays.length; listIndex++)
				{
					itemList = Weave.AS(arrayOfArrays[listIndex], Array);
					var item:string = '';
					if (itemList && itemIndex < itemList.length)
						item = itemList[itemIndex] || '';
					if (item || includeEmptyItems)
						joinedItem.push(item);
				}
				result.push(joinedItem.join(separator));
			}
			return result;
		}
		
		/**
		 * Performs a binary search on a sorted array with no duplicate values.
		 * @param sortedUniqueValues Array of Numbers or Strings
		 * @param compare A compare function
		 * @param exactMatchOnly If true, searches for exact match. If false, searches for insertion point.
		 * @return The index of the matching value or insertion point.
		 */
		public static binarySearch<T>(sortedUniqueValues:T[], item:T, exactMatchOnly:boolean, compare:(a:T,b:T)=>number = null):int
		{
			var i:int = 0,
				imin:int = 0,
				imax:int = sortedUniqueValues.length - 1;
			while (imin <= imax)
			{
				i = int((imin + imax) / 2);
				var a:T = sortedUniqueValues[i];
				
				var c:int = compare != null ? compare(item, a) : (item < a ? -1 : (item > a ? 1 : 0));
				if (c < 0)
					imax = i - 1;
				else if (c > 0)
					imin = ++i; // set i for possible insertion point
				else
					return i;
			}
			return exactMatchOnly ? -1 : i;
		}
		
		/**
		 * Creates an object from arrays of keys and values.
		 * @param keys Keys corresponding to the values.
		 * @param values Values corresponding to the keys.
		 * @return A new Object.
		 */
		public static zipObject<T>(keys:string[], values:T[]):{[key:string]:T}
		{
			var n:int = Math.min(keys.length, values.length);
			var o:{[key:string]:T} = {};
			for (var i:int = 0; i < n; i++)
				o[keys[i]] = values[i];
			return o;
		}
		
		/**
		 * This will get a subset of properties/items/attributes from an Object/Array/XML.
		 * @param object An Object/Array containing properties/items to retrieve.
		 * @param keys A list of property names, index values.
		 * @param output Optionally specifies where to store the resulting items.
		 * @return An Object (or Array) containing the properties/items/attributes specified by keysOrIndices.
		 */
		public static getItems(object:any, keys:string[], output:any = null):any
		{
			if (!output)
				output = Weave.IS(object, Array) ? [] : {};
			if (!object)
				return output;
			
			var keyIndex:any,
				keyValue:any,
				item:any;
			
			for (keyIndex in keys)
			{
				keyValue = keys[keyIndex];
				
				item = object[keyValue];
				
				if (Weave.IS(output, Array))
					output[keyIndex] = item;
				else
					output[keyValue] = item;
			}
			if (Weave.IS(output, Array))
				(output as any[]).length = keys ? keys.length : 0;
			
			return output;
		}
		
		/**
		 * Compares a list of properties in two objects
		 * @param object1 The first object
		 * @param object2 The second object
		 * @param propertyNames A list of names of properties to compare
		 * @return -1, 0, or 1
		 */
		public static compareProperties(object1:{[key:string]:any}, object2:{[key:string]:any}, propertyNames:string[]):int
		{
			for (var name of propertyNames || [])
			{
				var result:int = StandardLib.compare(object1[name], object2[name]);
				if (result)
					return result;
			}
			return 0;
		}
		
		/**
		 * Removes items from an Array.
		 * @param array Array
		 * @param indices Array of numerically sorted indices to remove
		 */
		public static removeByIndex(array:any[], indices:int[]):void
		{
			var n:int = array.length;
			var skipList:any[] = ArrayUtils.union(indices);
			var iSkip:int = 0;
			var skip:int = skipList[0];
			var write:int = skip;
			for (var read:int = skip; read < n; ++read)
			{
				if (read == skip)
					skip = skipList[++iSkip];
				else
					array[write++] = array[read];
			}
			array.length = write;
		}
		
		/**
		 * Gets a list of values of a property from a list of objects.
		 * @param array An Array of Objects.
		 * @param property The property name to get from each object
		 * @return A list of the values of the specified property for each object in the original list.
		 */
		public static pluck(array:any[], property:string):any[]
		{
			ArrayUtils._pluckProperty = property;
			return array.map(ArrayUtils._pluck);
		}
		private static _pluckProperty:string;
		private static _pluck(item:{[key:string]:any}, i:int):any
		{
			return item != null ? item[ArrayUtils._pluckProperty] : undefined;
		}
		
		/**
		 * Transposes a two-dimensional table.
		 */
		public static transpose<T>(table:T[][]):T[][]
		{
			var result:T[][] = [];
			for (var iCol:int = 0; iCol < table.length; iCol++)
			{
				var col:T[] = table[iCol];
				for (var iRow:int = 0; iRow < col.length; iRow++)
				{
					var row:T[] = result[iRow] || (result[iRow] = []);
					row[iCol] = col[iRow];
				}
			}
			return result;
		}
		
		/**
		 * Creates a lookup from item (or item property) to index. Does not consider duplicate items (or duplicate item property values).
		 * @param array An Array or Object
		 * @param propertyChain A property name or chain of property names to index on rather than the item itself.
		 * @return A reverse lookup Map.
		 */
		public static createLookup(array:any, ...propertyChain:string[]):Map<any,string>
		{
			var lookup:Map<any, string> = new Map<any, string>();
			for (var key in array)
			{
				var value:any = array[key];
				for (var prop of propertyChain || [])
					value = value[prop];
				lookup.set(value, key);
			}
			return lookup;
		}
	}
}
