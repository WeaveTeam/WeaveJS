/* ************************************************************************ */
/*																			*/
/*  DBF (XBase File Reader) 												*/
/*  Copyright (c)2007 Edwin van Rijkom										*/
/*  http://www.vanrijkom.org												*/
/*																			*/
/* This library is free software; you can redistribute it and/or			*/
/* modify it under the terms of the GNU Lesser General Public				*/
/* License as published by the Free Software Foundation; either				*/
/* version 2.1 of the License, or (at your option) any later version.		*/
/*																			*/
/* This library is distributed in the hope that it will be useful,			*/
/* but WITHOUT ANY WARRANTY; without even the implied warranty of			*/
/* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU		*/
/* Lesser General Public License or the LICENSE file for more details.		*/
/*																			*/
/* ************************************************************************ */

namespace org.vanrijkom.dbf
{
	import JSByteArray = weavejs.util.JSByteArray;
	import DbfHeader = org.vanrijkom.dbf.DbfHeader;
	import DbfRecord = org.vanrijkom.dbf.DbfRecord;
	import DbfTools = org.vanrijkom.dbf.DbfTools;

	/**
	 * The DbfFilter class is a utility class that allows for collecting records
	 * that match on one of the given values for a field.
	 * @author Edwin
	 *
	 */
	export class DbfFilter
	{
		/**
		 * Array containing DbfRecord typed values that match on one of the given
		 * values for a field.
		 */
		public matches: DbfRecord[];

		/**
		 * Constructor.
		 * @param src ByteArray containing the DBF file to filter.
		 * @param header DbfHeader instance previously read from the ByteArray.
		 * @param field Field to filter on.
		 * @param values Array of values to match field against.
		 * @param append If specified, the found records will be added to the specified Array instead of to the instance's matches array.
		 * @return
		 * @see vanrijkom.dbf.DbfHeader
		 *
		 */
		public DbfFilter(src: JSByteArray, header: DbfHeader, field: string, values: any[], append:DbfRecord[]=null) {
			this.matches = append || [];
			src.position = header.recordsOffset;
			var record: DbfRecord;
			var i: number, j: number;
			for (i= 0; i<header.recordCount; i++) {
				record = DbfTools.getRecord(src,header,i);
				for (j=0; j<values.length; j++) {
					if (record.map_field_value.get(field.toString()).match(values[j])) {
						this.matches.push(record);
						break;
					}
				}
			}
		}

	}
} // package