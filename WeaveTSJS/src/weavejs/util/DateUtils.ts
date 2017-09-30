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
	export class DateUtils
	{
		/**
		 * This must be set externally.
		 */
		public static parse(date:string|number, moment_fmt:string, force_utc:boolean = false, force_local:boolean = false):Date
		{
			if (moment_fmt)
				return moment(date as any, moment_fmt, true).toDate();
			return moment(date).toDate();
		}
		public static format(date:string|number|Date, moment_fmt:string):string
		{
			return moment(date).format(moment_fmt);
		}
		public static formatDuration(date:string|number|Date):string
		{
			return !isNaN(Weave.AS(date, Number) as number) ? moment.duration(date).humanize() : "";
		}
		public static detectFormats(dates:Array<string|number>, moment_formats:string[]):string[]
		{
			var validFormatsSparse:string[] = [].concat(moment_formats);
			var fmt:string;

			for (var date of dates || [])
			{
				for (var fmtIdx in validFormatsSparse)
				{
					fmt = validFormatsSparse[fmtIdx];
					if (!fmt)
						continue;	
					
					var m = moment(date as any, fmt, true);
					if (!m.isValid())
					{
						validFormatsSparse[fmtIdx] = null;
					}
				}
			}

			var validFormats:string[] = [];
			for (fmt of validFormatsSparse)
			{
				if (fmt !== null)
				{
					validFormats.push(fmt);
				}
			}

			return validFormats;
		}
	}
}
