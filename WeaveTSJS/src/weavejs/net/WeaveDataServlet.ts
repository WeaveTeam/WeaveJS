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
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IWeaveEntityService = weavejs.api.net.IWeaveEntityService;
	import IWeaveGeometryTileService = weavejs.api.net.IWeaveGeometryTileService;
	import Entity = weavejs.api.net.beans.Entity;
	import EntityHierarchyInfo = weavejs.api.net.beans.EntityHierarchyInfo;
	import AttributeColumnData = weavejs.net.beans.AttributeColumnData;
	import GeometryStreamMetadata = weavejs.net.beans.GeometryStreamMetadata;
	import TableData = weavejs.net.beans.TableData;
	import JS = weavejs.util.JS;
	import WeavePromise = weavejs.util.WeavePromise;
	import JSByteArray = weavejs.util.JSByteArray;
	import WeaveAPI = weavejs.WeaveAPI;
	import IWeaveDataSourceColumnMetadata = weavejs.data.source.IWeaveDataSourceColumnMetadata;

	/**
	 * This is a wrapper class for making asynchronous calls to a Weave data servlet.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.net.WeaveDataServlet", interfaces: [IWeaveEntityService]})
	export class WeaveDataServlet implements IWeaveEntityService
	{
		public static /* readonly */ DEFAULT_URL:string = '/WeaveServices/DataService';
		public static /* readonly */ WEAVE_AUTHENTICATION_EXCEPTION:string = 'WeaveAuthenticationException';
		private static /* readonly */ AUTHENTICATED_USER:string = 'authenticatedUser';
		
		private map_method_name = new Map<Function, string>(); // Function -> String
		protected servlet:AMF3Servlet;
		protected _serverInfo:any = null;

		constructor(url:string = null)
		{
			this.servlet = Weave.linkableChild(this, new AMF3Servlet(url || WeaveDataServlet.DEFAULT_URL, false));
		}
		
		////////////////////
		// Helper functions

		private getMethodName(method:Function|string):string
		{
			if (Weave.IS(method , String))
				return Weave.AS(method, String) as string;
			
			if (!this.map_method_name.has(method as Function))
			{
				for (var name of JS.getPropertyNames(this, true) || [])
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
		
		/**
		 * This function will generate a AsyncToken representing a servlet method invocation.
		 * @param method A WeaveAdminService class member function or a String.
		 * @param parameters Parameters for the servlet method.
		 * @param returnType_or_castFunction
		 *     Either the type of object (Class) returned by the service or a Function that converts an Object to the appropriate type.
		 *     If the service returns an Array of objects, each object in the Array will be cast to this type.
		 *     The object(s) returned by the service will be cast to this type by copying the public properties of the objects.
		 *     It is unnecessary to specify this parameter if the return type is a primitive value.
		 * @return The AsyncToken object representing the servlet method invocation.
		 */		
		private invoke(method:Function|string, parameters:IArguments|string[], returnType_or_castFunction:GenericClass|Function = null):WeavePromise<any>
		{
			parameters = (JS.toArray(parameters) || parameters) as string[];
			var methodName:string = this.getMethodName(method);
			if (!methodName)
				throw new Error("method must be a member of " + Weave.className(this));
			
			var promise:WeavePromise<any> = this.servlet.invokeAsyncMethod(methodName, parameters as string[]);
			var promiseThen:WeavePromise<any> = promise;
			if (!this._authenticationRequired)
				this.servlet.invokeDeferred(promise);
			if (returnType_or_castFunction)
			{
				if (!(Weave.IS(returnType_or_castFunction, Function) || JS.isClass(returnType_or_castFunction)))
					throw new Error("returnType_or_castFunction parameter must either be a Class or a Function");
				if (([Array, String, Number] as GenericClass[]).indexOf(returnType_or_castFunction as GenericClass) < 0) // skip these primitive casts
					promiseThen = promise.then(WeaveDataServlet.castResult.bind(this, returnType_or_castFunction), (error) => {
						if (error.code == WeaveDataServlet.WEAVE_AUTHENTICATION_EXCEPTION)
						{
							this._authenticationRequired = true;
							this._promisesPendingAuthentication.push(promise);
						}
						else
							JS.error(error);
					});
			}
			return promiseThen;
		}
		
		public static castResult(cast:Function|GenericClass, originalResult:any[]|any):Object
		{
			var results:number[] = Weave.AS(originalResult, Array) as any[] || [originalResult as any];
			for (var i:int = 0; i < results.length; i++)
			{
				if (JS.isClass(cast))
				{
					var resultItem:any = results[i];
					if (resultItem === null || Weave.IS(resultItem, JS.asClass(cast)))
						continue;
					var newResult:any = new (cast as GenericClass)();
					for (var key in resultItem)
						newResult[key] = resultItem[key];
					results[i] = newResult;
				}
				else
				{
					results[i] = (cast as Function)(results[i])
				}
			}
			return originalResult === results ? results : results[0];
		}
		
		//////////////////
		// Authentication
		
		private _authenticationRequired:boolean = false;
		private _user:string = null;
		private _pass:string = null;
		private _promisesPendingAuthentication:WeavePromise<any>[] = [];
		
		/**
		 * Check this to determine if authenticate() may be necessary.
		 * @return true if authenticate() may be necessary.
		 */
		public get authenticationSupported():boolean
		{
			var info:{[key:string]:any} = this.getServerInfo();
			return info && info['hasDirectoryService'];
		}
		
		/**
		 * Check this to determine if authenticate() must be called.
		 * @return true if authenticate() should be called.
		 */
		public get authenticationRequired():boolean
		{
			return this._authenticationRequired && !this._user && !this._pass;
		}
		
		public get authenticatedUser():string
		{
			var info:{[ley:string]:any} = this.getServerInfo();
			return info ? info[WeaveDataServlet.AUTHENTICATED_USER] : null;
		}
		
		/**
		 * Authenticates with the server.
		 * @param user
		 * @param pass
		 */
		public authenticate(user:string, pass:string):void
		{
			if (user && pass)
			{
				this._user = user;
				this._pass = pass;
				var promise = this.invoke(this.authenticate, arguments);
				promise.then(this.handleAuthenticateResult.bind(this), this.handleAuthenticateFault.bind(this));
				// check if we have to invoke manually
				if (this._authenticationRequired)
					this.servlet.invokeDeferred(promise);
			}
			else
			{
				this._user = null;
				this._pass = null;
			}
		}
		private handleAuthenticateResult():void
		{
			while (this._promisesPendingAuthentication.length)
				this.servlet.invokeDeferred(Weave.AS(this._promisesPendingAuthentication.shift(), WeavePromise));
			this.getServerInfo()[WeaveDataServlet.AUTHENTICATED_USER] = this._user;
		}
		private handleAuthenticateFault():void
		{
			this._user = null;
			this._pass = null;
		}
		
		////////////////
		// Server info
		
		public getServerInfo():{[key:string]:any}
		{
			if (!this._serverInfo)
			{
				// setting _serverInfo to non-object until promise is resolved
				this._serverInfo = true;
				this.invoke(this.getServerInfo, arguments).then(
					(result:{[key:string]:any}) =>
					{
						this._serverInfo = result || {};
					},
					(error:Error) =>
					{
						this._serverInfo = {"error": error};
					}
				);
			}
			// return null until promise is resolved
			return typeof this._serverInfo === 'object' ? this._serverInfo : null;
		}
		
		////////////////////
		// DataEntity info
		
		public get entityServiceInitialized():boolean
		{
			return this.getServerInfo() != null;
		}
		
		public getHierarchyInfo(publicMetadata:IWeaveDataSourceColumnMetadata):WeavePromise<EntityHierarchyInfo[]>
		{
			return this.invoke(this.getHierarchyInfo, arguments, EntityHierarchyInfo);
		}
		
		public getEntities(ids:number[]):WeavePromise<Entity[]>
		{
			return this.invoke(this.getEntities, arguments, Entity);
		}
		
		public findEntityIds(publicMetadata:IWeaveDataSourceColumnMetadata, wildcardFields:string[]):WeavePromise<number[]>
		{
			return this.invoke(this.findEntityIds, arguments);
		}
		
		public findPublicFieldValues(fieldName:string, valueSearch:string):WeavePromise<string[]>
		{
			return this.invoke(this.findPublicFieldValues, arguments);
		}
		
		////////////////////////////////////
		// string and numeric data columns
		
		public getColumn(columnId:string|number, minParam:number, maxParam:number, sqlParams:string[]):WeavePromise<AttributeColumnData>
		{
			return this.invoke(this.getColumn, arguments, AttributeColumnData);
		}
		
		public getTable(id:number, sqlParams:string[]):WeavePromise<TableData>
		{
			return this.invoke(this.getTable, arguments, TableData);
		}
		
		/////////////////////
		// Geometry columns
		
		public getGeometryStreamTileDescriptors(columnId:number):WeavePromise<GeometryStreamMetadata>
		{
			return this.invoke(this.getGeometryStreamTileDescriptors, arguments, GeometryStreamMetadata);
		}
		public getGeometryStreamMetadataTiles(columnId:number, tileIDs:number[]):WeavePromise<JSByteArray>
		{
			return this.invoke(this.getGeometryStreamMetadataTiles, arguments);
		}
		public getGeometryStreamGeometryTiles(columnId:number, tileIDs:number[]):WeavePromise<JSByteArray>
		{
			return this.invoke(this.getGeometryStreamGeometryTiles, arguments);
		}
		
		public createTileService(columnId:number):IWeaveGeometryTileService
		{
			var tileService:IWeaveGeometryTileService = new WeaveGeometryTileServlet(this, columnId);
			
			// when we dispose this servlet, we also want to dispose the spawned tile servlet
			Weave.disposableChild(this, tileService);
			
			return tileService;
		}
		
		//////////////
		// Row query
		
		public getRows(keys:IQualifiedKey[]):WeavePromise<{
				attributeColumnMetadata: {[key:string]:string}[],
				keyType: string,
				recordKeys: string[],
				recordData: any[][]
			}>
		{
			var keysArray:string[] = [];
			for (var key of keys)
			{
				keysArray.push(key.localName);
			}
			var keytype:string = Weave.AS(keys[0], IQualifiedKey).keyType;
			return this.invoke(this.getRows, [keytype, keysArray] as any as IArguments);
		}
		
		////////////////////////////
		// backwards compatibility
		
		/**
		 * Deprecated. Use getColumn() instead.
		 */
		public getColumnFromMetadata(metadata:IWeaveDataSourceColumnMetadata):WeavePromise<AttributeColumnData>
		{
			return this.invoke(this.getColumnFromMetadata, arguments, AttributeColumnData);
		}
	}

	/**
	 * This is an implementation of IWeaveGeometryTileService that uses a WeaveDataServlet as the tile source.
	 *
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.net.WeaveGeometryTileServlet"})
	class WeaveGeometryTileServlet implements IWeaveGeometryTileService
	{
		constructor(service:WeaveDataServlet, columnId:number)
		{
			this._service = service;
			this._columnId = columnId;
		}

		private _service:WeaveDataServlet;
		private _columnId:number;

		public getMetadataTiles(tileIDs:(number|string)[]):WeavePromise<JSByteArray>
		{
			var token = this._service.getGeometryStreamMetadataTiles(this._columnId, tileIDs as number[]);
			WeaveAPI.ProgressIndicator.addTask(token, this);
			return token;
		}

		public getGeometryTiles(tileIDs:number[]):WeavePromise<JSByteArray>
		{
			var token = this._service.getGeometryStreamGeometryTiles(this._columnId, tileIDs);
			WeaveAPI.ProgressIndicator.addTask(token, this);
			return token;
		}
	}
}
