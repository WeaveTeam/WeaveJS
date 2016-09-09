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

namespace weavejs.data.hierarchy
{
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IColumnReference = weavejs.api.data.IColumnReference;
	import IDataSource = weavejs.api.data.IDataSource;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import WeaveTreeDescriptorNode = weavejs.data.hierarchy.WeaveTreeDescriptorNode;

	@Weave.classInfo({id: "weavejs.data.hierarchy.WeaveRootDataTreeNode", interfaces: [ILinkableObject, IColumnReference]})
	export class WeaveRootDataTreeNode extends WeaveTreeDescriptorNode implements ILinkableObject, IColumnReference
	{
		public constructor(root:ILinkableHashMap)
		{	
			/* In Typescript we can't reference 'this' before calling super, but it allows fat-arrow binding. */
			super({
				dependency: null as ILinkableObject, /* Need to set later to work around compiler */
				label: Weave.lang('Data Sources'),
				hasChildBranches: true,
				children: ():IWeaveTreeNode[]=> {
					var sources:IDataSource[] = root.getObjects(IDataSource).concat(this.globalColumnDataSource);
					var nodes = sources.map(
						(ds:IDataSource):IWeaveTreeNode => {
							Weave.linkableChild(this, ds);
							return ds.getHierarchyRoot();
						}
					);
					
					// only show global columns node if it has at least one child
					var globalColumnsNode:IWeaveTreeNode = nodes[nodes.length - 1];
					if (!globalColumnsNode.getChildren().length)
						nodes.pop();
					
					return nodes;
				}
			});

			this.dependency = this;
			Weave.linkableChild(this, root.childListCallbacks);
			this.globalColumnDataSource = Weave.linkableChild(this, GlobalColumnDataSource.getInstance(root));
		}

		public getDataSource():IDataSource
		{
			return null;
		}

		public getColumnMetadata():{[name:string]:string}
		{
			return null;
		}
		
		private globalColumnDataSource:IDataSource;
	}
}
