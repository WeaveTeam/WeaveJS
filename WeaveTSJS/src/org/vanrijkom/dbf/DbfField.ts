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
	import DbfTools = org.vanrijkom.dbf.DbfTools;

	/**
	 * The DbfField class parses a field definition from a DBF file loaded to a
	 * ByteArray.
	 * @author Edwin van Rijkom
	 *
	 */
	export class DbfField
	{
		/**
		 * Field name.
		 */
		public name:string;
		/**
		 * Field type.
		 */
		public type: number;
		/**
		 * Field address.
		 */
		public address: number;
		/**
		 * Field lenght.
		 */
		public length: number;
		/**
		 * Field decimals.
		 */
		public decimals: number;
		/**
		 * Field id.
		 */
		public id: number;
		/**
		 * Field set flag.
		 */
		public setFlag: number;
		/**
		 * Field index flag.
		 */
		public indexFlag: number;

		/**
		 * Constructor.
		 * @param src
		 * @return
		 *
		 */
		constructor(src: JSByteArray) {

			this.name = DbfTools.readZeroTermANSIString(src);

			// fixed length: 10, so:
			src.position += (10-this.name.length);

			this.type = src.readUnsignedByte();
			this.address = src.readUnsignedInt();
			this.length = src.readUnsignedByte();
			this.decimals = src.readUnsignedByte();

			// skip 2:
			src.position += 2;

			this.id = src.readUnsignedByte();

			// skip 2:
			src.position += 2;

			this.setFlag = src.readUnsignedByte();

			// skip 7:
			src.position += 7;

			this.indexFlag = src.readUnsignedByte();
		}
	}
} // package