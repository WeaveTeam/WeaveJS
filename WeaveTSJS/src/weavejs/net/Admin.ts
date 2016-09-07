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
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import Entity = weavejs.api.net.beans.Entity;
	import EntityHierarchyInfo = weavejs.api.net.beans.EntityHierarchyInfo;
	import URLRequestUtils = weavejs.net.URLRequestUtils;
	import StandardLib = weavejs.util.StandardLib;
	import URLRequest = weavejs.net.URLRequest;
	import JS = weavejs.util.JS;
	import WeavePromise = weavejs.util.WeavePromise;
	import DatabaseConfigInfo = weavejs.net.beans.DatabaseConfigInfo;
	import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;

	@Weave.classInfo({id: "weavejs.net.Admin"})
	export class Admin
	{
		private static _thisInstance:Admin = null;
		public static get instance():Admin
		{
			if (this._thisInstance == null)
				this._thisInstance = new Admin();
			return this._thisInstance;
		}

		public static get service():WeaveAdminService
		{
			return this.instance.service;
		}

		public static get entityCache():EntityCache
		{
			return this.instance.entityCache;
		}
		
		
		private _service:WeaveAdminService = null;
		public get service():WeaveAdminService
		{
			if (!this._service)
			{
				this._service = WeaveAdminService.getInstance("/WeaveServices");
				//linkBindableProperty(_service.authenticated, this, 'userHasAuthenticated');
			}
			return this._service;
		}

		private focusEntityId:number = -1;
		/**
		 * This is an entity id on which editors should focus, or -1 if none.
		 * It will be set to the newest entity that was created by the administrator.
		 * After an editor has focused on the entity, clearFocusEntityId() should be called.
		 */
		public getFocusEntityId():number
		{
			// if the entity does not exist on the server, don't attempt to focus on it
			if (!Weave.isBusy(this.entityCache) && !this.entityCache.entityIsCached(this.focusEntityId))
				this.focusEntityId = -1;
			return this.focusEntityId;
		}
		public setFocusEntityId(id:number):void
		{
			// Request the entity now so that we can later detect if it
			// exists on the server by checking entityCache.entityIsCached().
			this.entityCache.getEntity(id);
			this.focusEntityId = id;
		}
		public clearFocusEntityId():void
		{
			this.focusEntityId = -1;
		}
		
		private _entityCache:EntityCache = null;
		public get entityCache():EntityCache
		{
			if (!this._entityCache)
				this._entityCache = new EntityCache(this.service, true);
			return this._entityCache;
		}
		
		
		/*Bindable*/ public databaseConfigExists:boolean = true;
		/*Bindable*/ public currentUserIsSuperuser:boolean = false;

		private _userHasAuthenticated:boolean = false;
		/*Bindable*/ public get userHasAuthenticated():boolean
		{
			return this._userHasAuthenticated;
		}
		public set userHasAuthenticated(value:boolean)
		{
			this._userHasAuthenticated = value;
			if (!this._userHasAuthenticated)
			{
				// prevent the user from seeing anything while logged out.
				this.entityCache.invalidateAll(true);
				this.currentUserIsSuperuser = false;
				this.connectionNames = [];
				this.weaveFileNames = [];
				this.privateWeaveFileNames = [];
				this.keyTypes = [];
				this.databaseConfigInfo = new DatabaseConfigInfo();
			}
		}
		
		// values returned by the server
		/*Bindable*/ public connectionNames:string[] = [];
		/*Bindable*/ public weaveFileNames:string[] = [];
		/*Bindable*/ public privateWeaveFileNames:string[] = [];
		/*Bindable*/ public keyTypes:string[] = [];
		/*Bindable*/ public databaseConfigInfo:DatabaseConfigInfo = new DatabaseConfigInfo();
		/**
		 * An Array of WeaveFileInfo objects.
		 * @see weave.services.beans.WeaveFileInfo
		 */
		/*Bindable*/ public uploadedCSVFiles:WeaveFileInfo[] = [];
		/**
		 * An Array of WeaveFileInfo objects.
		 * @see weave.services.beans.WeaveFileInfo
		 */
		/*Bindable*/ public uploadedShapeFiles:WeaveFileInfo[] = [];
		
		/* private */ constructor()
		{
			///////////////////
			// Initialization
			this.service.addHook(
				this.service.checkDatabaseConfigExists,
				null,
				(result:boolean):void =>
				{
					// save info
					this.databaseConfigExists = Weave.AS(result, Boolean) as boolean;
					if (!this.databaseConfigExists)
						this.service.getConnectionNames();
				}
			);
			this.service.addHook(
				this.service.authenticate,
				(connectionName:string, password:string):void =>
				{
					// not logged in until result comes back
					if (this.userHasAuthenticated)
						this.userHasAuthenticated = false;
					
					this.activeConnectionName = connectionName;
					this.activePassword = password;
				},
				(result:boolean):void =>
				{
					// save info
					this.userHasAuthenticated = true;
					this.currentUserIsSuperuser = Weave.AS(result, Boolean) as boolean;
					
					// refresh lists
					this.service.getWeaveFileNames(false);
					this.service.getWeaveFileNames(true);
					this.service.getConnectionNames();
					this.service.getDatabaseConfigInfo();
					this.service.getKeyTypes();
				}
			);
			//////////////////////////////
			// Weave client config files
			this.service.addHook(
				this.service.saveWeaveFileByteArray,
				null,
				(result:boolean):void =>
				{
					WeaveAdminService.messageDisplay(null, Weave.AS(result, String) as string, false);
					
					// refresh lists
					this.service.getWeaveFileNames(false);
					this.service.getWeaveFileNames(true);
				}
			);
			this.service.addHook(
				this.service.removeWeaveFile,
				null,
				():void =>
				{
					// refresh lists
					this.service.getWeaveFileNames(false);
					this.service.getWeaveFileNames(true);
				}
			);
			this.service.addHook(
				this.service.getWeaveFileNames,
				null,
				(result:string[], args:IArguments):void =>
				{
					var showAllFiles:boolean = args[0];
					if (showAllFiles)
						this.weaveFileNames = (Weave.AS(result, Array) || []) as string[];
					else
						this.privateWeaveFileNames = (Weave.AS(result, Array) || []) as string[];
				}
			);
			//////////////////////////////
			// ConnectionInfo management
			this.service.addHook(
				this.service.getConnectionNames,
				null,
				(result:string[]):void =>
				{
					// save list
					this.connectionNames = (Weave.AS(result, Array) || []) as string[];
				}
			);
 			this.service.addHook(
				this.service.saveConnectionInfo,
				null,
				(result:any, args:IArguments):void =>
				{
					// when connection save succeeds and we just changed our password, change our login credentials
					// 0=user, 1=pass, 2=folderName, 3=is_superuser, 4=connectString, 5=overwrite
					var saveName:string = args[0];
					var savePass:string = args[1];
					if (!this.userHasAuthenticated)
					{
						this.activeConnectionName = saveName;
						this.activePassword = savePass;
					}
					else if (this.activeConnectionName == saveName)
					{
						this.activePassword = savePass;
					}
					
					// refresh lists that may have changed
					this.service.getConnectionNames();
					this.service.getDatabaseConfigInfo();
					this.service.getWeaveFileNames(false);
				}
			);
			this.service.addHook(
				this.service.removeConnectionInfo,
				null,
				function(result:any, args:IArguments):void
				{
					var removedUser:string = args[0];
					// if user removed self, log out
					if (this.activeConnectionName == removedUser)
					{
						this.activeConnectionName = '';
						this.activePassword = '';
					}
					else
					{
						// refresh list
						this.service.getConnectionNames();
						this.service.getDatabaseConfigInfo();
					}
				}
			);
			//////////////////////////////////
			// DatabaseConfigInfo management
			this.service.addHook(
				this.service.getDatabaseConfigInfo,
				null,
				(result:any):void =>
				{
					// save info
					this.databaseConfigInfo = result as DatabaseConfigInfo || new DatabaseConfigInfo();
				}
			);
			this.service.addHook(
				this.service.setDatabaseConfigInfo,
				null,
				(result:boolean):void =>
				{
					// save info
					this.databaseConfigExists = Boolean(result);
					if (this.activeConnectionName && this.activePassword)
					{
						if (!this.userHasAuthenticated)
							this.service.authenticate(this.activeConnectionName, this.activePassword);
					
						// refresh
						this.service.getDatabaseConfigInfo();
					}
					// purge cache
					this.entityCache.invalidateAll(true);
				}
			);
			/////////////////
			// File uploads
			this.service.addHook(
				this.service.getUploadedCSVFiles,
				null,
				(result:WeaveFileInfo[]):void =>
				{
					// save info
					this.uploadedCSVFiles = (Weave.AS(result, Array) || []) as WeaveFileInfo[];
				}
			);
			this.service.addHook(
				this.service.getUploadedSHPFiles,
				null,
				(result:WeaveFileInfo[]):void =>
				{
					// save info
					this.uploadedShapeFiles = (Weave.AS(result, Array) || []) as WeaveFileInfo[];
				}
			);
			////////////////
			// Data import
			this.service.addHook(this.service.importSQL, null, this.handleTableImportResult.bind(this));
			this.service.addHook(this.service.importCSV, null, this.handleTableImportResult.bind(this));
			this.service.addHook(this.service.importSHP, null, this.handleTableImportResult.bind(this));
			//////////////////
			// Miscellaneous
			this.service.addHook(
				this.service.getKeyTypes,
				null,
				(result:string[]):void =>
				{
					// save list
					if (this.userHasAuthenticated)
						this.keyTypes = (Weave.AS(result, Array) || []) as string[];
				}
			);
			this.service.addHook(
				this.service.newEntity,
				null,
				function(result:number, meta0_parent1_index2:number[]):void
				{
					var id:number = Number(result);
					this.focusEntityId = id;
					this.entityCache.invalidate(id);
					var parentId:number = meta0_parent1_index2[1];
					this.entityCache.invalidate(parentId);
				}
			);

			this.service.addHook(
				this.service.getAuthenticatedUser,
				null,
				(result:string):void =>
				{
					this.activeConnectionName = Weave.AS(result, String) as string;
					this.userHasAuthenticated = !! this.activeConnectionName;
				}
			);
			
			this.service.checkDatabaseConfigExists();
		}
		
		private handleTableImportResult(result:number):void
		{
			var tableId:number = Math.floor(Number(result)); // TODO check if this is the correct way to cast to int
			var exists:boolean = false;
			var title:string;
			var info:EntityHierarchyInfo = this.entityCache.getBranchInfo(tableId);
			if (info)
			{
				exists = true;
				title = info.title;
			}
			else if (this.entityCache.entityIsCached(tableId))
			{
				exists = true;
				var entity:Entity = this.entityCache.getEntity(tableId);
				title = entity.publicMetadata.title;
			}
			
			if (exists)
				console.error(Weave.lang('Existing data table "{0}" was updated successfully.', title));
			else
				console.error(Weave.lang("New data table created successfully."));
			
			this.focusEntityId = tableId;
			// request children
			this.entityCache.invalidate(tableId, true);
			for (var id of this.entityCache.getEntity(tableId).childIds)
				this.entityCache.invalidate(id);
			// refresh list
			this.service.getKeyTypes();
		}
			
		/*Bindable*/ public get activeConnectionName():string
		{
			return this.service.user;
		}
		public set activeConnectionName(value:string)
		{
			if (this.service.user == value)
				return;
			this.service.user = value;
			
			// log out
			this.userHasAuthenticated = false;
		}
		/*Bindable*/ public get activePassword():string
		{
			return this.service.pass;
		}
		public set activePassword(value:string)
		{
			this.service.pass = value;
		}
		
		public getSuggestedPropertyValues(propertyName:string):string[]
		{
			var suggestions:string[] = ColumnMetadata.getSuggestedPropertyValues(propertyName);
			switch (propertyName)
			{
				case 'connection':
					return this.connectionNames;
				
				case ColumnMetadata.KEY_TYPE:
					return this.keyTypes;
				
				case ColumnMetadata.DATA_TYPE:
					return suggestions.concat(this.keyTypes);
				
				default:
					return suggestions;
			}
		}
	}
}
