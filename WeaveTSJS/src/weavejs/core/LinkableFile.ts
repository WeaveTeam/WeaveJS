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

namespace weavejs.core
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ILinkableVariable = weavejs.api.core.ILinkableVariable;
	import URLRequest = weavejs.net.URLRequest;
	import URLRequestUtils = weavejs.net.URLRequestUtils;
	import WeavePromise = weavejs.util.WeavePromise;
	import ResponseType = weavejs.net.ResponseType;
	import LinkablePromise = weavejs.core.LinkablePromise;

	/**
	 * A promise for file content, given a URL.
	 */
	@Weave.classInfo({id: "weavejs.core.LinkableFile", interfaces: [ILinkableVariable]})
	export class LinkableFile implements ILinkableVariable
	{
		private linkablePromise:LinkablePromise;
		private url:LinkableString;
		private responseType:string;

		public get isLocal():boolean
		{
			return (this.url.value && this.url.value.startsWith(URLRequestUtils.LOCAL_FILE_URL_SCHEME)) || !this.url.value;
		}

		constructor(defaultValue:string = null, taskDescription:any = null, responseType:string = ResponseType.UINT8ARRAY)
		{
			this.responseType = responseType;
			this.linkablePromise = Weave.linkableChild(this, new LinkablePromise(() => this.requestContent(), taskDescription));
			this.url = Weave.linkableChild(this.linkablePromise, new LinkableString(defaultValue));
		}

		private requestContent():WeavePromise<any>
		{
			if (!this.url.value)
				return null;
			var request:URLRequest = new URLRequest(this.url.value);
			request.responseType = this.responseType;
			return WeaveAPI.URLRequestUtils.request(this.linkablePromise, request);
		}

		public get result():Object
		{
			return this.linkablePromise.result;
		}

		public get error():Object
		{
			return this.linkablePromise.error;
		}

		public setSessionState(value:string):void
		{
			this.url.setSessionState(value);
		}

		public getSessionState():string
		{
			return this.url.getSessionState() as string;
		}

		public  get value():string
		{
			return this.url.value;
		}

		public set value(new_value:string)
		{
			this.url.value = new_value;
		}
	}
}
