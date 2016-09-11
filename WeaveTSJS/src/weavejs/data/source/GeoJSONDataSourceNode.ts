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

namespace weavejs.data.source
{
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import IColumnReference = weavejs.api.data.IColumnReference;
	import IDataSource = weavejs.api.data.IDataSource;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import StandardLib = weavejs.util.StandardLib;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;

	@Weave.classInfo({id: "weavejs.data.source.GeoJSONDataSourceNode", interfaces: [IWeaveTreeNode, IColumnReference]})
	export class GeoJSONDataSourceNode implements IWeaveTreeNode, IColumnReference
	{
		private idFields:string[];
		private source:IDataSource;
		private metadata:{[id:string]:string};
		private children:(IWeaveTreeNode&IColumnReference)[];
		
		constructor(source:IDataSource, metadata:IColumnMetadata, children:(IWeaveTreeNode&IColumnReference)[] = null, idFields:string[] = null)
		{
			this.source = source;
			this.metadata = metadata || {};
			this.children = children;
			this.idFields = idFields;
		}
		public equals(other:IWeaveTreeNode):boolean
		{
			var that:GeoJSONDataSourceNode = Weave.AS(other, GeoJSONDataSourceNode);
			if (that && this.source == that.source && StandardLib.compare(this.idFields, that.idFields) == 0)
			{
				if (this.idFields && this.idFields.length)
				{
					// check only specified fields
					for (var field of this.idFields)
					if (this.metadata[field] != that.metadata[field])
						return false;
					return true;
				}
				// check all fields
				return StandardLib.compare(this.metadata, that.metadata) == 0;
			}
			return false;
		}
		public getLabel():string
		{
			return this.metadata[ColumnMetadata.TITLE];
		}
		public isBranch():boolean
		{
			return this.children != null;
		}
		public hasChildBranches():boolean
		{
			return false;
		}
		public getChildren():(IWeaveTreeNode&IColumnReference)[]
		{
			return this.children;
		}
		
		public getDataSource():IDataSource
		{
			return this.source;
		}
		public getColumnMetadata():IColumnMetadata
		{
			return this.children ? null : this.metadata;
		}
	}
}
