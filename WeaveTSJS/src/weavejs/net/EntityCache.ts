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

namespace weavejs.net
{
    import WeaveAPI = weavejs.WeaveAPI;
    import ICallbackCollection = weavejs.api.core.ICallbackCollection;
    import IDisposableObject = weavejs.api.core.IDisposableObject;
    import ILinkableObject = weavejs.api.core.ILinkableObject;
    import ColumnMetadata = weavejs.api.data.ColumnMetadata;
    import EntityType = weavejs.api.data.EntityType;
    import IWeaveEntityManagementService = weavejs.api.net.IWeaveEntityManagementService;
    import IWeaveEntityService = weavejs.api.net.IWeaveEntityService;
    import Entity = weavejs.api.net.beans.Entity;
    import EntityHierarchyInfo = weavejs.api.net.beans.EntityHierarchyInfo;
    import EntityMetadata = weavejs.api.net.beans.EntityMetadata;
    import CallbackUtils = weavejs.util.CallbackUtils;
    import JS = weavejs.util.JS;
    import WeavePromise = weavejs.util.WeavePromise;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import IWeaveDataSourceColumnMetadata = weavejs.data.source.IWeaveDataSourceColumnMetadata;

	/**
	 * Provides an interface to a set of cached Entity objects.
	 */
    export class EntityCache implements ILinkableObject, IDisposableObject
    {
    	static WEAVE_INFO = Weave.classInfo(EntityCache, {
    		id: "weavejs.net.EntityCache",
			interfaces: [IDisposableObject]
		});

		/**
		 * A special flag value to represent a root node, which doesn't actually exist.
		 */
		public static /* readonly */ ROOT_ID:number = -1;
		/**
		 * This is the maximum number of entities the server allows a user to request at a time.
		 */
		private static /* readonly */ MAX_ENTITY_REQUEST_COUNT:number = 1000;

		private service:IWeaveEntityService = null;
		private adminService:IWeaveEntityManagementService = null; // service as IWeaveEntityManagementService
		private idsToFetch:{[id:number]:boolean} = {}; // id -> Boolean
        private entityCache:{[id:number]:Entity} = {}; // id -> Array <Entity>
		private idsToDelete:{[id:number]:boolean} = {}; // id -> Boolean
		private _idsByType:{[entityType:string]:number[]}  = {}; // entityType -> Array of id
		private _infoLookup:{[id:number]: EntityHierarchyInfo } = {}; // id -> EntityHierarchyInfo
		private idsDirty:{[id:number]:boolean} = {}; // id -> Boolean; used to remember which ids to invalidate the next time the entity is requested
		private purgeMissingEntities:boolean = false;
		
		private get callbacks():ICallbackCollection { return Weave.getCallbacks(this); }
		
		/**
		 * Creates an EntityCache.
		 * @param service The entity service, which may or may not implement IWeaveEntityManagementService.
		 * @param purgeMissingEntities Set this to true when entities may be deleted or created and ids previously deleted may be reused.
		 */
        constructor(service:IWeaveEntityService, purgeMissingEntities:boolean = false)
        {
			this.purgeMissingEntities = purgeMissingEntities;
			this.service = service;
			this.adminService = service as IWeaveEntityManagementService;
			Weave.linkableChild(this, service);
			// Generate a delayed callback so other grouped callbacks would not cause it to trigger immediately.
			// This is important for grouping entity requests.
			this.callbacks.addImmediateCallback(this, CallbackUtils.generateDelayedCallback(this, this.delayedCallback, 0));
        }
		
		/**
		 * Gets the IWeaveEntityService that was passed to the constructor.
		 */
		public getService():IWeaveEntityService
		{
			return this.service;
		}
		
		/**
		 * Checks if a specific parent-child relationship has been cached.
		 * @param parentId The ID of the parent entity.
		 * @param childId The ID of the child entity.
		 * @return true if the relationship has been cached.
		 */
		public hasCachedRelationship(parentId:number, childId:number):boolean
		{
			if (this.entityCache[parentId] && (!this.idsToFetch[parentId] || !this.entityCache[childId]))
				return Weave.AS(this.entityCache[parentId], Entity).hasChild(childId);
			if (this.entityCache[childId])
				return Weave.AS(this.entityCache[childId], Entity).hasParent(parentId);
			return false;
		}
		
