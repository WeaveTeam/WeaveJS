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
	import IAsyncService = weavejs.api.net.IAsyncService;
	import JSByteArray = weavejs.util.JSByteArray;
	import WeavePromise = weavejs.util.WeavePromise;
	import Protocol = weavejs.net.Protocol;
	import JS = weavejs.util.JS;

	/**
	 * This is an IAsyncService interface for a servlet that takes its parameters from URL variables.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.net.Servlet", interfaces: [IAsyncService]})
	export class Servlet implements IAsyncService
	{
		/**
		 * WeavePromise -> [methodName, params, id]
		 */
		protected map_promise_methodParamsId = new WeakMap<WeavePromise<any>, [string, string[], number]>();
		
		private nextId:int = 1;
		
		/**
		 * @param servletURL The URL of the servlet (everything before the question mark in a URL request).
		 * @param methodParamName This is the name of the URL parameter that specifies the method to be called on the servlet.
		 * @param urlRequestDataFormat This is the format to use when sending parameters to the servlet.
		 */
		constructor(servletURL:string, methodVariableName:string, protocol:string)
		{
			if ([Protocol.URL_PARAMS, Protocol.JSONRPC_2_0, Protocol.JSONRPC_2_0_AMF].indexOf(protocol) < 0)
				throw new Error(Weave.className(Servlet) + ': protocol not supported: "' + protocol + '"');
			
			this._servletURL = servletURL;
			this._protocol = protocol;
			this.METHOD = methodVariableName;
		}
		
		/**
		 * The name of the property which contains the remote method name.
		 */
		private METHOD:string = "method";
		/**
		 * The name of the property which contains method parameters.
		 */
		private PARAMS:string = "params";
		
		/**
		 * This is the base URL of the servlet.
		 * The base url is everything before the question mark in a url request like the following:
		 *     http://www.example.com/servlet?param=123
		 */
		public get servletURL():string
		{
			return this._servletURL;
		}

		protected _servletURL:string;

		/**
		 * This is the data format of the results from HTTP GET requests.
		 */
		protected _protocol:string;
		
		protected _invokeLater:boolean = false;
		
		/**
		 * This function makes a remote procedure call.
		 * @param methodName The name of the method to call.
		 * @param methodParameters The parameters to use when calling the method.
		 * @return A WeavePromise generated for the call.
		 */
		public invokeAsyncMethod(methodName:string, methodParameters:string[] = null):WeavePromise<any>
		{
			var promise:WeavePromise<any> = new WeavePromise(this);
			
			this.map_promise_methodParamsId.set(promise, [methodName, methodParameters, this.nextId++]);
			
			if (!this._invokeLater)
				this.invokeNow(promise);
			
			return promise;
		}
		
		/**
		 * This function may be overrided to give different servlet URLs for different methods.
		 * @param methodName The method.
		 * @return The servlet url for the method.
		 */
		protected getServletURLForMethod(methodName:string):string
		{
			return this._servletURL;
		}
		
		/**
		 * This will make a url request that was previously delayed.
		 * @param promise A WeavePromise generated from a previous call to invokeAsyncMethod().
		 */
		protected invokeNow(promise:WeavePromise<any>):void
		{
			//TODO - need a way to cancel previous request
			// if promise.setResult was called with a urlPromise, dispose the old urlPromise or re-invoke it
			
			var method0_params1_id2:[string, string[], number] = this.map_promise_methodParamsId.get(promise);
			if (!method0_params1_id2)
				return;
			
			var method = method0_params1_id2[0];
			var params = method0_params1_id2[1];
			var id = method0_params1_id2[2];
			
			var url:string = this.getServletURLForMethod(method);
			var request:URLRequest = new URLRequest(url);
			if (this._protocol == Protocol.URL_PARAMS)
			{
				params = _.cloneDeep(params);
				(params as any)[this.METHOD] = method;
				request.url = Servlet.buildUrlWithParams(url, params);
				request.method = RequestMethod.GET;
			}
			else if (this._protocol == Protocol.JSONRPC_2_0)
			{
				request.method = RequestMethod.POST;
				request.data = JSON.stringify({
					jsonrpc: "2.0",
					method: method,
					params: params,
					id: id
				});
				request.responseType = ResponseType.JSON;
			}
			else if (this._protocol == Protocol.JSONRPC_2_0_AMF)
			{
				request.method = RequestMethod.POST;
				request.data = JSON.stringify({
					jsonrpc: "2.0/AMF3",
					method: method,
					params: params,
					id: id
				});
			}
			
			var result:WeavePromise<any> = WeaveAPI.URLRequestUtils.request(this, request);
			
			if (this._protocol == Protocol.JSONRPC_2_0_AMF)
				result = result.then(Servlet.readAmf3Object);
			
			promise.setResult(result);
		}
		
		
		/**
		 * This function reads an object that has been AMF3-serialized into a ByteArray and compressed.
		 * @param compressedSerializedObject The ByteArray that contains the compressed AMF3 serialization of an object.
		 * @return The result of calling readObject() on the ByteArray, or null if the RPC returns void.
		 * @throws Error if unable to read the result.
		 */
		public static readAmf3Object(bytes:Uint8Array):Object
		{
			// length may be zero for void result
			var obj:Object = bytes && bytes.length && new JSByteArray(bytes).readObject();
			
			// TEMPORARY SOLUTION to detect errors
			if (obj && ((obj as any).faultCode && (obj as any).faultString))
				throw new Error((obj as any).faultCode + ": " + (obj as any).faultString);
			
			return obj;
		}
		
		public static buildUrlWithParams(url:string, params:{[key:string]:any}):string
		{
			var queryString:string = '';
			var qi:int = url.indexOf('?');
			if (qi >= 0)
			{
				queryString = url.substr(qi + 1);
				url = url.substr(0, qi);
			}
			
			for (var key in params)
			{
				if (queryString)
					queryString += '&';
				var value:any = params[key];
				if (params != null && typeof params === 'object')
					value = JS.isPrimitive(value) ? value : JSON.stringify(value);
				queryString += encodeURIComponent(key) + '=' + encodeURIComponent(value);
			}
			return url + '?' + queryString;
		}
	}
}
