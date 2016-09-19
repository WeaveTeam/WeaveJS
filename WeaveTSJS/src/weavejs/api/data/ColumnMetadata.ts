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
	 * Constants that refer to standard metadata property names used by the IAttributeColumn.getMetadata() function.
	 * 
	 * @author adufilie
	 */
	export class ColumnMetadata
	{
		public static /* readonly */ ENTITY_TYPE:string = 'entityType';
		public static /* readonly */ TITLE:string = "title";
		public static /* readonly */ NUMBER:string = "number";
		public static /* readonly */ STRING:string = "string";
		public static /* readonly */ KEY_TYPE:string = "keyType";
		public static /* readonly */ DATA_TYPE:string = "dataType";
		public static /* readonly */ PROJECTION:string = "projection";
		public static /* readonly */ AGGREGATION:string = "aggregation";
		public static /* readonly */ DATE_FORMAT:string = "dateFormat";
		public static /* readonly */ DATE_DISPLAY_FORMAT:string = "dateDisplayFormat";
		public static /* readonly */ OVERRIDE_BINS:string = "overrideBins";
		public static /* readonly */ MIN:string = "min";
		public static /* readonly */ MAX:string = "max";
		
		public static getAllMetadata(column:IAttributeColumn):IColumnMetadata
		{
			var meta:IColumnMetadata = {};
			var names:string[] = column.getMetadataPropertyNames();
			for (var name of names || [])
				meta[name] = column.getMetadata(name);
			return meta;
		}
		
		/**
		 * @param propertyName The name of a metadata property.
		 * @return An Array of suggested String values for the specified metadata property.
		 */
		public static getSuggestedPropertyValues(propertyName:string):string[]
		{
			switch (propertyName)
			{
				case ColumnMetadata.ENTITY_TYPE:
					return EntityType.ALL_TYPES;
				
				case ColumnMetadata.DATA_TYPE:
					return DataTypes.ALL_TYPES;
				
				case ColumnMetadata.DATE_DISPLAY_FORMAT:
				case ColumnMetadata.DATE_FORMAT:
					return DateFormat.getSuggestions();
				
				case ColumnMetadata.AGGREGATION:
					return Aggregation.ALL_TYPES;
				
				default:
					return [];
			}
		}
	}
}
