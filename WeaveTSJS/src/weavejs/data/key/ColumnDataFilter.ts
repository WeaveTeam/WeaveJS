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

namespace weavejs.data.key
{
	import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import IKeyFilter = weavejs.api.data.IKeyFilter;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IObjectWithDescription = weavejs.api.ui.IObjectWithDescription;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import JS = weavejs.util.JS;

	@Weave.classInfo({id: "weavejs.data.key.ColumnDataFilter", interfaces: [IKeyFilter, ILinkableObjectWithNewProperties, IObjectWithDescription]})
	export class ColumnDataFilter implements IKeyFilter, ILinkableObjectWithNewProperties, IObjectWithDescription
	{
		public getDescription():string
		{
			return Weave.lang("Filter for {0}", ColumnUtils.getTitle(this.column));
		}
		
		public static /* readonly */ REGEXP:string = 'regexp';
		private static /* readonly */ ALTERNATE_REGEX_PROPERTY:string = 'regex';
		
		public /* readonly */ enabled = Weave.linkableChild(this, new LinkableBoolean(true), this._cacheVars);
		public /* readonly */ includeMissingKeyTypes = Weave.linkableChild(this, new LinkableBoolean(true), this._cacheVars);
		public /* readonly */ column = Weave.linkableChild(this, DynamicColumn, this._resetKeyLookup);
		
		/**
		 * An Array of Numbers, Strings and/or Range objects specifying numeric ranges.
		 * A Range object contains two properties: "min" and "max".
		 * Alternatively, you can specify "minInclusive" or "minExclusive" in place of "min"
		 * and "minInclusive" or "maxExclusive" in place of "max".
		 */
		public /* readonly */ values = Weave.linkableChild(this, new LinkableVariable(Array), this._resetKeyLookup);
		
		private _enabled:boolean;
		private _includeMissingKeyTypes:boolean;
		private _stringLookup = new Map<string, boolean>();
		private _numberLookup = new Map<number, boolean>();
		private _ranges:ColumnDataFilterRange[];
		private _regexps:RegExp[];
		private _keyType:string;
		private map_key = new WeakMap<IQualifiedKey, boolean>();
		
		/* ??? */
		private _cacheVars():void
		{
			this._enabled = this.enabled.value;
			this._includeMissingKeyTypes = this.includeMissingKeyTypes.value;
		}
		private _resetKeyLookup():void
		{
			var state = this.values.getSessionState() as (string|number|IRegExpState|IRangeState)[] || [];
			var range:ColumnDataFilterRange;
			var regexp:RegExp;
			
			this._keyType = this.column.getMetadata(ColumnMetadata.KEY_TYPE);
			this.map_key = new WeakMap<IQualifiedKey, boolean>();
			this._numberLookup.clear();
			this._stringLookup.clear();
			this._ranges = null;
			this._regexps = null;
			
			for (var value of state)
			{
				if (typeof value === typeof 0)
				{
					this._numberLookup.set(value as number, true);
				}
				else if (typeof value === typeof "")
				{
					this._stringLookup.set(value as string, true);
				}
				else if (ColumnDataFilterRange.isRange(value))
				{
					try
					{
						range = new ColumnDataFilterRange(value as IRangeState);
						if (!this._ranges)
							this._ranges = [];
						this._ranges.push(range);
					}
					catch (e)
					{
						// ignore this value
					}
				}
				else if (ColumnDataFilter.isRegExp(value))
				{
					if (!this._regexps)
						this._regexps = [];
					regexp = ColumnDataFilter.toRegExp(value);
					this._regexps.push(regexp);
				}
			}
			
			// last step - canonicalize session states containing ranges
			if (this._ranges || this._regexps)
			{
				var newState:(string|number|IRegExpState|IRangeState)[] = [];
				for (value of state)
				{
					if (typeof value === typeof 0 || typeof value === typeof "")
						newState.push(value as number|string);
				}
				for (range of this._ranges || [])
				{
					newState.push(range.getState());
				}
				for (regexp of this._regexps || [])
				{
					value = {
						regexp: regexp.source
					};

					newState.push(value);
				}
				this.values.setSessionState(newState);
			}
		}
		
		public containsKey(key:IQualifiedKey):boolean
		{
			if (!this._enabled)
				return true;
			
			var numberValue:number;
			var stringValue:string;
			var result:boolean = this.map_key.get(key);
			if (result === undefined)
			{
				result = false;
				
				if (this._numberLookup.size || this._ranges)
					numberValue = this.column.getValueFromKey(key, Number);
				if (this._stringLookup.size || this._regexps)
					stringValue = this.column.getValueFromKey(key, String);

				result = this._numberLookup.get(numberValue) ||
					this._stringLookup.get(stringValue) ||
					(this._includeMissingKeyTypes && key.keyType != this._keyType);

				if (!result && this._ranges)
				{
					for (var range of this._ranges)
					{
						if (range.minInclusive ? numberValue < range.min : numberValue <= range.min)
							continue;
						if (range.maxInclusive ? numberValue > range.max : numberValue >= range.max)
							continue;
						result = true;
						break;
					}
				}
				
				if (!result && this._regexps)
				{
					for (var regexp of this._regexps)
					{
						if (regexp.test(stringValue))
						{
							result = true;
							break;
						}
					}
				}
				
				this.map_key.set(key, result);
			}
			return result;
		}
		
