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

namespace weavejs.api.net.beans
{
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;

	/**
	 * @author adufilie
	 */
	export class Entity extends EntityMetadata
	{
		static WEAVE_INFO = Weave.classInfo(Entity, {
			id: "weavejs.api.net.beans"
		});

		constructor(info:EntityHierarchyInfo = null)
		{
			super();
			this.id = -1;
			if (info)
			{
				this.id = info.id;
				this.publicMetadata.title = info.title;
				this.publicMetadata.entityType = info.entityType;
			}
		}
		
		public id:number;
		public parentIds:number[];
		public childIds:number[];
		public hasChildBranches:boolean;
		private _hasParent:{[id:number]:boolean};
		private _hasChild:{[id:number]:boolean};
		
		/**
		 * Resets this object so it does not contain any information.
		 */		
		public reset():void
		{
			this.id = -1;
			this.parentIds = null;
			this.childIds = null;
			this._hasParent = null;
			this._hasChild = null;
			this.publicMetadata = {};
			this.privateMetadata = {};
		}
		
		/**
		 * Tests if this object has been initialized.
		 */		
		public get initialized():boolean
		{
			return Boolean(this.id != -1 && this.parentIds && this.childIds);
		}
		
		public getEntityType():string
		{
			return this.publicMetadata.entityType;
		}
		
		public hasParent(parentId:number):boolean
		{
			if (!this.parentIds)
				return false;
			if (!this._hasParent)
			{
				this._hasParent = {};
				for (var pid of this.parentIds)
					this._hasParent[pid] = true;
			}
			return this._hasParent[parentId];
		}
		
		public hasChild(childId:number):boolean
		{
			if (!this.childIds)
				return false;
			if (!this._hasChild)
			{
				this._hasChild = {};
				for (var cid of this.childIds)
					this._hasChild[cid] = true;
			}
			return this._hasChild[childId];
		}
	}
}
