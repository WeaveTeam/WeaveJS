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

	/**
	 * The DbfRecord class parses a record from a DBF file loade to a ByteArray.
	 * To do so it requires a DbfHeader instance previously read from the
	 * ByteArray.
	 * @author Edwin van Rijkom
	 * @see vanrijkom.dbf.DbfHeader
	 *
	 */
	export class DbfRecord
	{
		/**
		 * Record field values. Use values["fieldname"] to get a value.
		 */
		public map_field_value:Map<string, any>;

		private offset: number;

		constructor(src: JSByteArray, header: DbfHeader) {
			this.offset = src.position;
			this.map_field_value = new Map<string, any>();
			for(var field of header.fields) {
				this.map_field_value.set(field.name, src.readUTFBytes(field.length));
			}
		}
	}
} // package