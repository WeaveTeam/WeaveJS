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

namespace weavejs.net.beans
{	
	import JSByteArray = weavejs.util.JSByteArray;
	import IWeaveDataSourceColumnMetadata = weavejs.data.source.IWeaveDataSourceColumnMetadata;

	export class AttributeColumnData
	{
		public static /* readonly */ NO_TABLE_ID:int = -1;
		
		public id:int;
		public tableId:int;
		public tableField:string;
		public metadata:IWeaveDataSourceColumnMetadata;
		public keys:string[];
		public data:any[];
		public thirdColumn:string[];
		public metadataTileDescriptors:JSByteArray;
		public geometryTileDescriptors:JSByteArray;
	}
}
