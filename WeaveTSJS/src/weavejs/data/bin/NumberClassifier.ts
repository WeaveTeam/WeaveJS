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
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataTypes = weavejs.api.data.DataTypes;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IBinClassifier = weavejs.api.data.IBinClassifier;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import StandardLib = weavejs.util.StandardLib;
	
	/**
	 * A classifier that uses min,max values for containment tests.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.bin.NumberClassifier", interfaces: [IBinClassifier]})
	export class NumberClassifier implements IBinClassifier
	{
		constructor(min:number = NaN, max:number = NaN, minInclusive:boolean = true, maxInclusive:boolean= true)
		{
			this._callbacks = Weave.getCallbacks(this);
			this.min.value = min;
			this.max.value = max;
			this.minInclusive.value = minInclusive;
			this.maxInclusive.value = maxInclusive;
		}

		/**
		 * These values define the bounds of the continuous range contained in this classifier.
		 */
		public /* readonly */ min:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		public /* readonly */ max:LinkableNumber = Weave.linkableChild(this, LinkableNumber);

		/**
		 * This value is the result of contains(value) when value == min.
		 */
		public /* readonly */ minInclusive:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);
		/**
		 * This value is the result of contains(value) when value == max.
		 */
		public /* readonly */ maxInclusive:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);

		// private variables for holding session state, used for speed
		private _callbacks:ICallbackCollection;
		private _triggerCount:uint = 0;
		private _min:number;
		private _max:number;
		private _minInclusive:boolean;
		private _maxInclusive:boolean;

		/**
		 * contains
		 * @param value A value to test.
		 * @return true If this IBinClassifier contains the given value.
		 */
		public contains(value:any):boolean
		{
			// validate private variables before trying to use them
			if (this._triggerCount != this._callbacks.triggerCounter)
			{
				this._min = this.min.value;
				this._max = this.max.value;
				this._minInclusive = this.minInclusive.value;
				this._maxInclusive = this.maxInclusive.value;
				this._triggerCount = this._callbacks.triggerCounter;
			}
			// use private variables for speed
			if (this._minInclusive ? value >= this._min : value > this._min)
				if (this._maxInclusive ? value <= this._max : value < this._max)
					return true;
			return false;
		}
		
		/**
		 * @param toStringColumn The primitive column to use that provides a number-to-string conversion function.
		 * @return A generated label for this NumberClassifier.
		 */
		public generateBinLabel(toStringColumn:IAttributeColumn = null):string
		{
			var minStr:string = null;
			var maxStr:string = null;
			
			// get labels from column
			minStr = ColumnUtils.deriveStringFromNumber(toStringColumn, this.min.value) || '';
			maxStr = ColumnUtils.deriveStringFromNumber(toStringColumn, this.max.value) || '';
			
			// if the column produced no labels, use default number formatting
			if (!minStr && !maxStr)
			{
				minStr = StandardLib.formatNumber(this.min.value);
				maxStr = StandardLib.formatNumber(this.max.value);
			}
			
			// if both labels are the same, return the label
			if (minStr && maxStr && minStr == maxStr)
				return minStr;
			
			// if the column dataType is string, put quotes around the labels
			if (toStringColumn && toStringColumn.getMetadata(ColumnMetadata.DATA_TYPE) == DataTypes.STRING)
			{
				minStr = Weave.lang('"{0}"', minStr);
				maxStr = Weave.lang('"{0}"', maxStr);
			}
			else
			{
				if (!this.minInclusive.value)
					minStr = Weave.lang("> {0}", minStr);
				if (!this.maxInclusive.value)
					maxStr = Weave.lang("< {0}", maxStr);
			}

			if (minStr == '')
				minStr = Weave.lang('Undefined');
			if (maxStr == '')
				maxStr = Weave.lang('Undefined');
			
			return Weave.lang("{0} to {1}", minStr, maxStr);
		}
		
		public toString():string
		{
			return (this.minInclusive.value ? '[' : '(')
				+ this.min.value + ', ' + this.max.value
				+ (this.maxInclusive.value ? ']' : ')');
		}
	}
}