		public stringifyValues():string[]
		{
			var result:(string|number|Object)[] = this.values.getSessionState() as any[] || [];
			return result.map(this.stringifyValue, this);
		}
		
		private stringifyValue(value:string|number|Object):string
		{
			if (typeof value === typeof "")
			{
				return value as string;
			}
			else if (typeof value === typeof 0)
			{
				return ColumnUtils.deriveStringFromNumber(this.column, value as number);
			}
			else if (ColumnDataFilterRange.isRange(value))
			{
				var range:ColumnDataFilterRange = new ColumnDataFilterRange(value);
				var leftBracket:string = range.minInclusive ? "[" : "(";
				var rightBracket:string = range.maxInclusive ? "]" : ")";
				return leftBracket + this.stringifyValue(range.min) + ", " + this.stringifyValue(range.max) + rightBracket;
			}
			else if (ColumnDataFilter.isRegExp(value))
			{
				return ColumnDataFilter.toRegExp(value).toString();
			}
			
			return null;
		}
		
		private static isRegExp(obj:Object):boolean
		{
			return obj != null && typeof obj == 'object'
				&& (obj.hasOwnProperty(ColumnDataFilter.REGEXP) || obj.hasOwnProperty(ColumnDataFilter.ALTERNATE_REGEX_PROPERTY));
		}
		
		private static toRegExp(value:IRegExpState):RegExp
		{
			return new RegExp(value.regexp || value.regex);
		}
		
		public get deprecatedStateMapping():Object
		{
			return this.handleMissingSessionStateProperties;
		}
		
		private _deprecatedRangeState:{[key:string]:any};
		private handleMissingSessionStateProperties(newState:{[key:string]:any}):void
		{
			// handle deprecated StringDataFilter single-string value
			const STRING_VALUE:string = 'stringValue';
			if (newState.hasOwnProperty(STRING_VALUE))
				this.values.setSessionState([newState[STRING_VALUE]]);
			
			// handle deprecated StringDataFilter array of strings
			const STRING_VALUES:string = 'stringValues';
			if (newState.hasOwnProperty(STRING_VALUES))
				this.values.setSessionState(newState[STRING_VALUES]);
			
			// handle deprecated NumberDataFilter state
			for (var property of ['min', 'max'])
			{
				if (newState.hasOwnProperty(property))
				{
					if (!this._deprecatedRangeState)
						this._deprecatedRangeState = {};
					this._deprecatedRangeState[property] = newState[property];
					this.values.setSessionState([this._deprecatedRangeState]);
				}
			}
		}
	}

	interface IRegExpState {
		regexp?: string;
		regex?: string;
	}

	interface IRangeState {
		min?: number;
		minInclusive?: number;
		minExclusive?: number;
		max?: number;
		maxInclusive?: number;
		maxExclusive?: number;
	}

	class ColumnDataFilterRange
	{
		public static isRange(obj:IRangeState):boolean
		{
			if (!obj)
				return false;
			
			var count:int = 0;
			var prop:string;
			
			for (prop of [ColumnDataFilterRange.MIN, ColumnDataFilterRange.MIN_INCLUSIVE, ColumnDataFilterRange.MIN_EXCLUSIVE])
				if (obj.hasOwnProperty(prop))
					count++;
			if (!count)
				return false;
			
			count = 0;
			for (prop of [ColumnDataFilterRange.MAX, ColumnDataFilterRange.MAX_INCLUSIVE, ColumnDataFilterRange.MAX_EXCLUSIVE])
				if (obj.hasOwnProperty(prop))
					count++;
			
			return count > 0;
		}
		
		public static /* readonly */ MIN = 'min';
		public static /* readonly */ MIN_INCLUSIVE = 'minInclusive';
		public static /* readonly */ MIN_EXCLUSIVE = 'minExclusive';
		public static /* readonly */ MAX = 'max';
		public static /* readonly */ MAX_INCLUSIVE = 'maxInclusive';
		public static /* readonly */ MAX_EXCLUSIVE = 'maxExclusive';
		
		public constructor(obj:IRangeState)
		{
			this.min = Math.max( 
				obj.min === undefined ? -Infinity : obj.min,
				obj.minInclusive === undefined ? -Infinity : obj.minInclusive,
				obj.minExclusive === undefined ? -Infinity : obj.minExclusive
			);

			this.max = Math.min(
				obj.max === undefined ? Infinity : obj.max,
				obj.maxInclusive === undefined ? Infinity : obj.maxInclusive,
				obj.maxExclusive === undefined ? Infinity : obj.maxExclusive
			);

			if (obj.minExclusive !== undefined)
				this.minInclusive = false;
			if (obj.maxExclusive !== undefined)
				this.maxInclusive = false;
		}
		
		public min = -Infinity;
		public max = Infinity;
		public minInclusive = true;
		public maxInclusive = true;
		
		public getState():IRangeState
		{
			var state:IRangeState = {};

			if (this.minInclusive)
				state.min = this.min;
			else
				state.minExclusive = this.min;

			if (this.maxInclusive)
				state.max = this.max;
			else
				state.maxExclusive = this.max;

			return state;
		}
	}
}
