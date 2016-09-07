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
	import ILocale = weavejs.api.core.ILocale;
	import ResponseType = weavejs.net.ResponseType;
	import URLRequest = weavejs.net.URLRequest;
	import WeavePromise = weavejs.util.WeavePromise;

	@Weave.classInfo({id: "weavejs.core.Locale", interfaces: [ILocale]})
	export class Locale implements ILocale
	{
		private _reverseLayout:boolean = false;
		public get reverseLayout():boolean { return this._reverseLayout; }
		public set reverseLayout(value:boolean) { this._reverseLayout = value; }
		
		public loadFromUrl(jsonUrl:string):WeavePromise<void>
		{
			var request:URLRequest = new URLRequest(jsonUrl);
			request.responseType = ResponseType.JSON;
			var self:Locale = this;
			return WeaveAPI.URLRequestUtils.request(this, request).then(function(data:{[text:string]:string}) { self.data = data; });
		}
		
		private _data:{[text:string]:string} = {};
		
		public get data():{[text:string]:string}
		{
			return this._data;
		}
		
		public set data(value:{[text:string]:string})
		{
			this._data = value;
		}
		
		public getText(text:string):string
		{
			if (!text)
				return '';
			
			var result:string;
			
			if (this._data.hasOwnProperty(text))
				result = this._data[text];
			else // make the original text appear in the lookup table even though there is no translation yet.
				this._data[text] = null;
			
			return result || text;
		}
	}
}
