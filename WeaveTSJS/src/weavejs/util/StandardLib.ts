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
	export class StandardLib
	{
		public static formatNumber(number:number, precision:int = -1):string
		{
			//TODO - use a library
			return String(number);
		}
		
		/**
		 * This function will cast a value of any type to a Number,
		 * interpreting the empty string ("") and null as NaN.
		 * @param value A value to cast to a Number.
		 * @return The value cast to a Number, or NaN if the casting failed.
		 */
		public static asNumber(value:any):number
		{
			if (value == null)
				return NaN; // return NaN because Number(null) == 0
			
			if (Weave.IS(value, Number) || Weave.IS(value, Date))
				return Number(value);
			
			try {
				var str:string = String(value);
				if (str == '')
					return NaN; // return NaN because Number('') == 0
				if (str.charAt(0) === '#')
					return Number('0x' + str.substr(1));
				if (str.charAt(str.length - 1) === '%')
					return Number(str.substr(0, -1)) / 100;
				return Number(str);
			} catch (e) { }

			return NaN;
		}
		
		/**
		 * Converts a value to a non-null String
		 * @param value A value to cast to a String.
		 * @return The value cast to a String.
		 */
		public static asString(value:any):string
		{
			if (value == null)
				return '';
			return String(value);
		}
		
		/**
		 * This function attempts to derive a boolean value from different types of objects.
		 * @param value An object to parse as a Boolean.
		 */
		public static asBoolean(value:any):boolean
		{
			if (Weave.IS(value, Boolean))
				return value;
			if (Weave.IS(value, String))
				return StandardLib.stringCompare(value, "true", true) == 0;
			if (isNaN(value))
				return false;
			if (Weave.IS(value, Number))
				return value != 0;
			return value;
		}
		
		/**
		 * Tests if a value is anything other than undefined, null, or NaN.
		 */
		public static isDefined(value:any):boolean
		{
			return value !== undefined && value !== null && !(Weave.IS(value, Number) && isNaN(value));
		}
		
		/**
		 * Tests if a value is undefined, null, or NaN.
		 */
		public static isUndefined(value:any, orEmptyString:boolean = false):boolean
		{
			return value === undefined || value === null || (Weave.IS(value, Number) && isNaN(value)) || (orEmptyString && value === '');
		}
		
		/**
		 * Pads a string on the left.
		 */
		public static lpad(str:string, length:uint, padString:string = ' '):string
		{
			if (str.length >= length)
				return str;
			while (str.length + padString.length < length)
				padString += padString;
			return padString.substr(0, length - str.length) + str;
		}
		
		/**
		 * Pads a string on the right.
		 */
		public static rpad(str:string, length:uint, padString:string = ' '):string
		{
			if (str.length >= length)
				return str;
			while (str.length + padString.length < length)
				padString += padString;
			return str + padString.substr(0, length - str.length);
		}
		
		/**
		 * This function performs find and replace operations on a String.
		 * @param string A String to perform replacements on.
		 * @param findStr A String to find.
		 * @param replaceStr A String to replace occurrances of the 'findStr' String with.
		 * @param moreFindAndReplace A list of additional find,replace parameters to use.
		 * @return The String with all the specified replacements performed.
		 */
		public static replace(string:string, findStr:string, replaceStr:string, ...moreFindAndReplace:string[]):string
		{
			string = string.split(findStr).join(replaceStr);
			while (moreFindAndReplace.length > 1)
			{
				findStr = moreFindAndReplace.shift();
				replaceStr = moreFindAndReplace.shift();
				string = string.split(findStr).join(replaceStr);
			}
			return string;
		}
		
		private static /* readonly */ argRef:RegExp = new RegExp("^(0|[1-9][0-9]*)\}");
		
		/**
		 * Substitutes "{n}" tokens within the specified string with the respective arguments passed in.
		 * Same syntax as StringUtil.substitute() without the side-effects of using String.replace() with a regex.
		 * @see String#replace()
		 * @see mx.utils.StringUtil#substitute()
		 */
		public static substitute(format:string, ...args:string[]):string
		{
			if (format == null)
				return '';
			if (args.length == 1 && Weave.IS(args[0], Array))
				args = args[0] as Array;
			var split:Array = format.split('{')
			var output:string = split[0];
			for (var i:int = 1; i < split.length; i++)
			{
				var str:string = split[i] as String;
				if (StandardLib.argRef.test(str))
				{
					var j:int = str.indexOf("}");
					output += args[str.substring(0, j)];
					output += str.substring(j + 1);
				}
				else
					output += "{" + str;
			}
			return output;
		}
		
		/**
		 * Takes a script where all lines have been indented with tabs,
		 * removes the common indentation from all lines and optionally
		 * replaces extra leading tabs with a number of spaces.
		 * @param script A script.
		 * @param spacesPerTab If zero or greater, this is the number of spaces to be used in place of each tab character used as indentation.
		 * @return The modified script.
		 */		
		public static unIndent(script:string, spacesPerTab:int = -1):string
		{
			if (script == null)
				return null;
			// switch all line endings to \n
			script = StandardLib.replace(script, '\r\n', '\n', '\r', '\n');
			// remove trailing whitespace (not leading whitespace)
			script = StandardLib.trim('.' + script).substr(1);
			// separate into lines
			var lines:Array = script.split('\n');
			// remove blank lines from the beginning
			while (lines.length && !StandardLib.trim(lines[0]))
				lines.shift();
			// stop if there's nothing left
			if (!lines.length)
			{
				return '';
			}
			// find the common indentation
			var commonIndent:number = Number.MAX_VALUE;
			var line:string;
			for (line of lines || [])
			{
				// ignore blank lines
				if (!StandardLib.trim(line))
					continue;
				// count leading tabs
				var lineIndent:int = 0;
				while (line.charAt(lineIndent) == '\t')
					lineIndent++;
				// remember the minimum number of leading tabs
				commonIndent = Math.min(commonIndent, lineIndent);
			}
			// remove the common indentation from each line
			for (var i:int = 0; i < lines.length; i++)
			{
				line = lines[i];
				// prepare to remove common indentation
				var t:int = 0;
				while (t < commonIndent && line.charAt(t) == '\t')
					t++;
				// optionally, prepare to replace extra tabs with spaces
				var spaces:string = '';
				if (spacesPerTab >= 0)
				{
					while (line.charAt(t) == '\t')
					{
						spaces += StandardLib.lpad('', spacesPerTab, '        ');
						t++;
					}
				}
				// commit changes
				lines[i] = spaces + line.substr(t);
			}
			return lines.join('\n');
		}

		/**
		 * @see mx.utils.StringUtil#trim()
		 */
		public static trim(str:string):string
		{
			if (str == null) return '';
			
			var startIndex:int = 0;
			while (StandardLib.isWhitespace(str.charAt(startIndex)))
				++startIndex;
			
			var endIndex:int = str.length - 1;
			while (StandardLib.isWhitespace(str.charAt(endIndex)))
				--endIndex;
			
			if (endIndex >= startIndex)
				return str.slice(startIndex, endIndex + 1);
			else
				return "";
		}
		
		/**
		 * @see mx.utils.StringUtil#isWhitespace()
		 */
		public static isWhitespace(character:string):boolean
		{
			switch (character)
			{
				case " ":
				case "\t":
				case "\r":
				case "\n":
				case "\f":
					// non breaking space
				case "\u00A0":
					// line seperator
				case "\u2028":
					// paragraph seperator
				case "\u2029":
					// ideographic space
				case "\u3000":
					return true;
				default:
					return false;
			}
		}
		
		/**
		 * Converts a number to a String using a specific numeric base and optionally pads with leading zeros.
		 * @param number The Number to convert to a String.
		 * @param base Specifies the numeric base (from 2 to 36) to use.
		 * @param zeroPad This is the minimum number of digits to return.  The number will be padded with zeros if necessary.
		 * @return The String representation of the number using the specified numeric base.
		 */
		public static numberToBase(number:number, base:int = 10, zeroPad:int = 1):string
		{
			if (!isFinite(number))
				return null;
			var parts:string[] = Math.abs(number).toString(base).split('.');
			if (parts[0].length < zeroPad)
				parts[0] = StandardLib.lpad(parts[0], zeroPad, '0');
			if (number < 0)
				parts[0] = '-' + parts[0];
			return parts.join('.');
		}

		/**
		 * This function returns -1 if the given value is negative, and 1 otherwise.
		 * @param value A value to test.
		 * @return -1 if value &lt; 0, 1 otherwise
		 */
		public static sign(value:number):number
		{
			if (value < 0)
				return -1;
			return 1;
		}
		
		/**
		 * This function constrains a number between min and max values.
		 * @param value A value to constrain between a min and max.
		 * @param min The minimum value.
		 * @param max The maximum value.
		 * @return If value &lt; min, returns min.  If value &gt; max, returns max.  Otherwise, returns value.
		 */
		public static constrain(value:number, min:number, max:number):number
		{
			if (value < min)
				return min;
			if (value > max)
				return max;
			return value;
		}
		
		/**
		 * Scales a number between 0 and 1 using specified min and max values.
		 * @param value The value between min and max.
		 * @param min The minimum value that corresponds to a result of 0.
		 * @param max The maximum value that corresponds to a result of 1.
		 * @return The normalized value between 0 and 1, or NaN if value is out of range.
		 */
		public static normalize(value:number, min:number, max:number):number
		{
			if (value < min || value > max)
				return NaN;
			if (min == max)
				return value - min; // min -> 0; NaN -> NaN
			return (value - min) / (max - min);
		}

		/**
		 * This function performs a linear scaling of a value from an input min,max range to an output min,max range.
		 * @param inputValue A value to scale.
		 * @param inputMin The minimum value in the input range.
		 * @param inputMax The maximum value in the input range.
		 * @param outputMin The minimum value in the output range.
		 * @param outputMax The maximum value in the output range.
		 * @return The input value rescaled such that a value equal to inputMin is scaled to outputMin and a value equal to inputMax is scaled to outputMax.
		 */
		public static scale(inputValue:number, inputMin:number, inputMax:number, outputMin:number, outputMax:number):number
		{
			if (inputMin == inputMax)
			{
				if (isNaN(inputValue))
					return NaN;
				if (inputValue > inputMax)
					return outputMax;
				return outputMin;
			}
			return outputMin + (outputMax - outputMin) * (inputValue - inputMin) / (inputMax - inputMin);
		}

		/**
		 * This rounds a Number to a given number of significant digits.
		 * @param value A value to round.
		 * @param significantDigits The desired number of significant digits in the result.
		 * @return The number, rounded to the specified number of significant digits.
		 */
		public static roundSignificant(value:number, significantDigits:uint = 14):number
		{
			// it doesn't make sense to round infinity or NaN
			if (!isFinite(value))
				return value;
			
			var sign:number = (value < 0) ? -1 : 1;
			var absValue:number = Math.abs(value);
			var pow10:number;
			
			// if absValue is less than 1, all digits after the decimal point are significant
			if (absValue < 1)
			{
				pow10 = Math.pow(10, significantDigits);
				//trace("absValue<1: Math.round(",absValue,"*",pow10,")",Math.round(absValue * pow10));
				return sign * Math.round(absValue * pow10) / pow10;
			}
			
			var log10:number = Math.ceil(Math.log(absValue) / Math.LN10);
			
			// Both these calculations are equivalent mathematically, but if we use
			// the wrong one we get bad rounding results like "123.456000000001".
			if (log10 < significantDigits)
			{
				// find the power of 10 that you need to MULTIPLY absValue by
				// so Math.round() will round off the digits we don't want
				pow10 = Math.pow(10, significantDigits - log10);
				return sign * Math.round(absValue * pow10) / pow10;
			}
			else
			{
				// find the power of 10 that you need to DIVIDE absValue by
				// so Math.round() will round off the digits we don't want
				pow10 = Math.pow(10, log10 - significantDigits);
				//trace("log10>significantDigits: Math.round(",absValue,"/",pow10,")",Math.round(absValue / pow10));
				return sign * Math.round(absValue / pow10) * pow10;
			}
		}
		
		//testRoundSignificant();
		private static testRoundSignificant():void
		{
			for (var pow:int = -5; pow <= 5; pow++)
			{
				var n:number = 1234.5678 * Math.pow(10, pow);
				for (var d:int = 0; d <= 9; d++)
					console.log('roundSignificant(',n,',',d,') =', StandardLib.roundSignificant(n, d));
			}
		}
		
		/**
		 * Rounds a number to the nearest multiple of a precision value.
		 * @param number A number to round.
		 * @param precision A precision to use.
		 * @return The number rounded to the nearest multiple of the precision value.
		 */
		public static roundPrecision(number:number, precision:number):number
		{
			return Math.round(number / precision) * precision;
		}
		
		/**
		 * @param n The number to round.
		 * @param d The total number of non-zero digits we care about for small numbers.
		 */
		public static suggestPrecision(n:number, d:int):number
		{
			return Math.pow(10, Math.min(0, Math.ceil(Math.log(n) / Math.LN10) - d));
		}

		/**
		 * Calculates an interpolated color for a normalized value.
		 * @param normValue A Number between 0 and 1.
		 * @param colors An Array or list of colors to interpolate between.  Normalized values of 0 and 1 will be mapped to the first and last colors.
		 * @return An interpolated color associated with the given normValue based on the list of color values.
		 */
		public static interpolateColor(normValue:number, ...colors:number[]):number
		{
			// handle an array of colors as the second parameter
			if (colors.length == 1 && Weave.IS(colors[0], Array))
				colors = colors[0];
			
			// handle invalid parameters
			if (normValue < 0 || normValue > 1 || colors.length == 0)
				return NaN;
			
			// find the min and max colors we want to interpolate between
			
			var maxIndex:int = colors.length - 1;
			var leftIndex:int = int(maxIndex * normValue);
			var rightIndex:int = leftIndex + 1;
			
			// handle boundary condition
			if (rightIndex == colors.length)
				return colors[leftIndex];
			
			var minColor:number = colors[leftIndex];
			var maxColor:number = colors[rightIndex];
			// normalize the norm value between the two norm values associated with the surrounding colors
			normValue = normValue * maxIndex - leftIndex;
			
			var percentLeft:number = 1 - normValue; // relevance of minColor
			var percentRight:number = normValue; // relevance of maxColor
			var R:int = 0xFF0000;
			var G:int = 0x00FF00;
			var B:int = 0x0000FF;
			return (
				((percentLeft * (minColor & R) + percentRight * (maxColor & R)) & R) |
				((percentLeft * (minColor & G) + percentRight * (maxColor & G)) & G) |
				((percentLeft * (minColor & B) + percentRight * (maxColor & B)) & B)
			);
		}
		
		/**
		 * ITU-R 601
		 */
		public static getColorLuma(color:number):number
		{
			return 0.3 * ((color & 0xFF0000) >> 16) + 0.59 * ((color & 0x00FF00) >> 8) + 0.11 * (color & 0x0000FF);
		}
		
		/**
		 * @param color A numeric color value
		 * @return A hex color string like #FFFFFF
		 */
		public static getHexColor(color:number):string
		{
			if (color != (color & 0xFFFFFF))
				return null;
			return '#' + StandardLib.numberToBase(color, 16, 6);
		}
		
		/**
		 * Code from Graphics Gems Volume 1
		 */
		public static getNiceNumber(x:number, round:boolean):number
		{
			var exponent:number;
			var fractionalPart:number;
			var niceFractionalPart:number;
			
			// special case for nice number of 0, since Math.log(0) is -Infinity
			if(x == 0)
				return 0;
			
			exponent = Math.floor( Math.log( x ) / Math.LN10 );
			fractionalPart = x / Math.pow( 10.0, exponent );
			
			if( round ) {
				if( fractionalPart < 1.5 ) {
					niceFractionalPart = 1.0;
				} else if( fractionalPart < 3.0 ) {
					niceFractionalPart = 2.0;
				} else if( fractionalPart < 7.0 ) {
					niceFractionalPart = 5.0;
				} else {
					niceFractionalPart = 10.0;
				}
			} else {
				if( fractionalPart <= 1.0 ) {
					niceFractionalPart = 1.0;
				} else if( fractionalPart <= 2.0 ) {
					niceFractionalPart = 2.0;
				} else if( fractionalPart < 5.0 ) {
					niceFractionalPart = 5.0;
				} else {
					niceFractionalPart = 10.0;
				}
			}
			
			return niceFractionalPart * Math.pow( 10.0, exponent );
		}
		
		/**
		 * Code from Graphics Gems Volume 1
		 * Note: This may return less than the requested number of values
		 */
		public static getNiceNumbersInRange(min:number, max:number, numberOfValuesInRange:int):number[]
		{
			// special case
			if (min == max)
				return [min];
			
			var nfrac:int;
			var d:number;
			var graphmin:number;
			var graphmax:number;
			var range:number;
			var x:number;
			var i:int = 0;
			
			var values:number[] = [];
			
			// Bug fix: getNiceNumbersInRange(0, 500, 6) returned [0,200,400] when it could be [0,100,200,300,400,500]
			// Was: range = getNiceNumber(max - min, false);
			range = max - min;
			
			d = StandardLib.getNiceNumber( range / (numberOfValuesInRange - 1), true);
			graphmin = Math.floor(min / d) * d;
			graphmax = Math.ceil(max / d) * d;
			
			nfrac = Math.max(-Math.floor(Math.log(d)/Math.LN10), 0);
			
			for (x = graphmin; x < graphmax + 0.5*d; x += d)
			{
				values[i++] = StandardLib.roundSignificant(x); // this fixes values like x = 0.6000000000000001 that may occur from x += d
			}
			
			return values;
		}
		
		/**
		 * Calculates the mean value from a list of Numbers.
		 */
		public static mean(...args:number[]):number
		{
			if (args.length == 1 && Weave.IS(args[0], Array))
				args = (args as any)[0];
			var sum:number = 0;
			for (var value of args || [])
				sum += value;
			return sum / args.length;
		}
		
		/**
		 * Calculates the sum of a list of Numbers.
		 */
		public static sum(...args:number[]):number
		{
			if (args.length == 1 && Weave.IS(args[0], Array))
				args = (args as any)[0];
			var sum:number = 0;
			for (var value of args || [])
				sum += value;
			return sum;
		}

		private static /* readonly */ AS3_CASEINSENSITIVE:int = 1;
		private static /* readonly */ AS3_DESCENDING:int = 2;
		private static /* readonly */ AS3_UNIQUESORT:int = 4;
		private static /* readonly */ AS3_RETURNINDEXEDARRAY:int = 8;
		private static /* readonly */ AS3_NUMERIC:int = 16;

		private static /* readonly */ LODASH_ASCENDING:string = "asc";
		private static /* readonly */ LODASH_DESCENDING:string = "desc";

		private static _indexMap:Map<any, number>;

		private static as3SortOn(array:Array, fieldNames:string|string[], options:any):Array
		{
			/* Normalize to arrays */
			if (!Weave.IS(fieldNames, Array))
				fieldNames = [fieldNames as string];
			if (!Weave.IS(options, Array))
				options = [options];

			/* Get global options */
			var returnIndexedArray:boolean = options.some(function(option:int):int {return option & StandardLib.AS3_RETURNINDEXEDARRAY;});
			var uniqueSort:boolean = options.some(function(option:int):int {return option & StandardLib.AS3_UNIQUESORT;});

			var orders = options.map(function (option:int):string {
				return (option & StandardLib.AS3_DESCENDING) ? StandardLib.LODASH_DESCENDING : StandardLib.LODASH_ASCENDING;
			});

			var iteratees = options.map(function (option:int, index:int):any {
				var customConvert:Function;
				var fieldName:string = fieldNames[index];
				/* lodash's default behavior is numeric sort, so
				 * we have to explicitly convert to strings if we 
				 * don't want that. */
				if (!(option & StandardLib.AS3_NUMERIC))
				{
					customConvert = function(item:any):string
					{
						if (item === undefined || item === null)
							return "";
						return String(item[fieldName]);
					}
				}
				else if (option & StandardLib.AS3_CASEINSENSITIVE)
				{
					customConvert = function(item:any):string
					{
						if (item === undefined || item === null)
							return "";
						return String(item[fieldName]).toLocaleLowerCase();
					}
				}

				return customConvert || fieldNames[index];
			});

			if (!StandardLib._indexMap)
				StandardLib._indexMap = new Map<any, number>();
			StandardLib._indexMap.clear();
			
			if (returnIndexedArray)
			{
				/* Assert that this is an object array, this won't necessarily work with primitive types.
				 * This technique won't work with non-unique items in general;
				 * it would take more iteratee-generation code to make this work
				 * reliably by wrapping it in objects with an attached index, 
				 * then unpacking it in the iteratee functions. */
				if (!StandardLib.arrayIsType(array, Object))
					console.error("Warning: Can't do an indexed array sort of non-objects reliably, as there's a higher chance of non-unique items.");
				array.forEach(function(item:any, index:int):void {StandardLib._indexMap.set(item, index);})
			}

			var result = lodash.sortByOrder(array, iteratees, orders);

			if (returnIndexedArray)
			{
				result = result.map(function (item:any):any {return StandardLib._indexMap.get(item);});
			}

			return result;
		}

		private static /* readonly */ _sortBuffer:any[] = []; /* Scratchspace to reduce GC pressure */
		/**
		 * Sorts an Array of items in place using properties, lookup tables, or replacer functions.
		 * @param array An Array to sort.
		 * @param params Specifies how to get values used to sort items in the array.
		 *               This can either be an Array of params or a single param, each of which can be one of the following:<br>
		 *               Array: values are looked up based on index (Such an Array must be nested in a params array rather than given alone as a single param)<br>
		 *               Object or Dictionary: values are looked up using items in the array as keys<br>
		 *               Property name: values are taken from items in the array using a property name<br>
		 *               Replacer function: array items are passed through this function to get values<br>
		 * @param sortDirections Specifies sort direction(s) (1 or -1) corresponding to the params.
		 * @param inPlace Set this to true to modify the original Array in place or false to return a new, sorted copy.
		 * @param returnSortedIndexArray Set this to true to return a new Array of sorted indices.
		 * @return Either the original Array or a new one.
		 * @see Array#sortOn()
		 */
		public static sortOn<T>(array:T[], params:any, sortDirections:any = undefined, inPlace:boolean = true, returnSortedIndexArray:boolean = false):T[]
		{
			if (array.length == 0)
				return inPlace ? array : [];
			
			var values:T[];
			var param:any;
			var sortDirection:int;
			var i:int;
			
			// expand _sortBuffer as necessary
			for (i = StandardLib._sortBuffer.length; i < array.length; i++)
				StandardLib._sortBuffer[i] = [];
			
			// If there is only one param, wrap it in an array.
			// Array.sortOn() is preferred over Array.sort() in this case
			// since an undefined value will crash Array.sort(Array.NUMERIC).
			if (params === array || !Weave.IS(params, Array))
			{
				params = [params];
				if (sortDirections)
					sortDirections = [sortDirections];
			}
			
			var fields:any[] = new Array(params.length);
			var fieldOptions:any[] = new Array(params.length);
			for (var p:int = 0; p < params.length; p++)
			{
				param = params[p];
				sortDirection = sortDirections && sortDirections[p] < 0 ? StandardLib.AS3_DESCENDING : 0;
				
				i = array.length;
				if (Weave.IS(param, Array))
					while (i--)
						StandardLib._sortBuffer[i][p] = param[i];
				else if (Weave.IS(param, Function))
					while (i--)
						StandardLib._sortBuffer[i][p] = param(array[i]);
				else if (Weave.IS(param, Map) || Weave.IS(param, WeakMap))
					while (i--)
						StandardLib._sortBuffer[i][p] = param.get(array[i]);
				else if (typeof param === 'object')
					while (i--)
						StandardLib._sortBuffer[i][p] = param[array[i]];
				else
					while (i--)
						StandardLib._sortBuffer[i][p] = array[i][param];
				
				fields[p] = p;
				fieldOptions[p] = StandardLib.AS3_RETURNINDEXEDARRAY | StandardLib.guessSortMode(StandardLib._sortBuffer, p) | sortDirection;
			}
			
			values = StandardLib._sortBuffer.slice(0, array.length);
			values = StandardLib.as3SortOn(values, fields, fieldOptions);
			
			if (returnSortedIndexArray)
				return values;
			
			var array2:T[] = new Array(array.length);
			i = array.length;
			while (i--)
				array2[i] = array[values[i]];
			
			if (!inPlace)
				return array2;
			
			i = array.length;
			while (i--)
				array[i] = array2[i];
			return array;
		}

		/**
		 * Guesses the appropriate Array.sort() mode based on the first non-undefined item property from an Array.
		 * @return Either Array.NUMERIC or 0.
		 */
		private static guessSortMode(array:any[], itemProp:int):int
		{
			for (var item of array || [])
			{
				var value = item[itemProp];
				if (value !== undefined)
					return Weave.IS(value, Number) || Weave.IS(value, Date) ? Array.NUMERIC : 0;
			}
			return 0;
		}
		
		/**
		 * This will return the type of item found in the Array if each item has the same type.
		 * @param a An Array to check.
		 * @return The type of all items in the Array, or null if the types differ. 
		 */
		public static getArrayType(a:any[]):GenericClass
		{
			if (a == null || a.length == 0 || a[0] == null)
				return null;
			var type:Class = (Object(a[0]) as any).constructor;
			for (var item of a || [])
				if (item == null || item.constructor != type)
					return null;
			return type;
		}
		
		/**
		 * Checks if all items in an Array are instances of a given type.
		 * @param a An Array of items to test
		 * @param type A type to check for
		 * @return true if each item in the Array is an object of the given type.
		 */
		public static arrayIsType<T>(a:T[], type:Class<T>):boolean
		{
			for (var item of a || [])
				if (!Weave.IS(item, type))
					return false;
			return true;
		}
		
		/**
		 * This will perform a log transformation on a normalized value to produce another normalized value.
		 * @param normValue A number between 0 and 1.
		 * @param factor The log factor to use.
		 * @return A number between 0 and 1.
		 */
		public static logTransform(normValue:number, factor:number = 1024):number
		{
			return Math.log(1 + normValue * factor) / Math.log(1 + factor);
		}
		
		/**
		 * This will generate a date string from a Number or a Date object using the specified date format.
		 * @param value The Date object or date string to format.
		 * @param formatString The format of the date string to be generated.
		 * @param formatAsUniversalTime If set to true, the date string will be generated using universal time.
		 *        If set to false, the timezone of the user's computer will be used.
		 * @return The resulting formatted date string.
		 * 
		 * @see mx.formatters::DateFormatter#formatString
		 * @see Date
		 */
		public static formatDate(value:Object, formatString:string = null, formatAsUniversalTime:boolean = true):string
		{
			//TODO
			if (Weave.IS(value, Number))
			{
				var date:Date = new Date();
				date.setTime(value as number);
				value = date;
			}
			return String(value);
		}
		
		/**
		 * The number of milliseconds in one minute.
		 */
		private static /* readonly */ _timezoneMultiplier:number = 60000;
		
		/**
		 * This compares two dynamic objects or primitive values and is much faster than ObjectUtil.compare().
		 * Does not check for circular refrences.
		 * @param a First dynamic object or primitive value.
		 * @param b Second dynamic object or primitive value.
		 * @param objectCompare An optional compare function to replace the default compare behavior for non-primitive Objects.
		 *                      The function should return -1, 0, or 1 to override the comparison result, or NaN to use the default recursive comparison result.
		 * @return A value of zero if the two objects are equal, nonzero if not equal.
		 */
		public static compare<T>(a:T, b:T, objectCompare:(a:T, b:T)=>int = null):int
		{
			var c:int;
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
			if (typeA != 'object')
				return 1;
			if (Weave.IS(a, Date) && Weave.IS(b, Date))
				return StandardLib.dateCompare(a as Date, b as Date);
			if (Weave.IS(a, Array) && Weave.IS(b, Array))
			{
				var an:int = a.length;
				var bn:int = b.length;
				if (an < bn)
					return -1;
				if (an > bn)
					return 1;
				for (var i:int = 0; i < an; i++)
				{
					c = StandardLib.compare(a[i], b[i]);
					if (c != 0)
						return c;
				}
				return 0;
			}
			
			if (objectCompare != null)
			{
				var result:number = objectCompare(a, b);
				if (isFinite(result))
					return result;
			}
			
			var qna:string = String(a); // getQualifiedClassName(a);
			var qnb:string = String(b); // getQualifiedClassName(b);
			
			if (qna != qnb)
				return StandardLib.stringCompare(qna, qnb);
			
			var p:string;
			
			// if there are properties in a not found in b, return -1
			for (p in a)
			{
				if (!b.hasOwnProperty(p))
					return -1;
			}
			for (p in b)
			{
				// if there are properties in b not found in a, return 1
				if (!a.hasOwnProperty(p))
					return 1;
				
				c = StandardLib.compare(a[p], b[p]);
				if (c != 0)
					return c;
			}
			
			return 0;
		}
		
		/**
		 * @see mx.utils.ObjectUtil#numericCompare()
		 */
		public static numericCompare(a:number, b:number):int
		{
			if (isNaN(a) && isNaN(b))
				return 0;
			
			if (isNaN(a))
				return 1;
			
			if (isNaN(b))
				return -1;
			
			if (a < b)
				return -1;
			
			if (a > b)
				return 1;
			
			return 0;
		}
		
		/**
		 * @see mx.utils.ObjectUtil#stringCompare()
		 */
		public static stringCompare(a:string, b:string, caseInsensitive:boolean = false):int
		{
			if (a == null && b == null)
				return 0;
			
			if (a == null)
				return 1;
			
			if (b == null)
				return -1;
			
			// Convert to lowercase if we are case insensitive.
			if (caseInsensitive)
			{
				a = String(a).toLocaleLowerCase();
				b = String(b).toLocaleLowerCase();
			}
			
			var result:int = String(a).localeCompare(b);
			
			if (result < -1)
				result = -1;
			else if (result > 1)
				result = 1;
			
			return result;
		}
		
		/**
		 * @see mx.utils.ObjectUtil#dateCompare()
		 */
		public static dateCompare(a:Date, b:Date):int
		{
			if (a == null && b == null)
				return 0;
			
			if (a == null)
				return 1;
			
			if (b == null)
				return -1;
			
			var na:number = a.getTime();
			var nb:number = b.getTime();
			
			if (na < nb)
				return -1;
			
			if (na > nb)
				return 1;
			
			if (isNaN(na) && isNaN(nb))
				return 0;
			
			if (isNaN(na))
				return 1;
			
			if (isNaN(nb))
				return -1;
			
			return 0;
		}
		
		/**
		 * @see https://github.com/bestiejs/punycode.js
		 */
		private static ucs2encode(value:uint):string
		{
			var output:string = '';
			if (value > 0xFFFF)
			{
				value -= 0x10000;
				output += String.fromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			return output + String.fromCharCode(value);
		}
		
		public static guid():string
		{
			return StandardLib.s4() + StandardLib.s4() + '-' + StandardLib.s4() + '-' + StandardLib.s4() + '-' +
				StandardLib.s4() + '-' + StandardLib.s4() + StandardLib.s4() + StandardLib.s4();
		}
		private static s4():string
		{
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		
		/**
		 * Converts a Uint8Array to a binary String
		 */
		public static byteArrayToString(byteArray:Uint8Array):string
		{
			var CHUNK_SIZE:int = 8192;
			var n:int = byteArray.length;
			if (n <= CHUNK_SIZE)
				return String.fromCharCode.apply(String, byteArray);
			var strings:Array = [];
			for (var i:int = 0; i < byteArray.length;)
				strings.push(String.fromCharCode.apply(null, byteArray.subarray(i, i += CHUNK_SIZE)));
			return strings.join('');
		}
	}
}
