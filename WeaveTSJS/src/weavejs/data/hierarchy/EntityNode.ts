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
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import ColumnMetadata = weavejs.api.data.ColumnMetadata;
    import EntityType = weavejs.api.data.EntityType;
    import IColumnReference = weavejs.api.data.IColumnReference;
    import IDataSource = weavejs.api.data.IDataSource;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import IWeaveTreeNodeWithEditableChildren = weavejs.api.data.IWeaveTreeNodeWithEditableChildren;
    import IWeaveTreeNodeWithPathFinding = weavejs.api.data.IWeaveTreeNodeWithPathFinding;
    import Entity = weavejs.api.net.beans.Entity;
    import EntityHierarchyInfo = weavejs.api.net.beans.EntityHierarchyInfo;
    import EntityCache = weavejs.net.EntityCache;
    import DebugUtils = weavejs.util.DebugUtils;
    import JS = weavejs.util.JS;
	import IWeaveDataSourceColumnMetadata = weavejs.data.source.IWeaveDataSourceColumnMetadata;

	@Weave.classInfo({
		id: "weavejs.data.hierarchy.EntityNode",
		interfaces: [IWeaveTreeNode, IWeaveTreeNodeWithEditableChildren, IWeaveTreeNodeWithPathFinding, IColumnReference]
	})
    export class EntityNode implements IWeaveTreeNodeWithEditableChildren, IWeaveTreeNodeWithPathFinding, IColumnReference
    {
		/**
		 * Dual lookup: (EntityCache -> int) and (int -> EntityCache)
		 */
		private static $map_cacheLookup:Map<EntityCache|int, EntityCache|int>;
		private static $cacheSerial:int = 0;
		
		public static debug:boolean = false;
		
		/**
		 * @param entityCache The entityCache which the Entity belongs to.
		 * @param rootFilterEntityType To be used by root node only.
		 * @param nodeFilterFunction Used for filtering children.
		 */
		constructor(entityCache:EntityCache = null, rootFilterEntityType:string = null, overrideLabel:string = null)
		{
			this.setEntityCache(entityCache);
			this._rootFilterEntityType = rootFilterEntityType;
			this._overrideLabel = overrideLabel;
		}
		
		private _rootFilterEntityType:string = null;
		/**
		 * @private
		 */
		public _overrideLabel:string = null;
		
		/**
		 * This primitive value is used in place of a pointer to an EntityCache object
		 * so that this object may be serialized & copied by the Flex framework without losing this information.
		 * @private
		 */
		public _cacheId:int = 0;
		
		/**
		 * The entity ID.
		 */
		public id:int = -1;
		
		/**
		 * Sets the EntityCache associated with this node.
		 */
		public setEntityCache(entityCache:EntityCache):void
		{
			if (!EntityNode.$map_cacheLookup)
				EntityNode.$map_cacheLookup = new Map<EntityCache|int, EntityCache|int>();
			var cid:int = EntityNode.$map_cacheLookup.get(entityCache) as int;
			if (entityCache && !cid)
			{
				cid = ++EntityNode.$cacheSerial;
				EntityNode.$map_cacheLookup.set(cid, entityCache);
				EntityNode.$map_cacheLookup.set(entityCache, cid);
			}
			if (cid != this._cacheId)
			{
				this._cacheId = cid;
				for (var child of this._childNodeCache || [])
					child.setEntityCache(entityCache);
			}
		}
		
		/**
		 * Gets the EntityCache associated with this node.
		 */
		public getEntityCache():EntityCache
		{
			return EntityNode.$map_cacheLookup ? EntityNode.$map_cacheLookup.get(this._cacheId) as EntityCache : null;
		}
		
		/**
		 * Gets the Entity associated with this node.
		 */
		public getEntity():Entity
		{
			return this.getEntityCache().getEntity(this.id);
		}
		
		// the node can re-use the same children array
		private /* readonly */_childNodes:EntityNode[] = [];
		
		// We cache child nodes to avoid creating unnecessary objects.
		// Each node must have its own child cache (not static) because we can't have the same node in two places in a Tree.
		private /* readonly */  _childNodeCache:EntityNode[] = []; // id -> EntityNode
		
		public equals(other:IWeaveTreeNode):boolean
		{
			if (other == this)
				return true;
			var node:EntityNode = other as EntityNode;
			return !!node
				&& this._cacheId == node._cacheId
				&& this.id == node.id;
		}
		
		public getDataSource():IDataSource
		{
			var cache:EntityCache = this.getEntityCache();
			var owner:ILinkableObject = cache;
			while (owner)
			{
				owner = Weave.getOwner(owner);
				if (Weave.IS(owner, IDataSource))
					return owner as IDataSource;
			}
			return null;
		}
		
		public getColumnMetadata():IWeaveDataSourceColumnMetadata
		{
			var meta:IWeaveDataSourceColumnMetadata = {};
			var entity:Entity = this.getEntity();
			if (entity.getEntityType() != EntityType.COLUMN)
				return null; // not a column
			for (var key in entity.publicMetadata)
				meta[key] = entity.publicMetadata[key];
			meta.weaveEntityId = this.id;
			return meta;
		}
		
		public getLabel():string
		{
			if (this._overrideLabel)
				return this._overrideLabel;
			
			var title:string;
			var entity:Entity;
			var entityType:string;
			var cache:EntityCache = this.getEntityCache();
			var branchInfo:EntityHierarchyInfo = cache.getBranchInfo(this.id);
			if (branchInfo)
			{
				// avoid calling getEntity()
				entityType = branchInfo.entityType || 'entity';
				title = branchInfo.title || Weave.lang("Untitled {0}#{1}", entityType, branchInfo.id);
				
				if (entityType == EntityType.TABLE)
					title = Weave.lang("{0} ({1})", title, branchInfo.numChildren);
			}
			else
			{
				entity = this.getEntity();
				
				title = entity.publicMetadata.title;
				if (!title)
				{
					var name:String = entity.publicMetadata['name'];
					if (name)
						title = '[name: ' + name + ']';
				}
				
				if (!title || EntityNode.debug)
					entityType = entity.getEntityType() || 'entity';
				
				if (!title && !entity.initialized)
				{
					if (this._rootFilterEntityType)
					{
						var ds:IDataSource = this.getDataSource();
						if (ds)
							title = Weave.getRoot(ds).getName(ds) || title;
					}
					else
						title = '...';
				}
			}
			
			if (cache.entityIsCached(this.id))
			{
				if (!entity)
					entity = cache.getEntity(this.id);
				if (entity.getEntityType() != EntityType.COLUMN && entity.parentIds.length > 1)
					title += Weave.lang(" ; Warning: Multiple parents ({0})", entity.parentIds);
			}
			
			var idStr:string;
			if (!title || EntityNode.debug)
				idStr = Weave.lang("{0}#{1}", entityType, this.id);
			
			if (!title)
				title = idStr;
			
			if (EntityNode.debug)
			{
				var children:IWeaveTreeNode[] = this.getChildren();
				if (entityType != EntityType.COLUMN && children)
					idStr += '; ' + children.length + ' children';
				title = Weave.lang('({0}) {1} {2}', idStr, DebugUtils.debugId(this), title);
			}
			
			return title;
		}
		
		public isBranch():boolean
		{
			// root is a branch
			if (this._rootFilterEntityType)
				return true;
			
			var cache:EntityCache = this.getEntityCache();
			
			var info:EntityHierarchyInfo = cache.getBranchInfo(this.id);
			if (info)
				return info.entityType != EntityType.COLUMN;
			
			var entity:Entity = cache.getEntity(this.id);
			
			// treat entities that haven't downloaded yet as leaf nodes
			// columns are leaf nodes
			return entity.initialized
				&& entity.getEntityType() != EntityType.COLUMN
		}

		public hasChildBranches():boolean
		{
			if (this._rootFilterEntityType)
				return true;
			
			var cache:EntityCache = this.getEntityCache();
			
			var info:EntityHierarchyInfo = cache.getBranchInfo(this.id);
			// tables and columns do not have child branches
			if (info && (info.entityType == EntityType.TABLE || info.entityType == EntityType.COLUMN))
				return false;
			
			return cache.getEntity(this.id).hasChildBranches;
		}
		
		private getCachedChildNode(childId:int):EntityNode
		{
			var child:EntityNode = Weave.AS(this._childNodeCache[childId], EntityNode);
			if (!child)
			{
				child = new EntityNode(this.getEntityCache());
				child.id = childId;
				this._childNodeCache[childId] = child;
			}
			if (child.id != childId)
			{
				JS.error("BUG: EntityNode id has changed since it was first cached");
				child.id = childId;
			}
			return child;
		}
		
		public getChildren():EntityNode[]
		{
			var cache:EntityCache = this.getEntityCache();
			
			var childIds:number[]|Entity[];
			if (this._rootFilterEntityType)
			{
				childIds = cache.getIdsByType(this._rootFilterEntityType);
			}
			else
			{
				var entity:Entity = cache.getEntity(this.id);
				if (entity.getEntityType() == EntityType.COLUMN)
					return null; // leaf node
				childIds = entity.childIds;
			}
			
			if (!childIds)
			{
				this._childNodes.length = 0;
				return this.isBranch() ? this._childNodes : null;
			}
			
			this._childNodes.length = childIds.length;
			for (var i:int = 0; i < childIds.length; i++)
				this._childNodes[i] = this.getCachedChildNode(childIds[i] as int);
			
			return this._childNodes;
		}
		
		public addChildAt(child:IWeaveTreeNode, index:int):boolean
		{
			var childNode:EntityNode = Weave.AS(child, EntityNode);
			if (childNode)
			{
				// does not support adding children from a different EntityCache
				if (this.getEntityCache() != childNode.getEntityCache())
					return false;
				this.getEntityCache().add_child(this.id, childNode.id, index);
				return true;
			}
			return false;
		}
		
		public removeChild(child:IWeaveTreeNode):boolean
		{
			var childNode:EntityNode = Weave.AS(child, EntityNode);
			if (childNode)
			{
				// does not support removing children from a different EntityCache
				if (this.getEntityCache() != childNode.getEntityCache())
					return false;
				childNode.getEntityCache().remove_child(this.id, childNode.id);
				return true;
			}
			return false;
		}
		
		public findPathToNode(descendant:IWeaveTreeNode&IColumnReference):(IWeaveTreeNode&IColumnReference)[]
		{
			var node:EntityNode = Weave.AS(descendant, EntityNode);
			if (!node || this._cacheId != node._cacheId)
				return null;
			
			var cache:EntityCache = this.getEntityCache();
			if (this._rootFilterEntityType == EntityType.TABLE)
			{
				// root table node only has two levels - table, column
				// return path of EntityNode objects
				for (var id of node.getEntity().parentIds || [])
				{
					if (cache.getEntity(id).getEntityType() == EntityType.TABLE)
					{
						var tableNode:EntityNode = this.getCachedChildNode(id);
						return [this, tableNode, tableNode.getCachedChildNode(node.id)];
					}
				}
				return null;
			}
			
			// get path of Entity objects
			var path:Entity[]|EntityNode[] = cache.getEntityPath(this.getEntity(), node.getEntity());
			// get path of EntityNode objects
			if (path)
			{
				for (var i:int = 0; i < path.length; i++)
				{
					if (i == 0)
						node = this;
					else
						node = node.getCachedChildNode(Weave.AS(path[i], Entity).id);
					path[i] = node;
				}
			}
			return path as EntityNode[];
		}
    }
}
