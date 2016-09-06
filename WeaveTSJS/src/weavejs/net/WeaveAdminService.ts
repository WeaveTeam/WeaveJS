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
	import IWeaveEntityManagementService = weavejs.api.net.IWeaveEntityManagementService;
	import Entity = weavejs.api.net.beans.Entity;
	import EntityHierarchyInfo = weavejs.api.net.beans.EntityHierarchyInfo;
	import EntityMetadata = weavejs.api.net.beans.EntityMetadata;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import ConnectionInfo = weavejs.net.beans.ConnectionInfo;
	import DatabaseConfigInfo = weavejs.net.beans.DatabaseConfigInfo;
	import WeaveFileInfo = weavejs.net.beans.WeaveFileInfo;
	import JS = weavejs.util.JS;
	import JSByteArray = weavejs.util.JSByteArray;
	import StandardLib = weavejs.util.StandardLib;
	import WeavePromise = weavejs.util.WeavePromise;
	import IWeaveDataSourceColumnMetadata = weavejs.data.source.IWeaveDataSourceColumnMetadata;
	
	/**
	 * The functions in this class correspond directly to Weave servlet functions written in Java.
	 * This object uses a queue to guarantee that asynchronous servlet calls will execute in the order they are requested.
	 * @author adufilie
	 * @see WeaveServices/src/weave/servlets/AdminService.java
	 * @see WeaveServices/src/weave/servlets/DataService.java
	 */	
	export class WeaveAdminService implements IWeaveEntityManagementService
	{
		static WEAVE_INFO = Weave.classInfo(WeaveAdminService, {
			id: "weavejs.net.WeaveAdminService",
			interfaces: [IWeaveEntityManagementService]
		});

		public static /* readonly */ WEAVE_AUTHENTICATION_EXCEPTION:string = 'WeaveAuthenticationException';
		
		private static /* readonly */ _map_url_instance:Map<string, WeaveAdminService> = new Map<string, WeaveAdminService>();

		public static getInstance(url:string):WeaveAdminService
		{
			if (this._map_url_instance.has(url))
			{
				return this._map_url_instance.get(url);
			}
			var serviceInstance:WeaveAdminService = new WeaveAdminService(url);
			this._map_url_instance.set(url, serviceInstance);
			return serviceInstance;
		}
		
		public static /* readonly */ messageLog:string[] = new Array();
		public static /* readonly */ messageLogCallbacks:CallbackCollection = new CallbackCollection();
		public static messageDisplay(messageTitle:string, message:string, showPopup:boolean):void
		{
			// for errors, both a popupbox and addition in the Log takes place
			// for successes, only addition in Log takes place
			if (showPopup)
				alert(message); //, messageTitle);

			// always add the message to the log
			if (messageTitle == null)
				this.messageLog.push(message);
			else
				this.messageLog.push(messageTitle + ": " + message);
			
			this.messageLogCallbacks.triggerCallbacks();
		}
		public static clearMessageLog():void
		{
			this.messageLog.length = 0;
			this.messageLogCallbacks.triggerCallbacks();
		}
		
		/**
		 * @param url The URL pointing to where a WeaveServices.war has been deployed.  Example: http://example.com/WeaveServices
		 */		
		/*private*/ constructor(url:string)
		{
			this.adminService = Weave.linkableChild(this, new AMF3Servlet(url + "/AdminService", false));
			this.dataService = Weave.linkableChild(this, new AMF3Servlet(url + "/DataService", false));
			
			this.resetQueue();
			this.initializeAdminService();
		}

		private map_method_name:Map<Function, string> = new Map<Function, string>(); // method->string

		private getMethodName(method:string|Function):string
		{
			if (Weave.IS(method, String))
				return method as string;
			
			if (!this.map_method_name.has(method as Function))
			{
				for (var name of JS.getPropertyNames(this, true))
				{
					if ((this as any)[name] === method)
					{
						this.map_method_name.set(method as Function, name);
						return name;
					}
				}
			}
			return this.map_method_name.get(method as Function);
		}
		
		private resetQueue():void
		{
			if (this.queue)
				Weave.dispose(this.queue);
			this.queue = Weave.linkableChild(this, new AsyncInvocationQueue(!this.initialized)); // paused if not initialized
		}
		
		private queue:AsyncInvocationQueue;
		private adminService:AMF3Servlet;
		private dataService:AMF3Servlet;
		private methodHooks:{[methodName:string]: MethodHook[]} = {}; // methodName -> Array (of MethodHook)
        /*Bindable*/ public initialized:boolean = false;
		/*Bindable*/ public migrationProgress:string = '';
		
		public get entityServiceInitialized():boolean
		{
			return this.authenticated.value;
		}
		
		//TODO - move hooks from Admin.as to here, and automatically set these user/pass/authenticated settings
		public /* readonly */ authenticated:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		/*Bindable*/ public user:string = '';
		/*Bindable*/ public pass:string = '';
		
		//////////////////////////////
		// Initialization
		
		public initializeAdminService():WeavePromise<void>
		{
			var req:URLRequest = new URLRequest(this.adminService.servletURL);

			return this.invokeAdmin(this.initializeAdminService, arguments, false).then(
				() => this.initializeAdminServiceComplete(),
				(error:string) => this.initializeAdminServiceError(error)
			);
		}

		private initializeAdminServiceComplete():void
		{
			this.initialized = true;
			this.queue.begin();
		}
		private initializeAdminServiceError(error:string):void
		{
			//fixErrorMessage(error);
			WeaveAdminService.messageDisplay(null, error, false);
		}
		
		/**
		 * @param method A pointer to a function of this WeaveAdminService.
		 * @param captureHandler Receives the parameters of the RPC call with the 'this' pointer set to the WeavePromise object.
		 * @param resultHandler A ResultEvent handler:  function(event:ResultEvent, parameters:Array = null):void
		 * @param faultHandler A FaultEvent handler:  function(event:FaultEvent, parameters:Array = null):void
		 */
		public addHook(method:Function, captureHandler:Function, resultHandler:Function, faultHandler:Function = null):void
		{
			var methodName:string = this.getMethodName(method);
			if (!methodName)
				throw new Error("method must be a member of WeaveAdminService");
			var hooks = this.methodHooks[methodName];
			if (!hooks)
				this.methodHooks[methodName] = hooks = [];
			var hook:MethodHook = new MethodHook();
			hook.captureHandler = captureHandler;
			hook.resultHandler = resultHandler;
			hook.faultHandler = faultHandler;
			hooks.push(hook);
		}
		
		private hookCaptureHandler(methodName:string, methodParams:IArguments|any[], query:WeavePromise<any>):void
		{
			for (var hook of this.methodHooks[methodName] || [])
			{
				if (hook.captureHandler == null)
					continue;
				var args = methodParams ? (methodParams as any[]).concat() : [];
				args.length = hook.captureHandler.length;
				hook.captureHandler.apply(query, args);
			}
		}

		/**
		 * This gets called automatically for each ResultEvent from an RPC.
		 * @param method The WeaveAdminService function which corresponds to the RPC.
		 */
		private hookHandler(methodName:string, methodParams:string[], result:any):void
		{
			var handler:Function;
			for (var hook of this.methodHooks[methodName] || [])
			{
				if (!Weave.IS(result, Error))
					handler = hook.resultHandler;
				else
					handler = hook.faultHandler;
				if (handler == null)
					continue;

				var args = [result, methodParams];
				args.length = handler.length;
				handler.apply(null, args);
			}
		}

		/**
		 * This function will generate a DelayedAsyncInvocation representing a servlet method invocation and add it to the queue.
		 * @param method A WeaveAdminService class member function.
		 * @param parameters Parameters for the servlet method.
		 * @param queued If true, the request will be put into the queue so only one request is made at a time.
		 * @return The DelayedAsyncInvocation object representing the servlet method invocation.
		 */
		private invokeAdmin(method:Function, parameters:IArguments|any[], queued:boolean = true, returnType:GenericClass = null):WeavePromise<any>
		{
			var methodName:string = this.getMethodName(method);
			if (!methodName)
				throw new Error("method must be a member of WeaveAdminService");
			return this.generateQuery(this.adminService, methodName, Array.from(parameters), queued, returnType);
		}

		/**
		 * This function will generate a DelayedAsyncInvocation representing a servlet method invocation and add it to the queue.
		 * @param methodName The name of a Weave DataService servlet method.
		 * @param parameters Parameters for the servlet method.
		 * @param queued If true, the request will be put into the queue so only one request is made at a time.
		 * @return The DelayedAsyncInvocation object representing the servlet method invocation.
		 */
		private invokeDataService(method:Function, parameters:IArguments|any[], queued:boolean = true, returnType:GenericClass = null):WeavePromise<any>
		{
			var methodName:string = this.getMethodName(method);
			if (!methodName)
				throw new Error("method must be a member of WeaveAdminService");
			return this.generateQuery(this.dataService, methodName, Array.from(parameters), queued, returnType);
		}

		/**
		 * This function will generate a DelayedAsyncInvocation representing a servlet method invocation and add it to the queue.
		 * @param service The servlet.
		 * @param methodName The name of a servlet method.
		 * @param parameters Parameters for the servlet method.
		 * @param returnType The type of object which the result should be cast to.
		 * @return The WeavePromise<any> object representing the servlet method invocation.
		 */
		private generateQuery(service:AMF3Servlet, methodName:string, parameters:IArguments|any[], queued:boolean, returnType:GenericClass):WeavePromise<any>
		{
			var query:WeavePromise<any> = service.invokeAsyncMethod(methodName, parameters);
			var castedQuery:WeavePromise<any>;

			if (queued)
				this.queue.addToQueue(query, service);

			this.hookCaptureHandler(methodName, parameters, query);

			if (([null, Array, String, Number] as GenericClass[]).indexOf(returnType) < 0)
			{
				castedQuery = query.then(WeaveDataServlet.castResult.bind(this, returnType));
			}
			else
			{
				castedQuery = query;
			}

			castedQuery.then(this.hookHandler.bind(this, methodName, parameters), this.interceptFault);

			if (!queued)
				service.invokeDeferred(query);

			return castedQuery;
		}

		// this function displays a String response from a server in an Alert box.
		private alertResult(result:any, token:any = null):void
		{
			WeaveAdminService.messageDisplay(null, result, false);
		}

		private static /* readonly */ PREVENT_FAULT_ALERT:WeakMap<WeavePromise<any>, boolean> = new WeakMap<WeavePromise<any>, boolean>();

		/**
		 * Prevents the default error display if a fault occurs.
		 * @param query A WeavePromise<any> that was generated by this service.
		 */
		public hideFaultMessage(query:WeavePromise<any>):void
		{
			WeaveAdminService.PREVENT_FAULT_ALERT.set(query, true);
		}

		private interceptFault(error:string):void
		{
			// if user has been signed out, clear the queue immediately
			//JS.error(error);
			if (error == WeaveAdminService.WEAVE_AUTHENTICATION_EXCEPTION && this.authenticated.value)
			{
				this.resetQueue();
				this.authenticated.value = false;
				this.user = '';
				this.pass = '';
			}
		}

		// this function displays an error message from a FaultEvent in an Alert box.
		private alertFault(methodName:string, methodParams:IArguments|any[], query:WeavePromise<any>, error:string):void
		{
			//fixErrorMessage(event.fault);
			if (WeaveAdminService.PREVENT_FAULT_ALERT.has(query))
			{
				WeaveAdminService.PREVENT_FAULT_ALERT['delete'](query);
				return;
			}
			
			var paramDebugStr:string = '';
			
			if (Weave.IS(methodParams, Array) && methodParams.length > 0)
				paramDebugStr = (methodParams as any[]).map((p:Object):string => { return Weave.stringify(p); }).join(', ');
			else
				paramDebugStr += Weave.stringify(methodParams);
			
			JS.error(StandardLib.substitute(
					"Received error on {0}({1}):\n\t{2}",
					methodName,
					paramDebugStr,
					error
				));
			
			//Alert.show(event.fault.faultString, event.fault.name);
			var msg:string = error.toString();
			if (msg == "ioError")
				msg = "Received no response from the servlet.\n"
					+ "Has the WAR file been deployed correctly?\n"
					+ "Expected servlet URL: "+ this.adminService.servletURL;
			WeaveAdminService.messageDisplay(error, msg, false);
		}
		
		public getVersion():WeavePromise<string>
		{
			return this.invokeAdmin(this.getVersion, arguments);
		}

		public checkDatabaseConfigExists():WeavePromise<boolean>
		{
			return this.invokeAdmin(this.checkDatabaseConfigExists, arguments);
		}

		public getAuthenticatedUser():WeavePromise<string>
		{
			return this.invokeAdmin(this.getAuthenticatedUser, arguments);
		}
		
		public authenticate(user:string, pass:string):WeavePromise<boolean>
		{
			return this.invokeAdmin(this.authenticate, arguments);
		}
		
		public keepAlive():WeavePromise<void>
		{
			return this.invokeAdmin(this.keepAlive, arguments);
		}

		//////////////////////////////
		// Weave client config files

		public getWeaveFileNames(showAllFiles:boolean):WeavePromise<string[]>
		{
			return this.invokeAdmin(this.getWeaveFileNames, arguments);
		}

		public saveWeaveFileByteArray(fileContent:Uint8Array, fileName:string, overwriteFile:boolean):WeavePromise<string>
		{
			var base64:string = btoa(StandardLib.byteArrayToString(fileContent));
			return this.invokeAdmin(this.saveWeaveFileByteArray, [base64, fileName, overwriteFile]);
		}

		public removeWeaveFile(fileName:string):WeavePromise<string>
		{
			return this.invokeAdmin(this.removeWeaveFile, arguments);
		}

		public getWeaveFileInfo(fileName:string):WeavePromise<WeaveFileInfo>
		{
			return this.invokeAdmin(this.getWeaveFileInfo, arguments, false, WeaveFileInfo); // bypass queue
		}
		
		//////////////////////////////
		// ConnectionInfo management
		
		public getConnectionNames():WeavePromise<string[]>
		{
			return this.invokeAdmin(this.getConnectionNames, arguments);
		}

		public getConnectionInfo(userToGet:string):WeavePromise<ConnectionInfo>
		{
			return this.invokeAdmin(this.getConnectionInfo, arguments, true, ConnectionInfo);
		}

		public saveConnectionInfo(info:ConnectionInfo, configOverwrite:boolean):WeavePromise<string>
		{
		    return this.invokeAdmin(
				this.saveConnectionInfo,
				[info.name, info.pass, info.folderName, info.is_superuser, info.connectString, configOverwrite]
			);
		}
		public removeConnectionInfo(connectionNameToRemove:string):WeavePromise<string>
		{
			return this.invokeAdmin(this.removeConnectionInfo, arguments);
		}
		
		//////////////////////////////////
		// DatabaseConfigInfo management
		
		public getDatabaseConfigInfo():WeavePromise<DatabaseConfigInfo>
		{
			return this.invokeAdmin(this.getDatabaseConfigInfo, arguments, true, DatabaseConfigInfo);
		}

		public setDatabaseConfigInfo(connectionName:string, password:string, schema:string, idFields:string[]):WeavePromise<string>
		{
			return this.invokeAdmin(this.setDatabaseConfigInfo, arguments);
		}

		//////////////////////////
		// DataEntity management
		
		public newEntity(metadata:EntityMetadata, parentId:number, insertAtIndex:number):WeavePromise<number>
		{
			return this.invokeAdmin(this.newEntity, arguments);
		}

		public updateEntity(entityId:number, diff:EntityMetadata):WeavePromise<void>
		{
			return this.invokeAdmin(this.updateEntity, arguments);
		}

		public removeEntities(entityIds:number[]):WeavePromise<number[]>
		{
			return this.invokeAdmin(this.removeEntities, arguments);
		}

		public addChild(parentId:number, childId:number, insertAtIndex:number):WeavePromise<number[]>
		{
			return this.invokeAdmin(this.addChild, arguments);
		}

		public removeChild(parentId:number, childId:number):WeavePromise<void>
		{
			return this.invokeAdmin(this.removeChild, arguments);
		}

		public getHierarchyInfo(publicMetadata:IWeaveDataSourceColumnMetadata):WeavePromise<EntityHierarchyInfo[]>
		{
			return this.invokeAdmin(this.getHierarchyInfo, arguments, true, EntityHierarchyInfo);
		}

		public getEntities(entityIds:number[]):WeavePromise<Entity[]>
		{
			return this.invokeAdmin(this.getEntities, arguments, true, Entity);
		}

		public findEntityIds(publicMetadata:IWeaveDataSourceColumnMetadata, wildcardFields:string[]):WeavePromise<number[]>
		{
			return this.invokeAdmin(this.findEntityIds, arguments);
		}

		public findPublicFieldValues(fieldName:string, valueSearch:string):WeavePromise<string[]>
		{
			return this.invokeAdmin(this.findPublicFieldValues, arguments);
		}
		
		///////////////////////
		// SQL info retrieval

		public getSQLSchemaNames():WeavePromise<string[]>
		{
			return this.invokeAdmin(this.getSQLSchemaNames, arguments, false);
		}

		public getSQLTableNames(schemaName:string):WeavePromise<string[]>
		{
			return this.invokeAdmin(this.getSQLTableNames, arguments, false);
		}

		public getSQLColumnNames(schemaName:string, tableName:string):WeavePromise<string[]>
		{
			return this.invokeAdmin(this.getSQLColumnNames, arguments, false);
		}

		/////////////////
		// File uploads
		
		public uploadFileByteArray(fileName:string, bytes:Uint8Array):WeavePromise<void>
		{
			// queue up requests for uploading chunks at a time, then return the token of the last chunk
			
			var MB:int = ( 1024 * 1024 );
			var maxChunkSize:int = 20 * MB;
			var chunkSize:int = (bytes.length > (5*MB)) ? Math.min((bytes.length / 10 ), maxChunkSize) : ( MB );
			var offset:int = 0;

			var promise:WeavePromise<void>;
			do
			{
				var chunkLength:int = Math.min(chunkSize, bytes.length - offset);
				var chunk:Uint8Array = bytes.subarray(offset, offset+chunkLength);

				offset += chunkLength;

				var base64:String = btoa(StandardLib.byteArrayToString(chunk));
				promise = this.invokeAdmin(this.uploadFileByteArray, [fileName, base64, offset > 0], true); // queued -- important!
			}
			while (offset < bytes.length);
			
			return promise;
		}

		public getUploadedCSVFiles():WeavePromise<WeaveFileInfo[]>
		{
			return this.invokeAdmin(this.getUploadedCSVFiles, arguments, false, WeaveFileInfo);
		}

		public getUploadedSHPFiles():WeavePromise<WeaveFileInfo[]>
		{
			return this.invokeAdmin(this.getUploadedSHPFiles, arguments, false, WeaveFileInfo);
		}

		public getCSVColumnNames(csvFiles:string):WeavePromise<string[]>
		{
			return this.invokeAdmin(this.getCSVColumnNames, arguments);
		}

		public getDBFColumnNames(dbfFileNames:string[]):WeavePromise<string[]>
		{
		    return this.invokeAdmin(this.getDBFColumnNames, arguments);
		}
		
		/////////////////////////////////
		// Key column uniqueness checks
		
		public checkKeyColumnsForSQLImport(schemaName:string, tableName:string, keyColumns:string[]):WeavePromise<void>
		{
			return this.invokeAdmin(this.checkKeyColumnsForSQLImport, arguments);
		}

		public checkKeyColumnsForCSVImport(csvFileName:string, keyColumns:string[]):WeavePromise<void>
		{
			return this.invokeAdmin(this.checkKeyColumnsForCSVImport, arguments);
		}

		public checkKeyColumnsForDBFImport(dbfFileNames:string[], keyColumns:string[]):WeavePromise<boolean>
		{
			return this.invokeAdmin(this.checkKeyColumnsForDBFImport, arguments);
		}
		
		////////////////
		// Data import
		
		public importCSV(
				csvFile:string, csvKeyColumn:string, csvSecondaryKeyColumn:string,
				sqlSchema:string, sqlTable:string, sqlOverwrite:boolean, configDataTableName:string,
				configKeyType:string, nullValues:string,
				filterColumnNames:string[], configAppend:boolean
			):WeavePromise<number>
		{
		    return this.invokeAdmin(this.importCSV, arguments);
		}
		public importSQL(
				schemaName:string, tableName:string, keyColumnName:string,
				secondaryKeyColumnName:string, configDataTableName:string,
				keyType:string, filterColumns:string[], configAppend:boolean
			):WeavePromise<number>
		{
		    return this.invokeAdmin(this.importSQL, arguments);
		}
		public importSHP(
				configfileNameWithoutExtension:string, keyColumns:string[],
				sqlSchema:string, sqlTablePrefix:string, sqlOverwrite:boolean, configTitle:string,
				configKeyType:string, configProjection:string, nullValues:string, importDBFAsDataTable:boolean, configAppend:boolean
			):WeavePromise<number>
		{
		    return this.invokeAdmin(this.importSHP, arguments);
		}
		
		public importDBF(
				fileNameWithoutExtension:string, sqlSchema:string,
				sqlTableName:string, sqlOverwrite:boolean, nullValues:string
			):WeavePromise<void>
		{
			return this.invokeAdmin(this.importDBF, arguments);
		}
		
		//////////////////////
		// SQL query testing
		
		public testAllQueries(tableId:number):WeavePromise<any[]>
		{
			return this.invokeAdmin(this.testAllQueries, arguments, false);
		}
		
		//////////////////
		// Miscellaneous
		
		public getKeyTypes():WeavePromise<string[]>
		{
			return this.invokeAdmin(this.getKeyTypes, arguments);
		}
		
		// this function is for verifying the local connection between Weave and the AdminConsole.
		public ping():string { return "pong"; }
		
		//////////////////////////
		// DataService functions
		
		public getAttributeColumn(metadata:IWeaveDataSourceColumnMetadata):WeavePromise<any>
		{
			return this.invokeDataService(this.getAttributeColumn, arguments, false);
		}
	}
	class MethodHook
	{
		public captureHandler:Function;
		public resultHandler:Function;
		public faultHandler:Function;
	}
}

