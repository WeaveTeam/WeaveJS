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
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import WeavePromise = weavejs.util.WeavePromise;

	export class JsonCache implements ILinkableObject
	{
		public static buildURL(base:string, params:{[key:string]:string}):string
		{
			var paramsStr:string = '';
			for (var key in params)
				paramsStr += (paramsStr ? '&' : '?') + encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
			return base + paramsStr;
		}
		
		/**
		 * @param requestHeaders Optionally set this to an Object mapping header names to values.
		 */
		public JsonCache(requestHeaders:{[header:string]:string} = null)
		{
			this.requestHeaders = requestHeaders;
		}
		
		private requestHeaders:{[header:string]:string} = null;
		
		private cache = new Map<string, WeavePromise<any>>();
		
		public clearCache():void
		{
			for(var [url, promise] of this.cache)
				Weave.dispose(promise);
			this.cache.clear();
			Weave.getCallbacks(this).triggerCallbacks();
		}
		
		/**
		 * @param url The URL to get JSON data
		 * @return The cached Object.
		 */
		public getJsonObject(url:string):Object
		{
			return this.getJsonPromise(url).getResult();
		}
		
		public getJsonPromise(url:string):WeavePromise<any>
		{
			var promise = this.cache.get(url);
			if (!promise)
			{
				var request:URLRequest = new URLRequest(url);
				request.requestHeaders = this.requestHeaders;
				request.responseType = ResponseType.JSON;
				promise = new WeavePromise(this)
					.setResult(WeaveAPI.URLRequestUtils.request(this, request))
					.then((result:Object):Object => { return result || {}; });
				this.cache.set(url, promise);
			}
			return promise;
		}
	}
	Weave.registerClass(JsonCache, "weavejs.net.JsonCache");
}
