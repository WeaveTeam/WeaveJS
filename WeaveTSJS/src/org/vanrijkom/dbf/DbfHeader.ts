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
	import DbfField = org.vanrijkom.dbf.DbfField;
	/**
	 * The DbfHeader class parses a DBF file loaded to a ByteArray
	 * @author Edwin van Rijkom
	 *
	 */
	export class DbfHeader
	{
		/**
		 * File length
		 */
		public fileLength: number;
		/**
		 * File version
		 */
		public version: number;
		/**
		 * Date of last update, Year.
		 */
		public updateYear: number;
		/**
		 * Date of last update, Month.
		 */
		public updateMonth: number;
		/**
		 * Data of last update, Day.
		 */
		public updateDay: number;
		/**
		 * Number of records on file.
		 */
		public recordCount: number;
		/**
		 * Header structure size.
		 */
		public headerSize: number;
		/**
		 * Size of each record.
		 */
		public recordSize: number;
		/**
		 * Incomplete transaction flag
		 */
		public incompleteTransaction: number;
		/**
		 * Encrypted flag.
		 */
		public encrypted: number;
		/**
		 * DBase IV MDX flag.
		 */
		public mdx: number;
		/**
		 * Language driver.
		 */
		public language: number;

		/**
		 * Array of DbfFields describing the fields found
		 * in each record.
		 */
		public fields: DbfField[];

		private  _recordsOffset: number;

		/**
		 * Constructor
		 * @param src
		 * @return
		 *
		 */
		constructor(src: JSByteArray) {
			// endian:
			src.littleEndian = true;

			this.version = src.readByte();
			this.updateYear = 1900+src.readUnsignedByte();
			this.updateMonth = src.readUnsignedByte();
			this.updateDay = src.readUnsignedByte();
			this.recordCount = src.readUnsignedInt();
			this.headerSize = src.readUnsignedShort();
			this.recordSize = src.readUnsignedShort();

			//skip 2:
			src.position += 2;

			this.incompleteTransaction = src.readUnsignedByte();
			this.encrypted = src.readUnsignedByte();

			// skip 12:
			src.position += 12;

			this.mdx = src.readUnsignedByte();
			this.language = src.readUnsignedByte();

			// skip 2;
			src.position += 2;

			// iterate field descriptors:
			this.fields = [];
			while (src.readByte() != 0X0D){
				src.position--;
				this.fields.push(new DbfField(src));
			}

			this._recordsOffset = this.headerSize+1;
		}

		public get recordsOffset(): number {
			return this._recordsOffset;
		}
	}

}  // package