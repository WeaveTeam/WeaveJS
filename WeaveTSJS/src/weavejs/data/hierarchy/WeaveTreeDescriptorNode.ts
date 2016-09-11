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
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import IColumnReference = weavejs.api.data.IColumnReference;
    import JS = weavejs.util.JS;
    import StandardLib = weavejs.util.StandardLib;
    import WeaveTreeItem = weavejs.util.WeaveTreeItem;
	import IDataSource = weavejs.api.data.IDataSource;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;

	/**
	 * A node in a tree whose leaves identify attribute columns.
	 * The following properties are used for equality comparison, in addition to node class definitions:<br>
	 * <code>dependency, data</code><br>
	 * The following properties are used by WeaveTreeDescriptorNode but not for equality comparison:<br>
	 * <code>label, children, hasChildBranches</code><br>
	 */
	@Weave.classInfo({id: "weavejs.data.hierarchy.WeaveTreeDescriptorNode", interfaces: [IWeaveTreeNode, IColumnReference]})
	export class WeaveTreeDescriptorNode extends WeaveTreeItem implements IWeaveTreeNode, IColumnReference
	{
		/**
		 * The following properties are used for equality comparison, in addition to node class definitions:
		 *     <code>dependency, data</code><br>
		 * The following properties are used by WeaveTreeDescriptorNode but not for equality comparison:
		 *     <code>label, children, hasChildBranches</code><br>
		 * @param params An values for the properties of this WeaveTreeDescriptorNode.
		 */
		constructor(params:{[key:string]:any})
		{
			super();
			this.childItemClass = WeaveTreeDescriptorNode;
			
			if (typeof params === 'object')
			{
				for (var key in params)
				{
					if (Weave.IS((this as any)[key], Function) && JS.hasProperty(this, '_' + key))
						(this as any)['_' + key] = params[key];
					else
						(this as any)[key] = params[key];
				}
			}
		}
		
		/**
		 * Set this to true if this node is a branch, or false if it is not.
		 * Otherwise, hasChildBranches() will check isBranch() on each child returned by getChildren().
		 */
		public set _hasChildBranches(value:any)
		{
			(this._counter as any)['hasChildBranches'] = undefined;
			this.__hasChildBranches = value;
		}
		private __hasChildBranches:any = null;
		
		public equals(other:IWeaveTreeNode):boolean
		{
			var that:WeaveTreeDescriptorNode = Weave.AS(other, WeaveTreeDescriptorNode);
			if (!that)
				return false;
			
			// compare constructor
			if (Object(this).constructor != Object(that).constructor)
				return false; // constructor differs
			
			// compare dependency
			if (this.dependency != that.dependency)
				return false; // dependency differs
			
			if (StandardLib.compare(this.data, that.data) != 0)
				return false; // data differs
			
			return true;
		}
		
		public getLabel():string
		{
			return this.label;
		}
		
		public isBranch():boolean
		{
			// assume that if children property was defined that this is a branch
			return this._children != null;
		}
		
		public hasChildBranches():boolean
		{
			var id:string = 'hasChildBranches';
			if (this.isCached(id))
				return this.cache(id);
			
			if (this.__hasChildBranches != null)
				return this.cache(id, this.getBoolean(this.__hasChildBranches, id));
			
			var children = this.getChildren();
			for (var child of children || [])
				if (child.isBranch())
					return this.cache(id, true);
			return this.cache(id, false);
		}
		
		public getChildren():(IWeaveTreeNode&IColumnReference)[]
		{
			return this.children;
		}

		public getDataSource():IDataSource
		{
			return null;
		}

		public getColumnMetadata():IColumnMetadata
		{
			return null;
		}
	}
}
