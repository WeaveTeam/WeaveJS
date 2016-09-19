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
	 * A column which implements setRecords()
	 */
	@Weave.classInfo({id: "weavejs.api.data.IBaseColumn", interfaces: [IAttributeColumn, ICallbackCollection, IKeySet]})
	export class IBaseColumn extends IAttributeColumn
	{
		/**
		 * Sets the data for this column.
		 * @param keys An Array of IQualifiedKeys
		 * @param data An Array of data values corresponding to the keys.
		 */
		setRecords:(keys:IQualifiedKey[], data:any[])=>void;
	}
}
