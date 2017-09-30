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
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	import ILinkableObjectWithBusyStatus = weavejs.api.core.ILinkableObjectWithBusyStatus;
	import AMF3Servlet = weavejs.net.AMF3Servlet;
	import WeavePromise = weavejs.util.WeavePromise;
	import WeaveAPI = weavejs.WeaveAPI;
	
	/**
	 * this class contains functions that handle a queue of remote procedure calls
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.net.AsyncInvocationQueue", interfaces: [ILinkableObjectWithBusyStatus, IDisposableObject]})
	export class AsyncInvocationQueue implements ILinkableObjectWithBusyStatus, IDisposableObject
	{
		public static debug:boolean = false;
		
		/**
		 * @param paused When set to true, no queries will be executed until begin() is called.
		 */
		constructor(paused:boolean = false)
		{
			this._paused = paused;
		}
		
		public isBusy():boolean
		{
			this.assertQueueValid();
			return this._downloadQueue.length > 0;
		}
		
		public dispose():void
		{
			this.assertQueueValid();
			for (var query of this._downloadQueue)
				WeaveAPI.ProgressIndicator.removeTask(query);
			this._downloadQueue.length = 0;
		}
		
		private _paused:boolean = false;
		
		/**
		 * If the 'paused' constructor parameter was set to true, use this function to start invoking queued queries.
		 */		
		public begin():void
		{
			this.assertQueueValid();

			if (this._paused)
			{
				this._paused = false;
				
				for (var query of this._downloadQueue)
					WeaveAPI.ProgressIndicator.addTask(query);
				
				if (this._downloadQueue.length)
					this.performQuery(this._downloadQueue[0]);
			}
		}

		private map_queryToService = new WeakMap<WeavePromise<any>, AMF3Servlet>();

		// interface to add a query to the download queue. 
		public addToQueue(query:WeavePromise<any>, service:AMF3Servlet):void
		{
			this.assertQueueValid();
			
			//trace("addToQueue",query);
			
			// if this query has already been queued, then do not queue it again
			if (this._downloadQueue.indexOf(query) >= 0)
			{
				//console.error("already queued", query);
				return;
			}
			
			if (!this._paused)
				WeaveAPI.ProgressIndicator.addTask(query);

			this.map_queryToService.set(query, service);
			
			if (AsyncInvocationQueue.debug)
			{
				query.then(
					function(result:any):void
					{
						console.log('Query returned: ', query);
					},
					function (fault:any):void
					{
						console.log('Query failed: ', query);
					}
				);
			}

			
			this._downloadQueue.push(query);
			
			if (!this._paused && this._downloadQueue.length == 1)
			{
				//trace("downloading immediately", query);
				this.performQuery(query);
			}
			else
			{
				//trace("added to queue", query);
			}
		}
	
		// Queue to handle concurrent requests to be downloaded.
		private _downloadQueue:WeavePromise<any>[] = new Array();

		// perform a query in the queue
		protected performQuery(query:WeavePromise<any>):void
		{
			this.assertQueueValid();
			
			//trace("performQuery (timeout = "+query.webService.requestTimeout+")",query.toString());
			//
			
			query.then(
				(result:any):void => {this.handleQueryResultOrFault(result, query)},
				(fault:any):void => {this.handleQueryResultOrFault(fault, query)}
			);
			
			//URLRequestUtils.reportProgress = false;
			
			
			var service:AMF3Servlet = this.map_queryToService.get(query);

			if (service)
			{
				if (AsyncInvocationQueue.debug)
					console.log('Query sent: ', query);
				service.invokeDeferred(query);
			}
			else
				if (AsyncInvocationQueue.debug) console.log('Query had no associated service: ', query);
			
			//URLRequestUtils.reportProgress = true;
		}
		
		// This function gets called when a query has been downloaded.  It will download the next query if available
		protected handleQueryResultOrFault(result:any, query:WeavePromise<any>):void
		{
			if (Weave.wasDisposed(this))
				return;
			
			WeaveAPI.ProgressIndicator.removeTask(query);
			
			// see if the query is in the queue
			var index:int = this._downloadQueue.indexOf(query);
			// stop if query not found in queue
			if (index < 0)
			{
				console.log("Query not found in queue: ", query);
				return;
			}
			
			//trace("remove from queue (position "+index+", length: "+_downloadQueue.length+")", query);
			
			// remove the query from the queue
			this._downloadQueue.splice(index, 1);
			
			// if the position was 0, start downloading the next query
			if (index == 0 && this._downloadQueue.length > 0)
			{
				//trace("perform next query", _downloadQueue[0] as DelayedAsyncCall);
				// get the next item in the list
				this.performQuery(this._downloadQueue[0]);
			}
			return;
		}
		
		private assertQueueValid():void
		{
			if (Weave.wasDisposed(this))
				throw new Error("AsyncInvocationQueue was already disposed");
		}
	}
}
