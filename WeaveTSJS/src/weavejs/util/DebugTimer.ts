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
	import StandardLib = weavejs.util.StandardLib;
	
	/**
	 * This class acts like a stop watch that supports nested begin/end times.
	 * Pairs of calls to begin() and end() may be nested.
	 * 
	 * @author adufilie
	 */
	export class DebugTimer
	{
		/**
		 * This is a list of nested start times.
		 */
		private static /* readonly */ debugTimes:int[] = [];
		
		/**
		 * This will record the current time as a new start time for comparison when lap() or end() is called.
		 * Pairs of calls to begin() and end() may be nested.
		 */
		public static begin():void
		{
			DebugTimer.debugTimes.push(Date.now());
		}
		
		/**
		 * Cancels the last call to begin().
		 */
		public static cancel():void
		{
			DebugTimer.debugTimes.pop();
		}
		
		/**
		 * This will report the time since the last call to begin() or lap().
		 * @param debugString A string to print using trace().
		 * @param debugStrings Additional strings to print using trace(), which will be separated by spaces.
		 * @return The elapsed time.
		 */
		public static lap(debugString:string, ...debugStrings:string[]):int
		{
			debugStrings.unshift(debugString);
			var elapsedTime:int = DebugTimer.end.apply(null, debugStrings);
			DebugTimer.begin();
			return elapsedTime;
		}
		
		/**
		 * This will reset the timer so that higher-level functions can resume their use of DebugTimer.
		 * Pairs of calls to begin() and end() may be nested.
		 * @param debugString A string to print using trace().
		 * @param debugStrings Additional strings to print using trace(), which will be separated by spaces.
		 * @return The elapsed time.
		 */
		public static end(debugString:string, ...debugStrings:string[]):int
		{
			debugStrings.unshift(debugString);
			var elapsedTime:int = Date.now() - DebugTimer.debugTimes.pop();
			var elapsed:string = '['+elapsedTime+' ms elapsed] ';
			var elapsedIndent:string = StandardLib.lpad('| ', elapsed.length);
			var indent:string = StandardLib.rpad('', DebugTimer.debugTimes.length * 2, '| ');
			var lines:string[] = debugStrings.join(' ').split('\n');
			for (var i:int = 0; i < lines.length; i++)
			{
				if (lines.length == 1)
					lines[i] = (indent + ',-' + elapsed + lines[i]);
				else if (i == 0)
					lines[i] = (indent + ',-' + elapsed + lines[i]);
				else if (i > 0 && i < lines.length - 1)
					lines[i] = (indent + '| ' + elapsedIndent + lines[i]);
				else
					lines[i] = (indent + '|-' + elapsed + lines[i]);
			}
			console.log(lines.join('\n'));
			
			if (elapsedTime > 1000)
				console.log(); // put breakpoint here
			
			return elapsedTime;
		}
	}
}