		/**
		 * Invalidates a cached Entity object and optionally invalidates any related Entity objects.
		 * @param id The entity ID.
		 * @param alsoInvalidateRelatives Set this to true if any hierarchy relationships may have been altered.
		 */
		public invalidate(id:number, alsoInvalidateRelatives:boolean = false):void
		{
			if (Weave.wasDisposed(this))
				return;
			
			//trace('invalidate',id, alsoInvalidateRelatives, entityCache[id]);
			this.callbacks.delayCallbacks();
			
			WeaveAPI.SessionManager.assignBusyTask(this.delayedCallback, this);
			
			// trigger callbacks if we haven't previously decided to fetch this id
			if (!this.idsToFetch[id])
				this.callbacks.triggerCallbacks();
			
			this.idsDirty[id] = false;
			this.idsToFetch[id] = true;
			
			if (!this.entityCache[id])
				this.entityCache[id] = new Entity(this._infoLookup[id]);

			if (alsoInvalidateRelatives)
			{
				var children = Weave.AS(this.entityCache[id], Entity).childIds;
				if (children && children.length)
				{
					for (var childId of children)
						this.invalidate(childId);
				}
				var parents = Weave.AS(this.entityCache[id], Entity).parentIds;
				if (parents && parents.length)
				{
					for (var parentId of parents)
						this.invalidate(parentId);
				}
				else
				{
					// invalidate root when child has no parents
					this.invalidate(EntityCache.ROOT_ID);
				}
			}
			
			this.callbacks.resumeCallbacks();
		}
		
		/**
		 * Retrieves an Entity object given its ID.
		 * @param id The entity ID.
		 * @return The Entity object.
		 */
		public getEntity(id:number):Entity
		{
			// if there is no cached value, call invalidate() to create a placeholder.
			if (!this.entityCache[id] || this.idsDirty[id])
				this.invalidate(id);
			
            return Weave.AS(this.entityCache[id], Entity);
		}
		
		/**
		 * Checks if a particular Entity object is cached.
		 * @param The entity ID.
		 * @return true if the corresponding Entity object exists in the cache.
		 */
		public entityIsCached(id:int):boolean
		{
			var entity:Entity = Weave.AS(this.entityCache[id], Entity);
			return entity && entity.initialized;
		}
		
		private delayedCallback():void
		{
			if (!this.service.entityServiceInitialized)
				return;
			
			// delete marked entities
			var deleted:boolean = false;
			var idsToRemove:number[] = [];
			for (var id in this.idsToDelete)
				idsToRemove.push(Number(id));
			
			if (this.adminService && idsToRemove.length)
			{
				this.adminService.removeEntities(idsToRemove).then(this.handleIdsToInvalidate.bind(this, true));
				this.idsToDelete = {};
			}
			
			// request invalidated entities
			var ids:number[] = [];
			for (var id in this.idsToFetch)
			{
				// when requesting root, also request data table list
				if (Number(id) == EntityCache.ROOT_ID)
				{
					var tableMetadata:IWeaveDataSourceColumnMetadata = {};
					tableMetadata.entityType = EntityType.TABLE;
					this.service.getHierarchyInfo(tableMetadata).then(this.handleEntityHierarchyInfo.bind(this, tableMetadata));
					
					var hierarchyMetadata:IWeaveDataSourceColumnMetadata = {};
					hierarchyMetadata.entityType = EntityType.HIERARCHY;
					this.service.getHierarchyInfo(hierarchyMetadata).then(this.handleEntityHierarchyInfo.bind(this, hierarchyMetadata));
				}
				else
					ids.push(Math.floor(Number(id)));
			}
			
			delete this.idsToFetch[EntityCache.ROOT_ID];
			if (ids.length > 0)
				this.idsToFetch = {};
			
			while (ids.length > 0)
			{
				var splicedIds = ids.splice(0, EntityCache.MAX_ENTITY_REQUEST_COUNT);
				this.service.getEntities(splicedIds).then(this.getEntityHandler.bind(this, splicedIds));
			}
			
			WeaveAPI.SessionManager.unassignBusyTask(this.delayedCallback);
        }
		
		private handleIdsToInvalidate(alsoInvalidateRelatives:boolean, result:number[]):void
		{
			this.callbacks.delayCallbacks();
			
			for (var id of result || [])
				this.invalidate(id, alsoInvalidateRelatives);
			
			this.callbacks.resumeCallbacks();
		}
		
