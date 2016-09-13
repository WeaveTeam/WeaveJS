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

namespace weavejs.data.column
{
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import LinkableString = weavejs.core.LinkableString;
	import CSVParser = weavejs.data.CSVParser;
	import EquationColumnLib = weavejs.data.EquationColumnLib;
	import ArrayUtils = weavejs.util.ArrayUtils;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;

	@Weave.classInfo({id: "weavejs.data.column.KeyColumn", interfaces: [IAttributeColumn, ICallbackCollection]})
	export class KeyColumn extends AbstractAttributeColumn
	{
		constructor(metadata:IColumnMetadata = null)
		{
			super(metadata || {});
		}
		
		private static csvParser:CSVParser;
		
		/* override */ public getMetadata(propertyName:string):string
		{
			if (propertyName == ColumnMetadata.TITLE)
			{
				var kt:string = this.keyType.value;
				if (kt)
					return Weave.lang("Key ({0})", kt);
				return Weave.lang("Key");
			}
			if (propertyName == ColumnMetadata.KEY_TYPE)
				return this.keyType.value;
			
			return super.getMetadata(propertyName);
		}
		
		/* override */ public getMetadataPropertyNames():string[]
		{
			return ArrayUtils.union(super.getMetadataPropertyNames(), [ColumnMetadata.TITLE, ColumnMetadata.KEY_TYPE]);
		}
		
		public /* readonly */ keyType:LinkableString = Weave.linkableChild(this, LinkableString);
		
		/* override */ public getValueFromKey(key:IQualifiedKey, dataType:GenericClass=null):any
		{
			var kt:string = this.keyType.value;
			if (kt && key.keyType != kt)
				return EquationColumnLib.cast(undefined, dataType);
			
			if (dataType == String)
				return key.toString();
			if (dataType == Number)
				return key.toNumber();
			if (dataType == IQualifiedKey)
				return key;
			
			return EquationColumnLib.cast(key, dataType);
		}
		
		/* override */ public get keys():IQualifiedKey[]
		{
			return [];
		}
	}
}