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
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IURLRequestUtils = weavejs.api.net.IURLRequestUtils;
	import Dictionary2D = weavejs.util.Dictionary2D;
	import StandardLib = weavejs.util.StandardLib;
	import WeavePromise = weavejs.util.WeavePromise;

	@Weave.classInfo({id: "weavejs.net.URLRequestUtils", interfaces: [IURLRequestUtils]})
	export class URLRequestUtils implements IURLRequestUtils
	{
		private byteArrayToDataUri(byteArray:Uint8Array, mimeType:string):string
		{
			return "data:" + (mimeType || '') + ';base64,' + btoa(StandardLib.byteArrayToString(byteArray));
		}
		
		public request(relevantContext:ILinkableObject, urlRequest:URLRequest):WeavePromise<Uint8Array>
		{
			var responseType:string = urlRequest.responseType || ResponseType.UINT8ARRAY;
			var promise:WeavePromise<any>; // TODO

			if (String(urlRequest.url).indexOf(URLRequestUtils.LOCAL_FILE_URL_SCHEME) == 0)
			{
				var fileName:string = String(urlRequest.url).substr(URLRequestUtils.LOCAL_FILE_URL_SCHEME.length);
				var weaveRoot:ILinkableHashMap = Weave.getRoot(relevantContext as ILinkableObject);
				var cachedPromise = this.get_d2d_weaveRoot_fileName_promise(weaveRoot, fileName);
				if (cachedPromise.getResult() == null && cachedPromise.getError() == null)
				{
					if (weaveRoot)
						this.removeLocalFile(weaveRoot, fileName);
					else
						cachedPromise.setError(new Error(Weave.lang("To request a " + URLRequestUtils.LOCAL_FILE_URL_SCHEME + " URL, the relevantContext must be an ILinkableObject registered under an instance of Weave.")));
				}
				promise = new WeavePromise(relevantContext)
					.setResult(cachedPromise)
					.then((byteArray:Uint8Array) => {
						switch (responseType) {
							default:
							case ResponseType.TEXT:
								return StandardLib.byteArrayToString(byteArray);
							case ResponseType.JSON:
								return JSON.parse(StandardLib.byteArrayToString(byteArray));
							case ResponseType.BLOB:
								return new Blob([byteArray.buffer]);
							case ResponseType.ARRAYBUFFER:
								return byteArray.buffer;
							case ResponseType.DOCUMENT:
								throw new Error("responseType " + ResponseType.DOCUMENT + " not supported for local files");
							case ResponseType.UINT8ARRAY:
								return byteArray;
							case ResponseType.DATAURI:
								return this.byteArrayToDataUri(byteArray, urlRequest.mimeType);
						}
					});
			}
			else
			{
				//TODO WeavePromise needs a way to specify a dispose handler (new WeavePromise(context, resolver, cleanup))
				// so we can cancel the request automatically when the promise is disposed
				promise = new WeavePromise(relevantContext, (resolve:Function, reject:Function):void => {
					var done:boolean = false;
					var ie9_XHR:Class<XMLHttpRequest> = (window as any).XDomainRequest;
					var XHR:Class<XMLHttpRequest> = ie9_XHR || XMLHttpRequest;
					var xhr = new XHR();
					xhr.open(urlRequest.method || RequestMethod.GET, urlRequest.url, true);
					for (var name in urlRequest.requestHeaders)
						xhr.setRequestHeader(name, urlRequest.requestHeaders[name]);
					
					if (responseType === ResponseType.UINT8ARRAY || responseType === ResponseType.DATAURI)
						xhr.responseType = ResponseType.ARRAYBUFFER;
					else
						xhr.responseType = responseType;
					
					xhr.onload = ():void => {
						var result = ie9_XHR ? xhr.responseText : xhr.response;
						
						if (responseType === ResponseType.UINT8ARRAY)
							result = new Uint8Array(result);
						if (responseType === ResponseType.DATAURI)
							result = this.byteArrayToDataUri(new Uint8Array(result), urlRequest.mimeType);

						if (xhr.status < 200 || xhr.status > 299) /* If we did not receive a success status code (200 OK, 201 Created, etc...), reject */
						{
							reject(xhr);
							done = true;
						}
						else
						{
							resolve(result);
							done = true;
						}
					};
					xhr.onerror = function():void {
						if (!done)
							reject(xhr);
						done = true;
					};
					xhr.onreadystatechange = function():void {
						if (xhr.readyState == 4 && xhr.status != 200)
						{
							setTimeout(
								function():void {
									if (!done)
										reject(xhr);
									done = true;
								},
								1000
							);
						}
					};
					xhr.send(urlRequest.data);
				});
			}
			
			var ilo:ILinkableObject = Weave.AS(relevantContext, ILinkableObject);
			if (ilo)
				WeaveAPI.ProgressIndicator.addTask(promise, ilo, urlRequest.url);
			
			return promise;
		}
		
		public static /* readonly */ LOCAL_FILE_URL_SCHEME:string = 'local://';
		
		private /* readonly */ d2d_weaveRoot_fileName_promise = new Dictionary2D<ILinkableObject, string, WeavePromise<Uint8Array>>(true);
		private get_d2d_weaveRoot_fileName_promise(weaveRoot:ILinkableHashMap, fileName:string):WeavePromise<Uint8Array>
		{
			var context = weaveRoot || this; // use (this) instead of (null) to avoid WeakMap invalid key error
			var promise = this.d2d_weaveRoot_fileName_promise.get(context, fileName);
			if (!promise)
			{
				promise = new WeavePromise(context).setResult(null) as WeavePromise<Uint8Array>;
				this.d2d_weaveRoot_fileName_promise.set(context, fileName, promise);
			}
			return promise;
		}
		
		public saveLocalFile(weaveRoot:ILinkableHashMap, fileName:string, byteArray:Uint8Array):string
		{
			var promise = this.get_d2d_weaveRoot_fileName_promise(weaveRoot, fileName);
			promise.setResult(byteArray);
			return URLRequestUtils.LOCAL_FILE_URL_SCHEME + fileName;
		}
		
		public getLocalFile(weaveRoot:ILinkableHashMap, fileName:string):Uint8Array
		{
			var promise = this.get_d2d_weaveRoot_fileName_promise(weaveRoot, fileName);
			var result = promise.getResult();
			return result;
		}
		
		public removeLocalFile(weaveRoot:ILinkableHashMap, fileName:string):void
		{
			var promise = this.get_d2d_weaveRoot_fileName_promise(weaveRoot, fileName);
			promise.setError(new Error(Weave.lang("Local file missing: {0}", fileName)));
		}
		
		public getLocalFileNames(weaveRoot:ILinkableHashMap):string[]
		{
			return this.d2d_weaveRoot_fileName_promise.secondaryKeys(weaveRoot).sort();
		}
	}
}