        private getEntityHandler(requestedIds:number[], result:Entity[]):void
        {
			var info:EntityHierarchyInfo;
			
			// reset all requested entities in case they do not appear in the results
			for (var id of requestedIds || [])
			{
				// make sure cached object is empty
				entity = this.entityCache[id] || new Entity();
				entity.reset();
				this.entityCache[id] = entity;
				this.idsDirty[id] = true;
			}
			
			for (var entity of result || [])
			{
				if (!entity.parentIds)
					entity.parentIds = [];
				if (!entity.childIds)
					entity.childIds = [];
				id = entity.id;
				this.entityCache[id] = entity;
				this.idsDirty[id] = false;
				info = this._infoLookup[id];
				if (info)
				{
					info.entityType = entity.publicMetadata.entityType;
					info.title = entity.publicMetadata.title;
					info.numChildren = entity.childIds.length;
				}
			}
			
			// for each id not appearing in result, delete _infoLookup[id]
			for (var id of requestedIds || [])
			{
				if (this.idsDirty[id])
				{
					if (this.purgeMissingEntities)
					{
						delete this._infoLookup[id];
					}
					else
					{
						// display an error and stop requesting the missing entity
						info = this._infoLookup[id] || new EntityHierarchyInfo();
						info.id = id;
						info.numChildren = 0;
						info.title = Weave.lang("[Error: Entity #{0} does not exist]", id);
						this._infoLookup[id] = info;
						this.idsDirty[id] = false;
					}
				}
			}
			
			this.callbacks.triggerCallbacks();
        }
		
		/**
		 * Calls getHierarchyInfo() in the IWeaveEntityService that was passed to the constructor and caches
		 * the results when they come back.
		 * @param publicMetadata Public metadata search criteria.
		 * @return RPC token for an Array of EntityHierarchyInfo objects.
		 * @see weavejs.api.net.IWeaveEntityService#getHierarchyInfo()
		 */		
		public getHierarchyInfo(publicMetadata:IWeaveDataSourceColumnMetadata):WeavePromise<EntityHierarchyInfo[]>
		{
			return this.service.getHierarchyInfo(publicMetadata)
				.then((result:EntityHierarchyInfo[]) => this.handleEntityHierarchyInfo(publicMetadata, result));
		}
		
		private handleEntityHierarchyInfo(publicMetadata:IWeaveDataSourceColumnMetadata, result:EntityHierarchyInfo[]):EntityHierarchyInfo[]
		{
			var entityType:string = publicMetadata.entityType;
			var infoArray:EntityHierarchyInfo[] = result || [];
			var ids:number[] = new Array(infoArray.length);
			for (var i:int = 0; i < infoArray.length; i++)
			{
				var info:EntityHierarchyInfo = infoArray[i] as EntityHierarchyInfo;
				info.entityType = entityType; // entityType is not provided by the server
				this._infoLookup[info.id] = info;
				ids[i] = info.id;
			}
			// if there is only one metadata property and it's entityType, save the list of ids
			var keys:string[] = JS.objectKeys(publicMetadata);
			if (keys.length == 1 && keys[0] == ColumnMetadata.ENTITY_TYPE)
				this._idsByType[entityType] = ids;
			
			this.callbacks.triggerCallbacks();
			return result;
		}
		
		/**
		 * Gets an Array of Entity objects which have previously been cached via getHierarchyInfo().
		 * Entities of type 'table' and 'hierarchy' get cached automatically.
		 * @param entityType Either 'table' or 'hierarchy'
		 * @return An Array of Entity objects with the given type
		 */		
		public getIdsByType(entityType:string):number[]
		{
			this.getEntity(EntityCache.ROOT_ID);
			return this._idsByType[entityType] = (this._idsByType[entityType] || []);
		}
		
		/**
		 * Gets an EntityHierarchyInfo object corresponding to an entity ID, to be used for displaying a hierarchy.
		 * @param The entity ID.
		 * @return The hierarchy info, or null if there is none.
		 */
		public getBranchInfo(id:int):EntityHierarchyInfo
		{
			this.getEntity(EntityCache.ROOT_ID);
			var info:EntityHierarchyInfo = this._infoLookup[id];
			
//			if (!info && entityIsCached(id))
//			{
//				var entity:Entity = entityCache[id];
//				info = new EntityHierarchyInfo(null);
//				info.id = id;
//				info.entityType = entity.publicMetadata[ColumnMetadata.ENTITY_TYPE];
//				info.title = entity.publicMetadata[ColumnMetadata.TITLE];
//				info.numChildren = entity.childIds.length;
//				_infoLookup[id] = info;
//			}
			
			return info;
		}
        
