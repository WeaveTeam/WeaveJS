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

namespace weavejs.geom
{
	/**
	 * This class defines a 1-dimensional continuous range of values by begin and end values.
	 * The difference between the begin and end values can be either positive or negative.
	 * 
	 * @author adufilie
	 */
	export class NumericRange
	{
		constructor(begin:number = NaN, end:number = NaN)
		{
			this.begin = begin;
			this.end = end;
		}

		/**
		 * The begin and end values define the range of values covered by this Range object.
		 * The difference between begin and end can be either positive or negative.
		 */
		public begin:number;
		public end:number;

		/**
		 * @param value A number within this Range
		 * @return A number in the range [0,1]
		 */
		public normalize(value:number):number
		{
			if (value == this.end)
				return 1;
			return (value - this.begin) / (this.end - this.begin);
		}
		/**
		 * @param A number in the range [0,1]
		 * @return A number within this Range
		 */
		public denormalize(value:number):number
		{
			return this.begin + (this.end - this.begin) * value;
		}
		
		/**
		 * This is the minimum value of the range.
		 */
		public get min():number
		{
			return Math.min(this.begin, this.end);
		}
		/**
		 * This is the maximum value of the range.
		 */
		public get max():number
		{
			return Math.max(this.begin, this.end);
		}
		
		/**
		 * The coverage of a Range is defined by the positive distance
		 * from the min numeric value to the max numeric value.
		 */
		public get coverage():number
		{
			return Math.abs(this.end - this.begin);
		}

		/**
		 * @param begin The new begin value.
		 * @param end The new end value.
		 */
		public setRange(begin:number, end:number):void
		{
			this.begin = begin;
			this.end = end;
		}

		/**
		 * This will shift the begin and end values by a delta value.
		 */
		public offset(delta:number):void
		{
			this.begin += delta;
			this.end += delta;
		}		

		/**
		 * This function will constrain a value to be within this Range.
		 * @return A number contained in this Range.
		 */
		public constrain(value:number):number
		{
			if (this.begin < this.end)
				return Math.max(this.begin, Math.min(value, this.end));
			return Math.max(this.end, Math.min(value, this.begin));
		}

		/**
		 * @param value A number to check
		 * @return true if the given value is within this Range
		 */
		public contains(value:number):boolean
		{
			if (this.begin < this.end)
				return this.begin <= value && value <= this.end;
			return this.end <= value && value <= this.begin;
		}

		/**
		 * @param value A number to check
		 * @return -1 if value &lt; min, 1 if value &gt; max, 0 if min &lt;= value &lt;= max, or NaN otherwise
		 */
		public compare(value:number):number
		{
			var min:number = this.min;
			var max:number = this.max;
			if (value < min)
				return -1;
			if (value > max)
				return 1;
			if (min <= value && value <= max)
				return 0;
			return NaN;
		}

		/**
		 * This function will reposition another Range object
		 * such that one range will completely contain the other.
		 * @param rangeToConstrain The range to be repositioned.
		 * @param allowShrinking If set to true, the rangeToConstrain may be resized to fit within this range.
		 */
		public constrainRange(rangeToConstrain:NumericRange, allowShrinking:boolean = false):void
		{
			// don't constrain if this range is NaN
			if (isNaN(this.coverage))
				return;

			if (rangeToConstrain.coverage < this.coverage) // if rangeToConstrain can fit within this Range
			{
				// shift rangeToConstrain enough so it is contained within this Range.
				if (rangeToConstrain.min < this.min)
					rangeToConstrain.offset(this.min - rangeToConstrain.min);
				else if (rangeToConstrain.max > this.max)
					rangeToConstrain.offset(this.max - rangeToConstrain.max);
			}
			else if (allowShrinking)
			{
				// rangeToConstrain should be resized to fit within this Range.
				rangeToConstrain.setRange(this.begin, this.end);
			}
			else // rangeToConstrain has a larger coverage (does not fit within this Range)
			{
				// shift rangeToConstrain enough so it contains this Range
				if (rangeToConstrain.min > this.min)
					rangeToConstrain.offset(this.min - rangeToConstrain.min);
				else if (rangeToConstrain.max < this.max)
					rangeToConstrain.offset(this.max - rangeToConstrain.max);
			}
		}
		
		/**
		 * This function will expand the range as necessary to include the specified value.
		 * @param value The value to include in the range.
		 */		
		public includeInRange(value:number):void
		{
			if (this.end < this.begin)
			{
				if (value < this.end)
					this.end = value;
				if (value > this.begin)
					this.begin = value;
			}
			else // begin <= end)
			{
				if (value < this.begin)
					this.begin = value;
				if (value > this.end)
					this.end = value;
			}
		}
		
		public toString():string
		{
			return "["+this.begin.toFixed(2)+" to "+this.end.toFixed(2)+"]";
		}
	}
}
