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

namespace weavejs.api.data
{
	/**
	 * Constants associated with different data types.
	 * @see weave.api.data.ColumnMetadata
	 */

	export declare type DataType = "number"|"string"|"date"|"geometry";
	export class DataTypes
	{
		public static /* readonly */ NUMBER:"number" = "number";
		public static /* readonly */ STRING:"string" = "string";
		public static /* readonly */ DATE:"date" = "date";
		public static /* readonly */ GEOMETRY:"geometry"= "geometry";

		public static /* readonly */ ALL_TYPES = [DataTypes.NUMBER, DataTypes.STRING, DataTypes.DATE, DataTypes.GEOMETRY];
		
		/**
		 * Gets the Class associated with a dataType metadata value.
		 * This Class indicates the type of values stored in a column with given dataType metadata value.
		 * @param dataType A dataType metadata value.
		 * @return The associated Class, which can be used to pass to IAttributeColumn.getValueFromKey().
		 * @see weave.api.data.IAttributeColumn#getValueFromKey()
		 */
		public static getClass(dataType:DataType):GenericClass
		{
			switch (dataType)
			{
				case DataTypes.NUMBER:
					return Number;
				case DataTypes.DATE:
					return Date;
				case DataTypes.GEOMETRY:
					return Array;
				default:
					return String;
			}
		}
		
		/**
		 * @param data An Array of data values.
		 * @return A dataType metadata value, or null if no data was found.
		 */
		public static getDataTypeFromData(data:any[]):DataType
		{
			for (var value of data || [])
			{
				if (Weave.IS(value, Number))
					return DataTypes.NUMBER;
				if (Weave.IS(value, Date))
					return DataTypes.DATE;
				if (value != null)
					return DataTypes.STRING;
			}
			return null;
		}
	}
}
