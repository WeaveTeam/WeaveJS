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
	import IColumnReference = weavejs.api.data.IColumnReference;
	import IDataSource = weavejs.api.data.IDataSource;
	import IDataSource_File = weavejs.api.data.IDataSource_File;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import IWeaveTreeNodeWithPathFinding = weavejs.api.data.IWeaveTreeNodeWithPathFinding;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;

	/**
	 * An all-static class containing functions for dealing with data hierarchies.
	 * 
	 * @author adufilie
	 */
	export class HierarchyUtils
	{
		public static findParentNode(root:IWeaveTreeNode&IColumnReference, dataSource:IDataSource, metadata:IColumnMetadata):IWeaveTreeNode&IColumnReference
		{
			var leaf:IWeaveTreeNode&IColumnReference = dataSource.findHierarchyNode(metadata);
			var path:(IWeaveTreeNode&IColumnReference)[] = HierarchyUtils.findPathToNode(root, leaf);
			if (path && path.length > 1)
				return path[path.length - 2];
			return null;
		}
		
		public static findSiblingNodes(dataSource:IDataSource, metadata:IColumnMetadata):(IWeaveTreeNode&IColumnReference)[]
		{
			if (!dataSource || !metadata)
				return [];
			
			var parent:IWeaveTreeNode&IColumnReference = HierarchyUtils.findParentNode(dataSource.getHierarchyRoot(), dataSource, metadata);
			return parent ? parent.getChildren() : []
		}
		
		/**
		 * Finds a series of IWeaveTreeNode objects which can be traversed as a path to a descendant node.
		 * @param root The root IWeaveTreeNode.
		 * @param descendant The descendant IWeaveTreeNode.
		 * @return An Array of IWeaveTreeNode objects which can be followed as a path from the root to the descendant, including the root and descendant nodes.
		 *         The last item in the path may be the equivalent node found in the hierarchy rather than the descendant node that was passed in.
		 *         Returns null if the descendant is unreachable from this node.
		 * @see weave.api.data.IWeaveTreeNode#equals()
		 */
		public static findPathToNode(root:IWeaveTreeNode&IColumnReference, descendant:IWeaveTreeNode&IColumnReference):(IWeaveTreeNode&IColumnReference)[]
		{
			if (!root || !descendant)
				return null;
			
			if (Weave.IS(root, IWeaveTreeNodeWithPathFinding))
				return Weave.AS(root, IWeaveTreeNodeWithPathFinding).findPathToNode(descendant);
			
			if (root.equals(descendant))
				return [root];
			
			var childs = root.getChildren();
			for (var child of childs)
			{
				var path = HierarchyUtils.findPathToNode(child, descendant);
				if (path)
				{
					path.unshift(root);
					return path;
				}
			}
			
			return null;
		}
		
		/**
		 * Traverses an entire hierarchy and returns all nodes that
		 * implement IColumnReference and have column metadata.
		 */
		public static getAllColumnReferenceDescendants(source:IDataSource):IColumnReference[]
		{
			return HierarchyUtils.getAllColumnReferences(source.getHierarchyRoot(), []);
		}
		private static getAllColumnReferences(node:IWeaveTreeNode&IColumnReference, output:IColumnReference[]):IColumnReference[]
		{
			var ref:IColumnReference = Weave.AS(node, IColumnReference);
			if (ref && ref.getColumnMetadata())
				output.push(ref);
			if (node)
			{
				var childs:(IWeaveTreeNode&IColumnReference)[] = node.getChildren();
				for (var child of childs || [])
					HierarchyUtils.getAllColumnReferences(child, output);
			}
			return output;
		}
	}
}
