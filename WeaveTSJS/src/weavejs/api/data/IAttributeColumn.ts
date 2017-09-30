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
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;

	/**
	 * This is an interface to a mapping of keys to data values.
	 *
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.api.data.IAttributeColumn", interfaces: [ICallbackCollection, IKeySet]})
	export class IAttributeColumn {}

	export interface IAttributeColumn extends ICallbackCollection, IKeySet
	{
		/**
		 * This function gets metadata associated with the column.
		 * For standard metadata property names, refer to the ColumnMetadata class.
		 * @param propertyName The name of the metadata property to retrieve.
		 * @return The value of the specified metadata property.
		 */
		getMetadata(propertyName:string):string;
		// TODO overload the getMetadata function for each property name

		/**
		 * Retrieves all metadata property names for this column.
		 * @return An Array of all available metadata property names.
		 */
		getMetadataPropertyNames():string[];

		/**
		 * This function gets a value associated with a record key.
		 * @param key A record key.
		 * @param dataType The desired value type (Examples: Number, String, Date, Array, IQualifiedKey)
		 * @return The value associated with the given record key.
		 */
		getValueFromKey<T>(key:IQualifiedKey, dataType?:Class<T>):T;
	}


}
