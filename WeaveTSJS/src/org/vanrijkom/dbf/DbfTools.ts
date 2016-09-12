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
	import DbfRecord = org.vanrijkom.dbf.DbfRecord;
	import DbfError = org.vanrijkom.dbf.DbfError;

	/**
	 * The DbfTools class bundles a utility functions used by the remainder of
	 * the DBF library.
	 * @author Edwin van Rijkom
	 *
	 */
	export class DbfTools
	{
		/**
		 * Read a zero terminated ANSI string from a ByteArray.
		 * @param src ByteArray instance to read from.
		 * @return
		 *
		 */
		public static readZeroTermANSIString(src: JSByteArray):string {
			var r: string = "";
			var b: number;
			while (true) {
				b = src.readUnsignedByte();
				if (!b)
					break;
				r += String.fromCharCode(b);
			}
			return r;
		}

		/**
		 * Read a fixed length ANSI string from a ByteArray.
		 * @param src ByteArray instance to read from.
		 * @param length Number of character to read.
		 * @return
		 *
		 */
		public static readANSIString(src: JSByteArray, length: number): string {
			var r: string = "";
			while(length--) {
				r+= String.fromCharCode(src.readUnsignedByte());
			}
			return r;
		}

		/**
		 * Read a DBF record from a DBF file.
		 * @param src ByteArray instance to read from.
		 * @param header DbfHeader instance previously read from the ByteArray.
		 * @param index Index of the record to read.
		 * @return
		 * @see vanrijkom.dbf.DbfHeader
		 *
		 */
		public static getRecord(src: JSByteArray, header: DbfHeader, index: number): DbfRecord {

			if (index > header.recordCount)
				throw(new DbfError("",DbfError.ERROR_OUTOFBOUNDS));

			src.position = header.recordsOffset + index * header.recordSize;
			return new DbfRecord(src, header);
		}
	}
} // package