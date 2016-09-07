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
	import RequestMethod = weavejs.net.RequestMethod;
	import ResponseType = weavejs.net.ResponseType;

	export class URLRequest
	{
		constructor(url:string = null)
		{
			this.url = url;
		}
		
		/**
		 * Either "get" or "post"
		 * @default "get"
		 */
		public method:string = RequestMethod.GET;
		
		/**
		 * The URL
		 */
		public url:string;
		
		/**
		 * Specified if method is "post"
		 */
		public data:string;
		
		/**
		 * Maps request header names to values
		 */
		public requestHeaders:{[key:string]: string};
		
		/**
		 * Can be one of the constants defined in the ResponseType class.
		 * @see ResponseType
		 */
		public responseType:string = ResponseType.UINT8ARRAY;
		
		/**
		 * Specifies the mimeType for the Data URI returned when responseType === "datauri".
		 */
		public mimeType:string;
	}
}