		/**
		 * Invalidates all cached information.
		 * @param purge If set to true, clears cache instead of just invalidating it.
		 */
		public invalidateAll(purge:boolean = false):void
        {
			if (Weave.wasDisposed(this))
				return;
			if (purge)
			{
				this.idsToFetch = {};
				this.entityCache = {};
				this.idsToDelete = {};
				this._idsByType = {};
				this._infoLookup = {};
				this.idsDirty = {};
			}
			else
			{
				// we don't want to delete the cache because we can still use the cached values for display in the meantime.
				for (var id in this.entityCache)
					this.idsDirty[id] = true;
			}
			this.callbacks.triggerCallbacks();
        }
		
		public update_metadata(id:number, diff:EntityMetadata):void
        {
			if (!this.adminService)
			{
				console.error("Unable to update metadata (Not an admin service)");
				return;
			}
			this.adminService.updateEntity(id, diff);
			this.invalidate(id);
        }
        public add_category(title:string, parentId:number, index:number):void
        {
			if (!this.adminService)
			{
				console.error("Unable to create entities (Not an admin service)");
				return;
			}
			var entityType:string = parentId == EntityCache.ROOT_ID ? EntityType.HIERARCHY : EntityType.CATEGORY;
            var em:EntityMetadata = new EntityMetadata();
			em.publicMetadata.title = title;
			em.publicMetadata.entityType = entityType;
			this.adminService.newEntity(em, parentId, index);
			this.invalidate(parentId);
        }
        public delete_entity(id:number):void
        {
			this.idsToDelete[id] = true;
			this.invalidate(id, true);
        }
        public add_child(parent_id:number, child_id:number, index:number):void
        {
			if (!this.adminService)
			{
				console.error("Unable to modify hierarchy (Not an admin service)");
				return;
			}
			
			if (this.idsToDelete[child_id]) // move from root
			{
				// prevent move-from-root from deleting the child
				delete this.idsToDelete[child_id];
				if (parent_id == EntityCache.ROOT_ID)
					return; // nothing to do
				
				// change hierarchy to category
				var diff:EntityMetadata = new EntityMetadata();
				diff.publicMetadata.entityType = EntityType.CATEGORY;
				this.adminService.updateEntity(child_id, diff);
			}
				
			this.adminService.addChild(parent_id, child_id, index)
				.then(this.handleIdsToInvalidate.bind(this, false));
			this.invalidate(parent_id);
        }
        public remove_child(parent_id:number, child_id:number):void
        {
			if (!this.adminService)
			{
				console.error("Unable to remove entities (Not an admin service)");
				return;
			}
			
			// remove from root means delete
			if (parent_id == EntityCache.ROOT_ID)
			{
				// delete_entity() does not take effect immediately.
				// this allows add_child() to move it to a new parent instead of deleting.
				this.delete_entity(child_id);
			}
			else
			{
				this.adminService.removeChild(parent_id, child_id);
			}
			this.invalidate(child_id, true);
        }
		
		/**
		 * Finds a series of Entity objects which can be traversed as a path from a root Entity to a descendant Entity.
		 * @param root The root Entity.
		 * @param descendant The descendant Entity.
		 * @return An Array of Entity objects which can be followed as a path from the root to the descendant, including the root and the descendant.
		 *         Returns null if the descendant is unreachable from the root.
		 */
		public getEntityPath(root:Entity, descendant:Entity):Entity[]
		{
			if (!(root.id == EntityCache.ROOT_ID))
			{
				//TODO - when searching for a column under root(-1), a table should always be returned instead of a hierarchy
				var type:string = descendant.getEntityType();
				if (type == EntityType.TABLE || type == EntityType.HIERARCHY)
					return [root, descendant];
			}
			
			if (root.id == descendant.id)
				return [root];
			
			for (var parentId of descendant.parentIds || [])
			{
				var parent:Entity = this.getEntity(parentId);
				if (!parent.initialized)
					continue;
				var path = this.getEntityPath(root, parent)
				if (path)
				{
					path.push(descendant);
					return path;
				}
			}
			return null;
		}
		
		public dispose():void
		{
			WeaveAPI.SessionManager.unassignBusyTask(this.delayedCallback);
		}
    }
}
