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
	/**
	 * Instances of the DbfError class are thrown from the DBF library classes
	 * on encountering errors.
	 * @author Edwin van Rijkom
	 *
	 */
	export class DbfError extends Error
	{
		/**
		 * Defines the identifier value of an undefined error.
		 */
		public static /* readonly */ ERROR_UNDEFINED = 0;
		/**
		 * Defines the identifier value of a 'out of bounds' error, which is thrown
		 * when an invalid item index is passed.
		 */
		public static /* readonly */ ERROR_OUTOFBOUNDS = 1;

		public errorID:number;

		constructor(msg:string, id:number=0) {
			super(msg);
			this.errorID = id;
		}
	}
} // package